import React, { useState } from 'react';
import { executeLiveTestTx, getContractAddress } from '../services/monadRpc';
import { MONAD_CONFIG } from '../config/monad';
import { REPOSITORY_URL } from '../config/contract';
import { IconCopy, IconCheck, IconExternalLink, IconLightning } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface JudgeVerificationBarProps {
  onOpenHelp: () => void;
}

export const JudgeVerificationBar: React.FC<JudgeVerificationBarProps> = ({ onOpenHelp }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    latencyMs: number;
    blockNumber: number;
    explorerUrl: string;
  } | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedRepo, setCopiedRepo] = useState(false);

  const contractAddress = getContractAddress();

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyRepo = () => {
    navigator.clipboard.writeText(REPOSITORY_URL);
    setCopiedRepo(true);
    setTimeout(() => setCopiedRepo(false), 2000);
  };

  const handleRunLiveTest = async () => {
    soundEngine.playClickSound();
    setTesting(true);
    try {
      const res = await executeLiveTestTx();
      setTestResult({
        latencyMs: res.latencyMs,
        blockNumber: res.blockNumber,
        explorerUrl: res.explorerUrl
      });
      soundEngine.playThunderSound();
    } finally {
      setTesting(false);
    }
  };

  return (
    <aside aria-label="Panel Verifikasi Juri Monad Testnet" className="w-full bg-[#14121D]/95 border-t-2 border-[#D4AF37] px-4 py-3 fixed bottom-0 left-0 right-0 z-40 shadow-2xl backdrop-blur-md animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Section Header & Presentation Speech Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B] animate-ping" />
            <span className="font-cinzel font-bold text-[#D4AF37] uppercase tracking-wider text-sm">
              Panel Verifikasi Juri
            </span>
          </div>
          <button
            onClick={onOpenHelp}
            className="help-btn"
            title="Penjelasan Panel Verifikasi"
          >
            ?
          </button>
          <span className="text-[11px] text-[#9E98B0] hidden xl:inline">
            Monad Testnet (Chain ID 10143)
          </span>
        </div>

        {/* Center: Live Contract Address & Repo Link (Speech-Ready Formatting) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Contract Address */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0A0F] border border-[#2D2842]">
            <span className="text-[#9E98B0] font-semibold">Kontrak:</span>
            <span className="font-mono text-[#F4F2F7] font-bold">
              {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
            </span>
            <button
              onClick={handleCopyContract}
              className="p-1 text-[#9E98B0] hover:text-[#D4AF37] transition-colors"
              title="Salin Alamat Kontrak"
            >
              {copiedContract ? <IconCheck size={14} color="#2E9E6B" /> : <IconCopy size={14} />}
            </button>
            <a
              href={`${MONAD_CONFIG.explorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-[#9E98B0] hover:text-[#6E56CF] transition-colors"
              title="Buka di Monad Explorer"
            >
              <IconExternalLink size={14} />
            </a>
          </div>

          {/* Repository Link */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0A0F] border border-[#2D2842]">
            <span className="text-[#9E98B0] font-semibold">Repo GitHub:</span>
            <span className="font-mono text-[#F4F2F7]">santoso/Mythomachy</span>
            <button
              onClick={handleCopyRepo}
              className="p-1 text-[#9E98B0] hover:text-[#D4AF37] transition-colors"
              title="Salin Link Repository"
            >
              {copiedRepo ? <IconCheck size={14} color="#2E9E6B" /> : <IconCopy size={14} />}
            </button>
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-[#9E98B0] hover:text-[#6E56CF] transition-colors"
              title="Buka Repository"
            >
              <IconExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Right: 1-Click Live Test Transaction Button & Latency Meter */}
        <div className="flex items-center gap-3">
          {testResult && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#2E9E6B]/15 border border-[#2E9E6B]/40 text-[#2E9E6B] font-mono text-[11px]">
              <span>Latensi: {testResult.latencyMs}ms</span>
              <span>| Blok #{testResult.blockNumber}</span>
            </div>
          )}

          <button
            onClick={handleRunLiveTest}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg btn-gold text-xs font-bold"
          >
            <IconLightning size={14} color="#0B0A0F" />
            <span>{testing ? 'Mengukur...' : 'Uji Transaksi Langsung'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
