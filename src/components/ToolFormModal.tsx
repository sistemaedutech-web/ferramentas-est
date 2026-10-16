import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ToolItem } from '../types';
import { validateTool, normalizeUrl, DEFAULT_CATEGORIES } from '../utils/tools';
import { ToolIcon, ICON_OPTIONS } from './ToolIcon';
import { ToolCard } from './ToolCard';

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolData: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  editingTool?: ToolItem | null;
  existingCategories: string[];
}

export const ToolFormModal: React.FC<ToolFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTool,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [iconKey, setIconKey] = useState('book-open');
  const [category, setCategory] = useState<string>('Pedagógico');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [order, setOrder] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageMode, setImageMode] = useState<'icon' | 'url' | 'upload'>('icon');

  // Populate form when editing or resetting
  useEffect(() => {
    if (editingTool) {
      setName(editingTool.name);
      setDescription(editingTool.description);
      setUrl(editingTool.url);
      setImageUrl(editingTool.imageUrl || '');
      setIconKey(editingTool.iconKey || 'globe');
      setIsPinned(Boolean(editingTool.isPinned));
      setOrder(typeof editingTool.order === 'number' ? editingTool.order : '');

      if (editingTool.imageUrl) {
        setImageMode('url');
      } else {
        setImageMode('icon');
      }

      if (DEFAULT_CATEGORIES.includes(editingTool.category as any)) {
        setCategory(editingTool.category);
        setIsCustomCategory(false);
      } else {
        setCategory('Outra');
        setCustomCategory(editingTool.category);
        setIsCustomCategory(true);
      }
    } else {
      // Default clean state
      setName('');
      setDescription('');
      setUrl('');
      setImageUrl('');
      setIconKey('sparkles');
      setCategory('Educação Inclusiva & PEI');
      setCustomCategory('');
      setIsCustomCategory(false);
      setIsPinned(false);
      setOrder('');
      setImageMode('icon');
    }
    setErrors({});
  }, [editingTool, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload (converts to base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'A imagem deve ter no máximo 2MB.',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setImageMode('upload');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    const finalUrl = normalizeUrl(url);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      url: finalUrl,
      imageUrl: imageMode !== 'icon' && imageUrl.trim() ? imageUrl.trim() : undefined,
      iconKey: imageMode === 'icon' ? iconKey : undefined,
      category: finalCategory,
      isPinned,
      order: typeof order === 'number' ? order : undefined,
    };

    const validation = validateTool(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(payload, editingTool?.id);
    onClose();
  };

  // Live preview mockup tool
  const previewTool: ToolItem = {
    id: editingTool?.id || 'preview-id',
    name: name.trim() || 'Nome da Ferramenta',
    description:
      description.trim() ||
      'Descrição detalhada da ferramenta, finalidade e orientações para o usuário final da Escola Santa Teresinha.',
    url: normalizeUrl(url) || 'https://sistema.esantateresinha.com.br',
    imageUrl: imageMode !== 'icon' && imageUrl.trim() ? imageUrl.trim() : undefined,
    iconKey: imageMode === 'icon' ? iconKey : undefined,
    category: isCustomCategory ? customCategory.trim() || 'Categoria' : category,
    isPinned,
    order: typeof order === 'number' ? order : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
              {editingTool ? 'Editar Ferramenta' : 'Cadastrar Nova Ferramenta'}
            </h2>
            <p className="text-xs text-slate-500">
              Preencha as informações para disponibilizar o link de acesso rápido no portal da escola.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body with 2-Column Split (Inputs + Live Preview) */}
        <div className="overflow-y-auto p-6">
          <form id="tool-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome da Ferramenta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Diário Eletrônico, Google Classroom, Portal do Aluno"
                  className={`w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border ${
                    errors.name ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-300 focus:border-blue-600'
                  } focus:outline-none transition-colors`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Link de Acesso Rápido */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Link de Acesso Rápido (URL) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                    https://
                  </span>
                  <input
                    type="text"
                    value={url.replace(/^https?:\/\//i, '')}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) setErrors((prev) => ({ ...prev, url: '' }));
                    }}
                    placeholder="diario.esantateresinha.com.br"
                    className={`w-full pl-18 pr-3.5 py-2.5 font-mono bg-white text-slate-900 text-sm rounded-lg border ${
                      errors.url ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-300 focus:border-blue-600'
                    } focus:outline-none transition-colors`}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Ao clicar, o usuário será direcionado diretamente para esta página.
                </p>
                {errors.url && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{errors.url}</span>
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição / Finalidade <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder="Explique resumidamente para que serve este sistema e quem deve utilizá-lo."
                  className={`w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border ${
                    errors.description ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-300 focus:border-blue-600'
                  } focus:outline-none transition-colors`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={isCustomCategory ? 'Outra' : category}
                    onChange={(e) => {
                      if (e.target.value === 'Outra') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setCategory(e.target.value);
                      }
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {existingCategories
                      .filter((c) => !DEFAULT_CATEGORIES.includes(c as any) && c !== 'Todas')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    <option value="Outra">+ Nova Categoria Personalizada...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Digite o nome da categoria"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Imagem / Ícone Section */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Imagem / Logotipo da Ferramenta
                </label>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode('icon')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      imageMode === 'icon'
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Ícone Institucional
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      imageMode === 'url'
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Link da Imagem (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      imageMode === 'upload'
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Enviar Imagem Local
                  </button>
                </div>

                {/* Sub-inputs according to mode */}
                {imageMode === 'icon' && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">
                      Escolha um ícone temático para representar a ferramenta:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-lg">
                      {ICON_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = iconKey === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setIconKey(opt.key)}
                            title={opt.label}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <IconComp size={20} />
                            <span className="text-[10px] mt-1 truncate max-w-full text-center">
                              {opt.label.split('/')[0].trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {imageMode === 'url' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Cole o endereço direto da imagem ou use o logotipo oficial:
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://esantateresinha.com.br/assets/logo-est.png')}
                        className="text-xs font-semibold text-blue-900 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        + Usar Logo Oficial (logo-est.png)
                      </button>
                    </div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://esantateresinha.com.br/assets/logo-est.png"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400">
                      Formatos recomendados: PNG, SVG ou JPG.
                    </p>
                  </div>
                )}

                {imageMode === 'upload' && (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-lg cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">
                        Clique para escolher o logotipo do seu computador
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        PNG, JPG, SVG até 2MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {imageUrl && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check size={13} />
                        <span>Imagem carregada com sucesso!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Destaque & Ordem */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Destacar no Topo
                    </span>
                    <p className="text-xs text-slate-500">
                      Exibir na seção de ferramentas em destaque do portal
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) =>
                      setOrder(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    placeholder="Ex: 1, 2, 3..."
                    className="w-full px-3.5 py-2 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Pré-visualização em Tempo Real
                  </span>
                  <span className="text-[11px] text-slate-400">Como aparecerá no portal</span>
                </div>

                <div className="py-2">
                  <ToolCard
                    tool={previewTool}
                    featured={isPinned}
                    onCopyLink={() => {}}
                  />
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Resumo da Ferramenta:</p>
                  <p><span className="text-slate-400">Destino:</span> {normalizeUrl(url) || 'Não definido'}</p>
                  <p><span className="text-slate-400">Categoria:</span> {isCustomCategory ? customCategory || 'Personalizada' : category}</p>
                  <p><span className="text-slate-400">Status:</span> {isPinned ? 'Fixada em Destaque' : 'Listagem Padrão'}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="tool-form"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
                >
                  {editingTool ? 'Salvar Alterações' : 'Cadastrar Ferramenta'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
