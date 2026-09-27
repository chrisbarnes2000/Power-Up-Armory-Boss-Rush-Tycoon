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
import { POWERUPS, BOSSES, DEFAULT_HERO_BASELINE, calculatePowerScore } from '../data';
import { X, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

// Import newly decomposed modular account subcomponents
import { LiveHeroStats } from './account/LiveHeroStats';
import { AccountQuickBadge } from './account/AccountQuickBadge';
import { EditProfileForm } from './account/EditProfileForm';
import { LocalResetOptions } from './account/LocalResetOptions';
import { GuestAuthForm } from './account/GuestAuthForm';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚔️');
  const [selectedTitle, setSelectedTitle] = useState('Grand Champion');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [syncingScore, setSyncingScore] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [confirmLocalWipe, setConfirmLocalWipe] = useState<'zero' | 'standard' | null>(null);

  // Local Character & State Purge with 2 Presets
  const handleLocalWipe = (mode: 'zero' | 'standard' = 'standard') => {
    const isZero = mode === 'zero';
    const preset = isZero ? DEFAULT_HERO_BASELINE.absoluteZero : DEFAULT_HERO_BASELINE.starter;
    const resetState: GameState = {
      coins: preset.coins,
      gems: preset.gems,
      maxHpBonus: 0,
      damageBonusPercent: 0,
      powerups: POWERUPS.map(p => ({ id: p.id, owned: false, level: 1, quantity: 0 })),
      bosses: BOSSES.map(b => ({ id: b.id, defeated: false })),
      powerScore: preset.powerScore,
      totalBossesDefeated: 0,
      playerName: currentUser?.displayName || userProfile?.displayName || gameState.playerName || 'Champion',
      battleLog: [{
        message: `🗑️ Character profile reset (${isZero ? `Absolute Zero: ${preset.powerScore} PS / ${preset.baseDefense} Armor / ${preset.coins} Currency` : `Standard Starter: ${preset.powerScore} PS / ${preset.baseDefense} Armor / ${preset.coins.toLocaleString()} Coins`}).`,
        className: 'log-defeat'
      }],
      leaderboard: gameState.leaderboard,
      purchasedCodes: [],
      bossKillStats: {},
      bossDeathStats: {},
      customStories: [],
      isDead: false,
      reviveCount: 0,
      revivePacks: preset.revivePacks,
      baseAttack: preset.baseAttack,
      baseDefense: preset.baseDefense,
      baseSpeed: preset.baseSpeed
    };

    setGameState(resetState);
    localStorage.setItem('bossRushTycoon', JSON.stringify(resetState));
    setConfirmLocalWipe(null);
    setProfileMessage(
      isZero
        ? '⚡ Character wiped to Absolute Zero! (0 PS, 0 DEF/Armor, 0 Coins, 0 Gems)'
        : '🎮 Starter profile restored! (29 PS, 5 DEF/Armor, 2,000 Coins, 500 Gems)'
    );
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
        powerScore: calculatePowerScore(gameState),
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
          powerScore: calculatePowerScore(gameState),
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
        powerScore: calculatePowerScore(gameState),
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
      powerScore: calculatePowerScore(gameState),
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
          powerScore: calculatePowerScore(gameState),
          totalBossesDefeated: gameState.totalBossesDefeated,
          coins: Math.floor(gameState.coins)
        }),
        displayName: updatedDisplayName,
        avatar: selectedAvatar,
        title: selectedTitle
      });

      setProfileMessage('Base account info updated & synced to leaderboard!');
      setIsEditMode(false);
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
      <div className="bg-[#0f172a] border border-[#2a4060] w-full max-w-xl md:max-w-3xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6 md:space-y-8">
        
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

        {/* SIGNED IN VIEW vs SIGNED OUT AUTH TABS */}
        {currentUser ? (
          <div className="space-y-6">
            
            {/* Live Hero Stats Overview (Moved above Contact/Badge Info!) */}
            <LiveHeroStats gameState={gameState} />

            {/* Account Quick Stats Badge (Contact details/Credentials) */}
            <AccountQuickBadge
              currentUser={currentUser}
              userProfile={userProfile}
              gameState={gameState}
              selectedAvatar={selectedAvatar}
              isEditMode={isEditMode}
              isAdminUser={isAdminUser}
              syncingScore={syncingScore}
              loading={loading}
              onEditToggle={() => setIsEditMode(true)}
              onManualSync={handleManualSync}
              onSignOut={handleSignOut}
            />

            {/* Base Account Information Edit Form if Edit Mode is Active */}
            {isEditMode && (
              <EditProfileForm
                editName={editName}
                setEditName={setEditName}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                selectedTitle={selectedTitle}
                setSelectedTitle={setSelectedTitle}
                isSavingProfile={isSavingProfile}
                onSaveProfile={handleSaveProfile}
                onCancel={() => setIsEditMode(false)}
              />
            )}

          </div>
        ) : (
          <GuestAuthForm
            authMode={authMode}
            setAuthMode={setAuthMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            displayNameInput={displayNameInput}
            setDisplayNameInput={setDisplayNameInput}
            loading={loading}
            gameState={gameState}
            onGoogleSignIn={handleGoogleSignIn}
            onEmailSignIn={handleEmailSignIn}
            onEmailSignUp={handleEmailSignUp}
            onPasswordReset={handlePasswordReset}
            onClearErrors={() => setAuthError(null)}
          />
        )}

        {/* Danger Zone Reset Options */}
        <LocalResetOptions
          confirmLocalWipe={confirmLocalWipe}
          setConfirmLocalWipe={setConfirmLocalWipe}
          onLocalWipe={handleLocalWipe}
        />

      </div>
    </div>
  );
}
