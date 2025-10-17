import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  user_id: string;
  module_preferences?: string[];
  recent_progress?: Array<{
    module_id: string;
    completion_score: number;
    time_spent_minutes: number;
  }>;
}

interface AIRecommendation {
  module_id: string;
  reason: string;
  confidence: number;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "AI service not configured. Please contact administrator.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: RequestPayload = await req.json();
    const userId = user.id;

    console.log("Generating recommendations for user:", userId);

    const { data: modules, error: modulesError } = await supabase
      .from("learning_modules")
      .select("id, title, description, level, ai_tags, estimated_time_minutes");

    if (modulesError) {
      console.error("Error fetching modules:", modulesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch modules" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: userProgress, error: progressError } = await supabase
      .from("progress_logs")
      .select("module_id, completion_score, time_spent_minutes")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("learning_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    const preferences = profile?.learning_preferences || {};

    const systemPrompt = `You are an adaptive learning AI coach. Analyze user progress and preferences to suggest 3-5 learning modules.

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "module_id": "uuid-here",
      "reason": "Brief explanation why this module suits the user",
      "confidence": 0.85
    }
  ]
}

Consider:
- User's completed modules and scores
- Learning preferences (difficulty, pace, topics)
- Logical progression paths
- Variety in recommendations
- Confidence should be 0-1 decimal`;

    const userMessage = `Available modules:
${JSON.stringify(modules, null, 2)}

User's recent progress:
${JSON.stringify(userProgress || [], null, 2)}

User preferences:
${JSON.stringify(preferences, null, 2)}

Provide 3-5 personalized module recommendations.`;

    console.log("Calling OpenAI API...");

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ] as OpenAIMessage[],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);

      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "AI service is currently rate limited. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (openaiResponse.status === 402 || openaiResponse.status === 401) {
        return new Response(
          JSON.stringify({
            error: "AI service configuration issue. Please contact administrator.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate recommendations" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse: OpenAIResponse = await openaiResponse.json();
    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("OpenAI response:", content);

    let parsedRecommendations: { suggestions: AIRecommendation[] };
    try {
      parsedRecommendations = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI recommendations" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!parsedRecommendations.suggestions || !Array.isArray(parsedRecommendations.suggestions)) {
      console.error("Invalid recommendations format:", parsedRecommendations);
      return new Response(
        JSON.stringify({ error: "Invalid recommendations format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const moduleIds = parsedRecommendations.suggestions.map((s) => s.module_id);
    const avgConfidence = parsedRecommendations.suggestions.reduce(
      (acc, s) => acc + s.confidence,
      0
    ) / parsedRecommendations.suggestions.length;

    const reasoning = parsedRecommendations.suggestions
      .map((s, i) => `${i + 1}. ${s.reason}`)
      .join("\n");

    const { data: storedRec, error: insertError } = await supabase
      .from("ai_recommendations")
      .insert({
        user_id: userId,
        suggested_module_ids: moduleIds,
        reasoning: reasoning,
        confidence_score: avgConfidence,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing recommendations:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store recommendations" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Recommendations stored successfully:", storedRec.id);

    return new Response(
      JSON.stringify({
        success: true,
        recommendation: storedRec,
        suggestions: parsedRecommendations.suggestions,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});