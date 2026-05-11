import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Trash2, Search, Download, Eye, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  getAllProjects, uploadProject, deleteProject, updateProject,
  getProjectSignedUrl, formatFileSize, Project,
} from '@/store/projectStore';
import { getAllBudgets } from '@/store/budgetStore';
import { Budget } from '@/types/budget';

const NONE = '__none__';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBudget, setFilterBudget] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetId, setBudgetId] = useState<string>(NONE);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([getAllProjects(), getAllBudgets()]);
      setProjects(p);
      setBudgets(b);
    } finally { setLoading(false); }
  }

  function resetForm() {
    setFile(null); setName(''); setDescription(''); setBudgetId(NONE);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onFileChange(f: File | null) {
    setFile(f);
    if (f && !name) setName(f.name.replace(/\.pdf$/i, ''));
  }

  async function handleUpload() {
    if (!file) return toast.error('Selecione um arquivo PDF');
    if (file.type !== 'application/pdf') return toast.error('Apenas arquivos PDF');
    if (!name.trim()) return toast.error('Informe um nome');
    setUploading(true);
    try {
      await uploadProject({
        file,
        name: name.trim(),
        description: description.trim() || undefined,
        budgetId: budgetId === NONE ? undefined : budgetId,
      });
      toast.success('Projeto anexado');
      setShowUpload(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar');
    } finally { setUploading(false); }
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Excluir o projeto "${p.name}"?`)) return;
    try {
      await deleteProject(p);
      toast.success('Excluído');
      await load();
    } catch { toast.error('Erro ao excluir'); }
  }

  async function handleOpen(p: Project) {
    try {
      const url = await getProjectSignedUrl(p.filePath);
      window.open(url, '_blank');
    } catch { toast.error('Erro ao abrir'); }
  }

  async function handleLink(p: Project, newBudgetId: string) {
    try {
      await updateProject(p.id, { budgetId: newBudgetId === NONE ? null : newBudgetId });
      await load();
      toast.success('Vínculo atualizado');
    } catch { toast.error('Erro ao vincular'); }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchBudget =
      filterBudget === 'all' ||
      (filterBudget === NONE && !p.budgetId) ||
      p.budgetId === filterBudget;
    return matchSearch && matchBudget;
  });

  const budgetMap = new Map(budgets.map(b => [b.id, b]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projetos</h2>
          <p className="text-sm text-muted-foreground">{projects.length} projeto(s) anexado(s)</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Upload className="h-4 w-4" /> Anexar Projeto
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterBudget} onValueChange={setFilterBudget}>
          <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os orçamentos</SelectItem>
            <SelectItem value={NONE}>Sem vínculo</SelectItem>
            {budgets.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.clientName || 'Sem cliente'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum projeto encontrado</p>
            <p className="mb-6 text-sm text-muted-foreground/70">Anexe seu primeiro PDF para organizar seus projetos</p>
            <Button onClick={() => setShowUpload(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Anexar Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => {
            const linked = p.budgetId ? budgetMap.get(p.budgetId) : null;
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    {p.description && <p className="truncate text-xs text-muted-foreground">{p.description}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(p.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                      {linked && (
                        <Badge variant="secondary" className="gap-1">
                          <Link2 className="h-3 w-3" /> {linked.clientName || 'Sem cliente'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={p.budgetId || NONE} onValueChange={v => handleLink(p, v)}>
                      <SelectTrigger className="w-44"><SelectValue placeholder="Vincular..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Sem vínculo</SelectItem>
                        {budgets.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.clientName || 'Sem cliente'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(p)} title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(p)} title="Baixar">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={(o) => { setShowUpload(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Anexar Projeto (PDF)</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Arquivo PDF</Label>
              <Input ref={fileRef} type="file" accept="application/pdf" onChange={e => onFileChange(e.target.files?.[0] || null)} />
              {file && <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Planta sala estar" />
            </div>
            <div className="grid gap-2">
              <Label>Descrição (opcional)</Label>
              <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Vincular a orçamento (opcional)</Label>
              <Select value={budgetId} onValueChange={setBudgetId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem vínculo</SelectItem>
                  {budgets.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.clientName || 'Sem cliente'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)} disabled={uploading}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Enviando...' : 'Anexar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
