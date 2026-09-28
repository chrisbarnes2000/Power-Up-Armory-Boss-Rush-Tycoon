import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GitCommit, Rocket, GitCommit as GitCommitIcon, Lightbulb, FlaskConical } from "lucide-react";
import { APP_VERSION, PUBLIC_RELEASE_VERSION, DEV_BUILD_VERSION } from "../version";
import { trackEvent, trackPageView } from "../lib/analytics";
import { 
  forceRefreshRemoteConfig, 
  getIsBetaTester, 
  setBetaTesterMode, 
  setLocalBetaFeatureOverride, 
  useRemoteConfig 
} from "../lib/remoteConfig";
import { ChangelogModalProps, BroadcastStatusResponse, RoadmapItem } from "./changelog/types";
import { ChangelogHeader } from "./changelog/ChangelogHeader";
import { ChangelogAdminPanel } from "./changelog/ChangelogAdminPanel";
import { ChangelogRoadmapTab } from "./changelog/ChangelogRoadmapTab";
import { ChangelogViewer } from "./changelog/ChangelogViewer";
import { BetaFeatureTogglesTab } from "./changelog/BetaFeatureTogglesTab";

// Import changelog markdown directly as raw strings for bundled access
import PUBLIC_CHANGELOG_RAW from "../../Docs/CHANGELOG.md?raw";
import DEV_CHANGELOG_RAW from "../../Docs/CHANGELOG_DEV.md?raw";

interface InitialRoadmapState {
  items: RoadmapItem[];
}

const INITIAL_ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: "milestone-1-3-1-coop-horde",
    title: "Milestone 1.3.1: Co-Op Horde Assaults",
    category: "Combat",
    status: "In Development",
    votes: 0,
    description: "Wave-based Horde battle encounters with escalating enemy clusters and shared squad telemetry."
  },
  {
    id: "milestone-1-4-0-elemental-affinities",
    title: "Milestone 1.4.0: Elemental Affinities",
    category: "Mechanics",
    status: "Planned",
    votes: 0,
    description: "Introduction of Fire, Water, Earth, and Air item affinities for strategic boss vulnerability exploitation."
  },
  {
    id: "milestone-1-5-0-achievements",
    title: "Milestone 1.5.0: Advanced Achievement System",
    category: "Progression",
    status: "Planned",
    votes: 0,
    description: "Permanent stat-boosting achievements and legendary champion titles for end-game progression."
  },
  {
    id: "world-boss-raids",
    title: "Multi-Champion World Boss Raids",
    category: "Social",
    status: "Planned",
    votes: 0,
    description: "Synchronized raids requiring multiple champions to take down massive World Bosses with shared reward pools."
  },
  {
    id: "item-crafting-forge",
    title: "The Great Forge: Legendary Item Crafting",
    category: "Armory",
    status: "Planned",
    votes: 0,
    description: "Dismantle redundant gear to forge specialized legendary items with unique passive traits."
  }
];

const ROADMAP_VOTES_KEY = "rapportverse_roadmap_votes_v4";
const ROADMAP_ITEMS_KEY = "rapportverse_roadmap_items_v4";

export default function ChangelogModal({ isOpen, onClose, isAdmin, isBeta: isBetaProp, onToggleBeta, user, initialTab }: ChangelogModalProps) {
  // Local Beta Tester State
  const [isBeta, setIsBeta] = useState<boolean>(() => {
    if (typeof isBetaProp === "boolean") return isBetaProp;
    return getIsBetaTester();
  });

  // Non-beta users default to public release changelog; beta testers and admins default to dev; or initialTab if provided
  const [activeTab, setActiveTab] = useState<"dev" | "public" | "aidbase" | "beta">(() => {
    if (initialTab) return initialTab;
    const isAuthorized = isBetaProp ?? getIsBetaTester() ?? isAdmin;
    return isAuthorized ? "dev" : "public";
  });

  useEffect(() => {
    if (isOpen && initialTab) {
      if (initialTab === "beta" && !isBeta && !isAdmin) {
        setIsBeta(true);
        if (onToggleBeta) onToggleBeta(true);
      }
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (typeof isBetaProp === "boolean") {
      setIsBeta(isBetaProp);
      if (!isBetaProp && !isAdmin && (activeTab === "dev" || activeTab === "beta")) {
        setActiveTab("public");
      }
    }
  }, [isBetaProp, isAdmin, activeTab]);

  const hasBetaAccess = Boolean(isAdmin || isBeta);

  useEffect(() => {
    if (!hasBetaAccess && (activeTab === "dev" || activeTab === "beta")) {
      setActiveTab("public");
    }
  }, [hasBetaAccess, activeTab]);

  const [publicChangelog, setPublicChangelog] = useState<string>("");
  const [devChangelog, setDevChangelog] = useState<string>("");
  const [currentVersion, setCurrentVersion] = useState<string>(`v${APP_VERSION}`);
  const [publicVersion, setPublicVersion] = useState<string>(`v${PUBLIC_RELEASE_VERSION}`);
  
  // Admin Remote Config & Broadcast State
  const [broadcastData, setBroadcastData] = useState<BroadcastStatusResponse | null>(null);
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isPromoting, setIsPromoting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isRefreshingRC, setIsRefreshingRC] = useState<boolean>(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Batch Release State
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState<boolean>(false);
  const [isBatchPublishing, setIsBatchPublishing] = useState<boolean>(false);
  const [batchVersion, setBatchVersion] = useState<string>(APP_VERSION);
  const [batchSummary, setBatchSummary] = useState<string>("");
  const [batchTargetFeedhive, setBatchTargetFeedhive] = useState<boolean>(true);
  const [batchTargetDiscord, setBatchTargetDiscord] = useState<boolean>(true);

  // Form State for Manual Dispatch
  const [targetFeedhive, setTargetFeedhive] = useState<boolean>(true);
  const [targetDiscord, setTargetDiscord] = useState<boolean>(true);
  const [customFeedhiveCopy, setCustomFeedhiveCopy] = useState<string>("");
  const [customDiscordContent, setCustomDiscordContent] = useState<string>("");
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");

  const handleToggleBetaTester = (enabled: boolean) => {
    setIsBeta(enabled);
    setBetaTesterMode(enabled);
    onToggleBeta?.(enabled);
    if (!enabled && (activeTab === "dev" || activeTab === "beta")) {
      setActiveTab("public");
    }
  };

  // AidBase Interactive Roadmap State - initialized from fresh clean items or persisted storage
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => {
    try {
      const saved = localStorage.getItem(ROADMAP_ITEMS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Non-fatal
    }
    return INITIAL_ROADMAP_ITEMS;
  });

  const [votedIds, setVotedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(ROADMAP_VOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // Non-fatal
    }
    return new Set();
  });

  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [feedbackCategory, setFeedbackCategory] = useState<string>("Co-Op Mode");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(ROADMAP_ITEMS_KEY, JSON.stringify(roadmapItems));
    } catch {
      // Non-fatal
    }
  }, [roadmapItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ROADMAP_VOTES_KEY, JSON.stringify(Array.from(votedIds)));
    } catch {
      // Non-fatal
    }
  }, [votedIds]);

  const loadChangelogs = async () => {
    let rawPublic = "";
    let rawDev = "";

    try {
      const res = await fetch("/api/admin/broadcast/changelogs");
      if (res.ok) {
        const data = await res.json();
        if (data.publicChangelog) rawPublic = data.publicChangelog;
        if (data.devChangelog) rawDev = data.devChangelog;
      }
    } catch {
      // Fall through to markdown module imports
    }

    if (!rawPublic) {
      rawPublic = PUBLIC_CHANGELOG_RAW;
    }

    if (!rawDev) {
      rawDev = DEV_CHANGELOG_RAW;
    }

    setPublicChangelog(rawPublic);
    setDevChangelog(rawDev);

    // Dynamically extract top headers from the raw changelogs
    const devMatch = rawDev.match(/^##\s*\[([^\]]+)\]/m);
    const pubMatch = rawPublic.match(/^##\s*\[([^\]]+)\]/m);

    const resolvedDevVersion = devMatch ? devMatch[1] : DEV_BUILD_VERSION;
    const resolvedPubVersion = pubMatch ? pubMatch[1] : PUBLIC_RELEASE_VERSION;

    setCurrentVersion(`v${resolvedDevVersion}`);
    setPublicVersion(`v${resolvedPubVersion}`);
    setBatchVersion(resolvedPubVersion.replace(/^v/, ""));
  };

  useEffect(() => {
    if (isOpen) {
      loadChangelogs();
      if (isAdmin && user) {
        fetchBroadcastStatus();
      }
      
      // Track initial tab view
      trackPageView(activeTab === "aidbase" ? "Roadmap" : activeTab === "beta" ? "Beta Features" : activeTab === "dev" ? "Dev Changelog" : "Public Changelog");
    }
  }, [isOpen]); // Only track once per open

  // Track tab changes
  useEffect(() => {
    if (isOpen) {
      const pageName = activeTab === "aidbase" ? "Roadmap" : activeTab === "beta" ? "Beta Features" : activeTab === "dev" ? "Dev Changelog" : "Public Changelog";
      trackPageView(pageName);
    }
  }, [activeTab]);

  const fetchBroadcastStatus = async () => {
    if (!user) return;
    setIsLoadingBroadcast(true);
    setBroadcastError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/broadcast/status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data: BroadcastStatusResponse = await res.json();
        setBroadcastData(data);
        setCustomFeedhiveCopy(data.preview.feedhiveCopy || "");
        setPublishStatus((data.config.defaultPublishStatus as any) || "draft");
        if (data.state.publicReleasedVersion) {
          setPublicVersion(`v${data.state.publicReleasedVersion}`);
        }
      } else {
        // Silently fail for 404 or other errors on initial load to avoid confusing "error span text"
        // setBroadcastError(errJson.error || "Failed to load broadcast status.");
      }
    } catch (err: any) {
      // setBroadcastError(err.message || "Network error loading broadcast status.");
    } finally {
      setIsLoadingBroadcast(false);
    }
  };

  const handleToggleAutoPost = async (channel: "feedhive" | "discord", currentValue: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const payload = {
        [channel === "feedhive" ? "feedhiveAutoPost" : "discordAutoPost"]: !currentValue
      };

      const res = await fetch("/api/admin/broadcast/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await forceRefreshRemoteConfig();
        await fetchBroadcastStatus();
      } else {
        const err = await res.json();
        setBroadcastError(err.error || "Failed to toggle setting.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error updating auto-post config.");
    }
  };

  const handleToggleFeatureFlag = async (flag: "featureCommsCheck" | "featurePlaybookScenarios", currentValue?: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const nextValue = currentValue === undefined ? false : !currentValue;
      const res = await fetch("/api/admin/broadcast/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ [flag]: nextValue })
      });

      if (res.ok) {
        setBroadcastSuccess(`Firebase Remote Config updated: ${flag} is now ${nextValue ? "ENABLED" : "DISABLED"}.`);
        await forceRefreshRemoteConfig();
        await fetchBroadcastStatus();
      } else {
        const err = await res.json();
        setBroadcastError(err.error || "Failed to update feature flag.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error updating feature flag.");
    }
  };

  const handleForceRefreshRC = async () => {
    setIsRefreshingRC(true);
    setBroadcastError(null);
    try {
      await forceRefreshRemoteConfig();
      await fetchBroadcastStatus();
      setBroadcastSuccess("Remote Config cache refreshed directly from Firebase.");
    } catch (err: any) {
      setBroadcastError(err.message || "Failed to force refresh Remote Config.");
    } finally {
      setIsRefreshingRC(false);
    }
  };

  const handleResetSync = async (target: "feedhive" | "discord" | "all") => {
    if (!user) return;
    setIsResetting(true);
    setBroadcastError(null);
    setBroadcastSuccess(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/broadcast/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ target })
      });

      if (res.ok) {
        setBroadcastSuccess(`Sync lock reset for ${target}. Ready for re-dispatch.`);
        await fetchBroadcastStatus();
      } else {
        const err = await res.json();
        setBroadcastError(err.error || "Failed to reset sync lock.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error resetting sync lock.");
    } finally {
      setIsResetting(false);
    }
  };

  const handlePromoteVersion = async () => {
    if (!user) return;
    setIsPromoting(true);
    setBroadcastError(null);
    setBroadcastSuccess(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/broadcast/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          version: APP_VERSION,
          triggerBroadcast: true
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastSuccess(`Successfully promoted v${APP_VERSION} to Public Release and initiated broadcast!`);
        setPublicVersion(`v${APP_VERSION}`);
        await fetchBroadcastStatus();
        await loadChangelogs();
      } else {
        setBroadcastError(data.error || "Failed to promote version.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error promoting version.");
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePublishBatchRelease = async () => {
    if (!user) return;
    if (!batchVersion.trim() || !batchSummary.trim()) {
      setBroadcastError("Please specify both a target version and a milestone summary.");
      return;
    }

    setIsBatchPublishing(true);
    setBroadcastError(null);
    setBroadcastSuccess(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/broadcast/publish-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          version: batchVersion.trim(),
          summary: batchSummary.trim(),
          broadcastToFeedHive: batchTargetFeedhive,
          broadcastToDiscord: batchTargetDiscord,
          publishStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastSuccess(`Batch release v${batchVersion} successfully published to Public Changelog & Remote Config!`);
        setPublicVersion(`v${batchVersion}`);
        setIsBatchDrawerOpen(false);
        setBatchSummary("");
        await loadChangelogs();
        await fetchBroadcastStatus();
        setActiveTab("public");
      } else {
        setBroadcastError(data.error || "Failed to publish batch release.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error publishing batch release.");
    } finally {
      setIsBatchPublishing(false);
    }
  };

  const handleManualBroadcast = async () => {
    if (!user) return;
    const targets: string[] = [];
    if (targetFeedhive) targets.push("feedhive");
    if (targetDiscord) targets.push("discord");

    if (targets.length === 0) {
      setBroadcastError("Please select at least one target (FeedHive or Discord).");
      return;
    }

    setIsBroadcasting(true);
    setBroadcastError(null);
    setBroadcastSuccess(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/broadcast/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targets,
          customFeedhiveCopy,
          customDiscordContent: customDiscordContent || undefined,
          publishStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastSuccess(data.message || "Broadcast successfully transmitted!");
        await fetchBroadcastStatus();
      } else {
        setBroadcastError(data.error || "Broadcast completed with errors. See server logs.");
      }
    } catch (err: any) {
      setBroadcastError(err.message || "Network error sending broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleVote = (id: string) => {
    const item = roadmapItems.find(i => i.id === id);
    if (!item) return;

    if (votedIds.has(id)) {
      setVotedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRoadmapItems(prev => prev.map(item => item.id === id ? { ...item, votes: Math.max(0, item.votes - 1) } : item));
      
      trackEvent('roadmap_vote_removed', {
        item_id: id,
        item_title: item.title,
        category: item.category
      });
    } else {
      setVotedIds(prev => new Set(prev).add(id));
      setRoadmapItems(prev => prev.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item));
      
      trackEvent('roadmap_vote_added', {
        item_id: id,
        item_title: item.title,
        category: item.category
      });
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;

    trackEvent('roadmap_feedback_submitted', {
      category: feedbackCategory,
      content_length: feedbackInput.length,
      content_preview: feedbackInput.substring(0, 100)
    });

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackInput("");
      setFeedbackSubmitted(false);
    }, 3500);
  };

  if (!isOpen) return null;

  const isDevBuildAhead = currentVersion !== publicVersion || (Boolean(broadcastData?.state.publicReleasedVersion) && broadcastData?.state.publicReleasedVersion !== APP_VERSION);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-5xl xl:max-w-6xl bg-[#080d1a] border border-[#1a2942] shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[90vh] max-h-[860px] xl:max-h-[940px] min-h-[560px]"
        >
          {/* Header */}
          <ChangelogHeader
            publicVersion={publicVersion}
            currentVersion={currentVersion}
            isDevBuildAhead={Boolean(isDevBuildAhead)}
            isAdmin={isAdmin}
            isBeta={isBeta}
            onClose={onClose}
          />

          {/* Admin Release & Remote Config Toolbar (Admin only) */}
          {isAdmin && (
            <ChangelogAdminPanel
              broadcastData={broadcastData}
              isLoadingBroadcast={isLoadingBroadcast}
              isPromoting={isPromoting}
              isResetting={isResetting}
              isRefreshingRC={isRefreshingRC}
              isBroadcasting={isBroadcasting}
              broadcastError={broadcastError}
              broadcastSuccess={broadcastSuccess}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              isBatchDrawerOpen={isBatchDrawerOpen}
              setIsBatchDrawerOpen={setIsBatchDrawerOpen}
              batchVersion={batchVersion}
              setBatchVersion={setBatchVersion}
              batchSummary={batchSummary}
              setBatchSummary={setBatchSummary}
              batchTargetFeedhive={batchTargetFeedhive}
              setBatchTargetFeedhive={setBatchTargetFeedhive}
              batchTargetDiscord={batchTargetDiscord}
              setBatchTargetDiscord={setBatchTargetDiscord}
              isBatchPublishing={isBatchPublishing}
              targetFeedhive={targetFeedhive}
              setTargetFeedhive={setTargetFeedhive}
              targetDiscord={targetDiscord}
              setTargetDiscord={setTargetDiscord}
              customFeedhiveCopy={customFeedhiveCopy}
              setCustomFeedhiveCopy={setCustomFeedhiveCopy}
              customDiscordContent={customDiscordContent}
              setCustomDiscordContent={setCustomDiscordContent}
              publishStatus={publishStatus}
              setPublishStatus={setPublishStatus}
              onPromoteVersion={handlePromoteVersion}
              onResetSync={handleResetSync}
              onFetchBroadcastStatus={fetchBroadcastStatus}
              onForceRefreshRC={handleForceRefreshRC}
              onToggleAutoPost={handleToggleAutoPost}
              onToggleFeatureFlag={handleToggleFeatureFlag}
              onPublishBatchRelease={handlePublishBatchRelease}
              onManualBroadcast={handleManualBroadcast}
            />
          )}

          {/* Sub Navigation Tabs */}
          <div className="shrink-0 flex items-center px-4 sm:px-6 py-2 bg-[#0d1526] border-b border-[#1a2942] gap-1.5 sm:gap-2 min-h-[48px]">
            {/* Releases Tab (Always visible) */}
            <button
              type="button"
              onClick={() => setActiveTab("public")}
              className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                activeTab === "public"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Rocket className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Releases</span>
              <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${activeTab === "public" ? "bg-white/20" : "bg-slate-500/15"}`}>
                v{publicVersion.replace(/^v/, "")}
              </span>
            </button>

            {/* Dev Logs Tab (Visible ONLY when Tester Mode is enabled) */}
            {isBeta && (
              <button
                type="button"
                onClick={() => setActiveTab("dev")}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  activeTab === "dev"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                <GitCommitIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Dev Logs</span>
                <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${activeTab === "dev" ? "bg-white/20" : "bg-slate-500/15"}`}>
                  v{currentVersion.replace(/^v/, "")}
                </span>
              </button>
            )}

            {/* Roadmap Tab (Always visible) */}
            <button
              type="button"
              onClick={() => setActiveTab("aidbase")}
              className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                activeTab === "aidbase"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Roadmap</span>
            </button>

            {/* Beta Flags Tab (Visible only when user has beta access) */}
            {hasBetaAccess && (
              <button
                type="button"
                onClick={() => setActiveTab("beta")}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  activeTab === "beta"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Beta Flags</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#080d1a]">
            {activeTab === "beta" ? (
              <BetaFeatureTogglesTab
                isBeta={isBeta}
                onToggleBeta={handleToggleBetaTester}
                isAdmin={isAdmin}
                user={user}
              />
            ) : activeTab === "aidbase" ? (
              <ChangelogRoadmapTab
                roadmapItems={roadmapItems}
                votedIds={votedIds}
                feedbackSubmitted={feedbackSubmitted}
                feedbackCategory={feedbackCategory}
                setFeedbackCategory={setFeedbackCategory}
                feedbackInput={feedbackInput}
                setFeedbackInput={setFeedbackInput}
                onSubmitFeedback={handleSubmitFeedback}
                onVote={handleVote}
                user={user}
                isAdmin={isAdmin}
                isBeta={isBeta}
                onToggleBeta={handleToggleBetaTester}
              />
            ) : (
              <ChangelogViewer
                activeTab={activeTab}
                publicChangelog={publicChangelog}
                devChangelog={devChangelog}
                publicVersion={publicVersion}
                appVersion={APP_VERSION}
                isAdmin={isAdmin}
                isBeta={isBeta}
                onToggleBetaMode={handleToggleBetaTester}
                onOpenBatchDrawer={() => setIsBatchDrawerOpen(true)}
              />
            )}
          </div>
          
          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-[#1a2942] bg-[#0d1526] flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400 space-x-2">
              <GitCommit className="h-4 w-4 text-amber-500/60" />
              <span>Synced with dual-track repository & Firebase Remote Config</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
