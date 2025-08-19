import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateUUID(): string {
  return crypto.randomUUID();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      workflow = "text-to-image",
      model = "runware:101@1",
      prompt, 
      negative_prompt = "", 
      width = 1024,
      height = 1024,
      num_inference_steps = 28,
      guidance_scale = 7.5,
      seed = null,
      n = 1,
      strength = 0.7,
      outpaint = null,
      seed_image = null,
      mask_image = null,
      nsfw_check = false
    } = await req.json()

    console.log('Runware image generation request:', { 
      workflow,
      prompt, 
      model, 
      width,
      height,
      num_inference_steps,
      guidance_scale,
      seed,
      n
    })

    const startTime = Date.now()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    let userEmail = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
      userEmail = user?.email
    }

    // Get Runware API key
    const runwareToken = Deno.env.get('RUNWARE_API_KEY')
    if (!runwareToken) {
      throw new Error('Runware API token not configured')
    }

    // Generate task UUID
    const taskUUID = generateUUID()
    
    // Build task based on workflow
    const task: any = {
      taskType: "imageInference",
      taskUUID,
      model,
      positivePrompt: prompt,
      width,
      height,
      steps: num_inference_steps,
      CFGScale: guidance_scale,
      numberResults: n,
      outputType: "dataURI",
      outputFormat: "PNG",
      includeCost: true
    }

    // Add optional parameters
    if (negative_prompt) {
      task.negativePrompt = negative_prompt
    }
    if (seed !== null) {
      task.seed = seed
    }
    if (nsfw_check) {
      task.checkNSFW = true
    }

    // Handle different workflows
    if (workflow === 'image-to-image' && seed_image) {
      task.seedImage = seed_image
      task.strength = strength
    } else if (workflow === 'inpainting' && seed_image && mask_image) {
      task.seedImage = seed_image
      task.maskImage = mask_image
    } else if (workflow === 'outpainting' && seed_image && outpaint) {
      task.seedImage = seed_image
      task.outpaint = outpaint
    }

    console.log('Connecting to Runware WebSocket...')

    // Connect to Runware WebSocket
    const wsUrl = `wss://api.runware.ai/v1-ws?token=${runwareToken}`
    
    const wsPromise = new Promise((resolve, reject) => {
      let ws: WebSocket
      let timeout: number

      try {
        ws = new WebSocket(wsUrl)
        
        // Set timeout for connection
        timeout = setTimeout(() => {
          ws.close()
          reject(new Error('WebSocket connection timeout'))
        }, 30000)

        ws.onopen = () => {
          console.log('WebSocket connected, sending task...')
          ws.send(JSON.stringify([task]))
        }

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log('Received WebSocket message:', response)

            if (response.error || response.errors) {
              const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Generation failed'
              console.error('Runware API error:', errorMessage)
              ws.close()
              clearTimeout(timeout)
              reject(new Error(errorMessage))
              return
            }

            if (response.data && Array.isArray(response.data)) {
              const resultData = response.data.find((item: any) => item.taskUUID === taskUUID)
              if (resultData && (resultData.imageURL || resultData.imageDataURI || resultData.imageBase64Data)) {
                ws.close()
                clearTimeout(timeout)
                resolve(resultData)
              }
            }
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          clearTimeout(timeout)
          reject(new Error('WebSocket connection failed'))
        }

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          clearTimeout(timeout)
          if (event.code !== 1000) {
            reject(new Error(`WebSocket closed unexpectedly: ${event.reason || event.code}`))
          }
        }
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })

    const resultData = await wsPromise as any
    const responseTime = Date.now() - startTime

    // Extract image data
    const imageUrl = resultData.imageURL || resultData.imageDataURI || `data:image/png;base64,${resultData.imageBase64Data}`
    const imageSizeBytes = resultData.imageSizeBytes || 0
    const returnedSeed = resultData.seed
    const cost = resultData.cost || 0
    const nsfw = resultData.NSFWContent || false

    console.log('Image generated successfully:', {
      taskUUID,
      seed: returnedSeed,
      cost,
      nsfw,
      size: imageSizeBytes
    })

    // Log successful generation
    const { error: logError } = await supabase.from('image_generation_logs').insert({
      user_id: userId,
      user_email: userEmail,
      api_provider: 'runware',
      model_name: model,
      model_id: model,
      task_type: workflow,
      prompt,
      negative_prompt,
      image_url: imageUrl,
      status: 'success',
      parameters: {
        width,
        height,
        steps: num_inference_steps,
        CFGScale: guidance_scale,
        seed: returnedSeed,
        strength,
        outpaint,
        nsfw_check,
        cost
      },
      image_metadata: {
        size_bytes: imageSizeBytes,
        format: 'png',
        nsfw_content: nsfw
      },
      processing_time_ms: responseTime,
      response_time_ms: responseTime,
      success: true,
      image_size_bytes: imageSizeBytes,
      has_source_image: !!seed_image,
      has_mask: !!mask_image,
      guidance_scale,
      num_inference_steps,
      seed: returnedSeed,
      width,
      height
    })

    if (logError) {
      console.error('Error logging image generation:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        image: imageUrl,
        metadata: {
          taskUUID,
          model,
          workflow,
          prompt,
          negative_prompt,
          parameters: {
            width,
            height,
            steps: num_inference_steps,
            CFGScale: guidance_scale,
            seed: returnedSeed,
            strength,
            outpaint,
            nsfw_check
          },
          response_time_ms: responseTime,
          size_bytes: imageSizeBytes,
          cost,
          nsfw_content: nsfw
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in Runware image generation:', error)
    
    // Log error to database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const authHeader = req.headers.get('Authorization')
      let userId = null
      let userEmail = null

      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        userId = user?.id
        userEmail = user?.email
      }

      await supabase.from('image_generation_logs').insert({
        user_id: userId,
        user_email: userEmail,
        api_provider: 'runware',
        model_name: 'unknown',
        model_id: 'unknown',
        task_type: 'unknown',
        prompt: 'unknown',
        status: 'error',
        error_message: error.message,
        success: false
      })
    } catch (logError) {
      console.error('Error logging failure:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})