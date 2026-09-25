import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { GameState, UserProfile } from '../types';
import { POWERUPS, BOSSES } from '../data';
import { X, LogOut, CheckCircle, Shield, Trophy, Sparkles, User, Mail, Lock, RefreshCw, AlertCircle, Key } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onSyncLeaderboard: (profile?: UserProfile) => Promise<void>;
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

export default function AccountModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  currentUser,
  userProfile,
  setUserProfile,
  onSyncLeaderboard
}: AccountModalProps) {
  // Auth Form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile Edit states
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚔️');
  const [selectedTitle, setSelectedTitle] = useState('Grand Champion');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [syncingScore, setSyncingScore] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [confirmLocalWipe, setConfirmLocalWipe] = useState(false);

  // Local Character & State Purge
  const handleLocalWipe = () => {
    const resetState: GameState = {
      coins: 2000,
      gems: 500,
      maxHpBonus: 0,
      damageBonusPercent: 0,
      powerups: POWERUPS.map(p => ({ id: p.id, owned: false, level: 1, quantity: 0 })),
      bosses: BOSSES.map(b => ({ id: b.id, defeated: false })),
      powerScore: 0,
      totalBossesDefeated: 0,
      playerName: currentUser?.displayName || 'Champion',
      battleLog: [{ message: '🗑️ Character data wiped. Starter profile initialized.', className: '' }],
      leaderboard: gameState.leaderboard,
      purchasedCodes: [],
      bossKillStats: {},
      bossDeathStats: {},
      customStories: []
    };

    setGameState(resetState);
    localStorage.setItem('bossRushTycoon', JSON.stringify(resetState));
    setConfirmLocalWipe(false);
    setProfileMessage('Character data wiped successfully! Starter currencies and gear have been restored.');
    setTimeout(() => setProfileMessage(null), 5000);
  };

  // Check isAdmin flag in auth details or firestore profile
  useEffect(() => {
    const isOwnerAccount = 
      currentUser?.uid === 'WlMw7jRoVgSl2kyjH6B47DLayU72' ||
      currentUser?.email?.toLowerCase() === 'chris.barnes.2000@me.com';

    let admin = userProfile?.isAdmin === true || isOwnerAccount;
    if (currentUser) {
      if ((currentUser as any).isAdmin === true || (currentUser as any).claims?.isAdmin === true) {
        admin = true;
      }
      currentUser.getIdTokenResult().then(res => {
        if (res.claims.isAdmin === true || userProfile?.isAdmin === true || isOwnerAccount) {
          setIsAdminUser(true);
        }
      }).catch(() => {});
    }
    setIsAdminUser(admin);
  }, [currentUser, userProfile]);

  // Synchronize edit form with user profile
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || currentUser?.displayName || gameState.playerName || 'Hero');
      setSelectedAvatar(userProfile.avatar || '⚔️');
      setSelectedTitle(userProfile.title || 'Grand Champion');
    } else if (currentUser) {
      setEditName(currentUser.displayName || gameState.playerName || 'Hero');
    }
  }, [userProfile, currentUser, gameState.playerName]);

  if (!isOpen) return null;

  // Google / Gmail Authentication
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check or create profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      let existingProfile: UserProfile | null = null;
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          existingProfile = snap.data() as UserProfile;
        }
      } catch (err) {
        console.warn('Could not fetch existing profile, creating fresh one:', err);
      }

      const freshProfile: UserProfile = existingProfile || {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || gameState.playerName || 'Hero',
        avatar: '⚔️',
        title: 'Grand Champion',
        powerScore: gameState.powerScore,
        totalBossesDefeated: gameState.totalBossesDefeated,
        coins: Math.floor(gameState.coins),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!existingProfile) {
        try {
          await setDoc(userDocRef, freshProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      setUserProfile(freshProfile);
      setGameState(prev => ({
        ...prev,
        playerName: freshProfile.displayName
      }));

      // Auto sync score to leaderboard
      await onSyncLeaderboard(freshProfile);
      setAuthSuccess('Signed in with Google successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Fetch or init profile
      const userDocRef = doc(db, 'users', user.uid);
      let profile: UserProfile | null = null;
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          profile = snap.data() as UserProfile;
        }
      } catch (err) {
        console.warn('Error reading profile:', err);
      }

      if (!profile) {
        profile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || gameState.playerName || 'Hero',
          avatar: '⚔️',
          title: 'Grand Champion',
          powerScore: gameState.powerScore,
          totalBossesDefeated: gameState.totalBossesDefeated,
          coins: Math.floor(gameState.coins),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, profile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      setUserProfile(profile);
      setGameState(prev => ({
        ...prev,
        playerName: profile?.displayName || prev.playerName
      }));

      await onSyncLeaderboard(profile);
      setAuthSuccess('Signed in successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Registration
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const chosenName = displayNameInput.trim() || gameState.playerName || 'Hero';

      // Update auth profile display name
      try {
        await updateProfile(user, { displayName: chosenName });
      } catch {
        // ignore profile update error
      }

      const newProfile: UserProfile = {
        userId: user.uid,
        email: user.email || '',
        displayName: chosenName,
        avatar: '⚔️',
        title: 'Grand Champion',
        powerScore: gameState.powerScore,
        totalBossesDefeated: gameState.totalBossesDefeated,
        coins: Math.floor(gameState.coins),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      setUserProfile(newProfile);
      setGameState(prev => ({ ...prev, playerName: chosenName }));
      await onSyncLeaderboard(newProfile);
      setAuthSuccess('Account created and registered to the Hall of Champions!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter your email to receive a password reset link.');
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setAuthSuccess('Password reset email sent! Check your inbox.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserProfile(null);
      setAuthSuccess('Signed out successfully.');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save Profile Updates (Display Name, Avatar, Title)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    setProfileMessage(null);

    const updatedDisplayName = editName.trim() || 'Hero';
    const updated: Partial<UserProfile> = {
      displayName: updatedDisplayName,
      avatar: selectedAvatar,
      title: selectedTitle,
      powerScore: gameState.powerScore,
      totalBossesDefeated: gameState.totalBossesDefeated,
      coins: Math.floor(gameState.coins),
      updatedAt: new Date().toISOString()
    };

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, { displayName: updatedDisplayName });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updated);

      setUserProfile(prev => prev ? { ...prev, ...updated } : null);
      setGameState(prev => ({ ...prev, playerName: updatedDisplayName }));

      // Synchronize updated name and avatar to Leaderboard entry
      await onSyncLeaderboard({
        ...(userProfile || {
          userId: currentUser.uid,
          displayName: updatedDisplayName,
          avatar: selectedAvatar,
          title: selectedTitle,
          powerScore: gameState.powerScore,
          totalBossesDefeated: gameState.totalBossesDefeated,
          coins: Math.floor(gameState.coins)
        }),
        displayName: updatedDisplayName,
        avatar: selectedAvatar,
        title: selectedTitle
      });

      setProfileMessage('Base account info updated & synced to leaderboard!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Manual Leaderboard Sync
  const handleManualSync = async () => {
    setSyncingScore(true);
    try {
      await onSyncLeaderboard(userProfile || undefined);
      setProfileMessage('Leaderboard entry updated successfully with current battle stats!');
    } catch (err) {
      console.error('Leaderboard sync error:', err);
      setProfileMessage('Could not sync score. Please try again.');
    } finally {
      setSyncingScore(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-[#2a4060] w-full max-w-xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-lg border border-blue-400/30">
            {currentUser && userProfile?.avatar ? userProfile.avatar : '👑'}
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              {currentUser ? 'PLAYER ACCOUNT' : 'CHAMPION PORTAL'}
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                {currentUser ? 'VERIFIED' : 'GUEST'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {currentUser 
                ? 'Manage your base hero credentials, public title, and leaderboard sync.'
                : 'Sign in with Google or Email to bind your armory and rank on the Hall of Champions.'}
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}
        {profileMessage && (
          <div className="mb-4 p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{profileMessage}</span>
          </div>
        )}

        {/* SIGNED IN VIEW */}
        {currentUser ? (
          <div className="space-y-6">
            
            {/* Account Quick Stats Badge */}
            <div className="bg-[#141f35] border border-[#2a4060] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAvatar}</span>
                <div>
                  <div className="font-extrabold text-white text-base flex items-center gap-1.5">
                    <span>{userProfile?.displayName || currentUser.displayName || gameState.playerName}</span>
                    <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                      {userProfile?.title || 'Grand Champion'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{currentUser.email}</span>
                    {currentUser.emailVerified && (
                      <span className="text-emerald-400 text-[10px] sm:text-xs flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 inline" /> Verified
                      </span>
                    )}
                    {isAdminUser && (
                      <span className="text-red-300 bg-red-950/60 border border-red-500/40 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <span>🛡️</span> Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-500/20 px-3 py-1.5 rounded-xl transition cursor-pointer self-end sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Live Hero Stats Overview */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-bold block">Power Score</span>
                <span className="text-sm sm:text-base font-black text-[#f5e56b]">{gameState.powerScore} PS</span>
              </div>
              <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-bold block">Bosses Slain</span>
                <span className="text-sm sm:text-base font-black text-red-400">⚔️ {gameState.totalBossesDefeated}</span>
              </div>
              <div className="bg-[#0b1222] border border-white/5 p-3 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-bold block">Gold Hoard</span>
                <span className="text-sm sm:text-base font-black text-yellow-400">{Math.floor(gameState.coins)} 🪙</span>
              </div>
            </div>

            {/* Base Account Information Edit Form */}
            <form onSubmit={handleSaveProfile} className="bg-[#111a2e] border border-[#1e2e4a] rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-[#7ae0ff] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <User className="w-3.5 h-3.5" />
                <span>Edit Base Account Info</span>
              </h3>

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
                  onClick={handleManualSync}
                  disabled={syncingScore}
                  className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  title="Update your live Power Score and stats to the Hall of Champions"
                >
                  {syncingScore ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
                  <span>Sync Leaderboard</span>
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* SIGNED OUT: AUTH TABS VIEW */
          <div className="space-y-6">

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
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 font-mono uppercase tracking-widest font-bold">or use email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex bg-[#0b1222] p-1 border border-white/10 rounded-2xl">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                  authMode === 'signin' ? 'bg-[#2a4060] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                  authMode === 'signup' ? 'bg-[#2a4060] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('reset'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                  authMode === 'reset' ? 'bg-[#2a4060] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Forgot
              </button>
            </div>

            {/* Email Form */}
            {authMode === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
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
              <form onSubmit={handleEmailSignUp} className="space-y-4">
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
              <form onSubmit={handlePasswordReset} className="space-y-4">
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
        )}

        {/* DANGER ZONE: CHARACTER DATA PURGE (FOR NORMAL & GUEST USERS) */}
        <div className="mt-8 bg-linear-to-b from-red-950/30 to-slate-900/40 border border-red-500/30 rounded-2xl p-4.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-sm">⚠️</span>
                <h3 className="font-mono text-xs text-red-400 font-extrabold uppercase tracking-widest">
                  RESET CHARACTER PROGRESS
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentUser 
                  ? 'Reset your local character levels, currencies, powerups, and battle records back to starter values.'
                  : 'Playing as a guest? Wipe your character progress and clear local device state for a clean fresh start.'}
              </p>
            </div>

            {confirmLocalWipe ? (
              <div className="flex items-center gap-2 shrink-0 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleLocalWipe}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Confirm Wipe?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLocalWipe(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLocalWipe(true)}
                className="px-4 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0"
              >
                🗑️ Wipe Character State
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
