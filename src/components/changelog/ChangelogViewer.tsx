import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { History, Search, Calendar, ChevronRight } from 'lucide-react';

interface ChangelogVersion {
  version: string;
  date: string;
  content: string;
  id: string;
}

interface ChangelogViewerProps {
  activeTab: 'dev' | 'public' | 'aidbase' | 'beta';
  publicChangelog: string;
  devChangelog: string;
  publicVersion: string;
  appVersion: string;
  isAdmin: boolean;
  isBeta: boolean;
  onToggleBetaMode: (enabled: boolean) => void;
  onOpenBatchDrawer: () => void;
}

export const ChangelogViewer: React.FC<ChangelogViewerProps> = ({
  activeTab,
  publicChangelog,
  devChangelog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const rawContent = activeTab === 'dev' ? devChangelog : publicChangelog;

  const versions = useMemo(() => {
    if (!rawContent) return [];

    // Split by H2 headers starting with [v...]
    const parts = rawContent.split(/##\s*\[([^\]]+)\]\s*[—–-]?\s*([^\n]*)/g);
    const parsed: ChangelogVersion[] = [];

    // parts[0] is preamble
    for (let i = 1; i < parts.length; i += 3) {
      const version = parts[i];
      const date = parts[i + 1]?.trim() || 'Unknown Date';
      const content = parts[i + 2]?.trim() || '';
      
      parsed.push({
        version,
        date,
        content,
        id: `v-${version.replace(/[^a-zA-Z0-9]/g, '-')}`
      });
    }

    return parsed;
  }, [rawContent]);

  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return versions;
    const query = searchQuery.toLowerCase();
    return versions.filter(v => 
      v.version.toLowerCase().includes(query) || 
      v.content.toLowerCase().includes(query) ||
      v.date.toLowerCase().includes(query)
    );
  }, [versions, searchQuery]);

  const activeVersion = useMemo(() => {
    if (selectedVersionId) {
      return versions.find(v => v.id === selectedVersionId) || versions[0];
    }
    return versions[0];
  }, [versions, selectedVersionId]);

  if (!rawContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <History className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-mono uppercase tracking-widest">No history recorded in the archives</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
      {/* Navigation Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-4 shrink-0 border-r border-slate-800/50 pr-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
          {filteredVersions.length > 0 ? (
            filteredVersions.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVersionId(v.id)}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl transition-all text-left group ${
                  activeVersion?.id === v.id 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black font-mono">v{v.version}</span>
                  {activeVersion?.id === v.id && <ChevronRight className="w-3 h-3" />}
                </div>
                <div className="flex items-center gap-1 opacity-60">
                  <Calendar className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-bold uppercase">{v.date}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase">No versions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-w-0">
        {activeVersion ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Version {activeVersion.version}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono uppercase tracking-widest">{activeVersion.date}</span>
                </div>
              </div>
              {activeTab === 'public' && activeVersion.version === versions[0].version && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                  Current Production Release
                </span>
              )}
            </div>

            <div className="prose prose-invert prose-sm max-w-none 
              prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4 prose-h3:flex prose-h3:items-center prose-h3:gap-2
              prose-h4:text-sm prose-h4:text-amber-400 prose-h4:uppercase prose-h4:tracking-widest prose-h4:mt-6 prose-h4:mb-2
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-300 prose-li:my-1
              prose-strong:text-white prose-strong:font-bold
              prose-hr:border-slate-800
              prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded prose-code:text-amber-300 prose-code:before:content-none prose-code:after:content-none
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeVersion.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <p className="text-sm font-mono uppercase tracking-widest">Select a version to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
