import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Freepik generation request:', { prompt });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user info
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;

    const freepikApiKey = Deno.env.get('FREEPIK_API_KEY');
    if (!freepikApiKey) {
      throw new Error('FREEPIK_API_KEY is not configured');
    }

    const startTime = Date.now();

    // Step 1: Create the image generation task
    console.log('Creating Freepik generation task...');
    const createResponse = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-freepik-api-key': freepikApiKey,
      },
      body: JSON.stringify({
        prompt: prompt,
        aspect_ratio: 'widescreen_16_9',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Freepik task creation failed:', createResponse.status, errorText);
      throw new Error(`Freepik API error: ${createResponse.status} ${errorText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      throw new Error('No task_id returned from Freepik API');
    }

    console.log('Task created:', taskId);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    let imageUrl = null;
    let status = 'PENDING';

    while (attempts < maxAttempts && status !== 'COMPLETED') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls

      const statusResponse = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
        method: 'GET',
        headers: {
          'x-freepik-api-key': freepikApiKey,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Freepik status check failed:', statusResponse.status, errorText);
        throw new Error(`Freepik status check error: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      status = statusData.data?.status;
      
      console.log(`Attempt ${attempts + 1}: Status = ${status}`);

      if (status === 'COMPLETED') {
        imageUrl = statusData.data?.generated?.[0];
        break;
      } else if (status === 'FAILED') {
        throw new Error('Freepik generation failed');
      }

      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out or failed');
    }

    const processingTime = Date.now() - startTime;

    // Log success to database
    await supabaseClient.from('image_generation_logs').insert({
      user_id: user?.id,
      user_email: user?.email,
      api_provider: 'freepik',
      model_name: 'freepik-mystic',
      task_type: 'text-to-image',
      prompt: prompt,
      image_url: imageUrl,
      status: 'success',
      success: true,
      processing_time_ms: processingTime,
      model_id: 'freepik-mystic',
      parameters: { aspect_ratio: 'widescreen_16_9' },
    });

    console.log('Image generated successfully:', imageUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        provider: 'freepik'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in freepik-generate function:', error);

    // Try to log error to database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: req.headers.get('Authorization')! },
          },
        }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();

      await supabaseClient.from('image_generation_logs').insert({
        user_id: user?.id,
        user_email: user?.email,
        api_provider: 'freepik',
        model_name: 'freepik-mystic',
        task_type: 'text-to-image',
        prompt: '',
        status: 'error',
        success: false,
        error_message: error instanceof Error ? error.message : String(error),
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
