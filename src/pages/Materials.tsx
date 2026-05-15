import { useEffect, useRef, useState } from 'react';
import { Plus, Upload, Pencil, Trash2, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Material, getAllMaterials, createMaterial, updateMaterial, deleteMaterial, parseNFeXML, createMaterialsBulk, ParsedNFeItem } from '@/store/materialStore';
import { formatCurrency } from '@/types/budget';
import { toast } from 'sonner';

const UNITS = ['m²', 'm', 'un', 'kg', 'pç'];
const CATEGORIES = ['chapa', 'ferragem', 'vidro', 'perfil', 'outros'];
const empty: Partial<Material> = { name: '', unit: 'un', costPrice: 0, category: 'outros', code: '', description: '' };

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<Partial<Material>>(empty);

  const [showImport, setShowImport] = useState(false);
  const [parsed, setParsed] = useState<(ParsedNFeItem & { selected: boolean; category: string })[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setItems(await getAllMaterials());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(m: Material) { setEditing(m); setForm(m); setShowModal(true); }

  async function save() {
    if (!form.name?.trim()) { toast.error('Nome obrigatório'); return; }
    try {
      if (editing) await updateMaterial(editing.id, form);
      else await createMaterial(form);
      setShowModal(false);
      await load();
      toast.success('Material salvo');
    } catch { toast.error('Erro ao salvar'); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Excluir material?')) return;
    await deleteMaterial(id);
    await load();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const result = parseNFeXML(text);
      if (result.length === 0) { toast.error('Nenhum item encontrado no XML'); return; }
      setParsed(result.map(r => ({ ...r, selected: true, category: 'outros' })));
      setShowImport(true);
    } catch {
      toast.error('XML inválido');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function confirmImport() {
    const selected = parsed.filter(p => p.selected);
    if (selected.length === 0) { toast.error('Selecione ao menos um item'); return; }
    try {
      await createMaterialsBulk(selected.map(s => ({
        name: s.name,
        unit: s.unit,
        costPrice: s.costPrice,
        category: s.category,
        code: s.code,
      })));
      setShowImport(false);
      await load();
      toast.success(`${selected.length} materiais importados`);
    } catch { toast.error('Erro ao importar'); }
  }

  const filtered = items.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.code || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || m.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Materiais</h2>
          <p className="text-sm text-muted-foreground">{items.length} material(is) cadastrado(s)</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xml" className="hidden" onChange={handleFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" /> Importar XML NF-e</Button>
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Material</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar material" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="py-16 text-center text-muted-foreground">Carregando...</div> :
        filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground"><Package className="mb-3 h-10 w-10 opacity-40" />Nenhum material</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{m.name}</h3>
                      {m.code && <p className="text-xs text-muted-foreground">Cód: {m.code}</p>}
                    </div>
                    <Badge variant="secondary" className="shrink-0">{m.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.unit}</span>
                    <span className="font-bold">{formatCurrency(m.costPrice)}</span>
                  </div>
                  <div className="mt-3 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Manual modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            <DialogDescription>Cadastro manual</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Nome *</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Unidade</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Preço de custo (R$)</Label>
                <Input type="number" step="0.01" value={form.costPrice ?? 0} onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Código (opcional)</Label>
                <Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import preview */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importar materiais do XML</DialogTitle>
            <DialogDescription>{parsed.length} item(ns) encontrado(s). Selecione os que deseja importar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {parsed.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox checked={p.selected} onCheckedChange={c => setParsed(prev => prev.map((x, idx) => idx === i ? { ...x, selected: !!c } : x))} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.unit} · {formatCurrency(p.costPrice)}{p.code ? ` · ${p.code}` : ''}</p>
                </div>
                <Select value={p.category} onValueChange={v => setParsed(prev => prev.map((x, idx) => idx === i ? { ...x, category: v } : x))}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>Cancelar</Button>
            <Button onClick={confirmImport}>Importar selecionados</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
