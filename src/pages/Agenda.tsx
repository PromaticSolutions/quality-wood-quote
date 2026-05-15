import { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AgendaEvent, EventType, getAllEvents, createEvent, updateEvent, deleteEvent } from '@/store/eventStore';
import { Client, getAllClients } from '@/store/clientStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPES: { value: EventType; label: string }[] = [
  { value: 'entrega', label: 'Entrega' },
  { value: 'instalacao', label: 'Instalação' },
  { value: 'medicao', label: 'Medição' },
  { value: 'reuniao', label: 'Reunião' },
];
const TYPE_COLORS: Record<EventType, string> = {
  entrega: 'bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-300',
  instalacao: 'bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-300',
  medicao: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-300',
  reuniao: 'bg-violet-500/15 text-violet-700 border-violet-300 dark:text-violet-300',
};

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
function fmtDateTimeLocal(iso: string) { const d = new Date(iso); const off = d.getTimezoneOffset(); const local = new Date(d.getTime() - off * 60000); return local.toISOString().slice(0, 16); }
function isSoon(iso: string) { const ms = new Date(iso).getTime() - Date.now(); return ms >= 0 && ms <= 3 * 86400000; }

export default function Agenda() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);
  const [form, setForm] = useState<Partial<AgendaEvent>>({});

  async function load() {
    const [e, c] = await Promise.all([getAllEvents(), getAllClients()]);
    setEvents(e);
    setClients(c);
  }
  useEffect(() => { load(); }, []);

  function openNew(date?: Date) {
    const d = date || new Date();
    d.setHours(9, 0, 0, 0);
    setEditing(null);
    setForm({ title: '', type: 'reuniao', startsAt: d.toISOString(), notes: '', clientId: undefined });
    setShowModal(true);
  }
  function openEdit(ev: AgendaEvent) {
    setEditing(ev);
    setForm(ev);
    setShowModal(true);
  }
  async function save() {
    if (!form.title?.trim() || !form.startsAt) { toast.error('Título e data obrigatórios'); return; }
    try {
      if (editing) await updateEvent(editing.id, form);
      else await createEvent(form);
      setShowModal(false);
      await load();
      toast.success('Evento salvo');
    } catch { toast.error('Erro ao salvar'); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Excluir evento?')) return;
    await deleteEvent(id);
    await load();
  }

  // Build month grid
  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startWeekday = first.getDay();
    const start = addDays(first, -startWeekday);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  // Build week
  const weekDays = useMemo(() => {
    const start = addDays(startOfDay(cursor), -cursor.getDay());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const m: Record<string, AgendaEvent[]> = {};
    for (const ev of events) {
      const k = startOfDay(new Date(ev.startsAt)).toISOString();
      (m[k] ||= []).push(ev);
    }
    return m;
  }, [events]);

  function getDayEvents(d: Date) {
    return eventsByDay[startOfDay(d).toISOString()] || [];
  }

  function shift(delta: number) {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta * 7);
    setCursor(d);
  }

  const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agenda</h2>
          <p className="text-sm text-muted-foreground">Compromissos e prazos</p>
        </div>
        <Button onClick={() => openNew()} className="gap-2"><Plus className="h-4 w-4" /> Novo Evento</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Hoje</Button>
              <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
              <span className="ml-3 text-base font-semibold capitalize">{monthLabel}</span>
            </div>
            <Tabs value={view} onValueChange={v => setView(v as any)}>
              <TabsList>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {view === 'month' ? (
            <>
              <div className="grid grid-cols-7 gap-px text-xs font-semibold text-muted-foreground">
                {weekDayNames.map(d => <div key={d} className="p-2 text-center">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px bg-border">
                {monthDays.map((d, i) => {
                  const inMonth = d.getMonth() === cursor.getMonth();
                  const isToday = sameDay(d, new Date());
                  const dayEvents = getDayEvents(d);
                  return (
                    <div key={i} className={cn('min-h-[90px] bg-background p-1.5 cursor-pointer hover:bg-muted/50', !inMonth && 'opacity-40')} onClick={() => openNew(d)}>
                      <div className={cn('mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs', isToday && 'bg-primary text-primary-foreground font-bold')}>{d.getDate()}</div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} onClick={e => { e.stopPropagation(); openEdit(ev); }}
                            className={cn('truncate rounded px-1.5 py-0.5 text-[10px] border', TYPE_COLORS[ev.type], isSoon(ev.startsAt) && 'ring-1 ring-destructive')}>
                            {new Date(ev.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d, i) => {
                const dayEvents = getDayEvents(d).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
                const isToday = sameDay(d, new Date());
                return (
                  <div key={i} className="min-h-[300px] rounded-md border p-2">
                    <div className={cn('mb-2 text-center text-xs font-semibold', isToday && 'text-primary')}>
                      {weekDayNames[d.getDay()]} {d.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id} onClick={() => openEdit(ev)} className={cn('cursor-pointer rounded border p-2 text-xs hover:opacity-80', TYPE_COLORS[ev.type], isSoon(ev.startsAt) && 'ring-1 ring-destructive')}>
                          <div className="font-semibold">{new Date(ev.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="truncate">{ev.title}</div>
                        </div>
                      ))}
                      {dayEvents.length === 0 && <p className="text-center text-xs text-muted-foreground">—</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => openNew(d)}>+ Adicionar</Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            <DialogDescription>Preencha os dados</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Título *</Label>
              <Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as EventType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Cliente</Label>
                <Select value={form.clientId || 'none'} onValueChange={v => setForm({ ...form, clientId: v === 'none' ? undefined : v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Nenhum —</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Data e hora *</Label>
              <Input type="datetime-local" value={form.startsAt ? fmtDateTimeLocal(form.startsAt) : ''} onChange={e => setForm({ ...form, startsAt: new Date(e.target.value).toISOString() })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {editing && <Button variant="ghost" className="text-destructive" onClick={() => { handleDelete(editing.id); setShowModal(false); }}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
