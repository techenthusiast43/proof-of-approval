import React from 'react';
import { Proposal, VoteDecision, VoterRecord } from '../types';
import { shortenAddress, formatTimestamp } from '../utils/format';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  Lock,
  Loader2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface ProposalDetailsModalProps {
  proposal: Proposal;
  voters: VoterRecord[];
  userVote: VoteDecision;
  userAddress?: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (proposalId: `0x${string}`) => Promise<void>;
  onReject: (proposalId: `0x${string}`) => Promise<void>;
  onCloseProposal: (proposalId: `0x${string}`) => Promise<void>;
  isActionLoading: boolean;
  txHash?: string;
  actionError?: string | null;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  proposal,
  voters,
  userVote,
  userAddress,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onCloseProposal,
  isActionLoading,
  txHash,
  actionError,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const approvals = Number(proposal.approvals);
  const rejections = Number(proposal.rejections);
  const totalVotes = approvals + rejections;

  const approvalPercent = totalVotes > 0 ? Math.round((approvals / totalVotes) * 100) : 0;
  const rejectionPercent = totalVotes > 0 ? 100 - approvalPercent : 0;

  const isCreator =
    userAddress &&
    proposal.creator.toLowerCase() === userAddress.toLowerCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-2">
              {proposal.isOpen ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active Proposal</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Closed
                </span>
              )}

              {isCreator && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <User className="w-3 h-3" />
                  <span>Created by You</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
              {proposal.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block mb-1">Creator Wallet</span>
              <div className="flex items-center space-x-1.5 font-mono text-slate-300">
                <span title={proposal.creator}>{shortenAddress(proposal.creator, 6)}</span>
                <button
                  onClick={() => handleCopy(proposal.creator)}
                  className="text-slate-500 hover:text-slate-300"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://scan.bohr.life/address/${proposal.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                  title="View on BOT Scan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Created At</span>
              <div className="flex items-center space-x-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimestamp(proposal.createdAt)}</span>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-500 block mb-0.5">Proposal ID</span>
              <div className="font-mono text-slate-400 break-all select-all text-[11px]">
                {proposal.id}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Proposal Description
            </h4>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {proposal.description || 'No detailed description was provided for this proposal.'}
            </div>
          </div>

          {/* Voting Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Voting Statistics
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                {totalVotes} total {totalVotes === 1 ? 'decision' : 'decisions'}
              </span>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved: {approvals}</span>
                  <span className="text-xs text-emerald-500 font-normal">({approvalPercent}%)</span>
                </div>
                <div className="flex items-center space-x-2 text-rose-400">
                  <span className="text-xs text-rose-500 font-normal">({rejectionPercent}%)</span>
                  <span>Rejected: {rejections}</span>
                  <XCircle className="w-4 h-4" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
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
          </div>

          {/* Connected User Vote Status */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Your Voting Status</span>
            {userVote === VoteDecision.Approved && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
                <span>You Voted: Approved</span>
              </span>
            )}
            {userVote === VoteDecision.Rejected && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <XCircle className="w-4 h-4" />
                <span>You Voted: Rejected</span>
              </span>
            )}
            {userVote === VoteDecision.None && (
              <span className="text-xs text-slate-400 font-mono">
                {userAddress ? 'Not voted yet' : 'Connect wallet to vote'}
              </span>
            )}
          </div>

          {/* Transaction status or error message */}
          {txHash && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <span>Transaction confirmed on BOT Chain!</span>
              <a
                href={`https://scan.bohr.life/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline flex items-center space-x-1 hover:text-emerald-200"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {actionError && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Voting Action Buttons (if active & not voted) */}
          {proposal.isOpen && userVote === VoteDecision.None && userAddress && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={isActionLoading}
                onClick={() => onApprove(proposal.id)}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Approve Proposal</span>
              </button>

              <button
                disabled={isActionLoading}
                onClick={() => onReject(proposal.id)}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Reject Proposal</span>
              </button>
            </div>
          )}

          {/* Close proposal button (if creator & active) */}
          {proposal.isOpen && isCreator && (
            <div className="pt-2">
              <button
                disabled={isActionLoading}
                onClick={() => onCloseProposal(proposal.id)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Close Proposal (Creator Only)</span>
              </button>
            </div>
          )}

          {/* Audit Log / Voter Records List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Voter Audit Log ({voters.length})
            </h4>

            {voters.length === 0 ? (
              <div className="text-center py-6 bg-slate-950/30 rounded-2xl border border-slate-800/60 text-xs text-slate-500">
                No votes recorded on-chain yet for this proposal.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {voters.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-300">{shortenAddress(v.address, 6)}</span>
                      <a
                        href={`https://scan.bohr.life/address/${v.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-emerald-400"
                        title="View on BOT Scan"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div>
                      {v.decision === VoteDecision.Approved ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

