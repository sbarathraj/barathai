import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// DeAPI configuration
const DEAPI_BASE_URL = "https://api.deapi.ai/api/v1/client";
const DEAPI_MODEL = "ZImageTurbo_INT8";
const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dltti9hiw";
const CLOUDINARY_API_KEY = "763847513187774";
const CLOUDINARY_API_SECRET = "FbVD7VV1mh3_opi2Cn2sxMJIKvE";

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  console.log("Uploading image to Cloudinary...");
  
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signatureBuffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(signatureString)
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("file", imageUrl);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const uploaded = await uploadResponse.json();
  console.log("✅ Uploaded to Cloudinary:", uploaded.secure_url);
  return uploaded.secure_url;
}

async function pollForResult(requestId: string, apiKey: string): Promise<string> {
  console.log(`Polling for result with request_id: ${requestId}`);
  
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const statusResponse = await fetch(
      `${DEAPI_BASE_URL}/request-status/${requestId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      throw new Error(`DeAPI status check failed: ${statusResponse.status} - ${errorText}`);
    }

    const statusData = await statusResponse.json();
    console.log(`Poll attempt ${attempt + 1}:`, statusData.data);

    if (statusData.data.status === "done") {
      if (statusData.data.result_url) {
        return statusData.data.result_url;
      }
      throw new Error("DeAPI returned done status but no result_url");
    }

    if (statusData.data.status === "error" || statusData.data.status === "failed") {
      throw new Error(`DeAPI generation failed: ${statusData.data.status}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("DeAPI generation timed out after maximum poll attempts");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, width = 768, height = 768, steps = 8, negative_prompt = "" } = await req.json();
    console.log("DeAPI image generation request:", { prompt, width, height, steps });
    const startTime = Date.now();

    // Init Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Auth user (optional)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    // Get DeAPI key
    const deapiKey = Deno.env.get("DEAPI_API_KEY");
    if (!deapiKey) throw new Error("DeAPI API key not configured");

    // Generate random seed
    const seed = Math.floor(Math.random() * 2147483647);

    // Step 1: Submit image generation request
    console.log("Submitting request to DeAPI...");
    const submitResponse = await fetch(`${DEAPI_BASE_URL}/txt2img`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deapiKey}`
      },
      body: JSON.stringify({
        prompt,
        model: DEAPI_MODEL,
        width,
        height,
        seed,
        steps,
        negative_prompt
      })
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`DeAPI submission failed: ${submitResponse.status} - ${errorText}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.data?.request_id;
    
    if (!requestId) {
      throw new Error("DeAPI did not return a request_id");
    }

    console.log("DeAPI request submitted, request_id:", requestId);

    // Step 2: Poll for result
    const resultUrl = await pollForResult(requestId, deapiKey);
    console.log("DeAPI generation complete, result_url:", resultUrl);

    // Step 3: Upload to Cloudinary
    const finalImageUrl = await uploadToCloudinary(resultUrl);

    const responseTime = Date.now() - startTime;

    // Save log in Supabase
    await supabase.from("image_generation_logs").insert({
      user_id: userId,
      user_email: userEmail,
      api_provider: "deapi",
      model_name: DEAPI_MODEL,
      model_id: DEAPI_MODEL,
      task_type: "text-to-image",
      prompt,
      negative_prompt,
      image_url: finalImageUrl,
      status: "success",
      parameters: { model: DEAPI_MODEL, width, height, steps, seed },
      image_metadata: { format: "image", request_id: requestId },
      processing_time_ms: responseTime,
      response_time_ms: responseTime,
      width,
      height,
      seed,
      num_inference_steps: steps,
      success: true
    });

    // Return response
    return new Response(JSON.stringify({
      success: true,
      image: finalImageUrl,
      content: "",
      metadata: { 
        model: DEAPI_MODEL, 
        prompt, 
        response_time_ms: responseTime,
        request_id: requestId,
        width,
        height,
        seed
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in DeAPI image generation:", error);

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

      const authHeader = req.headers.get("Authorization");
      let userId: string | null = null;
      let userEmail: string | null = null;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        userEmail = user?.email || null;
      }

      await supabase.from("image_generation_logs").insert({
        user_id: userId,
        user_email: userEmail,
        api_provider: "deapi",
        model_name: DEAPI_MODEL,
        model_id: DEAPI_MODEL,
        task_type: "text-to-image",
        prompt: "unknown",
        status: "error",
        error_message: error.message,
        success: false
      });
    } catch (logError) {
      console.error("Error logging failure:", logError);
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Failed to generate image",
      details: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
