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
      model = "google/gemini-2.5-flash-image-preview:free",
      prompt
    } = await req.json()

    console.log('OpenRouter Free Tier image generation request:', { 
      prompt, 
      model
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

    // Get OpenRouter API key
    const openrouterToken = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterToken) {
      throw new Error('OpenRouter API token not configured')
    }

    // OpenRouter API payload for free tier models
    const payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    }

    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
    
    console.log('Calling OpenRouter Free Tier API:', apiUrl)

    // Call OpenRouter API (free tier)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const responseTime = Date.now() - startTime
    const data = await response.json()

    // Extract generated content from OpenRouter response
    const generatedContent = data.choices?.[0]?.message?.content || ''
    
    // For image generation models, we expect the content to contain an image URL or base64
    // Since this is a free tier model, we'll treat the response as text for now
    const imageUrl = `data:text/plain;base64,${btoa(generatedContent)}`

    console.log('Content generated successfully:', {
      model,
      contentLength: generatedContent.length,
      responseTime
    })

    // Log successful generation
    const { error: logError } = await supabase.from('image_generation_logs').insert({
      user_id: userId,
      user_email: userEmail,
      api_provider: 'openrouter',
      model_name: model,
      model_id: model,
      task_type: 'text-to-image',
      prompt,
      image_url: imageUrl,
      status: 'success',
      parameters: {
        model: model
      },
      image_metadata: {
        size_bytes: generatedContent.length,
        format: 'text'
      },
      processing_time_ms: responseTime,
      response_time_ms: responseTime,
      success: true,
      image_size_bytes: generatedContent.length
    })

    if (logError) {
      console.error('Error logging image generation:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        image: imageUrl,
        content: generatedContent,
        metadata: {
          model,
          prompt,
          response_time_ms: responseTime,
          size_bytes: generatedContent.length
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
    console.error('Error in OpenRouter image generation:', error)
    
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
        api_provider: 'openrouter',
        model_name: 'unknown',
        model_id: 'unknown',
        task_type: 'text-to-image',
        prompt: 'unknown',
        status: 'error',
        error_message: error instanceof Error ? error.message : String(error),
        success: false
      })
    } catch (logError) {
      console.error('Error logging failure:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate content', 
        details: error instanceof Error ? error.message : String(error) 
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