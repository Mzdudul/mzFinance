import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PRESET_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#14B8A6", "#6366F1", "#F97316"];

function CategoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "tag", color: "#8B5CF6" });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("is_default", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("categories").update({ name: form.name, icon: form.icon, color: form.color }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({ name: form.name, icon: form.icon, color: form.color, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
      resetForm();
      toast.success(editingId ? "Categoria atualizada!" : "Categoria criada!");
    },
    onError: () => toast.error("Erro ao salvar categoria"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida!");
    },
  });

  const resetForm = () => { setForm({ name: "", icon: "tag", color: "#8B5CF6" }); setEditingId(null); };

  const defaultCats = categories.filter((c) => c.is_default);
  const customCats = categories.filter((c) => !c.is_default);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Categorias</h1>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2 gradient-purple border-0">
          <Plus className="w-4 h-4" /> Nova Categoria
        </Button>
      </div>

      {/* Custom Categories */}
      {customCats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Minhas Categorias</h2>
          <div className="glass-card divide-y divide-border/50">
            {customCats.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: c.color + "20", color: c.color }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(c.id); setForm({ name: c.name, icon: c.icon, color: c.color }); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Categories */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Categorias Padrão</h2>
        <div className="glass-card divide-y divide-border/50">
          {defaultCats.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: c.color + "20", color: c.color }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <Input placeholder="Nome da categoria" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="bg-secondary border-border" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Cor</p>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setForm((f) => ({ ...f, color }))} className={`w-8 h-8 rounded-full transition-transform ${form.color === color ? "scale-125 ring-2 ring-foreground" : ""}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full gradient-purple border-0" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesPage;
