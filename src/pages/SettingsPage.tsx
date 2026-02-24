import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CURRENCIES = ["BRL", "USD", "EUR", "GBP", "JPY", "ARS"];

function SettingsPage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("BRL");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCurrency(profile.preferred_currency || "BRL");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ display_name: displayName, preferred_currency: currency }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar perfil"),
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Configurações</h1>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center text-xl font-bold text-primary-foreground">
              {(displayName || user?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">{displayName || "Usuário"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nome de exibição</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Moeda preferida</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full gradient-purple border-0" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold mb-4">Conta</h2>
        <Button variant="destructive" onClick={signOut} className="w-full">
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
