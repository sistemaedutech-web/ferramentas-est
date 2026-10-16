import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  Library,
  Mail,
  LayoutGrid,
  Wrench,
  Laptop,
  Calendar,
  Database,
  ShieldCheck,
  Globe,
  Bookmark,
  Sparkles,
  HeartHandshake,
  Brain,
} from 'lucide-react';

interface ToolIconProps {
  imageUrl?: string;
  iconKey?: string;
  toolName: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ICON_OPTIONS = [
  { key: 'sparkles', label: 'Inclusão / SuperPei', icon: Sparkles },
  { key: 'book-open', label: 'Diário / Notas', icon: BookOpen },
  { key: 'graduation-cap', label: 'Sala de Aula / Docente', icon: GraduationCap },
  { key: 'users', label: 'Colaboradores / RH', icon: Users },
  { key: 'file-text', label: 'Secretaria / Atas', icon: FileText },
  { key: 'library', label: 'Biblioteca / Acervo', icon: Library },
  { key: 'mail', label: 'E-mail Institucional', icon: Mail },
  { key: 'layout-grid', label: 'Gestão Escolar SGE', icon: LayoutGrid },
  { key: 'wrench', label: 'Suporte TI / Salas', icon: Wrench },
  { key: 'laptop', label: 'Ambiente Virtual', icon: Laptop },
  { key: 'calendar', label: 'Horários & Calendário', icon: Calendar },
  { key: 'database', label: 'Servidor / Registros', icon: Database },
  { key: 'globe', label: 'Portal Web', icon: Globe },
  { key: 'bookmark', label: 'Favorito / Destaque', icon: Bookmark },
];

export const ToolIcon: React.FC<ToolIconProps> = ({
  imageUrl,
  iconKey,
  toolName,
  category = 'Pedagógico & Diários',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const containerSizes = {
    sm: 'w-9 h-9 min-w-9 text-base rounded-lg',
    md: 'w-12 h-12 min-w-12 text-xl rounded-xl',
    lg: 'w-16 h-16 min-w-16 text-2xl rounded-2xl',
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  };

  // Category palette pairing tailored for teacher/staff domains
  const categoryThemes: Record<string, { bg: string; text: string }> = {
    'Educação Inclusiva & PEI': { bg: 'bg-purple-100/80 border-purple-300', text: 'text-purple-800' },
    'Pedagógico & Diários': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    'Salas Virtuais & Aulas': { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    'Gestão & Secretaria': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    'Comunicação & Colaboração': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
    'Recursos Docentes': { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
    'Suporte & TI': { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
  };

  const theme = categoryThemes[category] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' };

  // If a valid image URL is given and has not errored out
  if (imageUrl && !imageError) {
    return (
      <div
        className={`${containerSizes[size]} overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1 shadow-xs ${className}`}
      >
        <img
          src={imageUrl}
          alt={`Logotipo ${toolName}`}
          className="w-full h-full object-contain rounded"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback to designated or matching icon
  const selectedIcon = ICON_OPTIONS.find((opt) => opt.key === iconKey)?.icon;
  const FallbackIcon = selectedIcon || Globe;

  return (
    <div
      className={`${containerSizes[size]} ${theme.bg} ${theme.text} border flex items-center justify-center shadow-xs ${className}`}
      aria-hidden="true"
    >
      <FallbackIcon size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
};
