import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  Star,
  Layers,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Sparkles,
} from 'lucide-react';
import { ToolItem } from '../types';
import { ToolIcon } from './ToolIcon';
import { SchoolLogo } from './SchoolLogo';
import { exportToolsToJson, parseToolsFromJson } from '../utils/tools';
import { AdminUser, SUPER_ADMIN_CREDENTIALS } from '../services/authService';
import { LogOut, Database, Code, Check, Copy, X } from 'lucide-react';

interface AdminPanelProps {
  tools: ToolItem[];
  currentUser?: AdminUser | null;
  onLogout: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (tool: ToolItem) => void;
  onDeleteTool: (id: string, name: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onResetDefaults: () => void;
  onImportTools: (tools: ToolItem[]) => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onBackToPublic: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tools,
  currentUser,
  onLogout,
  onOpenCreate,
  onOpenEdit,
  onDeleteTool,
  onTogglePin,
  onResetDefaults,
  onImportTools,
  onShowToast,
  onBackToPublic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [deletingTool, setDeletingTool] = useState<ToolItem | null>(null);
  const [showDbModal, setShowDbModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute category options
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => set.add(t.category));
    return ['Todas', ...Array.from(set)];
  }, [tools]);

  // Filter tools
  const filteredTools = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchCat = categoryFilter === 'Todas' || tool.category === categoryFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.url.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      );
    });
  }, [tools, searchTerm, categoryFilter]);

  // Export JSON handler
  const handleExport = () => {
    const jsonStr = exportToolsToJson(tools);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferramentas_docentes_santa_teresinha_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Arquivo de backup exportado com sucesso!', 'success');
  };

  // Import JSON handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseToolsFromJson(content);
      if (parsed.success && parsed.data) {
        onImportTools(parsed.data);
        onShowToast(`${parsed.data.length} ferramentas importadas com sucesso!`, 'success');
      } else {
        onShowToast(parsed.error || 'Falha ao processar arquivo.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <SchoolLogo size="lg" className="hidden sm:flex p-1 bg-slate-50 rounded-xl border border-slate-200" />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
              <span>Escola Santa Teresinha</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">home.esantateresinha.com.br</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-mono">MySQL: stateres_home</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Gestão de Ferramentas dos Professores & Funcionários
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sessão ativa: <strong className="text-slate-800">{currentUser?.email || SUPER_ADMIN_CREDENTIALS.email}</strong> ({currentUser?.role === 'super_admin' || !currentUser ? 'Super Admin' : 'Admin'})
            </p>
          </div>
        </div>

        {/* Primary Action Button & User Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Database size={15} />
            <span>Configuração MySQL</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus size={18} />
            <span>Cadastrar Ferramenta</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Encerrar sessão de administrador"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Ferramentas</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {tools.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Em Destaque</p>
          <p className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums mt-1">
            {tools.filter((t) => t.isPinned).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Áreas / Categorias</p>
          <p className="text-2xl font-extrabold text-blue-900 font-mono tabular-nums mt-1">
            {new Set(tools.map((t) => t.category)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SuperPei (Inclusão)</p>
          <p className="text-xs font-bold text-purple-700 font-mono truncate mt-2.5 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>Ativo & Vinculado</span>
          </p>
        </div>
      </div>

      {/* Data Management Bar: Search, Category Filter, Export, Import */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search in Admin */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome, descrição, link ou categoria..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 text-slate-800 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'Todas' ? 'Todas as Categorias' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Backup / Restore Controls */}
          <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
            <button
              type="button"
              onClick={handleExport}
              title="Exportar todas as ferramentas para arquivo JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span>Exportar JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Importar ferramentas a partir de um arquivo JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Upload size={14} />
              <span>Importar JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja restaurar a lista padrão de ferramentas docentes e funcionais da Escola Santa Teresinha?')) {
                  onResetDefaults();
                  onShowToast('Lista de ferramentas restaurada com sucesso!', 'info');
                }
              }}
              title="Restaurar lista padrão da Escola Santa Teresinha"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Restaurar padrões escolares"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tools Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">Ícone</th>
                <th className="py-3 px-4">Nome da Ferramenta</th>
                <th className="py-3 px-4">Categoria / Área</th>
                <th className="py-3 px-4">Link de Acesso Rápido</th>
                <th className="py-3 px-4 text-center w-24">Destaque</th>
                <th className="py-3 px-4 text-right w-36">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Icon */}
                    <td className="py-3 px-4 text-center">
                      <ToolIcon
                        imageUrl={tool.imageUrl}
                        iconKey={tool.iconKey}
                        toolName={tool.name}
                        category={tool.category}
                        size="sm"
                        className="mx-auto"
                      />
                    </td>

                    {/* Name & Description */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors flex items-center gap-1.5">
                        <span>{tool.name}</span>
                        {tool.name.toLowerCase().includes('superpei') && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                            Inclusão / PEI
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {tool.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-700">
                        {tool.category}
                      </span>
                    </td>

                    {/* URL */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 max-w-[200px] truncate">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                        title={tool.url}
                      >
                        <span className="truncate">{tool.url}</span>
                        <ExternalLink size={12} className="shrink-0 text-slate-400" />
                      </a>
                    </td>

                    {/* Pin Toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onTogglePin(tool.id, Boolean(tool.isPinned))}
                        className={`p-1.5 rounded-lg transition-colors ${
                          tool.isPinned
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={tool.isPinned ? 'Remover destaque' : 'Marcar como destaque'}
                        aria-label={tool.isPinned ? 'Remover destaque' : 'Marcar como destaque'}
                      >
                        <Star
                          size={18}
                          className={tool.isPinned ? 'fill-amber-500' : ''}
                        />
                      </button>
                    </td>

                    {/* Actions: Test link, Edit, Delete */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Testar link de acesso"
                          aria-label={`Testar link de ${tool.name}`}
                        >
                          <ExternalLink size={16} />
                        </a>

                        <button
                          type="button"
                          onClick={() => onOpenEdit(tool)}
                          className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar ferramenta"
                          aria-label={`Editar ${tool.name}`}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingTool(tool)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir ferramenta"
                          aria-label={`Excluir ${tool.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">
                      Nenhuma ferramenta encontrada com os filtros atuais.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente outro termo de busca ou cadastre uma nova ferramenta.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTool && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Tem certeza que deseja excluir a ferramenta{' '}
              <strong className="text-slate-900">"{deletingTool.name}"</strong>?
              O atalho deixará de ser exibido no portal dos professores e funcionários.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTool(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTool(deletingTool.id, deletingTool.name);
                  setDeletingTool(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Excluir Ferramenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MySQL Database Configuration Modal */}
      {showDbModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Database size={22} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Integração com Banco de Dados MySQL
                  </h3>
                  <p className="text-xs text-slate-500">
                    Banco de dados e usuário configurados: <code className="font-mono text-emerald-700 font-bold">stateres_home</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDbModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dica da Porta */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <div className="p-1 bg-amber-200/70 rounded text-amber-900 font-mono font-bold shrink-0">
                Porta: 3306
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950">Dúvida sobre qual porta usar?</p>
                <p className="text-amber-900/90 leading-relaxed">
                  A porta padrão universal do MySQL/Percona é <strong>3306</strong>. No entanto, como o seu cPanel está operando com <em>"Localhost via UNIX socket"</em>, <strong>não é necessário informar porta</strong> (pode deixar vazio ou omitir). Se o seu instalador exigir obrigatoriamente um valor numérico, use <strong>3306</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Servidor de Banco:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">Percona 5.7</span>
                </p>
                <p><span className="text-slate-500">Versão:</span> <span className="font-mono text-slate-900">5.7.44-48 Percona (GPL)</span></p>
                <p><span className="text-slate-500">Porta:</span> <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">3306</span> <span className="text-[10px] text-slate-400">(ou deixe vazio/UNIX socket)</span></p>
                <p><span className="text-slate-500">Conexão:</span> <span className="font-mono text-slate-900">Localhost via UNIX socket</span></p>
                <p><span className="text-slate-500">Protocolo:</span> <span className="font-mono">Versão 10</span></p>
                <p><span className="text-slate-500">Charset:</span> <span className="font-mono">utf8mb4 Unicode (utf8)</span></p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 flex items-center justify-between">
                  <span>cPanel & PHP 8.4:</span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-mono">PHP 8.4.26</span>
                </p>
                <p><span className="text-slate-500">Web Server:</span> <span className="font-mono text-slate-900">cpsrvd 11.134.0.63</span></p>
                <p><span className="text-slate-500">Banco:</span> <span className="font-mono font-bold text-emerald-800">stateres_home</span></p>
                <p><span className="text-slate-500">Usuário:</span> <span className="font-mono font-bold text-emerald-800">stateres@localhost</span></p>
                <p><span className="text-slate-500">Extensões:</span> <span className="font-mono">mysqli, curl, mbstring</span></p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Super Admin:</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono">Super Admin</span>
                </p>
                <p><span className="text-slate-500">Login:</span> <span className="font-mono font-bold text-slate-900">ivan@profesorivan.com.br</span></p>
                <p><span className="text-slate-500">Senha:</span> <span className="font-mono font-bold text-slate-900">123@mudar</span></p>
                <p><span className="text-slate-500">Domínio:</span> <span className="font-mono">home.esantateresinha.com.br</span></p>
                <p><span className="text-slate-500">Permissão:</span> <span className="font-mono">Total (Cadastrar, Editar, Excluir)</span></p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-blue-700" />
                  <span>Script SQL Completo (schema.sql) para importar no seu phpMyAdmin:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fullSql = `-- ========================================================================
-- Script SQL Otimizado para Percona Server 5.7.44 / MySQL 5.7
-- Servidor: Localhost via UNIX socket (cPanel)
-- Usuário: stateres / stateres_home
-- Banco de dados: stateres_home
-- Charset: UTF-8 Unicode (utf8mb4) / InnoDB DYNAMIC
-- ========================================================================

CREATE DATABASE IF NOT EXISTS \`stateres_home\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`stateres_home\`;

CREATE TABLE IF NOT EXISTS \`admins\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
  \`email\` VARCHAR(120) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`tools\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`image_url\` VARCHAR(500) NULL,
  \`icon_key\` VARCHAR(50) DEFAULT 'globe',
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'Educação Inclusiva & PEI',
  \`is_pinned\` TINYINT(1) DEFAULT 0,
  \`display_order\` INT DEFAULT 99,
  \`created_at\` BIGINT NOT NULL,
  \`updated_at\` BIGINT NOT NULL,
  INDEX \`idx_category\` (\`category\`),
  INDEX \`idx_pinned\` (\`is_pinned\`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção do Super Admin (ivan@profesorivan.com.br / 123@mudar)
INSERT INTO \`admins\` (\`name\`, \`email\`, \`password_hash\`, \`role\`)
VALUES (
  'Prof. Ivan (Super Admin)',
  'ivan@profesorivan.com.br',
  '93082ff9b55cff94ee7f4d728013baa1863409cf3e5873d3f639aa9238bdb4de',
  'super_admin'
)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`password_hash\` = VALUES(\`password_hash\`);

-- Ferramentas iniciais incluindo SuperPei
INSERT INTO \`tools\` (\`id\`, \`name\`, \`description\`, \`url\`, \`image_url\`, \`icon_key\`, \`category\`, \`is_pinned\`, \`display_order\`, \`created_at\`, \`updated_at\`)
VALUES
('tool-superpei', 'SuperPei', 'Ferramenta para criação, edição, cadastro e acompanhamento pedagógico de estudantes e estudantes neurodivergentes (PEI / AEE).', 'https://pei.sistemaedutech.com.br/login', NULL, 'sparkles', 'Educação Inclusiva & PEI', 1, 1, 1704067200000, 1704067200000),
('tool-diario-eletronico', 'Diário de Classe & Notas', 'Lançamento de frequências diárias, notas bimestrais, pareceres pedagógicos e planos de aula dos professores.', 'https://diario.esantateresinha.com.br', NULL, 'book-open', 'Pedagógico & Diários', 1, 2, 1704067200000, 1704067200000),
('tool-google-classroom', 'Google Classroom (Docente)', 'Painel do professor: turmas atribuídas, postagem de atividades, correção de trabalhos e Google Meet.', 'https://classroom.google.com', NULL, 'graduation-cap', 'Salas Virtuais & Aulas', 1, 3, 1704067200000, 1704067200000),
('tool-gestao-academica', 'Sistema de Gestão Escolar (SGE)', 'Acesso para coordenação e funcionários: enturmação, quadro de horários de aulas, atas e relatórios oficiais.', 'https://gestao.esantateresinha.com.br', 'https://esantateresinha.com.br/assets/logo-est.png', 'layout-grid', 'Gestão & Secretaria', 1, 4, 1704067200000, 1704067200000),
('tool-email-institucional', 'E-mail Corporativo (@esantateresinha)', 'Acesso ao webmail institucional e ferramentas Google Workspace para comunicação interna da equipe escolar.', 'https://mail.google.com/a/esantateresinha.com.br', 'https://esantateresinha.com.br/assets/logo-est.png', 'mail', 'Comunicação & Colaboração', 0, 5, 1704067200000, 1704067200000),
('tool-portal-rh', 'Portal do Colaborador & RH', 'Acesso para professores e funcionários: consulta de holerites, informes de rendimento, ponto e avisos do RH.', 'https://rh.esantateresinha.com.br', NULL, 'users', 'Gestão & Secretaria', 0, 6, 1704067200000, 1704067200000)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);`;

                      const blob = new Blob([fullSql], { type: 'text/sql;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'schema_stateres_home.sql';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      onShowToast('Arquivo schema_stateres_home.sql baixado com sucesso!', 'success');
                    }}
                    className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    <Download size={13} />
                    <span>Baixar .SQL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fullSql = `-- ========================================================================
-- Script SQL Otimizado para Percona Server 5.7.44 / MySQL 5.7
-- Servidor: Localhost via UNIX socket (cPanel)
-- Usuário: stateres / stateres_home
-- Banco de dados: stateres_home
-- Charset: UTF-8 Unicode (utf8mb4) / InnoDB DYNAMIC
-- ========================================================================

CREATE DATABASE IF NOT EXISTS \`stateres_home\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`stateres_home\`;

CREATE TABLE IF NOT EXISTS \`admins\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
  \`email\` VARCHAR(120) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`tools\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`image_url\` VARCHAR(500) NULL,
  \`icon_key\` VARCHAR(50) DEFAULT 'globe',
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'Educação Inclusiva & PEI',
  \`is_pinned\` TINYINT(1) DEFAULT 0,
  \`display_order\` INT DEFAULT 99,
  \`created_at\` BIGINT NOT NULL,
  \`updated_at\` BIGINT NOT NULL,
  INDEX \`idx_category\` (\`category\`),
  INDEX \`idx_pinned\` (\`is_pinned\`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`admins\` (\`name\`, \`email\`, \`password_hash\`, \`role\`)
VALUES (
  'Prof. Ivan (Super Admin)',
  'ivan@profesorivan.com.br',
  '93082ff9b55cff94ee7f4d728013baa1863409cf3e5873d3f639aa9238bdb4de',
  'super_admin'
)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`password_hash\` = VALUES(\`password_hash\`);`;
                      navigator.clipboard.writeText(fullSql);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                      onShowToast('Script SQL copiado para a área de transferência!', 'success');
                    }}
                    className="text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    {copiedSql ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 leading-relaxed">
{`-- Percona Server 5.7.44-48 / MySQL cPanel (stateres_home)
CREATE DATABASE IF NOT EXISTS \`stateres_home\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`stateres_home\`;

CREATE TABLE IF NOT EXISTS \`admins\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(120) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'super_admin'
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4;

-- Super Admin: ivan@profesorivan.com.br / senha: 123@mudar
INSERT INTO \`admins\` (\`name\`, \`email\`, \`password_hash\`, \`role\`)
VALUES ('Prof. Ivan (Super Admin)', 'ivan@profesorivan.com.br', '93082ff9b55cff94ee7f4d728013baa1863409cf3e5873d3f639aa9238bdb4de', 'super_admin')
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
