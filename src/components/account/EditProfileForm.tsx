import React from 'react';
import { User, RefreshCw, CheckCircle } from 'lucide-react';

interface EditProfileFormProps {
  editName: string;
  setEditName: (name: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
  selectedTitle: string;
  setSelectedTitle: (title: string) => void;
  isSavingProfile: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const AVATARS = ['⚔️', '🛡️', '🐉', '👑', '⚡', '🔮', '🏹', '🧙', '🌟', '🦅', '🐺', '🦁'];

const TITLES = [
  'Grand Champion',
  'Dragon Slayer',
  'Void Stalker',
  'Tycoon Sovereign',
  'Ironclad Sentinel',
  'Arcane Adept',
  'Shadow Blade',
  'Mythic Alchemist'
];

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  editName,
  setEditName,
  selectedAvatar,
  setSelectedAvatar,
  selectedTitle,
  setSelectedTitle,
  isSavingProfile,
  onSaveProfile,
  onCancel
}) => {
  return (
    <form onSubmit={onSaveProfile} className="bg-[#111a2e] border border-[#1e2e4a] rounded-2xl p-5 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-mono font-bold text-[#7ae0ff] uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Edit Base Account Info</span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-xs font-mono transition cursor-pointer"
        >
          ✕ Cancel
        </button>
      </div>

      <div>
        <label className="text-xs text-slate-300 uppercase font-bold block mb-1.5">
          Hero Display Name
        </label>
        <input
          type="text"
          maxLength={40}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
          placeholder="Enter heroic name"
        />
      </div>

      {/* Avatar Selector */}
      <div>
        <label className="text-xs text-slate-300 uppercase font-bold block mb-1.5">
          Champion Crest / Avatar
        </label>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => setSelectedAvatar(emoji)}
              className={`text-xl p-2 rounded-xl border transition cursor-pointer ${
                selectedAvatar === emoji
                  ? 'bg-blue-600/30 border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                  : 'bg-[#0b1222] border-white/5 hover:bg-white/10'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Title Selector */}
      <div>
        <label className="text-xs text-slate-300 uppercase font-bold block mb-1.5">
          Heroic Title
        </label>
        <select
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="w-full bg-[#0b1222] border border-[#2a4060] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
        >
          {TITLES.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSavingProfile}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          <span>Save Account Info</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
