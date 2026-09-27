import React, { useState } from 'react';
import { GameState, CustomStoryEntry } from '../../types';
import { BOSSES, POWERUPS } from '../../data';

interface StoryWeaverTabProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onSaveSuccess: (title: string) => void;
  onBackToLiving: () => void;
}

export const StoryWeaverTab: React.FC<StoryWeaverTabProps> = ({
  gameState,
  setGameState,
  onSaveSuccess,
  onBackToLiving
}) => {
  const [weaverBoss, setWeaverBoss] = useState<string>(BOSSES[0].id);
  const [weaverItems, setWeaverItems] = useState<string[]>([POWERUPS[0].id]);
  const [weaverOutcome, setWeaverOutcome] = useState<'victory' | 'defeat' | 'close-call' | 'heroic'>('victory');
  const [weaverTitle, setWeaverTitle] = useState('');
  const [weaverText, setWeaverText] = useState('');
  const [weaverAuthor, setWeaverAuthor] = useState(gameState.playerName || 'Champion');

  const toggleWeaverItem = (itemId: string) => {
    setWeaverItems(prev => {
      if (prev.includes(itemId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(i => i !== itemId);
      } else {
        if (prev.length >= 4) return prev; // Limit to 4 key items
        return [...prev, itemId];
      }
    });
  };

  const handleAutoWeave = () => {
    const boss = BOSSES.find(b => b.id === weaverBoss);
    const bossKills = gameState.bossKillStats?.[weaverBoss] || 0;
    const bossDeaths = gameState.bossDeathStats?.[weaverBoss] || 0;
    const itemsUsed = weaverItems.map(id => POWERUPS.find(p => p.id === id)?.id || id).join(', ');
    const firstItem = POWERUPS.find(p => p.id === weaverItems[0]);

    let generatedTitle = '';
    let generatedStory = '';

    if (weaverOutcome === 'victory') {
      generatedTitle = `The Triumph over ${boss?.id || weaverBoss}`;
      generatedStory = `Under the blood-tinted arena torches, ${weaverAuthor} stood opposite ${boss?.emoji} ${boss?.id}. Having recorded ${bossKills + 1} career triumph(s) and braved ${bossDeaths} harrowing setback(s), the champion placed total faith in their chosen armory loadout: ${itemsUsed}.\n\nWhen the beast unleashed its ferocious assault, the resonance of the ${firstItem?.emoji} ${firstItem?.id} cut through the fray. With synchronized precision and unyielding nerve, the champion executed the decisive strike. The ${boss?.id} roared in defeat and dissolved into a shower of gold coins and radiant gems, forever etching another legendary victory into the Armory’s battle annals.`;
    } else if (weaverOutcome === 'close-call') {
      generatedTitle = `A Hair's Breadth: The Clash with ${boss?.id || weaverBoss}`;
      generatedStory = `The duel with ${boss?.emoji} ${boss?.id} pushed ${weaverAuthor} to the absolute threshold of mortal endurance. With vital health depleted to mere fractions and the arena walls fracturing, it was the alchemical potency of ${itemsUsed} that prevented total collapse.\n\nDodging lethal shockwaves by mere inches, the champion delivered a desperate counter-blow that turned the tide just as consciousness threatened to fade. Though bloodied and exhausted, ${weaverAuthor} lived to tell the tale and claim the contested bounty.`;
    } else if (weaverOutcome === 'heroic') {
      generatedTitle = `The Heroic Defiance of ${boss?.id || weaverBoss}`;
      generatedStory = `Songs will be sung in the Armory forge of the hour ${weaverAuthor} challenged the mighty ${boss?.emoji} ${boss?.id}. Armed with ${itemsUsed}, the champion fought not merely for coin or pride, but to prove that mortal discipline can rival cosmic tyrants.\n\nEvery parry resonated like thunder through the battle chamber. Even in the face of overwhelming odds, the champion refused to yield, demonstrating the transcendent synergy between mastercraft steel and unbreakable will.`;
    } else {
      generatedTitle = `Bitter Steel: The Reckoning of ${boss?.id || weaverBoss}`;
      generatedStory = `Not all encounters in the Boss Rush arena end in triumph. In this grim record, ${weaverAuthor} stood against ${boss?.emoji} ${boss?.id}. Despite the formidable power of ${itemsUsed}, the beast's raw ferocity found a fatal gap in defenses.\n\nYet defeat in the Armory is merely the whetstone of champions. As the revive spark rekindled the champion’s breath, the lessons of this battle were transcribed into the ledger to forge stronger armor and sharper blades for the inevitable rematch.`;
    }

    setWeaverTitle(generatedTitle);
    setWeaverText(generatedStory);
  };

  const handleSaveCustomStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weaverTitle.trim() || !weaverText.trim()) return;

    const newStory: CustomStoryEntry = {
      id: `story-${Date.now()}`,
      title: weaverTitle.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      bossId: weaverBoss,
      featuredItems: [...weaverItems],
      outcome: weaverOutcome,
      storyText: weaverText.trim(),
      author: weaverAuthor.trim() || 'Champion'
    };

    setGameState(prev => {
      const existing = prev.customStories || [];
      const next = {
        ...prev,
        customStories: [newStory, ...existing]
      };
      try {
        localStorage.setItem('bossRushTycoon', JSON.stringify(next));
      } catch (e) {
        console.warn('Local storage write failed:', e);
      }
      return next;
    });

    onSaveSuccess(newStory.title);
    setWeaverTitle('');
    setWeaverText('');
    onBackToLiving();
  };

  return (
    <div className="bg-[#0e1628] border border-[#1a2540] rounded-3xl p-5 sm:p-7">
      <div className="border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">
          <span>✍️ THE CHRONICLER'S QUILL</span>
          <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-xs">Story Studio</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">Weave a Battle Tale</h3>
        <p className="text-xs text-slate-300 mt-1">
          Connect your real armory equipment with your battle record. Auto-draft an evocative chronicle or handwrite custom lore to bind permanently to the Tome.
        </p>
      </div>

      <form onSubmit={handleSaveCustomStory} className="space-y-5">
        {/* 1. Pick Adversary from Boss Records */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            1. Select Target Adversary from Battle Records
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BOSSES.map(boss => (
              <button
                type="button"
                key={boss.id}
                onClick={() => setWeaverBoss(boss.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                  weaverBoss === boss.id
                    ? 'bg-orange-600/20 border-orange-500 text-white'
                    : 'bg-[#141c30] border-[#2a4060]/40 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-xl">{boss.emoji}</span>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{boss.id}</div>
                  <div className="text-[10px] font-mono text-slate-400">{gameState.bossKillStats?.[boss.id] || 0} Kills Recorded</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Choose Key Armaments from Armory */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1">
            2. Choose Key Armaments Used in Combat (Up to 4)
          </label>
          <p className="text-[11px] text-slate-400 mb-2">Click to toggle gear active in this battle chronicle.</p>
          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
            {POWERUPS.map(item => {
              const isSelected = weaverItems.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleWeaverItem(item.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Outcome & Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
              3. Combat Encounter Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['victory', 'close-call', 'heroic', 'defeat'] as const).map(out => (
                <button
                  type="button"
                  key={out}
                  onClick={() => setWeaverOutcome(out)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    weaverOutcome === out
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#141c30] border-[#2a4060]/40 text-slate-400'
                  }`}
                >
                  {out}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
              Chronicler / Champion Name
            </label>
            <input
              type="text"
              value={weaverAuthor}
              onChange={e => setWeaverAuthor(e.target.value)}
              placeholder="Your Name..."
              className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Auto-Draft Button */}
        <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5 gap-3 flex-wrap sm:flex-nowrap">
          <div>
            <span className="text-xs font-bold text-amber-300 block">Need inspiration?</span>
            <span className="text-xs text-slate-400">Auto-draft a narrative chronicle connecting your selected gear to the boss record.</span>
          </div>
          <button
            type="button"
            onClick={handleAutoWeave}
            className="px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shrink-0"
          >
            ✨ Auto-Weave Story Draft
          </button>
        </div>

        {/* Title & Story Textarea */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
            Chronicle Chapter Title
          </label>
          <input
            type="text"
            required
            value={weaverTitle}
            onChange={e => setWeaverTitle(e.target.value)}
            placeholder="e.g. The Shattered Fang of the Void Serpent..."
            className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider font-bold mb-1.5">
            Chronicle Narrative Prose
          </label>
          <textarea
            required
            rows={6}
            value={weaverText}
            onChange={e => setWeaverText(e.target.value)}
            placeholder="Write the lore of how the battle unfolded, detailing how the weapons, shields, and relics countered the adversary's power..."
            className="w-full bg-[#141c30] border border-[#2a4060] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWeaverTitle('');
              setWeaverText('');
            }}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            📖 Bind Story to Lore Book
          </button>
        </div>
      </form>
    </div>
  );
};
