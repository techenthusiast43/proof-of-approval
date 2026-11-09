import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { botChainTestnet } from '../config/botChain';
import { shortenAddress } from '../utils/format';
import { ShieldCheck, ExternalLink, PlusCircle, LayoutDashboard, UserCheck, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'create' | 'my-proposals';
  setActiveTab: (tab: 'dashboard' | 'create' | 'my-proposals') => void;
  myProposalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  myProposalsCount,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chainId === botChainTestnet.id;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Proof<span className="text-emerald-400">OfApproval</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                BOT Chain Governance
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Create Proposal</span>
            </button>

            <button
              onClick={() => setActiveTab('my-proposals')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'my-proposals'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>My Proposals</span>
              {myProposalsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {myProposalsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Network Badge & Reown AppKit Button */}
          <div className="flex items-center space-x-3">
            {/* Faucet button */}
            <a
              href="https://faucet.botchain.ai/basic"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
            >
              <span>BOT Faucet</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Network indicator */}
            {isConnected && (
              isCorrectChain ? (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>BOT Testnet (968)</span>
                </div>
              ) : (
                <button
                  onClick={() => switchChain({ chainId: botChainTestnet.id })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Switch to BOT Chain</span>
                </button>
              )
            )}

            {/* Reown AppKit Web Component Button */}
            <appkit-button balance="show" size="md" />
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
              activeTab === 'create' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create</span>
          </button>
          <button
            onClick={() => setActiveTab('my-proposals')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
              activeTab === 'my-proposals' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>My Proposals ({myProposalsCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

