import React from 'react';
import { Proposal, VoteDecision } from '../types';
import { shortenAddress, formatTimeAgo } from '../utils/format';
import { CheckCircle2, XCircle, Lock, ArrowUpRight, PlusCircle, AlertCircle, Clock } from 'lucide-react';

interface MyProposalsViewProps {
  proposals: Proposal[];
  userVotes: Record<string, VoteDecision>;
  onSelect: (proposal: Proposal) => void;
  onCloseProposal: (proposalId: `0x${string}`) => Promise<void>;
  onCreateNew: () => void;
  isActionLoading: boolean;
  userAddress?: `0x${string}`;
}

export const MyProposalsView: React.FC<MyProposalsViewProps> = ({
  proposals,
  userVotes,
  onSelect,
  onCloseProposal,
  onCreateNew,
  isActionLoading,
  userAddress,
}) => {
  if (!userAddress) {
    return (
      <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 max-w-xl mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Wallet Not Connected</h3>
        <p className="text-sm text-slate-400 mb-6">
          Connect your Web3 wallet to manage the proposals you have created on BOT Chain.
        </p>
      </div>
    );
  }

  const myProposals = proposals.filter(
    (p) => p.creator.toLowerCase() === userAddress.toLowerCase()
  );

  if (myProposals.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <PlusCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Proposals Created Yet</h3>
        <p className="text-sm text-slate-400 mb-6">
          You haven't published any proposals from wallet <span className="font-mono text-slate-300">{shortenAddress(userAddress)}</span>.
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Your First Proposal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">My Proposals</h2>
          <p className="text-sm text-slate-400">
            Manage proposals created by <span className="font-mono text-emerald-400">{shortenAddress(userAddress, 6)}</span>
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myProposals.map((prop) => {
          const approvals = Number(prop.approvals);
          const rejections = Number(prop.rejections);
          const totalVotes = approvals + rejections;
          const approvalPercent = totalVotes > 0 ? Math.round((approvals / totalVotes) * 100) : 0;

          return (
            <div
              key={prop.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {prop.isOpen ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Closed
                    </span>
                  )}

                  <span className="flex items-center space-x-1 text-slate-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(prop.createdAt)}</span>
                  </span>
                </div>

                <h3
                  onClick={() => onSelect(prop)}
                  className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1 mb-2"
                >
                  {prop.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {prop.description || 'No description provided.'}
                </p>

                {/* Voting stats */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{approvals} Approvals ({approvalPercent}%)</span>
                    </span>
                    <span className="text-rose-400 flex items-center space-x-1">
                      <span>{rejections} Rejections</span>
                      <XCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${approvalPercent}%` }}
                      className="bg-emerald-500 h-full"
                    />
                    <div
                      style={{ width: `${totalVotes > 0 ? 100 - approvalPercent : 0}%` }}
                      className="bg-rose-500 h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onSelect(prop)}
                  className="text-xs text-slate-300 hover:text-emerald-400 font-medium flex items-center space-x-1"
                >
                  <span>Details & Voters</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {prop.isOpen && (
                  <button
                    disabled={isActionLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseProposal(prop.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Close Proposal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

