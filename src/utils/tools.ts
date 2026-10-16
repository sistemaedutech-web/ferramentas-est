/**
 * Types and pure utility functions for Tool item management and filtering
 * Exclusively designed for Teachers and Staff of Escola Santa Teresinha
 */

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  iconKey?: string;
  category: string;
  isPinned?: boolean;
  order?: number;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_CATEGORIES = [
  'Educação Inclusiva & PEI',
  'Pedagógico & Diários',
  'Salas Virtuais & Aulas',
  'Gestão & Secretaria',
  'Comunicação & Colaboração',
  'Recursos Docentes',
  'Suporte & TI',
] as const;

export const INITIAL_TOOLS: ToolItem[] = [
  {
    id: 'tool-superpei',
    name: 'SuperPei',
    description: 'Ferramenta para criação, edição, cadastro e acompanhamento pedagógico de estudantes e estudantes neurodivergentes (PEI / AEE).',
    url: 'https://pei.sistemaedutech.com.br/login',
    category: 'Educação Inclusiva & PEI',
    iconKey: 'sparkles',
    isPinned: true,
    order: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-diario-eletronico',
    name: 'Diário de Classe & Notas',
    description: 'Lançamento de frequências diárias, notas bimestrais, pareceres pedagógicos e planos de aula dos professores.',
    url: 'https://diario.esantateresinha.com.br',
    category: 'Pedagógico & Diários',
    iconKey: 'book-open',
    isPinned: true,
    order: 2,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-google-classroom',
    name: 'Google Classroom (Docente)',
    description: 'Painel do professor: turmas atribuídas, postagem de atividades, correção de trabalhos e Google Meet.',
    url: 'https://classroom.google.com',
    category: 'Salas Virtuais & Aulas',
    iconKey: 'graduation-cap',
    isPinned: true,
    order: 3,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-gestao-academica',
    name: 'Sistema de Gestão Escolar (SGE)',
    description: 'Acesso para coordenação e funcionários: enturmação, quadro de horários de aulas, atas e relatórios oficiais.',
    url: 'https://gestao.esantateresinha.com.br',
    category: 'Gestão & Secretaria',
    imageUrl: 'https://esantateresinha.com.br/assets/logo-est.png',
    iconKey: 'layout-grid',
    isPinned: true,
    order: 4,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-email-institucional',
    name: 'E-mail Corporativo (@esantateresinha)',
    description: 'Acesso ao webmail institucional e ferramentas Google Workspace para comunicação interna da equipe escolar.',
    url: 'https://mail.google.com/a/esantateresinha.com.br',
    category: 'Comunicação & Colaboração',
    imageUrl: 'https://esantateresinha.com.br/assets/logo-est.png',
    iconKey: 'mail',
    isPinned: false,
    order: 5,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-portal-rh',
    name: 'Portal do Colaborador & RH',
    description: 'Acesso para professores e funcionários: consulta de holerites, informes de rendimento, ponto e avisos do RH.',
    url: 'https://rh.esantateresinha.com.br',
    category: 'Gestão & Secretaria',
    iconKey: 'users',
    isPinned: false,
    order: 6,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-biblioteca-docente',
    name: 'Biblioteca & Acervo Pedagógico',
    description: 'Consulta de referências bibliográficas, manuais do professor, livros didáticos e reservas de acervo institucional.',
    url: 'https://biblioteca.esantateresinha.com.br',
    category: 'Recursos Docentes',
    iconKey: 'library',
    isPinned: false,
    order: 7,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'tool-suporte-ti',
    name: 'Chamados TI & Salas de Aula',
    description: 'Solicitação de assistência técnica para projetores, laboratórios de informática, rede wi-fi e login.',
    url: 'https://suporte.esantateresinha.com.br',
    category: 'Suporte & TI',
    iconKey: 'wrench',
    isPinned: false,
    order: 8,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
];

/**
 * Normalizes URL string, prepending https:// if protocol is omitted
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates a Tool item input before saving
 */
export function validateTool(input: Partial<ToolItem>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = 'O nome da ferramenta é obrigatório.';
  } else if (input.name.trim().length < 2) {
    errors.name = 'O nome deve ter pelo menos 2 caracteres.';
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.description = 'A descrição da ferramenta é obrigatória.';
  }

  if (!input.url || input.url.trim().length === 0) {
    errors.url = 'O link de acesso rápido é obrigatório.';
  } else {
    try {
      const normalized = normalizeUrl(input.url);
      const parsed = new URL(normalized);
      if (!parsed.hostname.includes('.')) {
        errors.url = 'Insira um link válido com domínio (ex: https://pei.sistemaedutech.com.br/login).';
      }
    } catch {
      errors.url = 'Formato de link inválido.';
    }
  }

  if (!input.category || input.category.trim().length === 0) {
    errors.category = 'Selecione uma categoria para a ferramenta.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Filters tools by search term and selected category
 */
export function filterTools(
  tools: ToolItem[],
  searchTerm: string,
  category: string
): ToolItem[] {
  const normalizedQuery = searchTerm.trim().toLowerCase();

  return tools.filter((tool) => {
    // Category match
    const categoryMatches =
      !category || category === 'Todas' || category === 'Todos' || tool.category === category;

    if (!categoryMatches) return false;

    // Search query match
    if (!normalizedQuery) return true;

    const inName = tool.name.toLowerCase().includes(normalizedQuery);
    const inDesc = tool.description.toLowerCase().includes(normalizedQuery);
    const inUrl = tool.url.toLowerCase().includes(normalizedQuery);
    const inCat = tool.category.toLowerCase().includes(normalizedQuery);

    return inName || inDesc || inUrl || inCat;
  });
}

/**
 * Sorts tools: pinned items first, then by explicit order, then by creation date
 */
export function sortTools(tools: ToolItem[]): ToolItem[] {
  return [...tools].sort((a, b) => {
    // 1. Pinned first
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
      return a.isPinned ? -1 : 1;
    }
    // 2. Order number ascending if present
    const orderA = typeof a.order === 'number' ? a.order : 9999;
    const orderB = typeof b.order === 'number' ? b.order : 9999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // 3. Fallback to name alphabetically
    return a.name.localeCompare(b.name);
  });
}

/**
 * Serializes tools to formatted JSON for backup/export
 */
export function exportToolsToJson(tools: ToolItem[]): string {
  return JSON.stringify(
    {
      institution: 'Escola Santa Teresinha',
      targetAudience: 'Professores e Funcionários',
      exportedAt: new Date().toISOString(),
      source: 'https://home.esantateresinha.com.br/',
      toolsCount: tools.length,
      tools,
    },
    null,
    2
  );
}

/**
 * Parses and validates imported JSON data
 */
export function parseToolsFromJson(jsonString: string): {
  success: boolean;
  data?: ToolItem[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const rawList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.tools)
      ? parsed.tools
      : null;

    if (!rawList) {
      return {
        success: false,
        error: 'Arquivo JSON inválido. A estrutura deve conter uma lista de ferramentas.',
      };
    }

    const validated: ToolItem[] = [];

    for (const item of rawList) {
      if (!item.name || !item.url) continue;
      validated.push({
        id: item.id || `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: String(item.name).trim(),
        description: item.description ? String(item.description).trim() : '',
        url: normalizeUrl(String(item.url)),
        imageUrl: item.imageUrl ? String(item.imageUrl).trim() : undefined,
        iconKey: item.iconKey ? String(item.iconKey).trim() : 'globe',
        category: item.category ? String(item.category).trim() : 'Educação Inclusiva & PEI',
        isPinned: Boolean(item.isPinned),
        order: typeof item.order === 'number' ? item.order : undefined,
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (validated.length === 0) {
      return {
        success: false,
        error: 'Nenhuma ferramenta válida encontrada no arquivo fornecido.',
      };
    }

    return {
      success: true,
      data: validated,
    };
  } catch (err) {
    return {
      success: false,
      error: `Erro ao processar JSON: ${err instanceof Error ? err.message : 'Arquivo corrompido'}`,
    };
  }
}
