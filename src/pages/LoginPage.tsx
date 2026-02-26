import { motion } from "framer-motion";
import { signInWithOAuth } from "@/integrations/supabase/auth";
import { diagnosSupabaseOAuth } from "@/integrations/supabase/diagnostic";
import { useState, useEffect } from "react";
import mzLogo from "@/assets/mz-logo.png";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      diagnosSupabaseOAuth().catch(() => {});
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithOAuth("google");
      
      if (result.error) {
        const errorMsg = result.error.message || "Unknown error";
        console.error("Google login failed:", result.error);
        
        // Provide helpful error messages
        if (errorMsg.includes("404") || errorMsg.includes("not found")) {
          setError(
            "OAuth provider not configured. Please enable Google OAuth in Supabase > Authentication > Providers. " +
            "Open the browser console (F12) for more details."
          );
        } else if (
          errorMsg.toLowerCase().includes("access blocked") ||
          errorMsg.toLowerCase().includes("invalid_app") ||
          errorMsg.toLowerCase().includes("unauthorized_client")
        ) {
          setError(
            "Google blocked the request: verify your OAuth client ID in Google Cloud Console " +
            "(consent screen, authorized domains and redirect URIs). See DECODIFICAR_ERROS.md for details."
          );
        } else if (errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
          setError("Invalid OAuth credentials in Supabase. Please verify your configuration.");
        } else {
          setError(`${errorMsg}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithOAuth("apple");
      
      if (result.error) {
        const errorMsg = result.error.message || "Unknown error";
        console.error("Apple login failed:", result.error);
        
        // Provide helpful error messages
        if (errorMsg.includes("404") || errorMsg.includes("not found")) {
          setError(
            "OAuth provider not configured. Please enable Apple Sign-In in Supabase > Authentication > Providers. " +
            "Open the browser console (F12) for more details."
          );
        } else if (errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
          setError("Invalid OAuth credentials in Supabase. Please verify your configuration.");
        } else {
          setError(`${errorMsg}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDebug = () => {
    setDebugMode(!debugMode);
    if (!debugMode) {
      diagnosSupabaseOAuth().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full gradient-purple opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full gradient-purple opacity-5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 space-y-8">
          {/* Logo & Branding */}
          <div className="text-center space-y-4">
            <motion.img
              src={mzLogo}
              alt="mzFinance"
              className="w-20 h-20 mx-auto rounded-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            />
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                mz<span className="text-gradient">Finance</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas finanças com inteligência
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-foreground/95 text-background font-medium transition-all hover:bg-foreground/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {loading ? "Conectando..." : "Continuar com Google"}
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-border bg-secondary/50 text-foreground font-medium transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!loading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              {loading ? "Conectando..." : "Continuar com Apple"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>

          {/* Debug Button (Development Only) */}
          {import.meta.env.DEV && (
            <button
              onClick={toggleDebug}
              className="w-full text-xs py-2 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-secondary/30 transition-colors"
            >
              {debugMode ? "Debug Mode: ON - Check Console (F12)" : "Debug Mode: OFF (Click to enable)"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
