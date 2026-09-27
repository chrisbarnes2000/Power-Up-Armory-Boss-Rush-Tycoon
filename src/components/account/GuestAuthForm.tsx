import React from 'react';
import { Mail, Lock, User, RefreshCw, Key, Shield } from 'lucide-react';
import { GameState } from '../../types';

interface GuestAuthFormProps {
  authMode: 'signin' | 'signup' | 'reset';
  setAuthMode: (mode: 'signin' | 'signup' | 'reset') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  displayNameInput: string;
  setDisplayNameInput: (name: string) => void;
  loading: boolean;
  gameState: GameState;
  onGoogleSignIn: () => void;
  onEmailSignIn: (e: React.FormEvent) => void;
  onEmailSignUp: (e: React.FormEvent) => void;
  onPasswordReset: (e: React.FormEvent) => void;
  onClearErrors: () => void;
}

export const GuestAuthForm: React.FC<GuestAuthFormProps> = ({
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  displayNameInput,
  setDisplayNameInput,
  loading,
  gameState,
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onPasswordReset,
  onClearErrors
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1-Click Google / Gmail Sign In */}
      <div className="bg-[#141f35] border border-[#2a4060] rounded-2xl p-5 text-center">
        <span className="text-3xl block mb-2">⚡</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wider mb-1">
          Fast Sign In with Google / Gmail
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Instantly connect your account with one click to store your base profile and publish your rank to the Hall of Champions.
        </p>

        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.72 1.486 6.64l3.78 3.125z"
            />
            <path
              fill="#FBBC05"
              d="M1.486 6.64a7.11 7.11 0 0 0 0 10.72l3.78-3.124a4.137 4.137 0 0 1 0-4.471L1.486 6.64z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.155 0 5.8-1.045 7.732-2.836l-3.836-3.127c-1.055.718-2.409 1.145-3.896 1.145-3.955 0-6.734-2.855-7.734-6.64l-3.782 3.125C3.358 21.28 7.33 24 12 24z"
            />
            <path
              fill="#4285F4"
              d="M24 12.273c0-.873-.077-1.71-.223-2.518H12v4.818h6.75c-.29 1.555-1.155 2.864-2.455 3.736l3.836 3.127C22.373 19.464 24 16.145 24 12.273z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Auth Tab Headers */}
      <div className="bg-[#141f35]/80 border border-[#2a4060]/50 p-1 rounded-2xl flex font-mono">
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); onClearErrors(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
            authMode === 'signin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('signup'); onClearErrors(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
            authMode === 'signup' ? 'bg-[#2a4060] text-[#7ae0ff] border border-blue-500/20 shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('reset'); onClearErrors(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
            authMode === 'reset' ? 'bg-[#2a4060] text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Forgot
        </button>
      </div>

      {/* Email Form */}
      {authMode === 'signin' && (
        <form onSubmit={onEmailSignIn} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder="hero@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            <span>Sign In with Email</span>
          </button>
        </form>
      )}

      {authMode === 'signup' && (
        <form onSubmit={onEmailSignUp} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Hero Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder={gameState.playerName || 'Heroic Slayer'}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder="champion@realm.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Password (minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>Register Champion Account</span>
          </button>
        </form>
      )}

      {authMode === 'reset' && (
        <form onSubmit={onPasswordReset} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your registered account email and we'll send you a password reset link.
          </p>

          <div>
            <label className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                placeholder="hero@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Send Reset Link</span>
          </button>
        </form>
      )}
    </div>
  );
};
