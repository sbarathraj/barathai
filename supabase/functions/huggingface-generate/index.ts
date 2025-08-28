import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      workflow = "text-to-image",
      model = "stabilityai/stable-diffusion-xl-base-1.0",
      prompt, 
      negative_prompt = "", 
      width = 1024,
      height = 1024,
      num_inference_steps = 20,
      guidance_scale = 7.5,
      seed = null,
      n = 1,
      strength = 0.7,
      seed_image = null,
      mask_image = null
    } = await req.json()

    console.log('Hugging Face image generation request:', { 
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

    // Get Hugging Face API key
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      throw new Error('Hugging Face API token not configured')
    }

    // Build request payload based on workflow
    const payload: any = {
      inputs: prompt,
      parameters: {
        width,
        height,
        num_inference_steps,
        guidance_scale,
      }
    }

    // Add optional parameters
    if (negative_prompt) {
      payload.parameters.negative_prompt = negative_prompt
    }
    if (seed !== null) {
      payload.parameters.seed = seed
    }
    if (n > 1) {
      payload.parameters.num_images_per_prompt = n
    }

    // Handle different workflows
    let apiUrl = `https://api-inference.huggingface.co/models/${model}`
    
    if (workflow === 'image-to-image' && seed_image) {
      payload.inputs = {
        prompt: prompt,
        image: seed_image
      }
      payload.parameters.strength = strength
    } else if (workflow === 'inpainting' && seed_image && mask_image) {
      payload.inputs = {
        prompt: prompt,
        image: seed_image,
        mask_image: mask_image
      }
    }

    console.log('Calling Hugging Face API:', apiUrl)

    // Call Hugging Face API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', response.status, errorText)
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    const responseTime = Date.now() - startTime

    // Get image data
    const imageBlob = await response.blob()
    const imageArrayBuffer = await imageBlob.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)))
    const imageUrl = `data:image/png;base64,${imageBase64}`
    const imageSizeBytes = imageArrayBuffer.byteLength

    console.log('Image generated successfully:', {
      model,
      workflow,
      size: imageSizeBytes,
      responseTime
    })

    // Log successful generation
    const { error: logError } = await supabase.from('image_generation_logs').insert({
      user_id: userId,
      user_email: userEmail,
      api_provider: 'huggingface',
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
        num_inference_steps,
        guidance_scale,
        seed,
        strength,
        n
      },
      image_metadata: {
        size_bytes: imageSizeBytes,
        format: 'png'
      },
      processing_time_ms: responseTime,
      response_time_ms: responseTime,
      success: true,
      image_size_bytes: imageSizeBytes,
      has_source_image: !!seed_image,
      has_mask: !!mask_image,
      guidance_scale,
      num_inference_steps,
      seed,
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
          model,
          workflow,
          prompt,
          negative_prompt,
          parameters: {
            width,
            height,
            num_inference_steps,
            guidance_scale,
            seed,
            strength,
            n
          },
          response_time_ms: responseTime,
          size_bytes: imageSizeBytes
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
    console.error('Error in Hugging Face image generation:', error)
    
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
        api_provider: 'huggingface',
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