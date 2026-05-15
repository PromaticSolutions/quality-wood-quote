import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FolderOpen, DollarSign, TrendingUp, Plus, Calendar, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllBudgets } from '@/store/budgetStore';
import { getAllProjects, Project } from '@/store/projectStore';
import { getAllEvents, AgendaEvent } from '@/store/eventStore';
import { Budget, calculateBudgetTotal, formatCurrency } from '@/types/budget';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = { draft: 'Rascunho', finalized: 'Finalizado', sent: 'Enviado' };
const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  finalized: 'bg-accent text-accent-foreground',
  sent: 'bg-primary text-primary-foreground',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, p, e] = await Promise.all([getAllBudgets(), getAllProjects(), getAllEvents()]);
        setBudgets(b);
        setProjects(p);
        setEvents(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = budgets.reduce((s, b) => s + (b.customTotal ?? calculateBudgetTotal(b)), 0);
  const byStatus = budgets.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const recent = budgets.slice(0, 5);
  const now = Date.now();
  const upcoming = events.filter(e => new Date(e.startsAt).getTime() >= now).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Button onClick={() => navigate('/orcamentos')} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard icon={FileText} label="Orçamentos" value={budgets.length.toString()} />
            <StatCard icon={DollarSign} label="Valor total" value={formatCurrency(total)} />
            <StatCard icon={TrendingUp} label="Finalizados" value={(byStatus.finalized || 0).toString()} />
            <StatCard icon={FolderOpen} label="Projetos anexados" value={projects.length.toString()} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Orçamentos recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recent.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Nenhum orçamento ainda</p>
                ) : (
                  recent.map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/budget/${b.id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-md border p-3 hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{b.clientName || 'Sem cliente'}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                        <span className="font-bold">{formatCurrency(b.customTotal ?? calculateBudgetTotal(b))}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['draft', 'finalized', 'sent'] as const).map(s => (
                  <div key={s} className="flex items-center justify-between">
                    <Badge className={statusColors[s]}>{statusLabels[s]}</Badge>
                    <span className="font-semibold">{byStatus[s] || 0}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
