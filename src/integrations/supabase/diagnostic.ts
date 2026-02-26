/**
 * Supabase OAuth Diagnostic Module
 * Helps identify and troubleshoot OAuth configuration issues
 */

import { supabase } from "./client";

export async function diagnosSupabaseOAuth() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      error: "Missing environment variables",
      environment: {
        supabaseUrl,
        hasKey: !!supabaseKey,
        projectId,
      },
      steps: [
        "Create .env file from .env.example",
        "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
        "Restart dev server",
      ],
    };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    return {
      success: true,
      environment: {
        supabaseUrl,
        hasKey: !!supabaseKey,
        projectId,
      },
      connection: {
        session: session ?? null,
        sessionError: sessionError ? sessionError.message : null,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: String(err),
      environment: {
        supabaseUrl,
        hasKey: !!supabaseKey,
        projectId,
      },
    };
  }
}

export async function testOAuthProvider(provider: "google" | "apple") {
  try {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      return { provider, success: false, error: error.message };
    }

    return { provider, success: true };
  } catch (err) {
    return { provider, success: false, error: String(err) };
  }
}
