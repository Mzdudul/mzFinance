import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * OAuth Callback Handler
 * This page is called by Supabase after user authenticates with Google/Apple
 * It simply waits for the auth state to update and then redirects to dashboard
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is authenticated and we're done loading, redirect to dashboard
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">
          Processando autenticação...
        </p>
        <p className="text-xs text-muted-foreground/75">
          Você será redirecionado em breve
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
