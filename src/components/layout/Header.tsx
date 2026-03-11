"use client";

import { useState, useEffect, useRef } from 'react';
import { Wallet, Globe, Bell, LogOut, CheckCircle, Mail, User } from 'lucide-react';
import { ethers } from 'ethers';
import SettingsButton from '@/components/ui/SettingsButton';

export default function Header() {
    const [account, setAccount] = useState<string | null>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);

    // Auto-close popups when clicking outside
    const notifRef = useRef<HTMLDivElement>(null);
    const walletRef = useRef<HTMLDivElement>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (error) {
                console.error("User rejected request", error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    useEffect(() => {
        // Check if already connected on load
        const checkConnection = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                }
            }
        };
        checkConnection();

        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
            if (walletRef.current && !walletRef.current.contains(event.target as Node)) setIsWalletOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const logoutWallet = () => {
        setAccount(null);
        setIsWalletOpen(false);
    };

    return (
        <header style={{
            height: '60px',
            borderBottom: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: 'var(--bg-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            overflow: 'visible'
        }}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="SMC AI" className="header-logo" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
                <h2 className="header-logo" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px' }}>
                    SMC<span style={{ color: 'var(--accent-cyan)' }}>AI</span>
                </h2>
            </div>

            <div className="header-right flex-center" style={{ gap: '12px' }}>
                {/* Network locked to BSC */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png"
                        alt="BSC Logo"
                        style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                    />
                    <span className="bsc-label" style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>BSC</span>
                    <span className="bsc-label-full" style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Mainnet</span>
                </div>

                <SettingsButton />

                {/* Notifications Popup — hidden on mobile */}
                <div className="notif-desktop" style={{ position: 'relative' }} ref={notifRef}>
                    <button
                        className="btn-linear-icon"
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        style={{ position: 'relative' }}
                    >
                        <Bell size={20} />
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
                    </button>

                    {isNotifOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute', top: 'calc(100% + 12px)', right: '-60px', width: '320px',
                            padding: '16px', zIndex: 150, borderRadius: '8px',
                            boxShadow: '4px 4px 0px rgba(0,0,0,0.5)', border: '2px solid var(--border-color)'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={16} className="text-cyan" /> System Updates
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Welcome to SMC AI V2! 🚀</h5>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        Experience our newly overhauled terminal. Smart money tracking is now live, and the AI agent is ready to assist you on the BSC network.
                                    </p>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'block' }}>Just now</span>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--success)' }}>
                                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Network Upgrade</h5>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        BSC node latency improved by 45%. Trade execution speeds are optimal.
                                    </p>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'block' }}>2 hours ago</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative', zIndex: 1000 }} ref={walletRef}>
                    <button
                        className={account ? "btn-secondary flex-center" : "btn-primary flex-center"}
                        style={{ gap: '8px' }}
                        onClick={() => {
                            if (!account) connectWallet();
                            else setIsWalletOpen(!isWalletOpen);
                        }}
                    >
                        <Wallet size={16} />
                        <span style={{ fontWeight: 600 }}>{account ? formatAddress(account) : 'Connect'}</span>
                    </button>

                    {isWalletOpen && account && (
                        <div className="glass-panel" style={{
                            position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '260px',
                            padding: '16px', zIndex: 150, borderRadius: '8px',
                            boxShadow: '4px 4px 0px rgba(0,0,0,0.5)', border: '2px solid var(--border-color)'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--bg-color)', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-cyan)' }}>
                                    <User size={24} className="text-cyan" />
                                </div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CONNECTED VIA WEB3</p>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', wordBreak: 'break-all' }}>
                                    {account}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                                    <CheckCircle size={12} /> Live Network
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />

                            <button className="btn-secondary" style={{ width: '100%', marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '8px', opacity: 0.7 }} disabled>
                                <Globe size={16} /> Login Google (Soon)
                            </button>

                            <button className="btn-primary" onClick={logoutWallet} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--danger)', color: '#fff', border: 'none' }}>
                                <LogOut size={16} /> Disconnect Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}
