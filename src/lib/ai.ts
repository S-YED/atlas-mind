import { supabase } from "@/integrations/supabase/client";

export interface AIRecommendation {
  module_id: string;
  reason: string;
  confidence: number;
}

export interface AIRecommendationResponse {
  success: boolean;
  recommendation: {
    id: string;
    user_id: string;
    suggested_module_ids: string[];
    reasoning: string;
    confidence_score: number;
    created_at: string;
    expires_at: string;
  };
  suggestions: AIRecommendation[];
}

export interface AIError {
  error: string;
  details?: string;
}

export async function generateRecommendations(
  userId: string
): Promise<AIRecommendationResponse> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error("Not authenticated");
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-personalize`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const errorData: AIError = await response.json();
    throw new Error(errorData.error || "Failed to generate recommendations");
  }

  return await response.json();
}

export async function getLatestRecommendations(userId: string) {
  const { data, error } = await supabase
    .from("ai_recommendations")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getModulesByIds(moduleIds: string[]) {
  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .in("id", moduleIds);

  if (error) {
    throw error;
  }

  return data;
}
