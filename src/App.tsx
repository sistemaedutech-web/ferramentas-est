/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { PublicPortal } from './components/PublicPortal';
import { AdminPanel } from './components/AdminPanel';
import { ToolFormModal } from './components/ToolFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ToastContainer } from './components/Toast';
import { ToolStorage } from './services/toolStorage';
import { AuthService, AdminUser } from './services/authService';
import { ToolItem, ViewMode, ToastMessage } from './types';

export default function App() {
  const [tools, setTools] = useState<ToolItem[]>(() => ToolStorage.getTools());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => AuthService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('view') === 'admin' || window.location.hash === '#admin') && AuthService.isAuthenticated()) {
      return 'admin';
    }
    return 'public';
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync tools on mount & listen to changes
  useEffect(() => {
    const unsubscribeTools = ToolStorage.onUpdate((updatedTools) => {
      setTools(updatedTools);
    });
    const unsubscribeAuth = AuthService.onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribeTools();
      unsubscribeAuth();
    };
  }, []);

  // Compute existing categories for the form dropdown
  const existingCategories = useMemo(() => {
    return Array.from(new Set(tools.map((t) => t.category)));
  }, [tools]);

  // Request entering admin mode
  const handleRequestAdmin = useCallback(() => {
    if (currentUser) {
      setViewMode('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  }, [currentUser]);

  // Handle successful login
  const handleLoginSuccess = useCallback((user: AdminUser) => {
    setCurrentUser(user);
    setViewMode('admin');
    showToast(`Bem-vindo, ${user.name}! Acesso de Super Admin concedido.`, 'success');
  }, [showToast]);

  // Handle Logout
  const handleLogout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    setViewMode('public');
    showToast('Sessão encerrada com sucesso.', 'info');
  }, [showToast]);

  // Handle Save (Create or Update)
  const handleSaveTool = useCallback(
    (toolData: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
      if (id) {
        // Update
        const updated = ToolStorage.updateTool(id, toolData);
        if (updated) {
          setTools(ToolStorage.getTools());
          showToast(`Ferramenta "${updated.name}" atualizada com sucesso!`, 'success');
        }
      } else {
        // Create
        const created = ToolStorage.addTool(toolData);
        setTools(ToolStorage.getTools());
        showToast(`Ferramenta "${created.name}" cadastrada com sucesso!`, 'success');
      }
    },
    [showToast]
  );

  // Handle Delete
  const handleDeleteTool = useCallback(
    (id: string, name: string) => {
      const deleted = ToolStorage.deleteTool(id);
      if (deleted) {
        setTools(ToolStorage.getTools());
        showToast(`Ferramenta "${name}" removida.`, 'info');
      }
    },
    [showToast]
  );

  // Handle Pin Toggle
  const handleTogglePin = useCallback(
    (id: string, currentPinned: boolean) => {
      const updated = ToolStorage.updateTool(id, { isPinned: !currentPinned });
      if (updated) {
        setTools(ToolStorage.getTools());
        showToast(
          updated.isPinned
            ? `"${updated.name}" foi fixada em destaque!`
            : `"${updated.name}" removida dos destaques.`,
          'info'
        );
      }
    },
    [showToast]
  );

  // Handle Reset to defaults
  const handleResetDefaults = useCallback(() => {
    const defaults = ToolStorage.resetToDefaults();
    setTools(defaults);
  }, []);

  // Handle Import
  const handleImportTools = useCallback((imported: ToolItem[]) => {
    ToolStorage.saveTools(imported);
    setTools(imported);
  }, []);

  // Handle Copy Link
  const handleCopyLink = useCallback(
    (url: string, name: string) => {
      showToast(`Link de "${name}" copiado para a área de transferência!`, 'success');
    },
    [showToast]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onToggleViewMode={(mode) => {
          if (mode === 'admin') {
            handleRequestAdmin();
          } else {
            setViewMode('public');
          }
        }}
        toolCount={tools.length}
      />

      {/* Main View Router */}
      {viewMode === 'public' ? (
        <PublicPortal
          tools={tools}
          onOpenAdmin={handleRequestAdmin}
          onCopyLink={handleCopyLink}
        />
      ) : (
        <AdminPanel
          tools={tools}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCreate={() => {
            setEditingTool(null);
            setIsFormOpen(true);
          }}
          onOpenEdit={(tool) => {
            setEditingTool(tool);
            setIsFormOpen(true);
          }}
          onDeleteTool={handleDeleteTool}
          onTogglePin={handleTogglePin}
          onResetDefaults={handleResetDefaults}
          onImportTools={handleImportTools}
          onShowToast={showToast}
          onBackToPublic={() => setViewMode('public')}
        />
      )}

      {/* Super Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Create / Edit Tool Modal */}
      <ToolFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTool(null);
        }}
        onSave={handleSaveTool}
        editingTool={editingTool}
        existingCategories={existingCategories}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
