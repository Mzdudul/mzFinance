import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CURRENCIES = ["BRL", "USD", "EUR", "GBP"];

function TransactionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "expense", amount: "", description: "", category_id: "", date: format(new Date(), "yyyy-MM-dd"), currency: "BRL" });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name, icon, color)")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description || null,
        category_id: form.category_id || null,
        date: form.date,
        currency: form.currency,
      };
      if (editingId) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDialogOpen(false);
      resetForm();
      toast.success(editingId ? "Transação atualizada!" : "Transação adicionada!");
    },
    onError: () => toast.error("Erro ao salvar transação"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação removida!");
    },
  });

  const resetForm = () => {
    setForm({ type: "expense", amount: "", description: "", category_id: "", date: format(new Date(), "yyyy-MM-dd"), currency: "BRL" });
    setEditingId(null);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ type: t.type, amount: String(t.amount), description: t.description || "", category_id: t.category_id || "", date: t.date, currency: t.currency });
    setDialogOpen(true);
  };

  const filtered = transactions.filter((t) => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || (t.categories as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Transações</h1>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2 gradient-purple border-0">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar transações..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="glass-card divide-y divide-border/50">
        {filtered.length > 0 ? filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: ((t.categories as any)?.color || "#6B7280") + "20", color: (t.categories as any)?.color || "#6B7280" }}>
                {((t.categories as any)?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{t.description || (t.categories as any)?.name || "Sem descrição"}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                {t.type === "income" ? "+" : "-"}{new Intl.NumberFormat("pt-BR", { style: "currency", currency: t.currency }).format(Number(t.amount))}
              </span>
              <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        )) : (
          <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma transação encontrada</p>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm((f) => ({ ...f, type: "expense" }))} className={`py-2 rounded-xl text-sm font-medium transition ${form.type === "expense" ? "gradient-purple text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Despesa</button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, type: "income" }))} className={`py-2 rounded-xl text-sm font-medium transition ${form.type === "income" ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"}`}>Receita</button>
            </div>
            <Input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required className="bg-secondary border-border" />
            <Input placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="bg-secondary border-border" />
            <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="bg-secondary border-border" />
              <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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

export default TransactionsPage;
