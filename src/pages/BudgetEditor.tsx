import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Trash2, ChevronDown, ChevronRight, Pencil, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  getBudget, updateBudgetInfo,
  createRoom as dbCreateRoom, updateRoom as dbUpdateRoom, deleteRoom as dbDeleteRoom,
  createItem as dbCreateItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem,
} from '@/store/budgetStore';
import { Budget, Room, BudgetItem, calculateRoomSubtotal, calculateBudgetTotal, formatCurrency } from '@/types/budget';
import { generateBudgetPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';

export default function BudgetEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemRoomId, setItemRoomId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemMeasurements, setItemMeasurements] = useState('');
  const [itemObservations, setItemObservations] = useState('');

  const reload = useCallback(async () => {
    if (!id) return;
    const b = await getBudget(id);
    if (b) {
      setBudget(b);
      setExpandedRooms(prev => prev.size > 0 ? prev : new Set(b.rooms.map(r => r.id)));
    } else {
      navigate('/');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  if (!budget) return null;

  const total = calculateBudgetTotal(budget);
  const displayTotal = budget.customTotal ?? total;

  // Budget info handlers
  async function updateField(field: keyof Budget, value: string | number) {
    const updated = { ...budget!, [field]: value };
    setBudget(updated);
    await updateBudgetInfo(budget!.id, { [field]: value });
  }

  // Room handlers
  function openAddRoom() {
    setEditingRoom(null);
    setRoomName('');
    setShowRoomModal(true);
  }
  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomName(room.name);
    setShowRoomModal(true);
  }
  async function saveRoom() {
    if (!roomName.trim()) return;
    try {
      if (editingRoom) {
        await dbUpdateRoom(editingRoom.id, roomName.trim());
      } else {
        await dbCreateRoom(budget!.id, roomName.trim(), budget!.rooms.length);
      }
      setShowRoomModal(false);
      await reload();
    } catch {
      toast.error('Erro ao salvar cômodo');
    }
  }
  async function handleDeleteRoom(roomId: string) {
    await dbDeleteRoom(roomId);
    await reload();
  }

  // Item handlers
  function openAddItem(roomId: string) {
    setEditingItem(null);
    setItemRoomId(roomId);
    setItemName('');
    setItemValue('');
    setItemMeasurements('');
    setItemObservations('');
    setShowItemModal(true);
  }
  function openEditItem(item: BudgetItem) {
    setEditingItem(item);
    setItemRoomId(item.roomId);
    setItemName(item.name);
    setItemValue(item.value.toString());
    setItemMeasurements(item.measurements || '');
    setItemObservations(item.observations || '');
    setShowItemModal(true);
  }
  async function saveItem() {
    if (!itemName.trim() || !itemValue || Number(itemValue) <= 0) return;
    try {
      if (editingItem) {
        await dbUpdateItem(editingItem.id, {
          name: itemName.trim(),
          value: Number(itemValue),
          measurements: itemMeasurements.trim() || undefined,
          observations: itemObservations.trim() || undefined,
        });
      } else {
        const room = budget!.rooms.find(r => r.id === itemRoomId);
        await dbCreateItem(itemRoomId, {
          name: itemName.trim(),
          value: Number(itemValue),
          measurements: itemMeasurements.trim() || undefined,
          observations: itemObservations.trim() || undefined,
          displayOrder: room ? room.items.length : 0,
        });
      }
      setShowItemModal(false);
      await reload();
    } catch {
      toast.error('Erro ao salvar item');
    }
  }
  async function handleDeleteItem(itemId: string) {
    await dbDeleteItem(itemId);
    await reload();
  }

  function toggleRoom(roomId: string) {
    setExpandedRooms(prev => {
      const s = new Set(prev);
      s.has(roomId) ? s.delete(roomId) : s.add(roomId);
      return s;
    });
  }

  async function handleExportPDF() {
    try {
      await generateBudgetPDF(budget!);
      toast.success('PDF exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar PDF');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">
            {budget.clientName || 'Novo Orçamento'}
          </h2>
          <p className="text-xs text-muted-foreground">
            Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Budget info */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Informações do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Cliente</Label>
              <Input value={budget.clientName} onChange={e => updateField('clientName', e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Arquiteta</Label>
              <Input value={budget.architectName} onChange={e => updateField('architectName', e.target.value)} placeholder="Nome da arquiteta" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Endereço (Logradouro e Número)</Label>
              <Input value={budget.clientAddress || ''} onChange={e => updateField('clientAddress', e.target.value)} placeholder="Ex: Rua das Flores, 123" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Bairro</Label>
              <Input value={budget.clientNeighborhood || ''} onChange={e => updateField('clientNeighborhood', e.target.value)} placeholder="Ex: Centro" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Cidade</Label>
              <Input value={budget.clientCity || ''} onChange={e => updateField('clientCity', e.target.value)} placeholder="Ex: São Paulo" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Estado</Label>
              <Input value={budget.clientState || ''} onChange={e => updateField('clientState', e.target.value)} placeholder="Ex: SP" maxLength={2} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Prazo (dias úteis)</Label>
              <Input type="number" value={budget.deliveryDays} onChange={e => updateField('deliveryDays', Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Forma de Pagamento</Label>
              <Input value={budget.paymentTerms} onChange={e => updateField('paymentTerms', e.target.value)} placeholder="Ex: 50% entrada + 6x cartão" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Observações Gerais (opcional)</Label>
              <Textarea
                value={budget.generalObservations || ''}
                onChange={e => updateField('generalObservations', e.target.value)}
                placeholder="Ex: Todos os armários superiores serão na cor branca."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cômodos</h3>
        <Button variant="outline" size="sm" onClick={openAddRoom} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Adicionar Cômodo
        </Button>
      </div>

      {budget.rooms.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum cômodo adicionado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-6 space-y-3">
          {budget.rooms.map(room => {
            const subtotal = calculateRoomSubtotal(room);
            const isOpen = expandedRooms.has(room.id);
            return (
              <Card key={room.id}>
                <div
                  className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/30"
                  onClick={() => toggleRoom(room.id)}
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-semibold text-foreground">{room.name}</span>
                    <span className="text-xs text-muted-foreground">({room.items.length} {room.items.length === 1 ? 'item' : 'itens'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEditRoom(room); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); handleDeleteRoom(room.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <CardContent className="border-t pt-4">
                    {room.items.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {room.items.map(item => (
                          <div key={item.id} className="flex items-start justify-between rounded-md border bg-secondary/30 p-3">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="font-medium text-foreground">{item.name}</p>
                              {item.measurements && <p className="text-xs text-muted-foreground">Medidas: {item.measurements}</p>}
                              {item.observations && <p className="text-xs text-muted-foreground italic">{item.observations}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-semibold text-foreground">{formatCurrency(item.value)}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItem(item)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openAddItem(room.id)} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Adicionar Item
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Financial Summary */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resumo Financeiro</h3>
          {budget.rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between py-1 text-sm">
              <span className="text-muted-foreground">{room.name}</span>
              <span className="font-medium text-foreground">{formatCurrency(calculateRoomSubtotal(room))}</span>
            </div>
          ))}
          {budget.rooms.length > 0 && <div className="my-3 border-t" />}
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-muted-foreground">Subtotal Calculado</span>
            <span className="font-medium text-foreground">{formatCurrency(total)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary p-4">
            <span className="font-semibold text-primary-foreground">TOTAL DO PROJETO</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-foreground/70">R$</span>
              <Input
                type="number"
                className="h-8 w-36 border-primary-foreground/30 bg-primary-foreground/10 text-right font-bold text-primary-foreground"
                value={displayTotal}
                onChange={e => {
                  const v = Number(e.target.value);
                  updateField('customTotal', v !== total ? v : undefined as any);
                }}
              />
              {budget.customTotal !== undefined && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70" onClick={() => updateField('customTotal', undefined as any)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Modal */}
      <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Editar Cômodo' : 'Novo Cômodo'}</DialogTitle>
            <DialogDescription>Informe o nome do cômodo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label>Nome do Cômodo</Label>
            <Input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Ex: Cozinha, Banheiro, Sala" onKeyDown={e => e.key === 'Enter' && saveRoom()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomModal(false)}>Cancelar</Button>
            <Button onClick={saveRoom} disabled={!roomName.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            <DialogDescription>Preencha as informações do item</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label>Nome do Item *</Label>
              <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Armários inferiores" />
            </div>
            <div className="grid gap-1.5">
              <Label>Valor (R$) *</Label>
              <Input type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="grid gap-1.5">
              <Label>Medidas (opcional)</Label>
              <Input value={itemMeasurements} onChange={e => setItemMeasurements(e.target.value)} placeholder="Ex: 2.5m x 1.2m" />
            </div>
            <div className="grid gap-1.5">
              <Label>Observações (opcional)</Label>
              <Textarea value={itemObservations} onChange={e => setItemObservations(e.target.value)} placeholder="Ex: Freijó imperial, puxadores meia cava" maxLength={500} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemModal(false)}>Cancelar</Button>
            <Button onClick={saveItem} disabled={!itemName.trim() || !itemValue || Number(itemValue) <= 0}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
