import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Client, getAllClients, createClient, updateClient, deleteClient, lookupCEP } from '@/store/clientStore';
import { toast } from 'sonner';

const empty: Partial<Client> = { name: '', document: '', phone: '', email: '', cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '', notes: '' };

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(empty);
  const [cepLoading, setCepLoading] = useState(false);

  async function load() {
    setLoading(true);
    setClients(await getAllClients());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setForm(c);
    setShowModal(true);
  }

  async function handleCepBlur() {
    if (!form.cep) return;
    setCepLoading(true);
    const found = await lookupCEP(form.cep);
    setCepLoading(false);
    if (found) {
      setForm(f => ({ ...f, ...found }));
    }
  }

  async function save() {
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return; }
    try {
      if (editing) await updateClient(editing.id, form);
      else await createClient(form);
      setShowModal(false);
      await load();
      toast.success('Cliente salvo');
    } catch {
      toast.error('Erro ao salvar');
    }
  }
  async function handleDelete(id: string) {
    if (!confirm('Excluir cliente?')) return;
    await deleteClient(id);
    await load();
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.document || '').includes(search)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-muted-foreground">{clients.length} cliente(s)</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Cliente</Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome, telefone ou CPF/CNPJ" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? <div className="py-16 text-center text-muted-foreground">Carregando...</div> :
        filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum cliente cadastrado</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-muted-foreground" />{c.name}</h3>
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                      {c.email && <p className="truncate text-xs text-muted-foreground">{c.email}</p>}
                      {c.city && <p className="text-xs text-muted-foreground">{[c.city, c.state].filter(Boolean).join(' / ')}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>Preencha os dados do cliente</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Nome completo *</Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>CPF / CNPJ</Label>
              <Input value={form.document || ''} onChange={e => setForm({ ...form, document: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Telefone / WhatsApp</Label>
              <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>CEP {cepLoading && <span className="text-xs text-muted-foreground">(buscando...)</span>}</Label>
              <Input value={form.cep || ''} onChange={e => setForm({ ...form, cep: e.target.value })} onBlur={handleCepBlur} placeholder="00000-000" />
            </div>
            <div className="grid gap-1.5">
              <Label>Estado</Label>
              <Input value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} maxLength={2} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Endereço (Rua/Avenida)</Label>
              <Input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Número</Label>
              <Input value={form.number || ''} onChange={e => setForm({ ...form, number: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Complemento</Label>
              <Input value={form.complement || ''} onChange={e => setForm({ ...form, complement: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Bairro</Label>
              <Input value={form.neighborhood || ''} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Cidade</Label>
              <Input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
