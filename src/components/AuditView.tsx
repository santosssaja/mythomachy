import React, { useState, useEffect } from 'react';
import {
  fetchMonadAuditData,
  MonadAuditData,
  getContractAddress,
  setCustomContractAddress,
  getSponsorKey,
  setSponsorKey,
  ensureBurnerFunded,
  testReadProfile,
  testWriteCreateRoom,
  testWriteSummon
} from '../services/monadRpc';
import { getBurnerAddress, resetBurnerWallet, getStoredPlayerProfile } from '../services/burnerSigner';
import { MONAD_CONFIG } from '../config/monad';
import { CHARACTER_LIST } from '../config/characters';
import { PlayerProfile } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconRefresh,
  IconLightning,
  IconFuel,
  IconServer,
  IconTerminal,
  IconDatabase,
  IconClose,
  IconTrophy
} from './SvgIcons';

interface AuditViewProps {
  onClose: () => void;
  playerProfile: PlayerProfile;
  onProfileUpdated: (profile: PlayerProfile) => void;
}

type AuditTab = 'telemetry' | 'contract' | 'wallet' | 'playground';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  title: string;
  detail?: string;
  txHash?: string;
  latencyMs?: number;
}

export const AuditView: React.FC<AuditViewProps> = ({
  onClose,
  playerProfile,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<AuditTab>('telemetry');
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<MonadAuditData | null>(null);

  // Playground execution states
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('id-ID'),
      type: 'info',
      title: 'Konsol Audit Monad Siap',
      detail: `Terhubung ke ${MONAD_CONFIG.rpcUrl} (Chain ID: ${MONAD_CONFIG.chainId})`
    }
  ]);

  // Copy badges
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedBurner, setCopiedBurner] = useState(false);
  const [copiedBlockHash, setCopiedBlockHash] = useState(false);

  // Settings / Overrides modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customContractInput, setCustomContractInput] = useState('');
  const [customSponsorInput, setCustomSponsorInput] = useState('');
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('id-ID')
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchMonadAuditData();
      setAuditData(data);
      if (!silent) {
        addLog({
          type: 'success',
          title: 'Sinkronisasi Telemetri RPC Berhasil',
          detail: `Blok #${data.blockNumber.toLocaleString()} • Gas Limit: ${data.gasLimit} • Latensi: ${data.latencyMs}ms`,
          latencyMs: data.latencyMs
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog({
        type: 'error',
        title: 'Gagal Mengambil Telemetri RPC',
        detail: msg
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, type: 'contract' | 'burner' | 'block') => {
    navigator.clipboard.writeText(text);
    if (type === 'contract') {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else if (type === 'burner') {
      setCopiedBurner(true);
      setTimeout(() => setCopiedBurner(false), 2000);
    } else if (type === 'block') {
      setCopiedBlockHash(true);
      setTimeout(() => setCopiedBlockHash(false), 2000);
    }
    soundEngine.playClickSound();
  };

  // 1-Click Faucet Funding
  const handleAutoFund = async () => {
    soundEngine.playClickSound();
    setFaucetLoading(true);
    setFaucetMessage(null);
    try {
      addLog({
        type: 'info',
        title: 'Meminta Top-up Faucet Sponsor (0.02 MON)...',
        detail: `Dompet Tujuan: ${getBurnerAddress()}`
      });
      const res = await ensureBurnerFunded();
      if (res.success) {
        soundEngine.playMatchStartSound();
        const msg = res.alreadyFunded
          ? 'Saldo sesi sudah cukup (>= 0.002 MON).'
          : '+0.02 MON berhasil ditransfer oleh Gas Sponsor!';
        setFaucetMessage(msg);
        addLog({
          type: 'success',
          title: 'Top-up Gas Sponsor Berhasil',
          detail: msg,
          txHash: res.hash
        });
        await loadData(true);
      } else {
        const errMsg = res.error || 'Gagal mengisi saldo sponsor.';
        setFaucetMessage(errMsg);
        addLog({
          type: 'warn',
          title: 'Top-up Gas Tidak Selesai',
          detail: errMsg
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFaucetMessage(msg);
      addLog({
        type: 'error',
        title: 'Error Faucet',
        detail: msg
      });
    } finally {
      setFaucetLoading(false);
      setTimeout(() => setFaucetMessage(null), 8000);
    }
  };

  // Reset burner wallet
  const handleResetBurner = () => {
    if (window.confirm('Hasilkan dompet sesi burner baru? Kunci privat lama akan diganti.')) {
      soundEngine.playThunderSound();
      const newAddr = resetBurnerWallet();
      const updatedProfile = getStoredPlayerProfile();
      onProfileUpdated(updatedProfile);
      addLog({
        type: 'info',
        title: 'Dompet Sesi Baru Dihasilkan',
        detail: `Alamat baru: ${newAddr}`
      });
      loadData(true);
    }
  };

  // Playground Test 1: Read Call
  const handleTestRead = async () => {
    soundEngine.playClickSound();
    setRunningTest('read');
    addLog({
      type: 'info',
      title: 'Memulai Panggilan Baca On-Chain...',
      detail: `Method: getPlayerProfile(${getBurnerAddress()})`
    });
    try {
      const res = await testReadProfile();
      addLog({
        type: 'success',
        title: `Panggilan Baca Selesai (${res.source === 'contract' ? 'Smart Contract' : 'Cache Sesi'})`,
        detail: JSON.stringify(res.data),
        latencyMs: res.latencyMs
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog({
        type: 'error',
        title: 'Gagal Membaca Profil On-Chain',
        detail: msg
      });
    } finally {
      setRunningTest(null);
    }
  };

  // Playground Test 2: Write Call (createRoom)
  const handleTestCreateRoom = async () => {
    soundEngine.playClickSound();
    setRunningTest('createRoom');
    addLog({
      type: 'info',
      title: 'Mengirim Transaksi Laga On-Chain...',
      detail: `Method: createRoom(bytes6 roomCode, bool isPrivate, uint8 mapId)`
    });
    try {
      const res = await testWriteCreateRoom(0);
      if (res.success) {
        soundEngine.playThunderSound();
        addLog({
          type: 'success',
          title: `Transaksi createRoom Berhasil Terkonfirmasi! [Kamar: ${res.roomCode}]`,
          detail: res.simulated
            ? 'Eksekusi simulasi instan (Saldo 0 MON).'
            : 'Transaksi tercatat pada blok Monad Testnet.',
          txHash: res.hash,
          latencyMs: res.latencyMs
        });
        await loadData(true);
      } else {
        addLog({
          type: 'error',
          title: 'Transaksi createRoom Gagal',
          detail: res.error || 'Terjadi kesalahan eksekusi RPC.'
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog({
        type: 'error',
        title: 'Error Transaksi Laga',
        detail: msg
      });
    } finally {
      setRunningTest(null);
    }
  };

  // Playground Test 3: Write Call (summonApexLegend)
  const handleTestSummon = async () => {
    soundEngine.playClickSound();
    setRunningTest('summon');
    addLog({
      type: 'info',
      title: 'Mengirim Transaksi Gacha Pemanggilan...',
      detail: `Method: summonApexLegend(uint256 clientSeed)`
    });
    try {
      const res = await testWriteSummon();
      if (res.success) {
        soundEngine.playThunderSound();
        addLog({
          type: 'success',
          title: 'Transaksi Gacha Berhasil Terkonfirmasi!',
          detail: res.simulated
            ? 'Eksekusi simulasi instan.'
            : 'Hasil pemanggilan PRNG on-chain tercatat di Monad.',
          txHash: res.hash,
          latencyMs: res.latencyMs
        });
        const updated = getStoredPlayerProfile();
        onProfileUpdated(updated);
        await loadData(true);
      } else {
        addLog({
          type: 'error',
          title: 'Transaksi Gacha Gagal',
          detail: res.error || 'Terjadi kesalahan eksekusi RPC.'
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog({
        type: 'error',
        title: 'Error Transaksi Gacha',
        detail: msg
      });
    } finally {
      setRunningTest(null);
    }
  };

  const handleSaveConfig = () => {
    if (customContractInput.trim()) {
      setCustomContractAddress(customContractInput.trim());
    }
    if (customSponsorInput.trim()) {
      setSponsorKey(customSponsorInput.trim());
    }
    setShowConfigModal(false);
    setCustomContractInput('');
    setCustomSponsorInput('');
    soundEngine.playClickSound();
    loadData();
  };

  const currentContract = auditData?.contractAddress || getContractAddress();
  const currentBurner = auditData?.burnerAddress || getBurnerAddress();
  const currentLatency = auditData?.latencyMs || 0;
  const isHealthy = currentLatency < 1200;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col max-w-[1520px] mx-auto audit-dashboard relative z-10 animate-fade-in overflow-y-auto">
      {/* Top Header Navigation Bar */}
      <div
        className="card-surface flex flex-wrap items-center justify-between gap-4 border border-[#D4AF37]/30 shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
        style={{ padding: '16px 20px' }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6E56CF] via-[#1F1B2E] to-[#D4AF37] p-[1.5px] shadow-[0_0_16px_rgba(110,86,207,0.5)] shrink-0">
            <div className="w-full h-full bg-[#0B0A0F] rounded-[10px] flex items-center justify-center text-[#D4AF37]">
              <IconServer size={22} color="#D4AF37" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-cinzel font-black text-base sm:text-lg tracking-wider text-[#F4F2F7]">
                AUDIT BLOCKCHAIN & TELEMETRI MONAD
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2E9E6B] px-2.5 py-1 rounded bg-[#2E9E6B]/15 border border-[#2E9E6B]/40 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E9E6B] animate-pulse" />
                MONAD 10143 (TESTNET)
              </span>
            </div>
            <p className="text-xs text-[#9E98B0] mt-0.5">
              Pusat Diagnostik Real-Time: Verifikasi RPC, Konsensus MonadBFT, Smart Contract, dan Eksekusi On-Chain
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="header-pill bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF] transition-colors text-xs font-bold cursor-pointer disabled:opacity-50"
            style={{ padding: '8px 16px' }}
            title="Segarkan Data Telemetri"
          >
            <IconRefresh size={14} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="header-pill bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors text-xs font-bold cursor-pointer"
            style={{ padding: '8px 16px' }}
            title="Pengaturan Kunci Sponsor & Kontrak"
          >
            <IconFuel size={14} color="#D4AF37" />
            <span className="hidden sm:inline">Konfigurasi</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              onClose();
            }}
            className="header-pill bg-gradient-to-r from-[#D4AF37]/25 via-[#1F1B2E] to-[#6E56CF]/25 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/35 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all text-xs font-bold cursor-pointer font-cinzel"
            style={{ padding: '8px 20px' }}
          >
            <IconClose size={14} />
            <span>Tutup Audit</span>
          </button>
        </div>
      </div>

      {/* Hero Telemetry Cards (4 Key Parameters with Safe Internal Padding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: RPC Latency */}
        <div
          className="metric-card card-surface relative overflow-hidden group hover:border-[#6E56CF] transition-colors"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-center justify-between text-xs text-[#9E98B0] mb-2 font-cinzel">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <IconLightning size={14} color={isHealthy ? '#2E9E6B' : '#E056FD'} />
              Latensi Node RPC
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isHealthy ? 'bg-[#2E9E6B]/15 text-[#2E9E6B] border border-[#2E9E6B]/30' : 'bg-[#E056FD]/15 text-[#E056FD]'
            }`}>
              {currentLatency > 0 ? (currentLatency < 800 ? 'SANGAT CEPAT' : 'STABIL') : 'MEMUAT...'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#F4F2F7]">
              {currentLatency > 0 ? `${currentLatency}` : '---'}
            </span>
            <span className="text-xs font-mono text-[#D4AF37]">ms</span>
          </div>
          <p className="text-[11px] text-[#9E98B0] mt-2">
            Respons instan via endpoint resmi Monad Testnet
          </p>
        </div>

        {/* Card 2: Latest Block Height */}
        <div
          className="metric-card card-surface relative overflow-hidden group hover:border-[#6E56CF] transition-colors"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-center justify-between text-xs text-[#9E98B0] mb-2 font-cinzel">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <IconDatabase size={14} color="#6E56CF" />
              Tinggi Blok Terkini
            </span>
            <span className="text-[10px] font-mono text-[#9D88F5] bg-[#6E56CF]/15 px-2 py-0.5 rounded border border-[#6E56CF]/30 font-bold">
              ~300ms / BLOK
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#D4AF37]">
              {auditData ? auditData.blockNumber.toLocaleString('id-ID') : '---'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9E98B0] mt-2 truncate">
            <span>Hash:</span>
            <span className="font-mono text-[#F4F2F7] truncate">
              {auditData?.blockHash ? `${auditData.blockHash.slice(0, 14)}...` : '---'}
            </span>
            {auditData?.blockHash && (
              <button
                onClick={() => handleCopy(auditData.blockHash, 'block')}
                className="text-[#D4AF37] hover:text-white p-0.5 transition-colors shrink-0"
                title="Salin Block Hash"
              >
                {copiedBlockHash ? <IconCheck size={12} color="#2E9E6B" /> : <IconCopy size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Gas & Throughput Limits */}
        <div
          className="metric-card card-surface relative overflow-hidden group hover:border-[#6E56CF] transition-colors"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-center justify-between text-xs text-[#9E98B0] mb-2 font-cinzel">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <IconFuel size={14} color="#D4AF37" />
              Batas Gas Blok
            </span>
            <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30 font-bold">
              150M GAS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#F4F2F7]">
              {auditData ? auditData.gasLimit : '150,000,000'}
            </span>
          </div>
          <p className="text-[11px] text-[#9E98B0] mt-2">
            Base Fee: <span className="text-[#D4AF37] font-mono font-bold">{auditData?.baseFeeGwei || '100'} Gwei</span> (5x kapasitas EVM standar)
          </p>
        </div>

        {/* Card 4: Burner Session Balance (With Color Sync Fix) */}
        <div
          className="metric-card card-surface relative overflow-hidden group hover:border-[#6E56CF] transition-colors"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-center justify-between text-xs text-[#9E98B0] mb-2 font-cinzel">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <IconTrophy size={14} color={auditData?.isFunded ? '#2E9E6B' : '#FF5555'} />
              Saldo Dompet Sesi
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              auditData?.isFunded
                ? 'bg-[#2E9E6B]/15 text-[#2E9E6B] border border-[#2E9E6B]/30'
                : 'bg-[#FF5555]/15 text-[#FF5555] border border-[#FF5555]/30'
            }`}>
              {auditData?.isFunded ? 'SIAP EKSEKUSI' : 'BUTUH GAS'}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            {/* Color reflects balance state: RED/CORAL if low, GREEN if funded */}
            <span className={`text-xl sm:text-2xl font-black font-mono ${
              auditData?.isFunded ? 'text-[#2E9E6B]' : 'text-[#FF5555]'
            }`}>
              {auditData?.burnerBalanceFormatted || '0.0000 MON'}
            </span>
            <button
              onClick={handleAutoFund}
              disabled={faucetLoading}
              className="text-[11px] font-bold font-cinzel text-[#D4AF37] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 px-2.5 py-1 rounded transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Isi Saldo Sesi Otomatis dari Gas Sponsor"
            >
              {faucetLoading ? 'Mengisi...' : '+0.02 MON'}
            </button>
          </div>
          {faucetMessage ? (
            <p className="text-[10px] text-[#D4AF37] font-medium mt-2 truncate">
              {faucetMessage}
            </p>
          ) : (
            <p className="text-[11px] text-[#9E98B0] mt-2 truncate">
              Kebutuhan Gas: &gt;= 0.002 MON per transaksi
            </p>
          )}
        </div>
      </div>

      {/* Main Content: Segmented Tabs with Generous Spacing and Margins */}
      <div
        className="telemetry-tabs border-b border-[#2D2842] pb-2 overflow-x-auto"
        style={{ margin: '16px 0', gap: '10px' }}
      >
        <button
          onClick={() => {
            soundEngine.playClickSound();
            setActiveTab('telemetry');
          }}
          className={`telemetry-tab-btn text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-[#6E56CF] text-white shadow-[0_0_12px_rgba(110,86,207,0.5)]'
              : 'text-[#9E98B0] hover:text-[#F4F2F7] hover:bg-[#1F1B2E]'
          }`}
          style={{ padding: '8px 16px' }}
        >
          <IconServer size={14} />
          <span>Jaringan & Konsensus</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            setActiveTab('contract');
          }}
          className={`telemetry-tab-btn text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === 'contract'
              ? 'bg-[#6E56CF] text-white shadow-[0_0_12px_rgba(110,86,207,0.5)]'
              : 'text-[#9E98B0] hover:text-[#F4F2F7] hover:bg-[#1F1B2E]'
          }`}
          style={{ padding: '8px 16px' }}
        >
          <IconDatabase size={14} />
          <span>Smart Contract & ABI</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            setActiveTab('wallet');
          }}
          className={`telemetry-tab-btn text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === 'wallet'
              ? 'bg-[#6E56CF] text-white shadow-[0_0_12px_rgba(110,86,207,0.5)]'
              : 'text-[#9E98B0] hover:text-[#F4F2F7] hover:bg-[#1F1B2E]'
          }`}
          style={{ padding: '8px 16px' }}
        >
          <IconFuel size={14} />
          <span>Dompet Sesi & Bitmask</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            setActiveTab('playground');
          }}
          className={`telemetry-tab-btn text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === 'playground'
              ? 'bg-[#D4AF37] text-[#0B0A0F] shadow-[0_0_14px_rgba(212,175,55,0.4)]'
              : 'text-[#9E98B0] hover:text-[#D4AF37] hover:bg-[#1F1B2E]'
          }`}
          style={{ padding: '8px 16px' }}
        >
          <IconTerminal size={14} />
          <span>Uji On-Chain & Log Terminal</span>
        </button>
      </div>

      {/* TAB 1: JARINGAN & KONSENSUS MONAD */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div
            className="network-params-panel lg:col-span-2 card-surface space-y-4"
            style={{ padding: '20px 24px' }}
          >
            <h2 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 mb-3">
              <IconServer size={16} color="#D4AF37" />
              Parameter Jaringan Monad Testnet
            </h2>

            <div className="space-y-3 text-xs">
              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">RPC Endpoint</span>
                <span className="font-mono text-[#F4F2F7] font-semibold">{MONAD_CONFIG.rpcUrl}</span>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Chain ID</span>
                <span className="font-mono text-[#F4F2F7] font-semibold">{MONAD_CONFIG.chainId} (Hex: 0x279f)</span>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Mata Uang Asli (Native Token)</span>
                <span className="font-mono text-[#D4AF37] font-semibold">MON (18 desimal)</span>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Waktu Blok (Target Block Time)</span>
                <span className="font-mono text-[#2E9E6B] font-semibold">~300 - 400 milidetik</span>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Finalitas Transaksi (Finality Time)</span>
                <span className="font-mono text-[#2E9E6B] font-semibold">~600 ms (1-slot BFT Consensus)</span>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Penjelajah Blok (Block Explorer)</span>
                <a
                  href={MONAD_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[#9D88F5] hover:text-white flex items-center gap-1.5 underline transition-colors"
                >
                  {MONAD_CONFIG.explorerUrl}
                  <IconExternalLink size={12} />
                </a>
              </div>

              <div className="param-row" style={{ padding: '12px 16px' }}>
                <span className="text-[#9E98B0]">Pemeriksaan Sinkronisasi Terakhir</span>
                <span className="font-mono text-[#F4F2F7]">
                  {auditData ? auditData.fetchedAt.toLocaleTimeString('id-ID') : 'Sedang memuat...'}
                </span>
              </div>
            </div>
          </div>

          <div
            className="architecture-panel card-surface space-y-4"
            style={{ padding: '20px 24px' }}
          >
            <h2 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 mb-3">
              <IconLightning size={16} color="#D4AF37" />
              Keunggulan Arsitektur Monad
            </h2>

            <div className="space-y-3.5 text-xs text-[#C5C0D0]">
              <div
                className="rounded-xl bg-[#14121D] border border-[#2D2842]"
                style={{ padding: '14px 18px' }}
              >
                <div className="font-bold text-[#F4F2F7] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6E56CF]" />
                  1. Asynchronous Execution
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-relaxed">
                  Konsensus dan eksekusi dipisahkan secara asinkron. Validator menyetujui urutan transaksi sebelum eksekusi berlangsung, memotong jeda latensi komputasi hingga di bawah 600ms.
                </p>
              </div>

              <div
                className="rounded-xl bg-[#14121D] border border-[#2D2842]"
                style={{ padding: '14px 18px' }}
              >
                <div className="font-bold text-[#F4F2F7] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  2. Biaya Gas Berdasarkan Gas Limit
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-relaxed">
                  Monad menagih gas berdasarkan <span className="text-[#D4AF37]">gas_limit</span> yang ditentukan, bukan gas terpakai. Mythomachy menggunakan limit 250.000 gas presisi untuk menghemat biaya pemain.
                </p>
              </div>

              <div
                className="rounded-xl bg-[#14121D] border border-[#2D2842]"
                style={{ padding: '14px 18px' }}
              >
                <div className="font-bold text-[#F4F2F7] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E9E6B]" />
                  3. MonadDb Parallel Execution
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-relaxed">
                  Penyimpanan kustom yang mengizinkan pemrosesan transaksi konkuren tanpa memblokir state global, mampu menangani 10.000 TPS real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART CONTRACT & ABI EXPLORER */}
      {activeTab === 'contract' && (
        <div className="space-y-5">
          <div className="card-surface" style={{ padding: '20px 24px' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">
                  Smart Contract Arena Mythomachy (`MythomachyArena.sol`)
                </h2>
                <p className="text-xs text-[#9E98B0] mt-0.5">
                  Kontrak terdesentralisasi untuk pencatatan skor pertandingan, pendaftaran sesi laga, dan pemanggilan legenda.
                </p>
              </div>

              <a
                href={`${MONAD_CONFIG.explorerUrl}/address/${currentContract}`}
                target="_blank"
                rel="noreferrer"
                className="header-pill bg-[#6E56CF]/20 border border-[#6E56CF]/50 text-[#9D88F5] hover:text-white hover:bg-[#6E56CF]/30 transition-all text-xs font-bold font-cinzel flex items-center gap-1.5"
                style={{ padding: '8px 16px' }}
              >
                <span>Buka di Monad Explorer</span>
                <IconExternalLink size={12} />
              </a>
            </div>

            <div
              className="rounded-xl bg-[#14121D] border border-[#2D2842] flex flex-wrap items-center justify-between gap-3 text-xs"
              style={{ padding: '14px 18px' }}
            >
              <span className="text-[#9E98B0] font-medium">Alamat Kontrak Aktif:</span>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[#D4AF37] font-semibold break-all">{currentContract}</span>
                <button
                  onClick={() => handleCopy(currentContract, 'contract')}
                  className="p-1.5 rounded-lg bg-[#1F1B2E] border border-[#2D2842] text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                  title="Salin Alamat Kontrak"
                >
                  {copiedContract ? <IconCheck size={14} color="#2E9E6B" /> : <IconCopy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* ABI Function Registry */}
          <div className="card-surface" style={{ padding: '20px 24px' }}>
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#F4F2F7] mb-4">
              Daftar Fungsi Smart Contract (ABI Public Interface)
            </h3>

            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'createRoom(bytes6 roomCode, bool isPrivate, uint8 mapId)',
                  type: 'Nonpayable (Write)',
                  desc: 'Mendaftarkan ruang laga baru on-chain dengan kode acak dan ID medan laga.'
                },
                {
                  name: 'joinRoom(bytes6 roomCode)',
                  type: 'Nonpayable (Write)',
                  desc: 'Menghubungkan penantang kedua ke ruang laga yang telah dibuat host.'
                },
                {
                  name: 'settleMatch(bytes6 roomCode, address winner, uint8 hostLegend, uint8 challengerLegend)',
                  type: 'Nonpayable (Write)',
                  desc: 'Menyelesaikan skor pertarungan, mencatat mutasi kemenangan pemenang di blockchain Monad.'
                },
                {
                  name: 'summonApexLegend(uint256 clientSeed)',
                  type: 'Payable (Write)',
                  desc: 'Menjalankan pemanggilan Kuil Legenda dengan benih acak untuk membuka petarung tingkat Apex.'
                },
                {
                  name: 'getPlayerProfile(address player)',
                  type: 'View (Read)',
                  desc: 'Membaca profil pemain: jumlah pecahan relik, kemenangan, bitmask petarung, dan counter pity.'
                },
                {
                  name: 'getPublicRoomsCount()',
                  type: 'View (Read)',
                  desc: 'Mengambil jumlah ruang laga publik yang sedang aktif menunggu penantang.'
                },
                {
                  name: 'ALL_UNLOCKED_MASK() / DEFAULT_UNLOCKED_MASK()',
                  type: 'View (Read)',
                  desc: 'Konstanta bitmask status kepemilikan petarung default dan apex.'
                }
              ].map((fn, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#14121D] border border-[#2D2842] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ padding: '12px 18px' }}
                >
                  <div>
                    <div className="font-mono font-bold text-[#F4F2F7]">{fn.name}</div>
                    <div className="text-[11px] text-[#9E98B0] mt-1">{fn.desc}</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border self-start sm:self-auto shrink-0 ${
                    fn.type.includes('Write')
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                      : 'bg-[#6E56CF]/15 text-[#9D88F5] border-[#6E56CF]/30'
                  }`}>
                    {fn.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOMPET SESI & BITMASK PEMAIN */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-surface space-y-4" style={{ padding: '20px 24px' }}>
            <h2 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 mb-2">
              <IconFuel size={16} color="#D4AF37" />
              Dompet Sesi Tanpa Kunci (Burner Session)
            </h2>
            <p className="text-xs text-[#9E98B0] leading-relaxed">
              Pemain tidak perlu menghubungkan ekstensi wallet pihak ketiga. Sesi akun dienkripsi secara lokal di penyimpanan peramban (browser) dan didukung gas sponsorship otomatis.
            </p>

            <div
              className="rounded-xl bg-[#14121D] border border-[#2D2842] space-y-3 text-xs"
              style={{ padding: '14px 18px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#9E98B0]">Alamat Dompet Sesi:</span>
                <button
                  onClick={() => handleCopy(currentBurner, 'burner')}
                  className="text-[#D4AF37] hover:text-white flex items-center gap-1.5 font-mono cursor-pointer"
                  title="Salin Alamat"
                >
                  {copiedBurner ? <IconCheck size={12} color="#2E9E6B" /> : <IconCopy size={12} />}
                  <span>{currentBurner.slice(0, 10)}...{currentBurner.slice(-8)}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#9E98B0]">Saldo MON Live:</span>
                <span className={`font-mono font-bold ${auditData?.isFunded ? 'text-[#2E9E6B]' : 'text-[#FF5555]'}`}>
                  {auditData?.burnerBalanceFormatted || '0.0000 MON'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#9E98B0]">Nonce Transaksi (Jumlah Tx):</span>
                <span className="font-mono text-[#F4F2F7]">
                  {auditData ? auditData.burnerNonce : 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#9E98B0]">Gas Sponsor Key:</span>
                <span className={`font-mono font-bold ${auditData?.sponsorKeyConfigured ? 'text-[#2E9E6B]' : 'text-[#D4AF37]'}`}>
                  {auditData?.sponsorKeyConfigured ? 'Terkonfigurasi (Aktif)' : 'Mode Faucet Otomatis'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleAutoFund}
                disabled={faucetLoading}
                className="header-pill bg-[#2E9E6B]/20 border border-[#2E9E6B]/50 text-[#2E9E6B] hover:bg-[#2E9E6B]/35 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
                style={{ padding: '8px 18px' }}
              >
                <IconLightning size={14} />
                <span>{faucetLoading ? 'Mengirim Gas...' : 'Isi Saldo Sesi (+0.02 MON)'}</span>
              </button>

              <button
                onClick={handleResetBurner}
                className="header-pill bg-[#1F1B2E] border border-[#FF5555]/40 text-[#FF5555] hover:bg-[#FF5555]/20 transition-all text-xs font-bold cursor-pointer"
                style={{ padding: '8px 18px' }}
              >
                <span>Hasilkan Dompet Baru</span>
              </button>
            </div>
          </div>

          {/* Character Bitmask Inspector */}
          <div className="card-surface space-y-4" style={{ padding: '20px 24px' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                <IconDatabase size={16} color="#D4AF37" />
                Bitmask Karakter Terbuka
              </h2>
              <span className="font-mono text-xs text-[#D4AF37] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                Mask: 0b{playerProfile.unlockedMask.toString(2).padStart(11, '0')}
              </span>
            </div>

            <p className="text-xs text-[#9E98B0]">
              Status kepemilikan 11 legenda disimpan efisien dalam satu variabel bit on-chain (16-bit uint):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {CHARACTER_LIST.map(char => {
                const isUnlocked = (playerProfile.unlockedMask & (1 << char.numericId)) !== 0;
                return (
                  <div
                    key={char.id}
                    className={`rounded-xl border flex items-center justify-between ${
                      isUnlocked
                        ? 'bg-[#14121D] border-[#2E9E6B]/40 text-[#F4F2F7]'
                        : 'bg-[#0B0A0F]/60 border-[#2D2842] text-[#9E98B0]'
                    }`}
                    style={{ padding: '10px 14px' }}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{char.name}</span>
                        {char.isApex && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                            APEX
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#9E98B0] mt-0.5">
                        Bit #{char.numericId} ({char.origin})
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isUnlocked
                        ? 'bg-[#2E9E6B]/20 text-[#2E9E6B]'
                        : 'bg-[#2D2842] text-[#9E98B0]'
                    }`}>
                      {isUnlocked ? 'TERBUKA' : 'TERKUNCI'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KONSOL UJI ON-CHAIN & TERMINAL LOGS */}
      {activeTab === 'playground' && (
        <div className="space-y-5">
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="card-surface flex flex-col justify-between border border-[#6E56CF]/40"
              style={{ padding: '18px 20px' }}
            >
              <div>
                <div className="text-xs font-cinzel font-bold text-[#9D88F5] uppercase mb-1.5">
                  Tes 1: Panggilan Baca (Read Call)
                </div>
                <div className="text-xs text-[#F4F2F7] font-semibold mb-1 font-mono">
                  `getPlayerProfile()`
                </div>
                <p className="text-[11px] text-[#9E98B0] mb-4">
                  Membaca data profil dompet sesi langsung dari RPC Monad.
                </p>
              </div>
              <button
                onClick={handleTestRead}
                disabled={runningTest !== null}
                className="header-pill bg-[#6E56CF] hover:bg-[#8068E6] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 justify-center w-full"
                style={{ padding: '10px 16px' }}
              >
                {runningTest === 'read' ? 'Mengeksekusi...' : 'Jalankan Panggilan Baca'}
              </button>
            </div>

            <div
              className="card-surface flex flex-col justify-between border border-[#D4AF37]/40"
              style={{ padding: '18px 20px' }}
            >
              <div>
                <div className="text-xs font-cinzel font-bold text-[#D4AF37] uppercase mb-1.5">
                  Tes 2: Transaksi Laga (Write Call)
                </div>
                <div className="text-xs text-[#F4F2F7] font-semibold mb-1 font-mono">
                  `createRoom()`
                </div>
                <p className="text-[11px] text-[#9E98B0] mb-4">
                  Membuat kamar laga on-chain dengan penandatanganan transaksi instan.
                </p>
              </div>
              <button
                onClick={handleTestCreateRoom}
                disabled={runningTest !== null}
                className="header-pill bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 justify-center font-cinzel w-full"
                style={{ padding: '10px 16px' }}
              >
                {runningTest === 'createRoom' ? 'Mengeksekusi...' : 'Kirim Transaksi Laga'}
              </button>
            </div>

            <div
              className="card-surface flex flex-col justify-between border border-[#2E9E6B]/40"
              style={{ padding: '18px 20px' }}
            >
              <div>
                <div className="text-xs font-cinzel font-bold text-[#2E9E6B] uppercase mb-1.5">
                  Tes 3: Pemanggilan Kuil (Write Call)
                </div>
                <div className="text-xs text-[#F4F2F7] font-semibold mb-1 font-mono">
                  `summonApexLegend()`
                </div>
                <p className="text-[11px] text-[#9E98B0] mb-4">
                  Menjalankan mutasi gacha legenda dengan seed acak di Monad Testnet.
                </p>
              </div>
              <button
                onClick={handleTestSummon}
                disabled={runningTest !== null}
                className="header-pill bg-[#2E9E6B] hover:bg-[#34B47B] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 justify-center w-full"
                style={{ padding: '10px 16px' }}
              >
                {runningTest === 'summon' ? 'Mengeksekusi...' : 'Kirim Transaksi Gacha'}
              </button>
            </div>
          </div>

          {/* Sleek Terminal Log Console */}
          <div
            className="card-surface border border-[#2D2842] bg-[#07060A] rounded-2xl shadow-2xl"
            style={{ padding: '20px 24px' }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2D2842] text-xs">
              <div className="flex items-center gap-2">
                <IconTerminal size={16} color="#D4AF37" />
                <span className="font-mono font-bold text-[#D4AF37]">monad-telemetry@mythomachy:~$ log --live</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#9E98B0] font-mono">
                  {logs.length} entri riwayat
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] text-[#9E98B0] hover:text-[#F4F2F7] underline cursor-pointer"
                >
                  Bersihkan
                </button>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs max-h-[380px] overflow-y-auto pr-1">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`rounded-xl border transition-colors ${
                    log.type === 'success'
                      ? 'bg-[#2E9E6B]/10 border-[#2E9E6B]/30 text-[#F4F2F7]'
                      : log.type === 'error'
                      ? 'bg-[#FF5555]/10 border-[#FF5555]/30 text-[#F4F2F7]'
                      : log.type === 'warn'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#F4F2F7]'
                      : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0]'
                  }`}
                  style={{ padding: '10px 14px' }}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold flex items-center gap-2">
                      <span className="text-[10px] text-[#9E98B0]">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'success' ? 'text-[#2E9E6B]' :
                        log.type === 'error' ? 'text-[#FF5555]' :
                        log.type === 'warn' ? 'text-[#D4AF37]' : 'text-[#9D88F5]'
                      }>
                        {log.title}
                      </span>
                    </span>

                    {log.latencyMs !== undefined && (
                      <span className="text-[10px] text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                        {log.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {log.detail && (
                    <div className="text-[11px] text-[#C5C0D0] mt-1.5 break-all leading-relaxed">
                      {log.detail}
                    </div>
                  )}

                  {log.txHash && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-[#9E98B0]">Tx Hash:</span>
                      <a
                        href={`${MONAD_CONFIG.explorerUrl}/tx/${log.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1.5 break-all"
                      >
                        {log.txHash}
                        <IconExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Configuration & Override Modal (Fixed Modal Overlay in Center Screen) */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="contract-config-modal relative w-full max-w-[520px] bg-[#12121C] border border-[#D4AF37]/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-5 animate-scale-in"
            style={{ padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D2842] pb-3.5">
              <div className="flex items-center gap-2.5">
                <IconFuel size={18} color="#D4AF37" />
                <h3 className="font-cinzel font-bold text-sm text-[#F4F2F7] uppercase tracking-wider">
                  Konfigurasi Kontrak & Kunci Sponsor
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-lg bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-white hover:border-[#D4AF37]/50 transition-colors flex items-center justify-center cursor-pointer"
                title="Tutup Modal"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9E98B0] mb-1.5 font-medium">
                  Alamat Smart Contract Kustom (0x... 42 karakter)
                </label>
                <input
                  type="text"
                  placeholder={currentContract}
                  value={customContractInput}
                  onChange={e => setCustomContractInput(e.target.value)}
                  className="w-full bg-[#0B0A0F] border border-[#2D2842] rounded-lg text-xs font-mono text-[#F4F2F7] focus:border-[#D4AF37] outline-none transition-colors"
                  style={{ padding: '10px 14px' }}
                />
              </div>

              <div>
                <label className="block text-[#9E98B0] mb-1.5 font-medium">
                  Kunci Privat Gas Sponsor Kustom (0x... 66 karakter)
                </label>
                <input
                  type="password"
                  placeholder="Kunci sponsor tersimpan aman di memori lokal browser"
                  value={customSponsorInput}
                  onChange={e => setCustomSponsorInput(e.target.value)}
                  className="w-full bg-[#0B0A0F] border border-[#2D2842] rounded-lg text-xs font-mono text-[#F4F2F7] focus:border-[#D4AF37] outline-none transition-colors"
                  style={{ padding: '10px 14px' }}
                />
                <p className="text-[10px] text-[#9E98B0] mt-1.5 leading-relaxed">
                  Kunci privat hanya disimpan di localStorage peramban lokal Anda untuk menandatangani faucet micro-top-up.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D2842]">
              <button
                onClick={() => setShowConfigModal(false)}
                className="header-pill bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] text-xs font-bold cursor-pointer"
                style={{ padding: '10px 20px' }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveConfig}
                className="header-pill bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0A0F] text-xs font-bold cursor-pointer font-cinzel shadow-md"
                style={{ padding: '10px 22px' }}
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
