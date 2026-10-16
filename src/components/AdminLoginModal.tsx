import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, KeyRound, Database } from 'lucide-react';
import { AuthService, SUPER_ADMIN_CREDENTIALS, AdminUser } from '../services/authService';
import { SchoolLogo } from './SchoolLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Credenciais inválidas.');
      }
    } catch {
      setError('Ocorreu um erro ao processar o login.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setEmail(SUPER_ADMIN_CREDENTIALS.email);
    setPassword(SUPER_ADMIN_CREDENTIALS.password);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" />
            <div>
              <h2 id="login-title" className="text-base font-bold text-slate-900">
                Acesso do Super Administrador
              </h2>
              <p className="text-xs text-slate-500">
                Gestão e cadastro de ferramentas escolares
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Quick-fill helper banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <KeyRound size={14} className="text-amber-500" />
                <span>Super Admin Cadastrado:</span>
              </span>
              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="text-[11px] font-bold text-blue-800 bg-white hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-md transition-colors"
              >
                Preencher Dados
              </button>
            </div>
            <div className="text-xs text-slate-600 font-mono space-y-0.5">
              <p><span className="text-slate-400">Login:</span> {SUPER_ADMIN_CREDENTIALS.email}</p>
              <p><span className="text-slate-400">Senha:</span> {SUPER_ADMIN_CREDENTIALS.password}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@profesorivan.com.br"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Database size={13} className="text-emerald-600" />
                <span>MySQL stateres_home</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-xl shadow-xs transition-colors"
              >
                <span>{loading ? 'Entrando...' : 'Entrar no Painel'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
