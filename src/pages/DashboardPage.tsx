import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#14B8A6", "#6366F1", "#F97316", "#6B7280"];

function DashboardPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
  const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));

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

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const currency = profile?.preferred_currency || "BRL";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  };

  const currentMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= monthStart && d <= monthEnd;
  });

  const prevMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  const totalBalance = transactions.reduce((acc, t) => acc + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);
  const monthIncome = currentMonthTxns.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
  const monthExpenses = currentMonthTxns.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
  const prevIncome = prevMonthTxns.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
  const prevExpenses = prevMonthTxns.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);

  // Pie chart data by category
  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    currentMonthTxns.filter((t) => t.type === "expense").forEach((t) => {
      const catName = (t.categories as any)?.name || "Outros";
      const catColor = (t.categories as any)?.color || "#6B7280";
      const existing = map.get(catName) || { name: catName, value: 0, color: catColor };
      existing.value += Number(t.amount);
      map.set(catName, existing);
    });
    return Array.from(map.values());
  }, [currentMonthTxns]);

  // Bar chart data last 6 months
  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(selectedMonth, i);
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const mTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= mStart && d <= mEnd;
      });
      months.push({
        month: format(m, "MMM", { locale: ptBR }),
        income: mTxns.filter((t) => t.type === "income").reduce((a, t) => a + Number(t.amount), 0),
        expenses: mTxns.filter((t) => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0),
      });
    }
    return months;
  }, [transactions, selectedMonth]);

  const recentTransactions = currentMonthTxns.slice(0, 8);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setSelectedMonth(new Date())}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saldo Total</span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <p className={`text-2xl font-display font-bold ${totalBalance >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(totalBalance)}
          </p>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Receitas</span>
            <ArrowUpRight className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-display font-bold text-success">{formatCurrency(monthIncome)}</p>
          {prevIncome > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {monthIncome >= prevIncome ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
              <span className="text-xs text-muted-foreground">
                {((monthIncome - prevIncome) / prevIncome * 100).toFixed(0)}% vs mês anterior
              </span>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Despesas</span>
            <ArrowDownRight className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-2xl font-display font-bold text-destructive">{formatCurrency(monthExpenses)}</p>
          {prevExpenses > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {monthExpenses <= prevExpenses ? <TrendingDown className="w-3 h-3 text-success" /> : <TrendingUp className="w-3 h-3 text-destructive" />}
              <span className="text-xs text-muted-foreground">
                {((monthExpenses - prevExpenses) / prevExpenses * 100).toFixed(0)}% vs mês anterior
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Despesas por Categoria</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground truncate flex-1">{cat.name}</span>
                    <span className="font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma despesa neste período</p>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Receitas vs Despesas (6 meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
              <XAxis dataKey="month" stroke="hsl(240 5% 55%)" fontSize={12} />
              <YAxis stroke="hsl(240 5% 55%)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(240 12% 8%)", border: "1px solid hsl(240 10% 16%)", borderRadius: "8px" }} />
              <Bar dataKey="income" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Transações Recentes</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: ((t.categories as any)?.color || "#6B7280") + "20", color: (t.categories as any)?.color || "#6B7280" }}
                  >
                    {((t.categories as any)?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.description || (t.categories as any)?.name || "Sem descrição"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma transação neste período</p>
        )}
      </motion.div>
    </div>
  );
}

export default DashboardPage;
