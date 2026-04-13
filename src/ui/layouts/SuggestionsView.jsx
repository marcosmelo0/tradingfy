import React, { useState } from 'react';
import { useSuggestions } from '../contexts/SuggestionsContext';
import { useModal } from '../contexts/ModalContext';
import { 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Clock, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Code2,
  Archive,
  ChevronRight,
  Filter
} from 'lucide-react';

const STATUS_CONFIG = {
  aberto: { 
    label: 'Sugestões', 
    color: 'bg-blue-500/10 text-blue-500', 
    icon: <MessageSquare size={16} />,
    emptyMsg: 'Nenhuma sugestão enviada pela comunidade ainda.'
  },
  desenvolvimento: { 
    label: 'Em Andamento', 
    color: 'bg-purple-500/10 text-purple-500', 
    icon: <Code2 size={16} />,
    emptyMsg: 'Nenhum projeto sendo desenvolvido no momento.'
  },
  concluido: { 
    label: 'Concluído', 
    color: 'bg-green-500/10 text-green-500', 
    icon: <CheckCircle2 size={16} />,
    emptyMsg: 'Ainda não finalizamos nenhuma sugestão desta lista.'
  },
  fechado: { 
    label: 'Arquivado', 
    color: 'bg-muted text-muted-foreground', 
    icon: <Archive size={16} />,
    emptyMsg: 'Nenhuma sugestão foi arquivada.'
  }
};

export const SuggestionsView = () => {
  const { suggestions, loading, createSuggestion, toggleVote, deleteSuggestion, updateSuggestionStatus, isAdmin, userId } = useSuggestions();
  const { confirm } = useModal();
  const [activeTab, setActiveTab] = useState('aberto');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSubmitting(true);
    const { error } = await createSuggestion(title, desc);
    if (!error) {
      setTitle('');
      setDesc('');
      setShowForm(false);
      setActiveTab('aberto');
    }
    setSubmitting(false);
  };

  const filteredSuggestions = suggestions.filter(s => s.status === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comunidade</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Sugestões de Melhorias</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Este espaço é dedicado a <span className="text-primary font-black">ideias de novas funções</span> para o Trading Diary Pro. 
            Sugeriu algo incrível? A comunidade vota e as melhores ideias ganham prioridade no desenvolvimento. 
            Todas as postagens são anônimas para focar no que importa: a evolução do sistema.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
            showForm 
            ? 'bg-muted text-foreground' 
            : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
          }`}
        >
          {showForm ? 'Fechar Formulário' : <><Plus size={18} /> Sugerir Nova Ideia</>}
        </button>
      </div>

      {/* Suggestion Form */}
      {showForm && (
        <div className="bg-card border border-primary/20 p-6 md:p-8 rounded-3xl md:rounded-4xl shadow-2xl animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-bold">Nova Ideia</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Título da Sugestão</label>
                <input 
                  required
                  placeholder="Ex: Integração com Profit Mobile via API"
                  className="w-full bg-background border border-border p-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Descrição (Opcional)</label>
                <textarea 
                  placeholder="Explique como essa nova função ajudaria no seu dia a dia..."
                  rows={3}
                  className="w-full bg-background border border-border p-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
               <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
               >
                 Cancelar
               </button>
               <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 enabled:hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
               >
                 {submitting ? 'Enviando...' : 'Postar Ideia'}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = suggestions.filter(s => s.status === key).length;
          const isActive = activeTab === key;
          
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isActive 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {config.icon}
              {config.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vertical Suggestion List */}
      <div className="space-y-4">
        {loading && suggestions.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse">
            Carregando sugestões...
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-4xl bg-card/30 animate-in zoom-in-95 duration-500">
            <div className={`inline-flex p-6 rounded-full mb-4 ${STATUS_CONFIG[activeTab].color}`}>
              {STATUS_CONFIG[activeTab].icon}
            </div>
            <h3 className="text-xl font-bold">Sem itens aqui</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
              {STATUS_CONFIG[activeTab].emptyMsg}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuggestions.map((s) => (
              <SuggestionCard 
                key={s.id} 
                s={s} 
                isAdmin={isAdmin} 
                userId={userId}
                onVote={() => toggleVote(s.id)}
                onDelete={async () => {
                  const confirmed = await confirm({
                    title: 'Remover Sugestão?',
                    message: 'Deseja realmente apagar a sua sugestão?',
                    type: 'danger'
                  });
                  if (confirmed) deleteSuggestion(s.id);
                }}
                onStatusChange={(newStatus) => updateSuggestionStatus(s.id, newStatus)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SuggestionCard = ({ s, isAdmin, userId, onVote, onDelete, onStatusChange }) => {
  return (
    <div className="group bg-card border border-border p-6 rounded-3xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start gap-5 flex-1">
        {/* Vote Sidebar */}
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={onVote}
            className={`p-3 rounded-2xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
              s.hasVoted 
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
              : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <ThumbsUp size={18} className={s.hasVoted ? 'fill-current' : ''} />
            <span className="text-[10px] font-black">{s.votesCount}</span>
          </button>
          <span className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest mt-1">Likes</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{s.title}</h3>
            {s.user_id === userId && (
              <button 
                onClick={onDelete}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {s.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
              {s.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 overflow-x-auto scrollbar-hide">
           <div className="flex items-center gap-1 shrink-0">
              <Clock size={12} /> {new Date(s.created_at).toLocaleDateString('pt-BR')}
           </div>
           <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shrink-0 ${STATUS_CONFIG[s.status]?.color}`}>
             {STATUS_CONFIG[s.status]?.label}
           </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center justify-between sm:justify-end gap-2 bg-primary/5 p-2 sm:p-0 rounded-xl sm:bg-transparent">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Mudar Status:</span>
            <select 
              value={s.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-muted text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:bg-primary/10 hover:text-primary transition-all shadow-sm border-none"
            >
              <option value="aberto">Sugestão</option>
              <option value="desenvolvimento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="fechado">Arquivado</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
