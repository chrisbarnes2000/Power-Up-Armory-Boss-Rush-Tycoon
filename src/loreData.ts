export interface CanonicalChapter {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  era: string;
  featuredBoss: string;
  featuredItems: string[];
  excerpt: string;
  chronicle: string[];
  tacticalLesson: string;
}

export interface ItemLoreEntry {
  id: string;
  title: string;
  itemNumber?: number | string;
  category?: 'Weapons' | 'Defense' | 'Utility' | 'Mystic';
  vendorName: string;
  vendorQuote: string;
  deliverableEcho: string;
  mythos: string;
  inGameEffect: string;
  forgingRecord: string;
  battleSignificance: string;
  bossCounter: {
    targetBoss: string;
    whyItWorks: string;
  };
  tycoonPhilosophy: string;
}

export const VEILED_LEDGER_PREAMBLE = {
  title: "ON THE NATURE OF THE DELIVERABLES",
  subtitle: "The Veiled Ledger of the Bazaar",
  paragraphs: [
    "In the Bazaar, nothing is sold by its true name.",
    "The Supply Chain is not a pipeline of products. It is a river of essence — each Power-Up artifact bleeds a residue that crystallizes, condenses, or ferments into a form the uninitiated can carry. The vendors do not lie. They simply speak in the Old Tongue — a dialect of metaphor, memory, and mercy.",
    "When a vendor says \"Gumdrops,\" they are not hiding candy. They are honoring the Focus Blade's first wielder, who chewed sweet resin before every duel. When they say \"Snow,\" they are not hiding powder. They are remembering the Dragon Scale's origin — a beast that slept in a blizzard and woke in a furnace.",
    "The Deliverables are not covers. They are echoes. Every street name is a prayer to the artifact that birthed it."
  ],
  closingNote: "The Deliverables are not disguises. They are descendants. Every street name is a story — a memory of the artifact that birthed it, a prayer to the power that flows through it. The Bazaar does not lie. It remembers. And the Old Tongue is how it speaks."
};

export interface BossDossier {
  id: string;
  title: string;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Catastrophic' | 'Cosmic';
  lore: string;
  behaviorLore: string;
  tacticalWeakness: string;
  recommendedArsenal: string[];
  historicalRecord: string;
}

export const CANONICAL_CHAPTERS: CanonicalChapter[] = [
  {
    id: 'chapter-1',
    chapterNumber: 'Chapter I',
    title: 'The Concentration of Steel',
    subtitle: 'The Goblin Incursion & The First Shard',
    era: 'The Dawn of the Armory',
    featuredBoss: 'Goblin King',
    featuredItems: ['Focus Blade', 'Speed Dagger'],
    excerpt: 'Before the grand armory rose, the realm was infested by scavengers. A solitary smith condensed their own raw focus into a razor edge.',
    chronicle: [
      'In the earliest cycles of the realm, the frontier was overrun by the feral warbands of the Goblin King. Clad in scrap iron and sustained by foul cunning, the King overwhelmed defenders not through martial prowess, but through deafening chaos and endless minion swarms.',
      'Defenders wielding heavy, clumsy iron were routinely dragged down. It was then that the First Artisan sequestered themselves within the crystal forge. Rejecting brute heft, they tempered a slender blade with alchemical focus — the Focus Blade.',
      'In the first recorded duel at the Crag of Bones, the champion wielded the blade alongside twin Speed Daggers. As the Goblin King screamed his summoning shriek, the champion bypassed the skittering horde with blinding velocity, striking the King’s vulnerable crown before his bodyguards could blink.',
      'Thus the Armory established its foundational decree: precision and velocity outweigh mindless bulk. The Goblin King fell, leaving behind the first golden tribute that seeded our tycoon reserve.'
    ],
    tacticalLesson: 'Use Focus Blade’s precision multiplier (3x crit) and Speed Dagger’s rapid double-strike to terminate the Goblin King before his swarms exhaust your vital health pool.'
  },
  {
    id: 'chapter-2',
    chapterNumber: 'Chapter II',
    title: 'The Siege of Broken Shields',
    subtitle: 'Orcish Bloodlust & The Heavy Foundry',
    era: 'The Age of Iron Walls',
    featuredBoss: 'Orc Warlord',
    featuredItems: ['Shield Breaker', 'Rage Axe', 'Magnetite Shield'],
    excerpt: 'When the Orc Warlord marched with five hundred iron-clad brutes, ordinary shields cracked like eggshells. The armory had to forge weapons that feed on fury.',
    chronicle: [
      'Emboldened by the Goblin King’s demise, the Orc Warlord descended from the jagged peaks, encased in black furnace-plate. His battle cry sent vibrations through the city gates, and every warrior who stood against him found their armor crumpled inward.',
      'At 50% vitality, the Warlord entered his legendary berserk fury, multiplying his concussive strikes tenfold. Traditional combat tactics broke down into slaughter.',
      'The Armory’s smiths answered with two revolutionary armaments: the Shield Breaker — a warhammer head tuned to fracture interlocking plate — and the Rage Axe, which converted incoming kinetic impact into stacking counter-strikes.',
      'In the crucible of the Gate Battle, the Champion absorbed the Warlord’s initial frenzy with the Magnetite Shield, reflecting concussive shockwaves back into the monster’s joints, then delivered a shattering blow with the Shield Breaker, nullifying 40% of his fortified armor in a single swing.',
      'The Warlord’s defeat proved that true defense is an active counter-offensive. From his furnace scraps, the first permanent Tycoon forging furnaces were ignited.'
    ],
    tacticalLesson: 'The Orc Warlord gains lethal frenzy under half HP. Deploy the Shield Breaker to bypass his thick armor, paired with Magnetite Shield to reflect his enraged attacks back onto him.'
  },
  {
    id: 'chapter-3',
    chapterNumber: 'Chapter III',
    title: 'Gloom and Phantom Steps',
    subtitle: 'The Shadow Assassin & The Art of Evasion',
    era: 'The Midnight Vendetta',
    featuredBoss: 'Shadow Assassin',
    featuredItems: ['Cloak of Shadows', 'Wing Charm', 'Phantom Dust'],
    excerpt: 'An enemy you cannot see cannot be struck. To fight the shadow, the champion had to become thinner than smoke.',
    chronicle: [
      'The third menace did not march with drums or horns. The Shadow Assassin appeared only as an absence of light in the council chambers, leaving monarchs and champions bleeding out before their blades could clear their scabbards.',
      'With a passive 30% evasion, the Assassin danced between arrows and steel. Armored warriors were found exhausted, swinging at empty air while poison seeped through the seams of their greaves.',
      'The Armory turned to ethereal alchemy. By weaving celestial feathers into the Wing Charm, champions attained zero-gravity agility. By dissolving spectral dust into the Cloak of Shadows, the wearer could phase outside corporeal physics on the first incoming strike.',
      'When the Assassin struck at midnight in the Silent Cloister, their poisoned stiletto passed harmlessly through the champion’s phased silhouette. The champion retaliated not with clumsy metal, but with Phase-infused Phantom strikes that ignored corporeal dodging entirely.',
      'The assassin collapsed into formless mist, leaving behind the dark ledger that taught our scouts the art of speed-tiering.'
    ],
    tacticalLesson: 'The Shadow Assassin evades 30% of incoming blows. Stack Speed and use the Cloak of Shadows to negate his opening sneak strike, then overwhelm him with ethereal phase damage.'
  },
  {
    id: 'chapter-4',
    chapterNumber: 'Chapter IV',
    title: 'The Celestial Pyre',
    subtitle: 'Wyrmfire and the Molten Scale',
    era: 'The Reign of Dragons',
    featuredBoss: 'Dragon Wyrm',
    featuredItems: ['Dragon Scale', 'Wing Charm', 'Laser Lens'],
    excerpt: 'The sky burned red when the ancient Wyrm awoke. Only those clad in the beast’s own shed scales could breathe amid the inferno.',
    chronicle: [
      'The Dragon Wyrm nested in the brimstone caldera, raining apocalyptic fire across the valley. Its breath weapon did not target a single warrior; it engulfed whole battalions in persistent radiant flame.',
      'To combat an airborne tyrant with an 800 HP core, terrestrial melee was suicide. The Armory dispatch launched an expedition to harvest the shed scales of the slumbering matriarch.',
      'Infused with raw magma veins, the Dragon Scale provided 40% absolute thermal resistance while enhancing breath damage. Mounted with the Laser Lens, the champion could project concentrated beams of coherent photon energy directly into the Wyrm’s throat during its fire-building exhale.',
      'Equipped with Wing Charms to match the Wyrm’s aerial altitude, champions rained laser fire from above the smoke canopy, turning the Wyrm’s breath back down its gullet.',
      'The Wyrm plummeted into the molten sea. Its heart-gem was mounted in the Armory’s central vault, generating our first high-tier passive yield stream.'
    ],
    tacticalLesson: 'The Dragon Wyrm’s AoE fire breath will melt low-defense builds. Equip the Dragon Scale for 40% fire mitigation, and use the Laser Lens to guarantee 100% precision hits against its aerial frame.'
  },
  {
    id: 'chapter-5',
    chapterNumber: 'Chapter V',
    title: 'Winter of the Undying',
    subtitle: 'The Necrotic Grasp & The Phoenix Spark',
    era: 'The Bone Frost Epoch',
    featuredBoss: 'Lich King',
    featuredItems: ['Phoenix Feather', 'Titan Armor', 'Focus Blade'],
    excerpt: 'How do you kill a tyrant who has already conquered death? By dying once yourself, and returning with holy vengeance.',
    chronicle: [
      'From the frozen catacombs rose the Lich King, master of necrotic frost and soul binding. Unlike mortal adversaries, striking down the Lich King was merely an intermission; his phylactery immediately reconstituted his decayed flesh at full combat vigor.',
      'Countless heroic attempts ended in despair when victorious champions, bleeding and gasping for breath, were executed by the resurrected Lich.',
      'The Armory’s highest alchemists traveled to the ash peaks of the eternal bird. There they gathered the Phoenix Feather — an artifact containing the fundamental code of rebirth.',
      'In the final vault, clad in impenetrable Titan Armor forged from ancient giant bone, the champion withstood the Lich’s necrotic waves. When the Lich fell and resurrected, striking a death blow, the Phoenix Feather ignited, restoring the champion to 50% health with cleansed blood.',
      'With the Lich’s phylactery unshielded, the champion cleaved the bone-crown with a maximum-stack Focus Blade. The undead reign ended forever.'
    ],
    tacticalLesson: 'The Lich King will resurrect once at full potency. Save your high-potency cooldowns, utilize Titan Armor to absorb necrotic decay, and rely on the Phoenix Feather to outlast his second life.'
  },
  {
    id: 'chapter-6',
    chapterNumber: 'Chapter VI',
    title: 'The Primordial Rift',
    subtitle: 'Poison of the Abyss & True Armor',
    era: 'The Abyssal Rupture',
    featuredBoss: 'Void Serpent',
    featuredItems: ['Void Orb', 'Titan Armor', 'Shield Breaker'],
    excerpt: 'Slithering through the cracks between realities, the Void Serpent venom does not corrode flesh — it corrodes existence itself.',
    chronicle: [
      'When the subterranean portals opened, the Void Serpent emerged. Spanning miles in coiled abyssal flesh, its venom dealt continuous damage over time that bypassed conventional armor ratings.',
      'Warriors with thousands of defense points melted into black ichor as the poison accumulated. Furthermore, the Serpent’s scales were composed of collapsed matter that absorbed 50% of incoming physical force.',
      'The Armory realized only matter from the void itself could neutralize the serpent. They harnessed the Void Orb — a condensed singularity that discharges 100% true damage, completely ignoring natural and unnatural resistances.',
      'Anchored by Titan Armor to sustain the prolonged battle, champions hurled void pulses directly into the serpent’s open maw. The true damage ripped through its interdimensional anatomy, causing its physical coils to collapse into pure spatial dust.',
      'The extraction of the serpent’s core unlocked our highest tier of Mystic alchemy.'
    ],
    tacticalLesson: 'The Void Serpent’s DoT poison and armor will wear you down in prolonged engagements. Use the Void Orb’s 100% True Damage to bypass its resistances before its venom ticks consume your life.'
  },
  {
    id: 'chapter-7',
    chapterNumber: 'Chapter VII',
    title: 'The Supernova Convergence',
    subtitle: 'The Devourer of Constellations',
    era: 'The Final Twilight',
    featuredBoss: 'Star Eater',
    featuredItems: ['Star Fragment', 'Void Orb', 'Phoenix Feather'],
    excerpt: 'The skies blackened as constellations vanished one by one. The final adversary does not merely fight; it consumes reality.',
    chronicle: [
      'At the apex of the Boss Rush saga stands the Star Eater — an ancient cosmic entity that feeds upon dying stellar cores. Possessing 5,000 baseline HP and wielding a terrifying 30% instant-kill obliteration beam, no conventional strategy can hope to survive.',
      'To challenge a star god requires nothing less than stellar matter. The Armory assembled the Ultimate Trinity: the Phoenix Feather to cheat unavoidable cosmic obliteration, the Void Orb to disintegrate the deity’s spatial barrier, and the Star Fragment.',
      'The Star Fragment, glowing with the dying fury of a collapsed red supergiant, unlocked a +500% critical damage multiplier and a 10% chance to instantly obliterate the target.',
      'When the Star Eater raised its gravitational vortex, the champion’s Star Fragment flared. In a flash of blinding celestial light brighter than a thousand suns, a critical supernova struck the cosmic core, shattering the titan into shimmering stardust.',
      'From its dust, the eternal Tycoon cycle achieved infinite equilibrium. The Champion’s name was etched into the Hall of Constellations forever.'
    ],
    tacticalLesson: 'The Star Eater has 5000+ HP and a 30% instant-kill chance. You MUST have the Phoenix Feather equipped to absorb instant obliteration, and pair the Star Fragment with maximum attack loadouts to trigger lethal supernovas.'
  }
];

export const ITEM_LORES: ItemLoreEntry[] = [
  {
    id: 'Focus Blade',
    itemNumber: 1,
    category: 'Weapons',
    vendorName: '"Gumdrops" / "Focus Chews" / "The Sweet Edge"',
    title: 'Focus Blade · The Monofilament Edge',
    mythos: 'The Focus Blade does not cut flesh. It cuts noise. When the first smith quenched this blade in crystalline dew, the residue that dripped from its edge hardened into small, jewel-like drops — sweet to the tongue, sharp to the mind. The Bazaar called them Gumdrops, and the name stuck.',
    vendorQuote: 'One chew and the world goes quiet. Two and you can hear your own heartbeat. Three and you can hear the heartbeat of your enemy.',
    deliverableEcho: 'The Gumdrops are not candy. They are concentrated clarity — the Focus Blade\'s edge, made edible.',
    inGameEffect: '+Focus, slows time perception, increases accuracy.',
    forgingRecord: 'Quenched in cryogenic dew collected from the highest peaks of Mount Arcanum. Requires 40 hours of uninterrupted meditation by the smith.',
    battleSignificance: 'Provides +15 ATK and +5 SPD. Precision Strike deals 3x damage with a 20% critical chance, slicing through enemy defenses.',
    bossCounter: {
      targetBoss: 'Goblin King & Orc Warlord',
      whyItWorks: 'The 3x critical strike pierces through early minion shields and ends burst phases before bosses can trigger enrage states.'
    },
    tycoonPhilosophy: 'Generates 0.5 Gold/s base rate. Represents the foundational investment in disciplined, reliable commerce.'
  },
  {
    id: 'Rage Axe',
    itemNumber: 5,
    category: 'Weapons',
    vendorName: '"Sap" / "The Golden Bleed" / "Fury Resin"',
    title: 'Rage Axe · The Berserker’s Kiln',
    mythos: 'The Rage Axe was not forged. It was bled. When the first berserker fell in battle, their axe sank into the earth and wept a golden resin — thick, warm, and humming with stored fury. The Bazaar harvested it. They called it Sap, because it drips from the weapon like lifeblood from a wound.',
    vendorQuote: 'One drop and you feel the axe in your hands. Two and you feel the berserker\'s heartbeat. Three and you are the berserker.',
    deliverableEcho: 'The Sap is not a concentrate. It is the memory of rage, preserved in amber.',
    inGameEffect: '+Strength, +Attack Speed, temporary berserk state.',
    forgingRecord: 'Crafted from meteoric iron bound with charred leather from elder drakes. It warms to the touch the closer danger approaches.',
    battleSignificance: 'Grants +12 ATK and builds Berserk stacks (+5 ATK per hit, up to 10 stacks). In drawn-out confrontations, damage scales tremendously.',
    bossCounter: {
      targetBoss: 'Orc Warlord & Elder Titan',
      whyItWorks: 'As the battle grinds through high-HP thresholds, the stacking Berserk buff ensures your damage outpaces boss health pools.'
    },
    tycoonPhilosophy: 'Generates 0.8 Gold/s base. A high-yield asset that scales aggressively as your armory expands.'
  },
  {
    id: 'Speed Dagger',
    itemNumber: 2,
    category: 'Weapons',
    vendorName: '"Cartridges" / "Feathersticks" / "The Quick"',
    title: 'Speed Dagger · The Flashfang',
    mythos: 'The Speed Dagger was carved from a shard of lightning caught in amber. When the amber cracked, the lightning didn\'t escape — it seeped. It pooled into slender glass vials that the Bazaar called Cartridges, because they loaded into the hand like ammunition into a chamber.',
    vendorQuote: 'One draw and you move before you think. Two and you think before you move. Three and you are the movement.',
    deliverableEcho: 'The Cartridges are not pens. They are bottled velocity — the Speed Dagger\'s edge, distilled into vapor.',
    inGameEffect: '+Movement Speed, +Evasion, brief intangibility.',
    forgingRecord: 'Balanced with mercury cores inside the hilt to eliminate inertia. Swings produce a sharp sonic crack.',
    battleSignificance: 'Gives +8 ATK and an unprecedented +20 SPD. Grants Flurry (2 strikes per turn) to double your trigger opportunities.',
    bossCounter: {
      targetBoss: 'Shadow Assassin',
      whyItWorks: 'By striking twice per round, it breaks through high-evasion stances and forces the assassin onto the defensive.'
    },
    tycoonPhilosophy: 'Generates 1.0 Gold/s base. Rapid turnover investment that pays back its acquisition cost in record time.'
  },
  {
    id: 'Shield Breaker',
    itemNumber: 3,
    category: 'Weapons',
    vendorName: '"Burners" / "One-Shots" / "The Last Word"',
    title: 'Shield Breaker · The Granite Maul',
    mythos: 'The Shield Breaker was forged in the Third Unification War to demolish castle gates. When the war ended, the hammer was melted down — but its essence refused to die. It condensed into small, dense vials that the Bazaar called Burners, because they burn hot, burn fast, and burn out.',
    vendorQuote: 'You don\'t save a Burner. You use it when the wall needs to come down. One hit and the shield shatters. Two and the wall follows. Three and you\'re standing in the rubble, wondering what held you back.',
    deliverableEcho: 'The Burners are not disposables. They are concentrated inevitability — the Shield Breaker\'s promise, sealed in glass.',
    inGameEffect: 'Breaks enemy shields, reduces defense, high impact damage.',
    forgingRecord: 'Cast from dense depleted lead-bronze with internal hydraulic shock dampeners that direct 100% of momentum outward.',
    battleSignificance: '+25 ATK with -10 DEF trade-off. Shatter permanently ignores 40% of enemy armor, neutralizing tank bosses.',
    bossCounter: {
      targetBoss: 'Elder Titan & Orc Warlord',
      whyItWorks: 'The Elder Titan relies on 50% damage reduction armor. The Shield Breaker completely shreds through this protection.'
    },
    tycoonPhilosophy: '1.5 Gold/s base rate. A high-impact asset designed for aggressive, high-risk high-reward tycoons.'
  },
  {
    id: 'Wing Charm',
    itemNumber: 15,
    category: 'Weapons',
    vendorName: '"Fluff" / "Cloud" / "The Lift"',
    title: 'Wing Charm · The Seraph’s Grace',
    mythos: 'The Wing Charm was plucked from a seraph who fell in love with the mortal world. When the seraph finally ascended, they left behind a single feather — and from that feather, a soft, airy resin began to form. The Bazaar called it Fluff, because it floats. They called it Cloud, because it lifts. They called it The Lift, because one hit and you\'re above it all.',
    vendorQuote: 'One breath and your feet leave the ground. Two and your worries follow. Three and you can see the whole Bazaar from above — and you realize how small it all is.',
    deliverableEcho: 'The Fluff is not a dab. It is weightlessness, captured in amber.',
    inGameEffect: 'Levitation, +Awareness, escape from ground-based attacks.',
    forgingRecord: 'Blessed under the twin moons by seven cloistered monks. Never touches the ground from creation to packaging.',
    battleSignificance: '+5 ATK, +5 DEF, +15 SPD. Grants a 30% passive evasion rate, allowing champions to slip through lethal boss sweeps.',
    bossCounter: {
      targetBoss: 'Dragon Wyrm & Goblin King',
      whyItWorks: 'Evades sweeping tail strikes and breath attacks that would otherwise decimate stationary melee fighters.'
    },
    tycoonPhilosophy: '2.0 Gold/s base. A stable, frictionless revenue engine that consistently accumulates profit.'
  },
  {
    id: '???.???',
    itemNumber: 4,
    category: 'Weapons',
    vendorName: '"Flickers" / "The Other Side" / "Void Cartridges"',
    title: '???.??? · The Unrevealed Matrix',
    mythos: 'When the Void Cartridges arrive, vendors will not sell them. They will offer them — to those who ask the right question, at the right hour, in the right tone of voice. They will call them Flickers, because you don\'t smoke them. You flicker in and out of existence. They will call them The Other Side, because that\'s where they take you.',
    vendorQuote: 'One flicker and you see the Bazaar for what it is. Two and you see yourself for what you are. Three and you don\'t come back — not the same way, at least.',
    deliverableEcho: 'The Flickers are not pens. They are doorways, disguised as glass.',
    inGameEffect: '??? (Unlocks after Boss Rush Mode completion)',
    forgingRecord: 'The blade has no name. It has no form. It exists only in the space between thoughts.',
    battleSignificance: 'Stats currently locked in quantum superposition. Theoretical models predict realm-bending alterations to combat laws.',
    bossCounter: {
      targetBoss: 'Unknown Horrors',
      whyItWorks: 'Designed for adversaries that have not yet manifested in our dimensional plane.'
    },
    tycoonPhilosophy: '0.0 Gold/s base. An unpriced speculative reserve held in the deepest vaults.'
  },
  {
    id: 'Mystery Artifact',
    itemNumber: 16,
    category: 'Weapons',
    vendorName: '"The Green" / "Leaf" / "The Oldest"',
    title: 'Mystery Artifact · The Oldest Root',
    mythos: 'Before the Armory, before the Bazaar, before the Supply Chain — there was The Green. It grew in the cracks of the world, and the first vendors did not sell it. They shared it. They called it Leaf, because it was simple. They called it The Oldest, because it was there before the first smith struck the first blade.',
    vendorQuote: 'The Green doesn\'t need a name. It doesn\'t need a price. It needs respect. Ask the right vendor. Pay the right price. The Green will find you — or you will find it. Either way, you\'ll know.',
    deliverableEcho: 'The Green is not a product. It is the source — the root of the Supply Chain, older than memory.',
    inGameEffect: 'Variable. Depends on strain. Depends on you.',
    forgingRecord: 'The oldest weapon. The first weapon. Grown, not forged.',
    battleSignificance: 'Transcends standard weapon metrics. Harmonizes with the natural order to impart unconditional vitality.',
    bossCounter: {
      targetBoss: 'The Final Unknown',
      whyItWorks: 'Grounded in primordial soil, it withstands reality-distortion and grounds turbulent energy.'
    },
    tycoonPhilosophy: 'Priceless primordial baseline. The living root of the entire economic system.'
  },
  {
    id: 'Magnetite Shield',
    itemNumber: 6,
    category: 'Defense',
    vendorName: '"Buttons" / "Pebbles" / "The Pull"',
    title: 'Magnetite Shield · The Kinetic Wall',
    mythos: 'The Magnetite Shield was forged from polar lodestone mined from geomagnetic rifts. When the shield was struck, it didn\'t break — it shed. Tiny, round pellets of magnetic ore flaked off and rolled across the ground. The Bazaar gathered them. They called them Buttons, because they were small and round and unassuming. They called them Pebbles, because they were everywhere. They called them The Pull, because once you took one, you couldn\'t stop.',
    vendorQuote: 'One Button and the danger comes to you. Two and the harm bounces off. Three and you realize you\'ve been standing in the storm the whole time — and you\'re still dry.',
    deliverableEcho: 'The Buttons are not pills. They are magnetic mercy — the Shield\'s protection, compressed into stone.',
    inGameEffect: '+Defense, absorbs first hit, calming effect.',
    forgingRecord: 'Layered with alternating sheets of cold-rolled steel and polar magnetic ceramics. Sparks violently upon impact.',
    battleSignificance: '+30 DEF. Reflect turns 25% of all received melee and projectile damage directly back upon the attacker.',
    bossCounter: {
      targetBoss: 'Orc Warlord & Goblin King',
      whyItWorks: 'High-attack, high-frequency bosses rapidly inflict self-damage as their ferocious blows bounce straight back into them.'
    },
    tycoonPhilosophy: '1.2 Gold/s base. The ultimate safe-haven asset, guaranteeing consistent gold reserves even in volatile market shifts.'
  },
  {
    id: 'Cloak of Shadows',
    itemNumber: 7,
    category: 'Defense',
    vendorName: '"Bars" / "Midnight" / "The Quiet"',
    title: 'Cloak of Shadows · The Umbral Shroud',
    mythos: 'The Cloak of Shadows was spun from the silk of midnight weavers. When the cloak was folded, it left behind a dark, rich residue — smooth to the touch, warm to the tongue. The Bazaar molded it into Bars, because they were square and simple. They called them Midnight, because one bite and the sun went down. They called them The Quiet, because the world stopped shouting.',
    vendorQuote: 'One bar and the shadows welcome you. Two and your enemies forget your face. Three and you forget why you were fighting in the first place.',
    deliverableEcho: 'The Bars are not chocolate. They are the embrace of night — the Cloak\'s silence, made edible.',
    inGameEffect: 'Invisibility, +Stealth, enemies lose aggro.',
    forgingRecord: 'Dyed in distilled twilight extract and stitched with dark matter filaments in total darkness.',
    battleSignificance: '+10 ATK, +10 DEF, +10 SPD. The Shadow Step trait grants guaranteed 50% dodge against opening strikes.',
    bossCounter: {
      targetBoss: 'Shadow Assassin & Lich King',
      whyItWorks: 'Negates lethal opening burst damage, allowing you to establish momentum before the enemy can establish dominance.'
    },
    tycoonPhilosophy: '1.8 Gold/s base. An elusive, high-efficiency revenue stream operating quietly in the background.'
  },
  {
    id: 'Titan Armor',
    itemNumber: 10,
    category: 'Defense',
    vendorName: '"Caps & Stems" / "The Bulk" / "Fortress"',
    title: 'Titan Armor · The Colossus Carapace',
    mythos: 'The Titan Armor was assembled from the petrified bones of the Mountain Titans. When the armor was worn, it didn\'t just protect — it grew. Small, sturdy fungi sprouted from the cracks in the bone, feeding on the titan\'s residual strength. The Bazaar harvested them. They called them Caps & Stems, because they were raw and unprocessed. They called them The Bulk, because they were heavy. They called them Fortress, because one dose and you became a wall.',
    vendorQuote: 'One cap and the world can\'t hurt you. Two and the world can\'t move you. Three and the world can\'t find you — because you\'ve become the mountain.',
    deliverableEcho: 'The Caps & Stems are not mushrooms. They are the titan\'s bones — the Armor\'s endurance, grown from decay.',
    inGameEffect: 'Massive +HP, damage reduction, unstoppable.',
    forgingRecord: 'Heated in geothermal vents for seven cycles, then hammered with diamond mallets into interlocking rib-plates.',
    battleSignificance: '+50 massive DEF with a slight -10 SPD penalty. Bulwark halves incoming damage and expands hero HP.',
    bossCounter: {
      targetBoss: 'Elder Titan & Void Serpent',
      whyItWorks: 'Provides the raw survivability required to outlast extended combat phases and survive deep damage-over-time poisons.'
    },
    tycoonPhilosophy: '3.0 Gold/s base. A heavyweight capital reserve that stabilizes your entire empire’s balance sheet.'
  },
  {
    id: 'Laser Lens',
    itemNumber: 9,
    category: 'Utility',
    vendorName: '"Tabs" / "Blotters" / "Paper"',
    title: 'Laser Lens · The Prism of Apollo',
    mythos: 'The Laser Lens was grown in a zero-gravity alchemical vacuum — a flawless diamond prism that focused ambient magic into a single, coherent beam. When the Lens was used, it left behind a residue on the glass — tiny, square, and bright. The Bazaar peeled them off and called them Tabs, because they were small and flat. They called them Blotters, because they soaked up the light. They called them Paper, because one tab and the world became a single, focused sentence.',
    vendorQuote: 'One tab and you see the truth. Two and you see the lies. Three and you realize there\'s no difference — only light and shadow.',
    deliverableEcho: 'The Tabs are not paper. They are concentrated clarity — the Lens\'s focus, pressed into squares.',
    inGameEffect: 'Reveals hidden paths, melts enemy armor, +Perception.',
    forgingRecord: 'Grown in a zero-gravity alchemical vacuum chamber using synthetic diamond vapor deposition.',
    battleSignificance: '+20 ATK and +5 SPD. Its Focus Beam mechanic guarantees 100% attack accuracy, rendering enemy evasion entirely useless.',
    bossCounter: {
      targetBoss: 'Shadow Assassin',
      whyItWorks: 'The Shadow Assassin’s 30% dodge rate is completely bypassed by the 100% accuracy of the Focus Beam.'
    },
    tycoonPhilosophy: '2.5 Gold/s base. A precision-engineered economic engine delivering zero wasted operational overhead.'
  },
  {
    id: 'Phantom Dust',
    itemNumber: 8,
    category: 'Utility',
    vendorName: '"Points" / "Pts" / "The Pinch"',
    title: 'Phantom Dust · Spectral Flakes',
    mythos: 'The Phantom Dust was gathered from the footsteps of a ghost who didn\'t know they were dead. When the dust settled, it didn\'t fall — it waited. It hung in the air, vibrating slightly out of phase with reality. The Bazaar measured it in Points, because it was precise. They called it Pts, because it was small. They called it The Pinch, because one point and you phased through the wall.',
    vendorQuote: 'One point and you feel the world breathe. Two and you feel your own breath leave you. Three and you realize you\'ve been a ghost all along — and the wall was never there.',
    deliverableEcho: 'The Points are not dust. They are the space between spaces — the Phantom\'s footsteps, measured in moments.',
    inGameEffect: '+Charisma, enemy debuff transfer, shared damage.',
    forgingRecord: 'Ground in agate mortars and preserved in pressurized vacuum vials to prevent it from phasing through the table.',
    battleSignificance: '+15 ATK, +5 DEF, +15 SPD. Imbues attacks with 20% Ethereal Damage, piercing through physical armor plates.',
    bossCounter: {
      targetBoss: 'Elder Titan & Void Serpent',
      whyItWorks: 'Ethereal damage ignores physical damage reduction thresholds, melting through stony and void armor.'
    },
    tycoonPhilosophy: '3.5 Gold/s base. High-margin esoteric asset commanding premium passive returns.'
  },
  {
    id: 'Dragon Scale',
    itemNumber: 11,
    category: 'Utility',
    vendorName: '"Snow" / "The White" / "Flake"',
    title: 'Dragon Scale · The Ignis Plate',
    mythos: 'The Dragon Scale was harvested from the chest crest of the Fire Wyrm Igniculus. When the scale was removed, it didn\'t cool — it shattered. It broke into a fine, white powder that the Bazaar called Snow, because it was cold to the touch. They called it The White, because it was pure. They called it Flake, because one line and you felt the dragon\'s heart beating in your chest.',
    vendorQuote: 'One line and you breathe fire. Two and you breathe ice. Three and you realize you\'ve been the dragon all along — and the fire was never yours to control.',
    deliverableEcho: 'The Snow is not a powder. It is elemental fury — the Scale\'s heart, ground into dust.',
    inGameEffect: '+Speed, +Stamina, no cooldowns, crash debuff after.',
    forgingRecord: 'Polished with volcanic pumice and reinforced with gold filigree to channel elemental fire conduits.',
    battleSignificance: '+18 ATK and +15 DEF. Unlocks Fire Breath for a 30% flat bonus damage burst and 40% thermal resistance.',
    bossCounter: {
      targetBoss: 'Dragon Wyrm',
      whyItWorks: 'Directly counters the Dragon Wyrm’s AoE fire breath while matching the beast’s raw flame output.'
    },
    tycoonPhilosophy: '5.0 Gold/s base. A legendary tier economic anchor that dramatically accelerates gold acquisition.'
  },
  {
    id: 'Phoenix Feather',
    itemNumber: 12,
    category: 'Mystic',
    vendorName: '"R" / "The Reset" / "Ash"',
    title: 'Phoenix Feather · The Undying Spark',
    mythos: 'The Phoenix Feather was shed during the Eternal Solar Bird\'s rebirth. When the feather cooled, it left behind a white, shimmering residue — fine as ash, bright as dawn. The Bazaar refined it into R, because it was the first letter of the Old Tongue word for "return." They called it The Reset, because one line and you were back. They called it Ash, because it was born from fire.',
    vendorQuote: 'One line and you remember who you were. Two and you remember why you fell. Three and you get back up — not because you have to, but because you can.',
    deliverableEcho: 'The R is not a powder. It is resurrection — the Feather\'s promise, ground into dust.',
    inGameEffect: 'Revive once per battle, +Spiritual Damage, reality distortion.',
    forgingRecord: 'Enclosed in runic glass suspended within a golden gyroscope to keep its flame tethered to this realm.',
    battleSignificance: '+10 ATK, +10 DEF, +5 SPD. Grants Revive: resurrects the champion once per battle at 50% health.',
    bossCounter: {
      targetBoss: 'Lich King & Star Eater',
      whyItWorks: 'The only reliable defense against the Star Eater’s 30% instant-kill obliteration and the Lich King’s double-life phase.'
    },
    tycoonPhilosophy: '8.0 Gold/s base. A mythic asset that guarantees long-term portfolio resilience and colossal passive yields.'
  },
  {
    id: 'Void Orb',
    itemNumber: 13,
    category: 'Mystic',
    vendorName: '"S" / "The Silence" / "Nothing"',
    title: 'Void Orb · The Pocket Singularity',
    mythos: 'The Void Orb was found at the edge of the Bazaar, where the Supply Chain ends and nothing begins. When the Orb was touched, it didn\'t burn — it listened. It absorbed every sound, every thought, every memory. The Bazaar refined what was left into S, because it was the first letter of the Old Tongue word for "still." They called it The Silence, because one hit and the world went quiet. They called it Nothing, because that\'s what it was.',
    vendorQuote: 'One hit and your enemies forget your name. Two and they forget their own. Three and you realize you\'ve been fighting yourself the whole time.',
    deliverableEcho: 'The S is not a crystal. It is erasure — the Orb\'s hunger, crystallized into calm.',
    inGameEffect: 'Complete aggro reset, memory wipe, silence.',
    forgingRecord: 'Suspended within eight electromagnetic containment needles powered by condensed star matter.',
    battleSignificance: '+30 massive ATK with -20 DEF vulnerability. Oblivion deals 100% True Damage that ignores all enemy resistances.',
    bossCounter: {
      targetBoss: 'Elder Titan & Void Serpent',
      whyItWorks: 'Completely ignores the Elder Titan’s 50% damage reduction and the Void Serpent’s abyssal scales.'
    },
    tycoonPhilosophy: '12.0 Gold/s base. High-risk, astronomical-yield asset for champions dominating the end-game economy.'
  },
  {
    id: 'Star Fragment',
    itemNumber: 14,
    category: 'Mystic',
    vendorName: '"SandS" / "Stardust" / "The Glitter"',
    title: 'Star Fragment · The Supernova Shard',
    mythos: 'The Star Fragment was the first item ever sold in the Bazaar — the original seed of the Supply Chain. When the star died, it didn\'t go dark. It scattered. It left behind a glittering, cosmic dust that the Bazaar called SandS, because it was everywhere and nowhere at once. They called it Stardust, because it shimmered. They called it The Glitter, because one hit and you saw everything.',
    vendorQuote: 'One hit and you see the past. Two and you see the future. Three and you realize they\'re the same thing — and you\'ve been standing at the center of it all along.',
    deliverableEcho: 'The SandS is not a powder. It is omniscience — the Fragment\'s light, scattered across eternity.',
    inGameEffect: 'Reveals all enemies, +True Sight, critical hit immunity.',
    forgingRecord: 'Shaped by stellar magnetic fields at the edge of an event horizon. Emits faint gravitational pulses.',
    battleSignificance: '+25 ATK and +10 SPD. Unlocks Supernova: +500% critical damage and a 10% chance to instantly obliterate the target.',
    bossCounter: {
      targetBoss: 'Star Eater',
      whyItWorks: 'The only weapon possessing sufficient cosmic density to trigger an instant-kill collapse on the 5000 HP Star Eater.'
    },
    tycoonPhilosophy: '15.0 Gold/s base. The undisputed crown jewel of the tycoon empire, delivering unparalleled gold generation.'
  }
];

export const BOSS_DOSSIERS: BossDossier[] = [
  {
    id: 'Goblin King',
    title: 'The Scrap Iron Despot',
    threatLevel: 'Low',
    lore: 'Ruler of the lower subterranean warrens. Surrounds himself with screeching minions who throw themselves into weapon swings.',
    behaviorLore: 'Attacks in rapid flurries and relies on sheer numbers to wear down solitary adventurers before looting their armor.',
    tacticalWeakness: 'Susceptible to precision burst damage. Eliminating him quickly scatters his minions into disarray.',
    recommendedArsenal: ['Focus Blade', 'Speed Dagger'],
    historicalRecord: 'Over 12,000 recorded skirmishes on the outer rim. Primary source of early gold seeds.'
  },
  {
    id: 'Orc Warlord',
    title: 'The Ironbreaker of Grom’s Ridge',
    threatLevel: 'Moderate',
    lore: 'A towering battle-veteran clad in thick furnace iron. He lives only for concussive melee impact.',
    behaviorLore: 'Upon dropping below 50% health, enters a berserk frenzy that dramatically increases strike cadence and shockwave intensity.',
    tacticalWeakness: 'Heavy armor is brittle against anti-armor weaponry. His reckless swings leave him vulnerable to reflected kinetic damage.',
    recommendedArsenal: ['Shield Breaker', 'Magnetite Shield', 'Rage Axe'],
    historicalRecord: 'Sacked three frontier outposts before the Armory’s Shield Breaker weapons turned the tide.'
  },
  {
    id: 'Shadow Assassin',
    title: 'The Silent Eclipse',
    threatLevel: 'Moderate',
    lore: 'A phantom killer trained in the subterranean monasteries of the Umbral Spire. Leaves no footprints or shadows.',
    behaviorLore: 'Dances between corporeal states, dodging roughly a third of all incoming attacks while aiming for lethal vital points.',
    tacticalWeakness: 'Coherent energy weapons and wide-angle photon beams bypass dimensional slipping entirely.',
    recommendedArsenal: ['Laser Lens', 'Wing Charm', 'Cloak of Shadows'],
    historicalRecord: 'Responsible for the downfall of the Old Council before being trapped in an illuminated prism chamber.'
  },
  {
    id: 'Dragon Wyrm',
    title: 'The Brimstone Scourge',
    threatLevel: 'High',
    lore: 'An ancient serpentine dragon that nests in the volcanic calderas. Its scales are hardened magma crusts.',
    behaviorLore: 'Takes flight to bathe the arena in continuous area-of-effect firestorms, melting physical armor and boiling blood.',
    tacticalWeakness: 'Vulnerable to its own thermal element if harvested scales are wielded against it. Airborne strikes expose its throat.',
    recommendedArsenal: ['Dragon Scale', 'Wing Charm', 'Laser Lens'],
    historicalRecord: 'Its hoard of ancient gold coins financed the construction of the Armory’s central tycoon core.'
  },
  {
    id: 'Lich King',
    title: 'The Frost Monarch of the Crypt',
    threatLevel: 'High',
    lore: 'A fallen necromancer king who achieved eternal undeath through dark soul bindings. Surrounds himself with bone frost.',
    behaviorLore: 'Upon physical death, his phylactery instantaneously triggers, resurrecting his skeletal form at full combat potency.',
    tacticalWeakness: 'Phylactery resonance can be exhausted. Champions who survive his second phase can permanently shatter his crown.',
    recommendedArsenal: ['Phoenix Feather', 'Titan Armor', 'Focus Blade'],
    historicalRecord: 'Plunged the northern territories into a century of bone-winter before champions wielding the Phoenix Feather ended the curse.'
  },
  {
    id: 'Elder Titan',
    title: 'The Primordial Monolith',
    threatLevel: 'Severe',
    lore: 'A sentient walking mountain of living bedrock and dense iron ore. Shakes the earth with every lumbering step.',
    behaviorLore: 'Inherent 50% damage reduction armor reduces standard steel weapons to blunt splinters.',
    tacticalWeakness: 'Ignores physical defense, but completely defenseless against True Damage singularities and ethereal phase weaponry.',
    recommendedArsenal: ['Void Orb', 'Shield Breaker', 'Phantom Dust'],
    historicalRecord: 'Constructed by ancient gods to guard the lower mantle. Defeated champions become compacted sediment.'
  },
  {
    id: 'Void Serpent',
    title: 'The Abyssal Devourer',
    threatLevel: 'Severe',
    lore: 'An interdimensional horror that swims through the cosmic rift. Its body is composed of shifting null-matter.',
    behaviorLore: 'Injects persistent abyssal venom that inflicts stacking damage over time, bypassing normal armor ratings.',
    tacticalWeakness: 'Vulnerable to concentrated true damage and burst strikes that sever its dimensional anchors before poison stacks fatal amounts.',
    recommendedArsenal: ['Void Orb', 'Titan Armor', 'Speed Dagger'],
    historicalRecord: 'Breached the realm boundary during the Great Collapse. Banished back into the void with condensed singularities.'
  },
  {
    id: 'Star Eater',
    title: 'The Cosmic Singularity',
    threatLevel: 'Cosmic',
    lore: 'An astral leviathan that wanders dying galaxies, consuming the light of spent suns. Reality warps in its presence.',
    behaviorLore: 'Boasts 5,000+ base health and periodically releases an Obliteration Pulse with a 30% chance to immediately execute the challenger.',
    tacticalWeakness: 'Must be countered with the Phoenix Feather to absorb the obliteration blast, then overwhelmed with Supernova critical strikes.',
    recommendedArsenal: ['Star Fragment', 'Phoenix Feather', 'Void Orb'],
    historicalRecord: 'The ultimate boss of the arena. Defeating the Star Eater yields immense prismatic gem reserves.'
  }
];

export const SYSTEM_LEGEND = {
  currencies: [
    {
      name: 'Gold Coins (🪙)',
      role: 'Tycoon & Maintenance Currency',
      sources: 'Generated continuously by owned powerups in the tycoon system, and awarded as bounties for slaying Bosses.',
      uses: 'Used to upgrade powerup levels (increasing their base multiplier), purchase Pre-Fight combat enhancements (HP Shields & Combat Tonics), and pay for instant Battle Revives in combat.'
    },
    {
      name: 'Prismatic Gems (💎)',
      role: 'Premium Armory Currency',
      sources: 'Harvested exclusively by conquering high-tier Bosses in the Boss Rush Arena.',
      uses: 'Used to unlock new powerup licenses directly in the game view, and to purchase additional duplicate copies to stack multiplier volume.'
    },
    {
      name: 'Power Score (PS)',
      role: 'Combat Readiness & Gateway Metric',
      sources: 'Calculated dynamically: Sum of all owned item ATK + DEF + SPD, plus 10 PS per item Level, 5 PS per item Quantity, and 25 PS per total Bosses defeated.',
      uses: 'Acts as the strict gateway requirement to challenge higher-tier Bosses. Higher bosses demand disciplined armory development.'
    }
  ],
  tycoonFormulas: [
    {
      label: 'Passive Gold Yield Formula',
      formula: 'Rate = Σ [ BaseRate × Quantity × (1 + (Level - 1) × 0.5) ] Gold/sec',
      explanation: 'Every item generates Gold continuously. Adding duplicate copies increases the base multiplier linearly, while leveling up an item adds a +50% compound multiplier per level.'
    },
    {
      label: 'Effective Combat Stats',
      formula: 'Total Attack = [ Σ (Item ATK × Quantity) ] × (1 + Tonic Bonus%)',
      explanation: 'Combat damage is multiplied by your purchased Combat Tonics. Stacking multiple copies of a weapon dramatically boosts your per-turn strike force.'
    },
    {
      label: 'Hero Health Pool',
      formula: 'Total Max HP = 100 Base HP + Total Defense + Shield Boosts',
      explanation: 'Every point of defense across your armory directly expands your active health bar in boss encounters, allowing you to endure ferocious boss strikes.'
    }
  ],
  packNomenclature: [
    {
      term: 'Single / Shard',
      volume: '1 Unit',
      lore: 'The fundamental crystallization of an alchemical blueprint. Sufficient to activate the item license in your armory.'
    },
    {
      term: '10-Pack / 30-Pack',
      volume: '10 to 30 Units',
      lore: 'Wholesale crate distribution intended for rapid tycoon scaling. Multiplies passive yield ten-fold.'
    },
    {
      term: 'Gram Fractions (0.5g, 1g, 3.5g, 7g, 14g)',
      volume: 'Alchemical Essence Weighs',
      lore: 'High-purity mystical reagents (Phoenix Feathers, Dragon Scales, Void Orbs) are weighed in concentrated alchemical grams. Denser weights reflect exponentially deeper alchemical saturation.'
    },
    {
      term: 'Tabs (1-Tab, 10-Tabs)',
      volume: 'Sublingual Infusion Wafers',
      lore: 'Used exclusively for optical and cognitive enhancers like the Laser Lens. Rapidly absorbed into the champion’s ocular nervous system.'
    },
    {
      term: 'Ziplock / Vacuum Vault',
      volume: 'Bulk Vacuum Stash (Bulk Quantity)',
      lore: 'Heavyweight reinforced containers for bulk armory storage. Seals in astral volatility and preserves maximum potency.'
    }
  ]
};
