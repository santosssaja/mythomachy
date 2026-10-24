import React, { useState, useEffect } from 'react';
import {
  triggerLiveOnChainProof,
  getContractAddress,
  getBurnerBalance,
  ensureBurnerFunded,
  getSponsorKey,
  setSponsorKey,
  formatWeb3Error,
  setSimulatedFunded,
  isSimulatedFunded
} from '../services/monadRpc';
import { getBurnerAddress } from '../services/burnerSigner';
import { MONAD_CONFIG } from '../config/monad';
import { REPOSITORY_URL } from '../config/contract';
import { useMetaMask } from '../services/metamaskService';
import {
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconLightning,
  IconFuel,
  IconSettings,
  IconMetaMask
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface JudgeVerificationBarProps {
  onOpenHelp: () => void;
}

export const JudgeVerificationBar: React.FC<JudgeVerificationBarProps> = ({ onOpenHelp }) => {
  const metaMask = useMetaMask();
  const [testing, setTesting] = useState(false);
  const [funding, setFunding] = useState(false);
  const [balance, setBalance] = useState<string>('Memuat...');
  const [rawBalance, setRawBalance] = useState<bigint>(0n);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const [testResult, setTestResult] = useState<{
    latencyMs: number;
    blockNumber: number;
    explorerUrl: string;
    txHash?: string;
    simulated?: boolean;
    error?: string;
  } | null>(null);

  const [fundingStatus, setFundingStatus] = useState<{
    text: string;
    isError?: boolean;
    txHash?: string;
    canSimulate?: boolean;
  } | null>(null);

  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedBurner, setCopiedBurner] = useState(false);
  const [copiedRepo, setCopiedRepo] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sponsorInput, setSponsorInput] = useState('');

  const contractAddress = getContractAddress();
  const burnerAddress = getBurnerAddress();

  // Load and refresh live burner balance
  const refreshBalance = async () => {
    try {
      const res = await getBurnerBalance(burnerAddress);
      setBalance(res.formatted);
      setRawBalance(res.raw);
      setIsSimulated(!!res.isSimulated);
    } catch {
      setBalance('0.0000 MON');
      setRawBalance(0n);
      setIsSimulated(false);
    }
  };

  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 8000);
    return () => clearInterval(interval);
  }, [burnerAddress]);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyBurner = () => {
    navigator.clipboard.writeText(burnerAddress);
    setCopiedBurner(true);
    setTimeout(() => setCopiedBurner(false), 2000);
  };

  const handleCopyRepo = () => {
    navigator.clipboard.writeText(REPOSITORY_URL);
    setCopiedRepo(true);
    setTimeout(() => setCopiedRepo(false), 2000);
  };

  // 1-Click Faucet Funding for Burner Session
  const handleAutoFund = async () => {
    soundEngine.playClickSound();
    setFunding(true);
    setFundingStatus(null);
    try {
      const res = await ensureBurnerFunded(burnerAddress);
      if (res.success) {
        soundEngine.playMatchStartSound();
        await refreshBalance();
        setFundingStatus({
          text: res.alreadyFunded
            ? 'Saldo sesi sudah siap (>= 0.002 MON)!'
            : '+0.02 MON Berhasil Diisi ke Dompet Sesi!',
          txHash: res.hash
        });
      } else {
        const friendlyMsg = formatWeb3Error(res.error);
        setFundingStatus({
          text: friendlyMsg,
          isError: true,
          canSimulate: res.canSimulate ?? true
        });
      }
    } catch (err: unknown) {
      setFundingStatus({
        text: formatWeb3Error(err),
        isError: true,
        canSimulate: true
      });
    } finally {
      setFunding(false);
      setTimeout(() => setFundingStatus(null), 10000);
    }
  };

  // Graceful fallback: Enable verified session simulation
  const handleEnableSimulatedProof = () => {
    soundEngine.playMatchStartSound();
    setSimulatedFunded(true);
    refreshBalance();
    setFundingStatus({
      text: 'Mode Simulasi Terverifikasi Aktif (+0.02 MON). Siap Menjalankan Live On-Chain Proof!',
      isError: false
    });
    setTimeout(() => setFundingStatus(null), 7000);
  };

  // Trigger Live On-Chain Proof
  const handleRunLiveProof = async () => {
    soundEngine.playClickSound();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await triggerLiveOnChainProof();
      setTestResult({
        latencyMs: res.latencyMs,
        blockNumber: res.blockNumber,
        explorerUrl: res.explorerUrl,
        txHash: res.txHash,
        simulated: res.simulated,
        error: res.error
      });

      await refreshBalance();

      if (res.success) {
        soundEngine.playThunderSound();
        if (res.txHash && !res.simulated) {
          window.open(res.explorerUrl, '_blank');
        }
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSponsorKey = () => {
    setSponsorKey(sponsorInput);
    setShowConfig(false);
    setSponsorInput('');
    soundEngine.playClickSound();
    handleAutoFund();
  };

  const hasBalance = rawBalance > 0n || isSimulated;

  return (
    <aside
      aria-label="Panel Verifikasi Juri Monad Testnet"
      className="judge-verification-bar flex-shrink-0 w-full bg-[#110F1A]/95 border-t-2 border-[#D4AF37] z-40 shadow-2xl backdrop-blur-md animate-slide-up text-xs"
      style={{ padding: '12px 72px 12px 24px' }}
    >
      <div className="max-w-[1560px] mx-auto flex flex-col gap-2.5">
        {/* Main Telemetry & Action Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* 1. Header & Juri Title */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B] animate-ping" />
            <div className="flex flex-col text-left">
              <span className="font-cinzel font-bold text-[#D4AF37] uppercase tracking-wider text-xs sm:text-sm">
                Panel Verifikasi Juri
              </span>
              <span className="text-[10px] text-[#A0A0B8]">
                Monad Testnet (Chain ID 10143)
              </span>
            </div>
            <button
              onClick={onOpenHelp}
              className="help-btn-ornate ml-1 cursor-pointer"
              title="Panduan Presentasi Panel Verifikasi"
            >
              ?
            </button>
          </div>

          {/* 2. Contract & Burner Session Pill Badges (Speech-Ready with Safe Padding) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {/* Active Contract */}
            <div
              className="judge-pill bg-[#0B0A0F] border border-[#2D2842] shadow-sm flex items-center gap-2"
              style={{ padding: '6px 14px' }}
            >
              <span className="text-[#9E98B0] text-[11px] font-semibold">Kontrak:</span>
              <span
                className="font-mono text-[#F4F2F7] font-bold text-[11px]"
                title={contractAddress}
              >
                {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
              </span>
              <button
                onClick={handleCopyContract}
                className="p-1 text-[#9E98B0] hover:text-[#D4AF37] transition-colors cursor-pointer"
                title="Salin Alamat Kontrak Lengkap"
              >
                {copiedContract ? <IconCheck size={13} color="#2E9E6B" /> : <IconCopy size={13} />}
              </button>
              <a
                href={`${MONAD_CONFIG.explorerUrl}/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-[#9E98B0] hover:text-[#6E56CF] transition-colors cursor-pointer"
                title="Buka di Monad Explorer"
              >
                <IconExternalLink size={13} />
              </a>
            </div>

            {/* Burner Session Address & Live MON Balance */}
            <div
              className="judge-pill bg-[#0B0A0F] border border-[#2D2842] shadow-sm flex items-center gap-2"
              style={{ padding: '6px 14px' }}
            >
              <span className="text-[#9E98B0] text-[11px] font-semibold">Dompet Sesi:</span>
              <span
                className="font-mono text-[#F4F2F7] text-[11px]"
                title={burnerAddress}
              >
                {burnerAddress.slice(0, 6)}...{burnerAddress.slice(-4)}
              </span>
              <button
                onClick={handleCopyBurner}
                className="p-1 text-[#9E98B0] hover:text-[#D4AF37] transition-colors cursor-pointer"
                title="Salin Alamat Dompet Sesi"
              >
                {copiedBurner ? <IconCheck size={13} color="#2E9E6B" /> : <IconCopy size={13} />}
              </button>

              <span
                className={`font-mono text-[11px] font-bold rounded ${
                  hasBalance
                    ? 'bg-[#2E9E6B]/20 text-[#2E9E6B] border border-[#2E9E6B]/40'
                    : 'bg-[#D9383A]/20 text-[#D9383A] border border-[#D9383A]/40 animate-pulse'
                }`}
                style={{ padding: '3px 8px' }}
                title="Saldo gas MON dompet sesi saat ini"
              >
                {balance}
              </span>
            </div>

            {/* MetaMask External Wallet Pill Badge */}
            <div
              className="judge-pill bg-[#0B0A0F] border border-[#2D2842] shadow-sm flex items-center gap-2"
              style={{ padding: '6px 14px' }}
            >
              <IconMetaMask size={14} className="shrink-0" />
              <span className="text-[#9E98B0] text-[11px] font-semibold">MetaMask:</span>
              {metaMask.isConnected && metaMask.address ? (
                <>
                  <span
                    className="font-mono text-[#F4F2F7] text-[11px]"
                    title={metaMask.address}
                  >
                    {metaMask.address.slice(0, 6)}...{metaMask.address.slice(-4)}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold rounded ${
                      metaMask.isMonadTestnet
                        ? 'bg-[#2E9E6B]/20 text-[#2E9E6B] border border-[#2E9E6B]/40'
                        : 'bg-[#E67E22]/20 text-[#E67E22] border border-[#E67E22]/40'
                    }`}
                    style={{ padding: '3px 8px' }}
                    title={metaMask.isMonadTestnet ? 'Saldo MetaMask di Monad Testnet' : 'Beralih ke Monad Testnet'}
                  >
                    {metaMask.balance}
                  </span>
                </>
              ) : (
                <button
                  onClick={() => metaMask.connect()}
                  className="text-[11px] font-bold text-[#F6851B] hover:text-[#FFA04D] transition-colors cursor-pointer select-none"
                  title="Sambungkan Dompet MetaMask"
                >
                  + Sambungkan
                </button>
              )}
            </div>

            {/* GitHub Repo */}
            <div
              className="judge-pill hidden xl:inline-flex bg-[#0B0A0F] border border-[#2D2842] items-center gap-2"
              style={{ padding: '6px 14px' }}
            >
              <span className="text-[#9E98B0] text-[11px]">Repo:</span>
              <span className="font-mono text-[#F4F2F7] text-[11px]">santoso/Mythomachy</span>
              <button
                onClick={handleCopyRepo}
                className="p-0.5 text-[#9E98B0] hover:text-[#D4AF37] transition-colors cursor-pointer"
                title="Salin Link Repo"
              >
                {copiedRepo ? <IconCheck size={13} color="#2E9E6B" /> : <IconCopy size={13} />}
              </button>
              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                className="p-0.5 text-[#9E98B0] hover:text-[#6E56CF] transition-colors cursor-pointer"
                title="Buka Repository"
              >
                <IconExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* 3. Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Button 1: Isi Energi Sesi (Faucet Otomatis) */}
            <button
              onClick={handleAutoFund}
              disabled={funding}
              className={`btn-faucet font-cinzel font-bold text-xs tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 ${
                hasBalance
                  ? 'bg-[#1F1B2E] border border-[#6E56CF]/60 text-[#D4AF37] hover:bg-[#6E56CF]/30'
                  : 'bg-gradient-to-r from-[#6E56CF] to-[#4D38A2] border border-[#9D88F5] text-white animate-pulse'
              }`}
              style={{ padding: '7px 16px' }}
              title="Kirim 0.02 MON gas top-up otomatis ke dompet sesi via gas sponsor"
            >
              <IconFuel size={14} color={hasBalance ? '#D4AF37' : '#FFFFFF'} />
              <span>{funding ? 'Mengisi Gas...' : 'Isi Energi Sesi (Faucet)'}</span>
            </button>

            {/* Button 2: Trigger Live On-Chain Proof (With Glowing Golden Lightning Icon) */}
            <button
              onClick={handleRunLiveProof}
              disabled={testing}
              className="btn-trigger-proof font-cinzel font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
              style={{ padding: '7px 18px' }}
              title="Kirim transaksi nyata ke Monad Testnet dan dapatkan tautan bukti tanda terima explorer"
            >
              <IconLightning size={15} color="#F5D167" />
              <span>{testing ? 'Mengirim Transaksi...' : 'Trigger Live On-Chain Proof'}</span>
            </button>

            {/* Optional Sponsor Key Config Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 rounded-lg bg-[#0B0A0F] border border-[#2D2842] text-[#9E98B0] hover:text-[#D4AF37] transition-all cursor-pointer"
              title="Konfigurasi Sponsor Key Kustom"
            >
              <IconSettings size={15} />
            </button>
          </div>
        </div>

        {/* Optional Sponsor Key Popover Input */}
        {showConfig && (
          <div
            className="w-full rounded-xl bg-[#0B0A0F] border border-[#D4AF37]/40 flex flex-wrap items-center gap-2.5 text-left animate-fade-in"
            style={{ padding: '12px 16px' }}
          >
            <span className="text-[11px] text-[#D4AF37] font-semibold whitespace-nowrap">
              Kunci Sponsor Gas (VITE_TESTNET_SPONSOR_KEY):
            </span>
            <input
              type="password"
              placeholder="0x... (Private Key untuk mendanai 0.02 MON)"
              value={sponsorInput}
              onChange={e => setSponsorInput(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-1.5 rounded-lg bg-[#14121D] border border-[#2D2842] text-[#F4F2F7] font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              onClick={handleSaveSponsorKey}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0B0A0F] font-bold text-[11px] cursor-pointer hover:brightness-110 font-cinzel"
            >
              Simpan & Danai
            </button>
            <button
              onClick={() => setShowConfig(false)}
              className="px-2.5 py-1.5 text-[#9E98B0] hover:text-white text-[11px] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Status / Error Banner Strip (Single-line, Well-Padded, with Solution Fallback) */}
        {fundingStatus && (
          <div
            className={
              fundingStatus.isError
                ? 'judge-error-banner animate-fade-in'
                : 'w-full flex items-center justify-between rounded-xl bg-[#0B0A0F]/90 border border-[#2E9E6B]/40 text-[11px] animate-fade-in font-mono text-[#2E9E6B]'
            }
            style={{ padding: '10px 16px' }}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className={`shrink-0 ${fundingStatus.isError ? 'text-amber-400 font-bold' : 'text-[#2E9E6B]'}`}>
                {fundingStatus.isError ? '⚠️' : '✓'}
              </span>
              <span className="truncate">{fundingStatus.text}</span>
              {fundingStatus.txHash && (
                <a
                  href={`${MONAD_CONFIG.explorerUrl}/tx/${fundingStatus.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[#D4AF37] hover:text-white ml-1 inline-flex items-center gap-0.5"
                >
                  <span>Tx: {fundingStatus.txHash.slice(0, 10)}...</span>
                  <IconExternalLink size={11} />
                </a>
              )}
            </div>

            {fundingStatus.isError && fundingStatus.canSimulate && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEnableSimulatedProof}
                  className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0B0A0F] font-bold text-xs hover:bg-[#E5C158] transition-colors cursor-pointer shadow-sm font-cinzel"
                  title="Gunakan simulasi sesi agar fitur Trigger On-Chain Proof tetap dapat dicoba juri"
                >
                  Gunakan Bukti Simulasi
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-2.5 py-1 rounded-full bg-[#1F1B2E] border border-[#2D2842] text-[#D4AF37] hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Kunci Kustom
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live On-Chain Proof Result Strip */}
        {testResult && (
          <div
            className="w-full flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-[#0B0A0F]/90 border border-[#2D2842] text-[11px] animate-fade-in font-mono"
            style={{ padding: '10px 16px' }}
          >
            <div className="flex flex-wrap items-center gap-2.5 text-[#F4F2F7]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2E9E6B]/15 border border-[#2E9E6B]/40 text-[#2E9E6B]">
                <span>Latensi RPC:</span>
                <strong className="text-white font-bold">{testResult.latencyMs} ms</strong>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6E56CF]/15 border border-[#6E56CF]/40 text-[#9D88F5]">
                <span>Blok Monad:</span>
                <strong className="text-white font-bold">#{testResult.blockNumber.toLocaleString('id-ID')}</strong>
              </div>

              {testResult.txHash && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
                  <span>Bukti Tx:</span>
                  <a
                    href={testResult.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-white hover:text-[#D4AF37] inline-flex items-center gap-1"
                    title="Buka Tanda Terima Transaksi di Monad Explorer"
                  >
                    <span>{testResult.txHash.slice(0, 10)}...{testResult.txHash.slice(-8)}</span>
                    <IconExternalLink size={12} />
                  </a>
                </div>
              )}

              {testResult.simulated && (
                <span className="text-[#E5C158] text-[11px] font-semibold">
                  (Mode Simulasi Sesi Terverifikasi)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
