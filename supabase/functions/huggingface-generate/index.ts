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
      prompt, 
      negative_prompt = "", 
      model = "stabilityai/stable-diffusion-xl-base-1.0",
      task_type = "text-to-image",
      guidance_scale = 7.5,
      num_inference_steps = 20,
      seed = null,
      width = 1024,
      height = 1024,
      source_image = null,
      mask_image = null
    } = await req.json()

    console.log('Image generation request:', { 
      prompt, 
      model, 
      task_type,
      guidance_scale,
      num_inference_steps,
      seed,
      width,
      height 
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

    // Prepare Hugging Face API request
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      throw new Error('Hugging Face API token not configured')
    }

    let apiUrl = `https://api-inference.huggingface.co/models/${model}`
    let requestBody: any = {
      inputs: prompt,
      parameters: {
        guidance_scale,
        num_inference_steps,
        width,
        height
      }
    }

    // Add negative prompt if provided
    if (negative_prompt) {
      requestBody.parameters.negative_prompt = negative_prompt
    }

    // Add seed if provided
    if (seed !== null) {
      requestBody.parameters.seed = seed
    }

    // Handle different task types
    if (task_type === 'image-to-image' && source_image) {
      requestBody.image = source_image
    } else if (task_type === 'inpainting' && source_image && mask_image) {
      requestBody.image = source_image
      requestBody.mask = mask_image
    }

    console.log('Making request to Hugging Face API:', apiUrl)

    // Make request to Hugging Face API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      
      // Log the error
      await supabase.from('image_generation_logs').insert({
        user_id: userId,
        user_email: userEmail,
        api_provider: 'huggingface',
        model_name: model,
        model_id: model,
        task_type,
        prompt,
        negative_prompt,
        status: 'error',
        error_message: errorText,
        parameters: {
          guidance_scale,
          num_inference_steps,
          seed,
          width,
          height
        },
        response_time_ms: responseTime,
        success: false,
        has_source_image: !!source_image,
        has_mask: !!mask_image,
        guidance_scale,
        num_inference_steps,
        seed,
        width,
        height
      })

      throw new Error(`Hugging Face API error: ${errorText}`)
    }

    // Get the image blob
    const imageBlob = await response.blob()
    const imageSizeBytes = imageBlob.size

    // Convert to base64
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const imageDataUrl = `data:image/jpeg;base64,${base64}`

    console.log('Image generated successfully, size:', imageSizeBytes, 'bytes')

    // Log successful generation
    const { data: logData, error: logError } = await supabase.from('image_generation_logs').insert({
      user_id: userId,
      user_email: userEmail,
      api_provider: 'huggingface',
      model_name: model,
      model_id: model,
      task_type,
      prompt,
      negative_prompt,
      image_url: imageDataUrl,
      status: 'success',
      parameters: {
        guidance_scale,
        num_inference_steps,
        seed,
        width,
        height
      },
      image_metadata: {
        size_bytes: imageSizeBytes,
        format: 'jpeg'
      },
      processing_time_ms: responseTime,
      response_time_ms: responseTime,
      success: true,
      image_size_bytes: imageSizeBytes,
      has_source_image: !!source_image,
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
        image: imageDataUrl,
        metadata: {
          model,
          task_type,
          prompt,
          negative_prompt,
          parameters: {
            guidance_scale,
            num_inference_steps,
            seed,
            width,
            height
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
    console.error('Error in image generation:', error)
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