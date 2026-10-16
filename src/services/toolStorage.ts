import { ToolItem } from '../types';
import { INITIAL_TOOLS } from '../utils/tools';

const STORAGE_KEY = 'esantateresinha_staff_tools_v3';
const SYNC_EVENT = 'esantateresinha_tools_updated';

export const ToolStorage = {
  getTools(): ToolItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default staff tools (including SuperPei)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TOOLS));
        return INITIAL_TOOLS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure SuperPei exists if not present
        const hasSuperPei = parsed.some((t: ToolItem) => t.name.toLowerCase().includes('superpei'));
        if (!hasSuperPei) {
          const merged = [INITIAL_TOOLS[0], ...parsed];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
      return INITIAL_TOOLS;
    } catch (e) {
      console.warn('Failed to read from localStorage, using initial tools', e);
      return INITIAL_TOOLS;
    }
  },

  saveTools(tools: ToolItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: tools }));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  },

  addTool(tool: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'>): ToolItem {
    const tools = this.getTools();
    const newTool: ToolItem = {
      ...tool,
      id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newTool, ...tools];
    this.saveTools(updated);
    return newTool;
  },

  updateTool(id: string, updates: Partial<Omit<ToolItem, 'id' | 'createdAt'>>): ToolItem | null {
    const tools = this.getTools();
    const index = tools.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTool: ToolItem = {
      ...tools[index],
      ...updates,
      updatedAt: Date.now(),
    };

    tools[index] = updatedTool;
    this.saveTools(tools);
    return updatedTool;
  },

  deleteTool(id: string): boolean {
    const tools = this.getTools();
    const filtered = tools.filter((t) => t.id !== id);
    if (filtered.length !== tools.length) {
      this.saveTools(filtered);
      return true;
    }
    return false;
  },

  resetToDefaults(): ToolItem[] {
    this.saveTools(INITIAL_TOOLS);
    return INITIAL_TOOLS;
  },

  onUpdate(callback: (tools: ToolItem[]) => void): () => void {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ToolItem[]>;
      callback(custom.detail || this.getTools());
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  },
};
