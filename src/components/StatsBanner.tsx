import React from 'react';
import { Proposal } from '../types';
import { Vote, CheckCircle2, XCircle, FolderOpen, Coins, Globe2 } from 'lucide-react';

interface StatsBannerProps {
  proposals: Proposal[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ proposals }) => {
  const total = proposals.length;
  const active = proposals.filter((p) => p.isOpen).length;
  const closed = total - active;

  const totalApprovals = proposals.reduce(
    (acc, p) => acc + Number(p.approvals),
    0
  );
  const totalRejections = proposals.reduce(
    (acc, p) => acc + Number(p.rejections),
    0
  );

  return (
    <div className="mb-8 space-y-4">
      {/* Network banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>BOT Chain Testnet Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Decentralized Proposal Approvals
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Transparent on-chain decision platform on BOT Chain. Create proposals, verify voter decisions, and achieve verifiable consensus.
            </p>
          </div>

          {/* Quick Chain Specs */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Chain ID</div>
                <div className="font-semibold text-slate-200">968 (0x3c8)</div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-teal-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Native Token</div>
                <div className="font-semibold text-slate-200">BOT (150M Supply)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Proposals */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Proposals</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded on-chain</div>
        </div>

        {/* Active Proposals */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{active}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Currently open for voting</div>
        </div>

        {/* Closed Proposals */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Closed</span>
            <Vote className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-300 tracking-tight">{closed}</div>
          <div className="text-[11px] text-slate-500 mt-1">Voting completed</div>
        </div>

        {/* Total Approvals */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-emerald-400/80 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approvals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{totalApprovals}</div>
          <div className="text-[11px] text-emerald-500/70 mt-1">Total approved votes</div>
        </div>

        {/* Total Rejections */}
        <div className="bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 rounded-xl p-4 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-400/80 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rejections</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{totalRejections}</div>
          <div className="text-[11px] text-rose-500/70 mt-1">Total rejected votes</div>
        </div>
      </div>
    </div>
  );
};

