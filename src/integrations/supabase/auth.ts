/**
 * Direct Supabase OAuth Integration
 * Handles Google and Apple Sign-In without any third-party wrappers
 */

import { supabase } from "./client";

export type OAuthProvider = "google" | "apple";

interface SignInWithOAuthOptions {
  redirectUrl?: string;
}

/**
 * Signs in user with OAuth provider (Google or Apple)
 * Automatically redirects to provider's login page
 * 
 * @param provider OAuth provider ('google' or 'apple')
 * @param options Configuration options for the sign-in flow
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  options?: SignInWithOAuthOptions
) {
  try {
    // Determine redirect URL - prioritize custom URL, then use current origin
    const redirectUrl = options?.redirectUrl || `${window.location.origin}/auth/callback`;

    const { error, data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        // This scopes request to ensure proper OAuth flow
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error(`OAuth sign-in error (${provider}):`, error.message);
      return {
        error,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Unexpected error during OAuth sign-in:`, errorMessage);
    return {
      error: {
        message: errorMessage,
        status: 500,
      },
      success: false,
    };
  }
}

/**
 * Handles OAuth callback after user authenticates with provider
 * Supabase automatically handles the callback, but this utility
 * can be used for additional processing
 */
export async function handleOAuthCallback() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session after OAuth callback:", error.message);
      return {
        error,
        session: null,
      };
    }

    return {
      error: null,
      session,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Unexpected error handling OAuth callback:", errorMessage);
    return {
      error: {
        message: errorMessage,
        status: 500,
      },
      session: null,
    };
  }
}

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      return {
        error,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Unexpected error during sign out:", errorMessage);
    return {
      error: {
        message: errorMessage,
        status: 500,
      },
      success: false,
    };
  }
}

/**
 * Gets current user session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return {
        error,
        session: null,
      };
    }

    return {
      error: null,
      session,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Unexpected error getting session:", errorMessage);
    return {
      error: {
        message: errorMessage,
        status: 500,
      },
      session: null,
    };
  }
}
