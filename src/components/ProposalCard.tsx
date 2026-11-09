import React from 'react';
import { Proposal, VoteDecision } from '../types';
import { shortenAddress, formatTimeAgo } from '../utils/format';
import { CheckCircle2, XCircle, ArrowUpRight, Clock, User, ShieldCheck } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  userVote?: VoteDecision;
  onSelect: (proposal: Proposal) => void;
  isCreator: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  userVote,
  onSelect,
  isCreator,
}) => {
  const approvals = Number(proposal.approvals);
  const rejections = Number(proposal.rejections);
  const totalVotes = approvals + rejections;

  const approvalPercent = totalVotes > 0 ? Math.round((approvals / totalVotes) * 100) : 0;
  const rejectionPercent = totalVotes > 0 ? 100 - approvalPercent : 0;

  return (
    <div
      onClick={() => onSelect(proposal)}
      className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
    >
      <div>
        {/* Header row: Status badge + Creator tag + User vote status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            {proposal.isOpen ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Closed
              </span>
            )}

            {isCreator && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
                <User className="w-3 h-3" />
                <span>Author</span>
              </span>
            )}
          </div>

          {/* User vote badge if they voted */}
          {userVote === VoteDecision.Approved && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>You Approved</span>
            </span>
          )}
          {userVote === VoteDecision.Rejected && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-500/30">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>You Rejected</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1.5">
          {proposal.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {proposal.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Voting Progress bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{approvals} ({approvalPercent}%)</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span>({rejectionPercent}%) {rejections}</span>
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {totalVotes === 0 ? (
              <div className="w-full bg-slate-800 h-full" />
            ) : (
              <>
                <div
                  style={{ width: `${approvalPercent}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${rejectionPercent}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Footer info: Creator address + Creation time + Action arrow */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-300">by {shortenAddress(proposal.creator)}</span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(proposal.createdAt)}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

