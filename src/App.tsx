import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { ProposalCard } from './components/ProposalCard';
import { ProposalDetailsModal } from './components/ProposalDetailsModal';
import { CreateProposalForm } from './components/CreateProposalForm';
import { MyProposalsView } from './components/MyProposalsView';
import { PROOF_OF_APPROVAL_CONFIG } from './contracts/contractConfig';
import { Proposal, VoteDecision, VoterRecord } from './types';
import { botChainTestnet } from './config/botChain';
import {
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Inbox,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export function App() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'my-proposals'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, VoteDecision>>({});
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [modalVoters, setModalVoters] = useState<VoterRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);

  // Fetch all proposals directly from smart contract
  const fetchProposalsData = useCallback(async () => {
    if (!publicClient) return;

    try {
      setIsRefreshing(true);

      // 1. Get all proposal IDs
      const ids = (await publicClient.readContract({
        ...PROOF_OF_APPROVAL_CONFIG,
        functionName: 'getAllProposalIds',
      })) as `0x${string}`[];

      if (!ids || ids.length === 0) {
        setProposals([]);
        setUserVotes({});
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 2. Fetch full proposal details in parallel
      const fetchedProposals: Proposal[] = [];
      const votesMap: Record<string, VoteDecision> = {};

      for (const id of ids) {
        try {
          const res = (await publicClient.readContract({
            ...PROOF_OF_APPROVAL_CONFIG,
            functionName: 'getProposal',
            args: [id],
          })) as any;

          // res: [id, creator, title, description, isOpen, approvals, rejections, createdAt]
          const prop: Proposal = {
            id: res[0],
            creator: res[1],
            title: res[2],
            description: res[3],
            isOpen: res[4],
            approvals: res[5],
            rejections: res[6],
            createdAt: res[7],
          };
          fetchedProposals.push(prop);

          // If wallet connected, query user vote decision
          if (address) {
            const decisionNum = (await publicClient.readContract({
              ...PROOF_OF_APPROVAL_CONFIG,
              functionName: 'getVoteDecision',
              args: [id, address],
            })) as number;

            votesMap[id.toLowerCase()] = decisionNum as VoteDecision;
          }
        } catch (err) {
          console.warn(`Could not read proposal ${id}:`, err);
        }
      }

      // Sort newest proposals first
      fetchedProposals.sort((a, b) => Number(b.createdAt - a.createdAt));

      setProposals(fetchedProposals);
      setUserVotes(votesMap);

      // If a modal is open, refresh its data too
      if (selectedProposal) {
        const updated = fetchedProposals.find((p) => p.id === selectedProposal.id);
        if (updated) {
          setSelectedProposal(updated);
          await loadVotersForProposal(updated.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [publicClient, address, selectedProposal]);

  useEffect(() => {
    fetchProposalsData();
  }, [publicClient, address]);

  // Load voters list for a proposal
  const loadVotersForProposal = async (proposalId: `0x${string}`) => {
    if (!publicClient) return;
    try {
      const res = (await publicClient.readContract({
        ...PROOF_OF_APPROVAL_CONFIG,
        functionName: 'getProposalVoters',
        args: [proposalId],
      })) as [string[], number[]];

      const [addresses, decisions] = res;
      const records: VoterRecord[] = addresses.map((addr, i) => ({
        address: addr as `0x${string}`,
        decision: decisions[i] as VoteDecision,
      }));
      setModalVoters(records);
    } catch (err) {
      console.warn('Error reading voters list:', err);
      setModalVoters([]);
    }
  };

  const handleOpenProposal = async (prop: Proposal) => {
    setSelectedProposal(prop);
    setActionError(null);
    setLastTxHash(undefined);
    await loadVotersForProposal(prop.id);
  };

  // Create proposal action
  const handleCreateProposal = async (
    proposalId: `0x${string}`,
    title: string,
    description: string
  ): Promise<string | undefined> => {
    if (!publicClient) throw new Error('Client not ready');

    const tx = await writeContractAsync({
      ...PROOF_OF_APPROVAL_CONFIG,
      functionName: 'createProposal',
      args: [proposalId, title, description],
    });

    // Strictly wait until receipt is confirmed on BOT Chain before marking success
    await publicClient.waitForTransactionReceipt({ hash: tx });

    await fetchProposalsData();
    return tx;
  };

  // Approve proposal action
  const handleApproveProposal = async (proposalId: `0x${string}`) => {
    if (!publicClient) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      setLastTxHash(undefined);

      const tx = await writeContractAsync({
        ...PROOF_OF_APPROVAL_CONFIG,
        functionName: 'approveProposal',
        args: [proposalId],
      });

      // Wait for block confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      setLastTxHash(receipt.transactionHash);

      await fetchProposalsData();
      await loadVotersForProposal(proposalId);
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || 'Transaction failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reject proposal action
  const handleRejectProposal = async (proposalId: `0x${string}`) => {
    if (!publicClient) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      setLastTxHash(undefined);

      const tx = await writeContractAsync({
        ...PROOF_OF_APPROVAL_CONFIG,
        functionName: 'rejectProposal',
        args: [proposalId],
      });

      // Wait for block confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      setLastTxHash(receipt.transactionHash);

      await fetchProposalsData();
      await loadVotersForProposal(proposalId);
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || 'Transaction failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Close proposal action
  const handleCloseProposal = async (proposalId: `0x${string}`) => {
    if (!publicClient) return;
    const confirmed = window.confirm(
      'Are you sure you want to close this proposal? No more votes can be cast once closed.'
    );
    if (!confirmed) return;

    try {
      setIsActionLoading(true);
      setActionError(null);
      setLastTxHash(undefined);

      const tx = await writeContractAsync({
        ...PROOF_OF_APPROVAL_CONFIG,
        functionName: 'closeProposal',
        args: [proposalId],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      setLastTxHash(receipt.transactionHash);

      await fetchProposalsData();
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal({ ...selectedProposal, isOpen: false });
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || 'Failed to close proposal');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filtered & searched proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      // Status filter
      if (filterStatus === 'active' && !p.isOpen) return false;
      if (filterStatus === 'closed' && p.isOpen) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCreator = p.creator.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCreator || matchesId;
      }

      return true;
    });
  }, [proposals, filterStatus, searchQuery]);

  const myProposalsCount = useMemo(() => {
    if (!address) return 0;
    return proposals.filter((p) => p.creator.toLowerCase() === address.toLowerCase()).length;
  }, [proposals, address]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myProposalsCount={myProposalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <StatsBanner proposals={proposals} />

            {/* Filter & Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or address..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Status Filters & Refresh */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({proposals.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Active ({proposals.filter((p) => p.isOpen).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('closed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === 'closed'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Closed ({proposals.filter((p) => !p.isOpen).length})
                  </button>
                </div>

                <button
                  onClick={() => fetchProposalsData()}
                  disabled={isRefreshing}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                  title="Refresh proposals from BOT Chain"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Proposals Grid or Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-56 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-5 space-y-4"
                  >
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-800 rounded w-4/5" />
                    <div className="h-12 bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Proposals Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
                  {searchQuery
                    ? `No proposals match "${searchQuery}". Try adjusting your filters.`
                    : 'No proposals currently exist on the BOT Chain contract.'}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Proposal</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProposals.map((prop) => (
                  <ProposalCard
                    key={prop.id}
                    proposal={prop}
                    userVote={userVotes[prop.id.toLowerCase()]}
                    onSelect={handleOpenProposal}
                    isCreator={
                      Boolean(address && prop.creator.toLowerCase() === address.toLowerCase())
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE PROPOSAL */}
        {activeTab === 'create' && (
          <CreateProposalForm
            onCreate={handleCreateProposal}
            onSuccess={(id) => {
              setActiveTab('dashboard');
              const prop = proposals.find((p) => p.id === id);
              if (prop) handleOpenProposal(prop);
            }}
          />
        )}

        {/* TAB 3: MY PROPOSALS */}
        {activeTab === 'my-proposals' && (
          <MyProposalsView
            proposals={proposals}
            userVotes={userVotes}
            userAddress={address}
            onSelect={handleOpenProposal}
            onCloseProposal={handleCloseProposal}
            onCreateNew={() => setActiveTab('create')}
            isActionLoading={isActionLoading}
          />
        )}
      </main>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <ProposalDetailsModal
          isOpen={Boolean(selectedProposal)}
          proposal={selectedProposal}
          voters={modalVoters}
          userVote={userVotes[selectedProposal.id.toLowerCase()] || VoteDecision.None}
          userAddress={address}
          onClose={() => setSelectedProposal(null)}
          onApprove={handleApproveProposal}
          onReject={handleRejectProposal}
          onCloseProposal={handleCloseProposal}
          isActionLoading={isActionLoading}
          txHash={lastTxHash}
          actionError={actionError}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070c18] py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">ProofOfApproval</span>
            <span>•</span>
            <span>BOT Chain Governance Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              BOT Chain Explorer
            </a>
            <a
              href="https://faucet.botchain.ai/basic"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              BOT Testnet Faucet
            </a>
            <span className="font-mono text-slate-600">Chain ID: 968</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

