import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filePath: string;
  fileSize: number;
  budgetId?: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || undefined,
    filePath: row.file_path,
    fileSize: Number(row.file_size || 0),
    budgetId: row.budget_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function getProjectsByBudget(budgetId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('budget_id', budgetId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function uploadProject(params: {
  file: File;
  name: string;
  description?: string;
  budgetId?: string;
}): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const ext = params.file.name.split('.').pop() || 'pdf';
  const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('projects')
    .upload(filePath, params.file, { contentType: params.file.type || 'application/pdf' });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: params.name,
      description: params.description || null,
      file_path: filePath,
      file_size: params.file.size,
      budget_id: params.budgetId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateProject(id: string, patch: { name?: string; description?: string; budgetId?: string | null }): Promise<void> {
  const update: any = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.budgetId !== undefined) update.budget_id = patch.budgetId;
  const { error } = await supabase.from('projects').update(update).eq('id', id);
  if (error) throw error;
}

export async function deleteProject(project: Project): Promise<void> {
  await supabase.storage.from('projects').remove([project.filePath]);
  const { error } = await supabase.from('projects').delete().eq('id', project.id);
  if (error) throw error;
}

export async function getProjectSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('projects')
    .createSignedUrl(filePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
