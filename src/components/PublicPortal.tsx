import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Star,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { ToolItem } from '../types';
import { ToolCard } from './ToolCard';
import { SchoolLogo } from './SchoolLogo';
import { filterTools, sortTools } from '../utils/tools';

interface PublicPortalProps {
  tools: ToolItem[];
  onOpenAdmin: () => void;
  onCopyLink: (url: string, name: string) => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  tools,
  onOpenAdmin,
  onCopyLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute unique categories dynamically from current tools
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => set.add(t.category));
    return ['Todas', ...Array.from(set)];
  }, [tools]);

  // Filtered and sorted tools
  const filteredTools = useMemo(() => {
    const matched = filterTools(tools, searchQuery, selectedCategory);
    return sortTools(matched);
  }, [tools, searchQuery, selectedCategory]);

  // Pinned tools for the spotlight section
  const isDefaultView = !searchQuery.trim() && selectedCategory === 'Todas';
  const pinnedTools = useMemo(() => {
    return tools.filter((t) => t.isPinned);
  }, [tools]);

  // Find SuperPei specifically for quick access callout
  const superPeiTool = useMemo(() => {
    return tools.find((t) => t.name.toLowerCase().includes('superpei'));
  }, [tools]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-800/40 relative overflow-hidden">
          {/* Subtle geometric pattern backdrop */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
            {/* Official School Logo Display */}
            <div className="mb-4 p-2 bg-white rounded-2xl shadow-md border border-white/20 inline-flex items-center justify-center">
              <SchoolLogo size="lg" />
            </div>

            {/* Domain & Institutional Kicker (Zero-Pill clean typography) */}
            <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
              <span>Escola Santa Teresinha</span>
              <span aria-hidden="true" className="text-amber-500/60">·</span>
              <span className="font-mono lowercase text-blue-200">home.esantateresinha.com.br</span>
              <span aria-hidden="true" className="text-amber-500/60">·</span>
              <span className="text-emerald-300">Uso Exclusivo: Professores & Funcionários</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 text-balance">
              Portal do Professor & Funcionários
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-blue-100/90 leading-relaxed mb-6 sm:mb-8">
              Acesso rápido e centralizado ao <strong>SuperPei</strong> (Educação Inclusiva),
              diários de classe, Google Classroom e aos sistemas acadêmicos da Escola Santa Teresinha.
            </p>

            {/* Live Search Bar */}
            <div id="busca" className="max-w-2xl mx-auto relative">
              <div className="relative flex items-center">
                <Search
                  size={20}
                  className="absolute left-4 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por SuperPei, diário de classe, notas, Classroom, SGE..."
                  className="w-full pl-11 sm:pl-12 pr-12 sm:pr-24 py-3 sm:py-3.5 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base rounded-xl shadow-lg border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all"
                  aria-label="Buscar ferramenta de acesso rápido"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    aria-label="Limpar termo de busca"
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex absolute right-4 px-2 py-0.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded">
                    /
                  </kbd>
                )}
              </div>

              {/* Status info line */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200/80 mt-2.5 px-1">
                <span>{filteredTools.length} {filteredTools.length === 1 ? 'ferramenta disponível' : 'ferramentas disponíveis para o corpo docente'}</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                  <span>Cadastrar nova ferramenta no Admin</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 pr-1 shrink-0 hidden sm:inline">
              Áreas:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-pressed={active}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Dedicated SuperPei Spotlight Banner (Only on default view) */}
          {isDefaultView && superPeiTool && (
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-950 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-purple-800/50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                  <Sparkles size={16} className="text-amber-300" />
                  <span>Destaque Inclusão · Escola Santa Teresinha</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  SuperPei — Plano Educacional Individualizado
                </h2>
                <p className="text-sm sm:text-base text-purple-100 leading-relaxed">
                  {superPeiTool.description}
                </p>
                <div className="pt-1 flex items-center gap-3 text-xs text-purple-300 font-mono">
                  <span>pei.sistemaedutech.com.br/login</span>
                  <span>·</span>
                  <span>Acesso direto para professores e AEE</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 relative z-10">
                <a
                  href={superPeiTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-md transition-all whitespace-nowrap"
                  aria-label="Abrir SuperPei em nova aba"
                >
                  <span>Acessar SuperPei</span>
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => onCopyLink(superPeiTool.url, superPeiTool.name)}
                  className="px-3 py-3 text-xs font-semibold text-purple-200 hover:text-white bg-purple-800/60 hover:bg-purple-800 rounded-xl transition-colors"
                  title="Copiar link do SuperPei"
                  aria-label="Copiar link do SuperPei"
                >
                  Copiar Link
                </button>
              </div>
            </div>
          )}

          {/* Spotlight / Pinned Section */}
          {isDefaultView && pinnedTools.length > 0 && (
            <section id="destaques">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Star size={18} className="fill-amber-500 text-amber-500" />
                    <span>Ferramentas Principais do Educador</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Os sistemas diários mais utilizados por professores e equipe escolar
                  </p>
                </div>
                <span className="text-xs text-slate-600 font-mono tabular-nums">
                  {pinnedTools.length} principais
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pinnedTools.map((tool) => (
                  <ToolCard
                    key={`pinned-${tool.id}`}
                    tool={tool}
                    featured={true}
                    onCopyLink={onCopyLink}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Tools Section */}
          <section id="todas-ferramentas">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={18} className="text-blue-900" />
                  <span>
                    {selectedCategory === 'Todas'
                      ? 'Catálogo Completo para Professores e Funcionários'
                      : `Ferramentas: ${selectedCategory}`}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {searchQuery
                    ? `Resultados encontrados para "${searchQuery}"`
                    : 'Clique em "Acessar" para abrir o sistema em uma nova aba'}
                </p>
              </div>
              <span className="text-xs text-slate-600 font-mono tabular-nums">
                {filteredTools.length} ferramentas
              </span>
            </div>

            {/* Grid of tools */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    featured={false}
                    onCopyLink={onCopyLink}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
                <Search size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Nenhuma ferramenta encontrada
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  {searchQuery
                    ? `Não encontramos ferramentas com o termo "${searchQuery}". Verifique a digitação ou tente outro nome.`
                    : 'Não há ferramentas cadastradas nesta categoria ainda.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Limpar filtro de busca
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} />
                    <span>Cadastrar esta ferramenta no Admin</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <SchoolLogo size="sm" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Escola Santa Teresinha
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portal Interno do Professor e Funcionários · <span className="font-mono">home.esantateresinha.com.br</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <a
                href="https://pei.sistemaedutech.com.br/login"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-800 font-semibold transition-colors"
              >
                SuperPei (Inclusão)
              </a>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <a
                href="https://esantateresinha.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-900 transition-colors"
              >
                Website Oficial
              </a>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-blue-900 font-semibold hover:underline"
              >
                Gerenciar Ferramentas (Admin)
              </button>
            </div>

            <p className="text-xs text-slate-600 font-mono">
              © {new Date().getFullYear()} E. Santa Teresinha
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};
