import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Loader2, Lock, Mail, MessageCircle, Settings as SettingsIcon, Shield, Sparkles, Trash2, Upload, User, Building2, Plug, Sliders, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, lookupCEP, type Profile, updateMyProfile, uploadAvatar, uploadCompanyLogo } from '@/store/profileStore';
import { supabase } from '@/integrations/supabase/client';

function passwordStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => { setProfile(p); setLoading(false); });
  }, []);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((prev) => prev ? { ...prev, [k]: v } : prev);
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      await updateMyProfile(profile);
      toast.success('Alterações salvas');
    } catch (e: any) {
      toast.error('Erro ao salvar', { description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCEP(cep: string) {
    set('cep', cep);
    if (cep.replace(/\D/g, '').length === 8) {
      const r = await lookupCEP(cep);
      if (r) {
        set('address', r.address);
        set('neighborhood', r.neighborhood);
        set('city', r.city);
        set('state', r.state);
        toast.success('Endereço encontrado');
      }
    }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await uploadAvatar(f);
      set('avatarUrl', url);
      await updateMyProfile({ avatarUrl: url });
      toast.success('Foto atualizada');
    } catch (err: any) { toast.error('Erro ao enviar foto', { description: err.message }); }
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await uploadCompanyLogo(f);
      set('logoUrl', url);
      await updateMyProfile({ logoUrl: url });
      toast.success('Logo atualizado');
    } catch (err: any) { toast.error('Erro ao enviar logo', { description: err.message }); }
  }

  if (loading || !profile) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil, empresa, segurança e preferências.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col gap-6 lg:flex-row">
        <TabsList className="h-auto flex-row overflow-x-auto bg-transparent p-0 lg:w-56 lg:flex-col lg:items-stretch lg:bg-card lg:border lg:border-border lg:rounded-md lg:p-2">
          <SettingsTab value="profile" icon={User} label="Perfil" />
          <SettingsTab value="company" icon={Building2} label="Empresa" />
          <SettingsTab value="security" icon={Shield} label="Segurança" />
          <SettingsTab value="connections" icon={Plug} label="Contas conectadas" />
          <SettingsTab value="preferences" icon={Sliders} label="Preferências" />
          <SettingsTab value="plan" icon={CreditCard} label="Plano" />
        </TabsList>

        <div className="flex-1 min-w-0">
          {/* PERFIL */}
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Perfil</CardTitle><CardDescription>Suas informações pessoais.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={profile.avatarUrl} /><AvatarFallback className="bg-primary text-primary-foreground text-xl">{(profile.fullName || user?.email || '?').slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"><Upload className="h-3.5 w-3.5" />Enviar foto</Label>
                    <input id="avatar" type="file" accept="image/*" className="hidden" onChange={onAvatar} />
                    {profile.avatarUrl && <Button size="sm" variant="ghost" className="text-destructive ml-2" onClick={async () => { set('avatarUrl', undefined); await updateMyProfile({ avatarUrl: undefined }); toast.success('Foto removida'); }}><Trash2 className="h-3.5 w-3.5 mr-1" />Remover</Button>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nome completo"><Input value={profile.fullName || ''} onChange={(e) => set('fullName', e.target.value)} /></Field>
                  <Field label="Nome da empresa / marcenaria"><Input value={profile.companyName || ''} onChange={(e) => set('companyName', e.target.value)} /></Field>
                  <Field label="Cargo / função"><Input value={profile.roleTitle || ''} onChange={(e) => set('roleTitle', e.target.value)} /></Field>
                  <Field label="Telefone"><Input value={profile.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="(00) 00000-0000" /></Field>
                  <Field label="E-mail" className="sm:col-span-2">
                    <div className="flex gap-2">
                      <Input value={user?.email || ''} readOnly className="bg-muted/40" />
                      <Tooltip><TooltipTrigger asChild><span><Button variant="outline" disabled>Solicitar alteração</Button></span></TooltipTrigger><TooltipContent>Em breve</TooltipContent></Tooltip>
                    </div>
                  </Field>
                </div>
                <SaveBar saving={saving} onSave={save} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMPRESA */}
          <TabsContent value="company" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Informações da empresa</CardTitle><CardDescription>Esses dados aparecerão no PDF dos orçamentos.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-md border border-border bg-muted/30 overflow-hidden">
                    {profile.logoUrl ? <img src={profile.logoUrl} alt="logo" className="h-full w-full object-contain" /> : <Building2 className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo" className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"><Upload className="h-3.5 w-3.5" />Enviar logo</Label>
                    <input id="logo" type="file" accept="image/*" className="hidden" onChange={onLogo} />
                    {profile.logoUrl && <Button size="sm" variant="ghost" className="text-destructive ml-2" onClick={async () => { set('logoUrl', undefined); await updateMyProfile({ logoUrl: undefined }); toast.success('Logo removido'); }}><Trash2 className="h-3.5 w-3.5 mr-1" />Remover</Button>}
                    <p className="text-xs text-muted-foreground">Usado no cabeçalho dos orçamentos em PDF.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Razão social"><Input value={profile.legalName || ''} onChange={(e) => set('legalName', e.target.value)} /></Field>
                  <Field label="CNPJ"><Input value={profile.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></Field>
                  <Field label="CEP"><Input value={profile.cep || ''} onChange={(e) => handleCEP(e.target.value)} placeholder="00000-000" /></Field>
                  <Field label="Endereço"><Input value={profile.address || ''} onChange={(e) => set('address', e.target.value)} /></Field>
                  <Field label="Número"><Input value={profile.number || ''} onChange={(e) => set('number', e.target.value)} /></Field>
                  <Field label="Complemento"><Input value={profile.complement || ''} onChange={(e) => set('complement', e.target.value)} /></Field>
                  <Field label="Bairro"><Input value={profile.neighborhood || ''} onChange={(e) => set('neighborhood', e.target.value)} /></Field>
                  <Field label="Cidade"><Input value={profile.city || ''} onChange={(e) => set('city', e.target.value)} /></Field>
                  <Field label="Estado"><Input value={profile.state || ''} onChange={(e) => set('state', e.target.value)} maxLength={2} /></Field>
                  <Field label="Site"><Input value={profile.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
                  <Field label="Instagram"><Input value={profile.instagram || ''} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" /></Field>
                </div>
                <SaveBar saving={saving} onSave={save} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEGURANÇA */}
          <TabsContent value="security" className="mt-0">
            <SecurityTab />
          </TabsContent>

          {/* CONEXÕES */}
          <TabsContent value="connections" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Contas conectadas</CardTitle><CardDescription>Integre serviços externos à sua conta.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <ConnectionRow icon={Mail} title="E-mail (Gmail / SMTP)" description="Envie orçamentos por e-mail." />
                <ConnectionRow icon={MessageCircle} title="WhatsApp Business" description="Envie mensagens automáticas." />
                <ConnectionRow icon={Calendar} title="Google Agenda" description="Sincronize seus compromissos." />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERÊNCIAS */}
          <TabsContent value="preferences" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Preferências</CardTitle><CardDescription>Personalize o sistema do seu jeito.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Moeda padrão">
                    <Select value={profile.currency} onValueChange={(v) => set('currency', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">R$ — Real brasileiro</SelectItem>
                        <SelectItem value="USD">US$ — Dólar</SelectItem>
                        <SelectItem value="EUR">€ — Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Formato de data">
                    <Select value={profile.dateFormat} onValueChange={(v) => set('dateFormat', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Tema">
                    <Select value={profile.theme} onValueChange={(v) => { set('theme', v as any); applyTheme(v as any); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Validade padrão dos orçamentos (dias)">
                    <Input type="number" min={1} value={profile.defaultBudgetValidityDays} onChange={(e) => set('defaultBudgetValidityDays', parseInt(e.target.value) || 30)} />
                  </Field>
                </div>
                <SaveBar saving={saving} onSave={save} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLANO */}
          <TabsContent value="plan" className="mt-0">
            <Card>
              <CardHeader><CardTitle>Plano e assinatura</CardTitle><CardDescription>Detalhes da sua assinatura.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border bg-gradient-to-br from-primary/5 to-transparent p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Plano atual</span>
                      </div>
                      <h3 className="mt-1 text-xl font-semibold">Profissional</h3>
                      <p className="text-sm text-muted-foreground">Acesso completo a todos os módulos.</p>
                    </div>
                    <Tooltip><TooltipTrigger asChild><span><Button disabled>Gerenciar plano</Button></span></TooltipTrigger><TooltipContent>Em breve</TooltipContent></Tooltip>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                    <div><p className="text-muted-foreground">Próxima renovação</p><p className="font-medium">—</p></div>
                    <div><p className="text-muted-foreground">Status</p><p className="font-medium text-[hsl(var(--success))]">Ativo</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function SettingsTab({ value, icon: Icon, label }: { value: string; icon: any; label: string }) {
  return (
    <TabsTrigger value={value} className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:w-full">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </TabsTrigger>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end border-t border-border pt-4">
      <Button onClick={onSave} disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar alterações'}
      </Button>
    </div>
  );
}

function ConnectionRow({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-border p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Em breve</span>
      <Tooltip><TooltipTrigger asChild><span><Button size="sm" variant="outline" disabled>Conectar</Button></span></TooltipTrigger><TooltipContent>Em breve</TooltipContent></Tooltip>
    </div>
  );
}

function SecurityTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const strength = useMemo(() => passwordStrength(next), [next]);
  const strengthColors = ['bg-destructive', 'bg-destructive', 'bg-[hsl(var(--warning))]', 'bg-[hsl(var(--warning))]', 'bg-[hsl(var(--success))]'];
  const strengthLabels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  async function changePassword() {
    if (next.length < 8) return toast.error('Mínimo de 8 caracteres');
    if (next !== confirm) return toast.error('As senhas não coincidem');
    if (!user?.email) return;
    setBusy(true);
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (signErr) throw new Error('Senha atual incorreta');
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      toast.success('Senha alterada');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e: any) {
      toast.error('Erro', { description: e.message });
    } finally { setBusy(false); }
  }

  async function endAllSessions() {
    if (!confirm) {/* noop */}
    if (!window.confirm('Encerrar todas as sessões e fazer logout?')) return;
    await supabase.auth.signOut({ scope: 'global' });
    toast.success('Sessões encerradas');
  }

  return (
    <Card>
      <CardHeader><CardTitle>Segurança</CardTitle><CardDescription>Atualize sua senha e gerencie sessões.</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Senha atual" className="sm:col-span-2"><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
          <Field label="Nova senha"><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          <Field label="Confirmar nova senha"><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
        </div>
        {next && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength] : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Força: {strengthLabels[strength]}</p>
          </div>
        )}
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={changePassword} disabled={busy || !current || !next}><Lock className="mr-2 h-4 w-4" />Alterar senha</Button>
        </div>

        <div className="rounded-md border border-border p-4">
          <h4 className="text-sm font-semibold">Sessões ativas</h4>
          <p className="mt-1 text-xs text-muted-foreground">Encerre todas as sessões em todos os dispositivos.</p>
          <Button variant="outline" className="mt-3" onClick={endAllSessions}>Encerrar todas as sessões</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}
