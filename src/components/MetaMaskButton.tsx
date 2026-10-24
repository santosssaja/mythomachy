import React, { useState, useRef, useEffect } from 'react';
import { useMetaMask } from '../services/metamaskService';
import { MONAD_CONFIG } from '../config/monad';
import {
  IconMetaMask,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconLightning
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface MetaMaskButtonProps {
  className?: string;
  compact?: boolean;
}

export const MetaMaskButton: React.FC<MetaMaskButtonProps> = ({
  className = '',
  compact = false
}) => {
  const {
    isInstalled,
    isConnected,
    address,
    isMonadTestnet,
    balance,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance
  } = useMetaMask();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleConnect = async () => {
    soundEngine.playClickSound();
    await connect();
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    soundEngine.playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchNetwork = async () => {
    soundEngine.playClickSound();
    setIsSwitching(true);
    await switchNetwork();
    setIsSwitching(false);
  };

  const handleDisconnect = () => {
    soundEngine.playClickSound();
    disconnect();
    setIsOpen(false);
  };

  const truncateAddr = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 1. DISCONNECTED STATE: Clean Gold-Orange MetaMask Trigger
  if (!isConnected || !address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="header-pill bg-gradient-to-r from-[#F6851B]/20 via-[#14121D] to-[#E2761B]/15 border border-[#F6851B]/50 hover:border-[#F6851B] text-[#F4F2F7] hover:shadow-[0_0_18px_rgba(246,133,27,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-bold font-cinzel tracking-wider cursor-pointer flex items-center gap-2 select-none"
          style={{ padding: '7px 14px' }}
          title={isInstalled ? 'Sambungkan ke Dompet MetaMask' : 'Pasang Ekstensi MetaMask'}
        >
          <IconMetaMask size={18} className="shrink-0" />
          <span className="whitespace-nowrap">
            {isConnecting ? (
              <span className="flex items-center gap-1.5 text-[#F6851B]">
                <span className="w-2 h-2 rounded-full bg-[#F6851B] animate-ping" />
                <span>Menyambungkan...</span>
              </span>
            ) : compact ? (
              <span>MetaMask</span>
            ) : (
              <span>Sambungkan MetaMask</span>
            )}
          </span>
        </button>

        {error && (
          <div className="absolute top-full right-0 mt-2 p-2.5 bg-[#1F1212] border border-[#E74C3C]/60 rounded-xl text-[11px] text-[#FF8E8E] shadow-xl w-64 z-50 animate-fadeIn">
            <p className="leading-snug">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // 2. CONNECTED STATE: Capsule with Truncated Address, Balance & Dropdown
  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => {
          soundEngine.playClickSound();
          setIsOpen(!isOpen);
        }}
        className={`header-pill border transition-all cursor-pointer flex items-center gap-2 text-xs font-mono select-none ${
          isMonadTestnet
            ? 'bg-[#14121D] border-[#2D2842] hover:border-[#6E56CF] text-[#F4F2F7]'
            : 'bg-[#2B1B0F] border-[#E67E22] text-[#F39C12] animate-pulse'
        }`}
        style={{ padding: '6px 14px' }}
        title="Klik untuk melihat status & pengaturan MetaMask"
      >
        <IconMetaMask size={18} className="shrink-0" />

        {/* Live Network Indicator */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isMonadTestnet ? 'bg-[#2E9E6B] shadow-[0_0_6px_#2E9E6B]' : 'bg-[#E67E22] animate-ping'
          }`}
        />

        {/* Address */}
        <span className="font-bold text-xs text-[#D4AF37]">
          {truncateAddr(address)}
        </span>

        {/* MON Balance (Desktop) */}
        <span className="hidden sm:inline-block text-[11px] font-bold text-[#9E98B0] bg-[#0B0A0F] px-2 py-0.5 rounded border border-[#2D2842]">
          {balance}
        </span>
      </button>

      {/* Dropdown Details Popover */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2.5 w-80 bg-[#0B0A0F]/98 backdrop-blur-xl border border-[#2D2842] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-4.5 z-50 space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2D2842] pb-3">
            <div className="flex items-center gap-2">
              <IconMetaMask size={22} />
              <div>
                <h4 className="text-xs font-bold text-[#F4F2F7] font-cinzel tracking-wide">
                  MetaMask Terhubung
                </h4>
                <p className="text-[10px] text-[#9E98B0]">Dompet Web3 Eksternal</p>
              </div>
            </div>
            <span
              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isMonadTestnet
                  ? 'bg-[#2E9E6B]/15 border-[#2E9E6B]/40 text-[#2E9E6B]'
                  : 'bg-[#E67E22]/15 border-[#E67E22]/40 text-[#E67E22]'
              }`}
            >
              {isMonadTestnet ? 'Monad Aktif' : 'Jaringan Salah'}
            </span>
          </div>

          {/* Account Address Box */}
          <div className="bg-[#14121D] p-3 rounded-xl border border-[#2D2842] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#9E98B0]">
              <span>Alamat Dompet</span>
              <button
                onClick={handleCopy}
                className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
                title="Salin Alamat Lengkap"
              >
                {copied ? <IconCheck size={12} color="#2E9E6B" /> : <IconCopy size={12} />}
                <span className="text-[10px]">{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-[#F4F2F7] font-bold break-all select-all leading-snug">
              {address}
            </p>
          </div>

          {/* Balance & Network Status */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#14121D] p-2.5 rounded-xl border border-[#2D2842]">
              <span className="text-[10px] text-[#9E98B0] block mb-0.5">Saldo MON</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#D4AF37]">{balance}</span>
                <button
                  onClick={() => refreshBalance()}
                  className="text-[10px] text-[#6E56CF] hover:text-[#9D88F5] cursor-pointer"
                  title="Perbarui Saldo"
                >
                  Segarkan
                </button>
              </div>
            </div>

            <div className="bg-[#14121D] p-2.5 rounded-xl border border-[#2D2842]">
              <span className="text-[10px] text-[#9E98B0] block mb-0.5">Jaringan</span>
              <span className="font-bold text-[11px] text-[#F4F2F7] block truncate">
                {isMonadTestnet ? 'Monad Testnet' : 'Bukan Monad'}
              </span>
            </div>
          </div>

          {/* Wrong Network Warning & Auto-Switch Action */}
          {!isMonadTestnet && (
            <div className="bg-[#2B1B0F] border border-[#E67E22]/60 p-3 rounded-xl space-y-2">
              <p className="text-[11px] text-[#F39C12] leading-tight">
                Dompet Anda tidak berada di <strong>Monad Testnet (Chain ID 10143)</strong>.
              </p>
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="w-full py-1.5 px-3 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <IconLightning size={14} color="#000" />
                <span>{isSwitching ? 'Beralih...' : 'Beralih ke Monad Testnet'}</span>
              </button>
            </div>
          )}

          {/* Links & Disconnect Action */}
          <div className="pt-2 border-t border-[#2D2842] flex items-center justify-between gap-2">
            <a
              href={`${MONAD_CONFIG.explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#9E98B0] hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-cinzel"
            >
              <span>Monad Explorer</span>
              <IconExternalLink size={12} />
            </a>

            <button
              onClick={handleDisconnect}
              className="text-[11px] text-[#E74C3C] hover:text-[#FF7675] font-bold font-cinzel transition-colors cursor-pointer"
            >
              Putuskan Sambungan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
