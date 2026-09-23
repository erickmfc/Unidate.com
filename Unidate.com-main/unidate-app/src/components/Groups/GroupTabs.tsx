import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, MessageSquare, Megaphone, Link as LinkIcon, Calendar, BarChart3, FileText, Plus, Trash2, ExternalLink } from 'lucide-react';
import GroupFeed from './GroupFeed';
import { useAuth } from '../../contexts/AuthContext';
import { useUniDateToast } from '../UI/Toast';
import { GroupMaterialsService, GroupMaterial } from '../../services/groupMaterialsService';
import { GroupResourcesService, GroupResource } from '../../services/groupResourcesService';
import { GroupAnnouncementsService, GroupAnnouncement } from '../../services/groupAnnouncementsService';
import { GroupChatService } from '../../services/groupChatService';
import { GroupEventsService } from '../../services/groupEventsService';
import { GroupPostsService } from '../../services/groupPostsService';

interface GroupTabsProps { groupId: string; isMember: boolean; isEditor: boolean; }
type TabId = 'materials' | 'posts' | 'announcements' | 'resources' | 'calendar' | 'stats';

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean }> = ({ label, value, onChange, placeholder, multiline }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    {multiline ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /> : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />}
  </label>
);

const GroupTabs: React.FC<GroupTabsProps> = ({ groupId, isMember, isEditor }) => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [activeTab, setActiveTab] = useState<TabId>('materials');
  const [materials, setMaterials] = useState<GroupMaterial[]>([]);
  const [resources, setResources] = useState<GroupResource[]>([]);
  const [announcements, setAnnouncements] = useState<GroupAnnouncement[]>([]);
  const [groupEvents, setGroupEvents] = useState<Awaited<ReturnType<typeof GroupEventsService.getGroupEvents>>>([]);
  const [stats, setStats] = useState({ posts: 0, messages: 0, events: 0 });
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [material, setMaterial] = useState({ title: '', description: '', externalUrl: '', subject: '', category: '', type: 'link', difficulty: 'iniciante' });
  const [resource, setResource] = useState({ title: '', description: '', url: '', category: 'link' });
  const [announcement, setAnnouncement] = useState({ title: '', content: '', priority: 'medium' as 'low'|'medium'|'high' });

  const loadContent = useCallback(async () => {
    if (!isMember) return;
    try {
      const [nextMaterials, nextResources, nextAnnouncements, nextEvents] = await Promise.all([
        GroupMaterialsService.getGroupMaterials(groupId), GroupResourcesService.getGroupResources(groupId), GroupAnnouncementsService.getGroupAnnouncements(groupId), GroupEventsService.getGroupEvents(groupId, currentUser?.uid),
      ]);
      setMaterials(nextMaterials); setResources(nextResources); setAnnouncements(nextAnnouncements); setGroupEvents(nextEvents);
    } catch (error) { console.error('Erro ao carregar conteúdo do grupo:', error); showError('Não foi possível carregar o conteúdo do grupo'); }
  }, [groupId, isMember, showError]);

  useEffect(() => { void loadContent(); }, [loadContent]);

  useEffect(() => {
    if (activeTab !== 'stats' || !isMember) return;
    void Promise.all([GroupChatService.getChatStats(groupId), GroupEventsService.getGroupEvents(groupId, currentUser?.uid)])
      .then(async ([chat, events]) => {
        const posts = await GroupPostsService.getGroupPosts(groupId, 1000);
        setStats({ posts: posts.length, messages: chat.totalMessages, events: events.length });
      })
      .catch(error => { console.error('Erro ao carregar estatísticas:', error); showError('Não foi possível carregar as estatísticas'); });
  }, [activeTab, currentUser?.uid, groupId, isMember, showError]);

  const saveMaterial = async () => {
    if (!currentUser || !material.title.trim() || !material.description.trim()) return;
    try {
      await GroupMaterialsService.shareMaterial(groupId, { ...material, title: material.title, externalUrl: material.externalUrl || undefined, tags: [], sharedBy: currentUser.uid, sharedByName: userProfile?.displayName || currentUser.email || 'Usuário' });
      setMaterial({ title: '', description: '', externalUrl: '', subject: '', category: '', type: 'link', difficulty: 'iniciante' }); setShowMaterialForm(false); await loadContent(); showSuccess('Material salvo no Supabase');
    } catch (error) { console.error(error); showError('Não foi possível salvar o material'); }
  };
  const saveResource = async () => {
    if (!currentUser || !resource.title.trim() || !resource.url.trim()) return;
    try {
      await GroupResourcesService.addResource(groupId, { ...resource, addedBy: currentUser.uid, addedByName: userProfile?.displayName || currentUser.email || 'Usuário', tags: [] });
      setResource({ title: '', description: '', url: '', category: 'link' }); setShowResourceForm(false); await loadContent(); showSuccess('Recurso salvo no Supabase');
    } catch (error) { console.error(error); showError('Não foi possível salvar o recurso'); }
  };
  const saveAnnouncement = async () => {
    if (!currentUser || !announcement.title.trim() || !announcement.content.trim()) return;
    try {
      await GroupAnnouncementsService.createAnnouncement(groupId, { ...announcement, createdBy: currentUser.uid, createdByName: userProfile?.displayName || currentUser.email || 'Usuário' });
      setAnnouncement({ title: '', content: '', priority: 'medium' }); setShowAnnouncementForm(false); await loadContent(); showSuccess('Anúncio salvo no Supabase');
    } catch (error) { console.error(error); showError('Não foi possível salvar o anúncio'); }
  };

  const tabs = [{ id: 'materials' as TabId, label: 'Materiais', icon: BookOpen }, { id: 'posts' as TabId, label: 'Feed', icon: MessageSquare }, { id: 'announcements' as TabId, label: 'Anúncios', icon: Megaphone }, { id: 'resources' as TabId, label: 'Recursos', icon: LinkIcon }, { id: 'calendar' as TabId, label: 'Calendário', icon: Calendar }, { id: 'stats' as TabId, label: 'Estatísticas', icon: BarChart3 }];
  const modal = (title: string, body: React.ReactNode, onClose: () => void) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="text-gray-500">Fechar</button></div>{body}</div></div>;

  return <div className="mt-6">
    <nav className="mb-6 flex space-x-8 overflow-x-auto border-b border-gray-200">{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Icon className="h-5 w-5" /><span>{tab.label}</span></button>; })}</nav>
    {activeTab === 'posts' && <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950 via-blue-950 to-purple-950 p-6"><GroupFeed groupId={groupId} isMember={isMember} /></div>}
    {activeTab === 'materials' && <section className="rounded-lg border border-gray-200 bg-white p-6"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Biblioteca de Materiais</h3>{isMember && <button onClick={() => setShowMaterialForm(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white"><Plus className="h-4 w-4" />Compartilhar Material</button>}</div>{materials.length === 0 ? <p className="text-gray-600">Nenhum material compartilhado ainda.</p> : <div className="space-y-3">{materials.map(item => <article key={item.id} className="rounded-lg border p-4"><div className="flex justify-between"><div><h4 className="font-semibold">{item.title}</h4><p className="text-sm text-gray-600">{item.description}</p>{item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600">Abrir link <ExternalLink className="h-3 w-3" /></a>}</div>{currentUser?.uid === item.sharedBy && <button onClick={() => GroupMaterialsService.deleteMaterial(item.id, currentUser.uid).then(loadContent).catch(() => showError('Não foi possível remover o material'))} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}</div></article>)}</div>}</section>}
    {activeTab === 'announcements' && <section className="rounded-lg border border-gray-200 bg-white p-6"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Anúncios</h3>{isEditor && <button onClick={() => setShowAnnouncementForm(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white"><Plus className="h-4 w-4" />Criar Anúncio</button>}</div>{announcements.length === 0 ? <p className="text-gray-600">Nenhum anúncio publicado ainda.</p> : <div className="space-y-3">{announcements.map(item => <article key={item.id} className="rounded-lg border p-4"><div className="flex justify-between"><div><h4 className="font-semibold">{item.title}</h4><p className="text-gray-600">{item.content}</p></div>{currentUser?.uid === item.createdBy && <button onClick={() => GroupAnnouncementsService.deleteAnnouncement(item.id, currentUser.uid).then(loadContent).catch(() => showError('Não foi possível remover o anúncio'))} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}</div></article>)}</div>}</section>}
    {activeTab === 'resources' && <section className="rounded-lg border border-gray-200 bg-white p-6"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Recursos Compartilhados</h3>{isMember && <button onClick={() => setShowResourceForm(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white"><Plus className="h-4 w-4" />Adicionar Recurso</button>}</div>{resources.length === 0 ? <p className="text-gray-600">Nenhum recurso compartilhado ainda.</p> : <div className="space-y-3">{resources.map(item => <article key={item.id} className="rounded-lg border p-4"><div className="flex justify-between"><div><h4 className="font-semibold">{item.title}</h4><p className="text-sm text-gray-600">{item.description}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600">Abrir recurso <ExternalLink className="h-3 w-3" /></a></div>{currentUser?.uid === item.addedBy && <button onClick={() => GroupResourcesService.deleteResource(item.id, currentUser.uid).then(loadContent).catch(() => showError('Não foi possível remover o recurso'))} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}</div></article>)}</div>}</section>}
    {activeTab === 'calendar' && <section className="rounded-lg border border-gray-200 bg-white p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-semibold">Calendário do grupo</h3><p className="text-sm text-gray-600">{groupEvents.length} {groupEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}</p></div><Calendar className="h-6 w-6 text-purple-600" /></div>{groupEvents.length === 0 ? <p className="text-gray-600">Nenhum evento agendado.</p> : <div className="space-y-3">{groupEvents.map(event => <article key={event.id} className="rounded-lg border p-4"><h4 className="font-semibold">{event.title}</h4><p className="text-sm text-gray-600">{event.date.toDate().toLocaleString('pt-BR')} · {event.location || 'Local não informado'}</p><p className="mt-1 text-sm text-gray-700">{event.description}</p></article>)}</div>}</section>}
    {activeTab === 'stats' && <section className="rounded-lg border border-gray-200 bg-white p-6"><h3 className="mb-4 text-lg font-semibold">Estatísticas do Grupo</h3><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-purple-50 p-4"><strong>{stats.posts}</strong><p className="text-sm text-gray-600">Posts</p></div><div className="rounded-lg bg-purple-50 p-4"><strong>{stats.messages}</strong><p className="text-sm text-gray-600">Mensagens</p></div><div className="rounded-lg bg-purple-50 p-4"><strong>{stats.events}</strong><p className="text-sm text-gray-600">Eventos</p></div></div></section>}
    {showMaterialForm && modal('Compartilhar material', <div className="space-y-3"><Field label="Título" value={material.title} onChange={v => setMaterial({...material,title:v})} /><Field label="Descrição" value={material.description} onChange={v => setMaterial({...material,description:v})} multiline /><Field label="Link (opcional)" value={material.externalUrl} onChange={v => setMaterial({...material,externalUrl:v})} placeholder="https://..." /><button onClick={saveMaterial} disabled={!material.title.trim() || !material.description.trim()} className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white disabled:opacity-50">Salvar material</button></div>, () => setShowMaterialForm(false))}
    {showResourceForm && modal('Adicionar recurso', <div className="space-y-3"><Field label="Título" value={resource.title} onChange={v => setResource({...resource,title:v})} /><Field label="Descrição" value={resource.description} onChange={v => setResource({...resource,description:v})} multiline /><Field label="URL" value={resource.url} onChange={v => setResource({...resource,url:v})} placeholder="https://..." /><button onClick={saveResource} disabled={!resource.title.trim() || !resource.url.trim()} className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white disabled:opacity-50">Salvar recurso</button></div>, () => setShowResourceForm(false))}
    {showAnnouncementForm && modal('Criar anúncio', <div className="space-y-3"><Field label="Título" value={announcement.title} onChange={v => setAnnouncement({...announcement,title:v})} /><Field label="Conteúdo" value={announcement.content} onChange={v => setAnnouncement({...announcement,content:v})} multiline /><button onClick={saveAnnouncement} disabled={!announcement.title.trim() || !announcement.content.trim()} className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white disabled:opacity-50">Publicar anúncio</button></div>, () => setShowAnnouncementForm(false))}
  </div>;
};

export default GroupTabs;
