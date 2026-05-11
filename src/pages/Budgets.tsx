import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Search, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getAllBudgets, createBudget, deleteBudget } from '@/store/budgetStore';
import { Budget, calculateBudgetTotal, formatCurrency } from '@/types/budget';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = { draft: 'Rascunho', finalized: 'Finalizado', sent: 'Enviado' };
const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  finalized: 'bg-accent text-accent-foreground',
  sent: 'bg-primary text-primary-foreground',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newArchitect, setNewArchitect] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    setLoading(true);
    const data = await getAllBudgets();
    setBudgets(data);
    setLoading(false);
  }

  const filtered = budgets.filter(b =>
    b.clientName.toLowerCase().includes(search.toLowerCase()) ||
    b.architectName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    try {
      const budget = await createBudget({ clientName: newClient, architectName: newArchitect });
      navigate(`/budget/${budget.id}`);
    } catch {
      toast.error('Erro ao criar orçamento');
    }
  }

  async function handleDelete(id: string) {
    await deleteBudget(id);
    await loadBudgets();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
          <p className="text-sm text-muted-foreground">{budgets.length} orçamento(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou arquiteta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum orçamento encontrado</p>
            <p className="mb-6 text-sm text-muted-foreground/70">Crie seu primeiro orçamento para começar</p>
            <Button onClick={() => setShowNew(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Criar Orçamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(b => (
            <Card
              key={b.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/budget/${b.id}`)}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold text-foreground">
                      {b.clientName || 'Sem cliente'}
                    </h3>
                    {b.architectName && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {b.architectName}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{formatCurrency(b.customTotal ?? calculateBudgetTotal(b))}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={e => { e.stopPropagation(); handleDelete(b.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Input id="client" value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="architect">Arquiteta</Label>
              <Input id="architect" value={newArchitect} onChange={e => setNewArchitect(e.target.value)} placeholder="Nome da arquiteta" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar Orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
