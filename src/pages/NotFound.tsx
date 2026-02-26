import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="mb-2 text-5xl font-bold">404</h1>
        <p className="mb-2 text-lg font-semibold text-foreground">Página não encontrada</p>
        <p className="mb-8 text-muted-foreground">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default" className="gap-2">
            <a href="/">
              <Home className="h-4 w-4" />
              Ir para Home
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </Button>
        </div>

        <div className="mt-12 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Rota solicitada: <code className="text-xs font-mono text-foreground">{location.pathname}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
