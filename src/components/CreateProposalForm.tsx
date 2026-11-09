import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { botChainTestnet } from '../config/botChain';
import { keccak256, toHex, stringToHex } from 'viem';
import { PlusCircle, Loader2, CheckCircle2, AlertCircle, ExternalLink, Calendar, Key } from 'lucide-react';

interface CreateProposalFormProps {
  onCreate: (proposalId: `0x${string}`, title: string, description: string) => Promise<string | undefined>;
  onSuccess: (proposalId: `0x${string}`) => void;
}

export const CreateProposalForm: React.FC<CreateProposalFormProps> = ({
  onCreate,
  onSuccess,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [customSalt, setCustomSalt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProposalId, setCreatedProposalId] = useState<`0x${string}` | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Generate deterministic/unique proposalId preview
  const generatePreviewId = (): `0x${string}` => {
    if (!title.trim()) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    const seed = `${title.trim()}-${address || 'anonymous'}-${customSalt || 'default'}`;
    return keccak256(stringToHex(seed));
  };

  const previewId = generatePreviewId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected || !address) {
      setError('Please connect your Web3 wallet first.');
      return;
    }

    if (chainId !== botChainTestnet.id) {
      setError('Please switch to BOT Chain Testnet (Chain ID 968) before submitting.');
      return;
    }

    if (!title.trim()) {
      setError('Proposal title cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Unique proposalId combining title, creator, timestamp and random entropy
      const entropy = `${title.trim()}-${address}-${Date.now()}-${Math.random()}`;
      const uniqueProposalId = keccak256(stringToHex(entropy));

      // Append optional deadline note to description if specified
      let finalDescription = description.trim();
      if (deadline) {
        finalDescription = `[Deadline: ${new Date(deadline).toLocaleString()}]\n\n${finalDescription}`;
      }

      const hash = await onCreate(uniqueProposalId, title.trim(), finalDescription);
      
      setCreatedProposalId(uniqueProposalId);
      if (hash) setTxHash(hash);
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || 'Failed to submit proposal to BOT Chain.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <PlusCircle className="w-6 h-6 text-emerald-400" />
            <span>Create New Proposal</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Proposals are immutably deployed to the BOT Chain smart contract. Any wallet can inspect and cast approval or rejection votes.
          </p>
        </div>

        {createdProposalId ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Proposal Successfully Created!</h3>
            </div>

            <p className="text-sm text-slate-300">
              Your proposal has been confirmed on the BOT Chain network.
            </p>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block mb-1">On-Chain Proposal ID:</span>
              <span className="text-emerald-400 break-all select-all">{createdProposalId}</span>
            </div>

            {txHash && (
              <div className="pt-2">
                <a
                  href={`https://scan.bohr.life/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:underline"
                >
                  <span>View transaction on BOT Scan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="flex space-x-3 pt-3">
              <button
                onClick={() => onSuccess(createdProposalId)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
              >
                View Proposal
              </button>
              <button
                onClick={() => {
                  setCreatedProposalId(null);
                  setTitle('');
                  setDescription('');
                  setDeadline('');
                  setTxHash(null);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Proposal Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Approve community grant for DeFi tooling on BOT Chain"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Description field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Short Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context, deliverables, and why wallets should approve or reject this proposal..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
              />
            </div>

            {/* Optional Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Voting Deadline (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Live Unique ID Preview */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Unique Proposal Identifier Preview:</span>
              </div>
              <div className="font-mono text-xs text-slate-400 break-all select-all">
                {title.trim() ? previewId : 'Fill in the proposal title to generate ID'}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Wallet status banner if not connected */}
            {!isConnected && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                Please connect your wallet at the top right to deploy this proposal onto BOT Chain.
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to BOT Chain...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Proposal to BOT Chain</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

