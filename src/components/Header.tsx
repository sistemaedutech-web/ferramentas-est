import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { ShieldCheck, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  toolCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onToggleViewMode,
  toolCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          {/* Zone 1: Single text element wordmark with official logo */}
          <button
            onClick={() => onToggleViewMode('public')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg py-1 px-1 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
            aria-label="Ir para a página inicial da Escola Santa Teresinha"
          >
            <SchoolLogo size="md" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                Escola Santa Teresinha
              </span>
              <span className="text-[10px] sm:text-xs text-blue-900 font-semibold tracking-tight">
                Portal do Professor & Funcionários
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {viewMode === 'public' ? (
              <>
                <a
                  href="#busca"
                  className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1"
                >
                  Buscar
                </a>
                <a
                  href="#destaques"
                  className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Destaques & SuperPei</span>
                </a>
                <a
                  href="#todas-ferramentas"
                  className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1"
                >
                  Catálogo ({toolCount})
                </a>
                <a
                  href="https://pei.sistemaedutech.com.br/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-800 transition-colors whitespace-nowrap shrink-0 py-1 text-purple-700 font-semibold inline-flex items-center gap-1"
                >
                  <span>SuperPei</span>
                </a>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                Painel Administrativo: Cadastrar, Editar e Excluir
              </span>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {viewMode === 'public' ? (
              <button
                onClick={() => onToggleViewMode('admin')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shadow-xs"
                aria-label="Abrir Área Administrativa"
              >
                <ShieldCheck size={15} />
                <span>Admin / Gestão</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleViewMode('public')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 whitespace-nowrap"
                aria-label="Voltar para a Página Pública"
              >
                <ArrowLeft size={15} />
                <span>Ver Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
