"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Activity,
    Bot,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    Shield,
    Flame,
    Feather,
    Github
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isExpanded: boolean;
}

const NavItem = ({ href, icon, label, isActive, isExpanded }: NavItemProps) => (
    <Link href={href} prefetch={false} style={{ textDecoration: 'none' }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isExpanded ? '12px' : '0',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            padding: isExpanded ? '12px 16px' : '12px',
            borderRadius: '4px',
            background: isActive ? 'var(--accent-cyan)' : 'transparent',
            color: isActive ? '#000' : 'var(--text-secondary)',
            borderLeft: isActive ? '4px solid #000' : '4px solid transparent',
            transition: 'all 0.15s ease',
            height: '44px',
            minWidth: isExpanded ? '200px' : '48px',
            margin: '0 8px',
            boxShadow: isActive ? '3px 3px 0px rgba(0,0,0,0.5)' : 'none'
        }} className={isActive ? "" : "hover-linear-glow"}>
            <div style={{ color: isActive ? '#000' : 'var(--text-secondary)' }}>{icon}</div>
            {isExpanded && <span style={{ fontWeight: isActive ? '700' : '600', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</span>}
        </div>
    </Link>
);

const RISK_MODES = [
    { id: 'conservative', label: 'CONSERVATIVE', icon: <Shield size={14} />, color: 'var(--success)', shadow: 'var(--success)', desc: 'Low risk. TP 20%, SL 5%, max 5% per position.' },
    { id: 'balanced', label: 'BALANCED', icon: <Feather size={14} />, color: 'var(--warning)', shadow: 'var(--warning)', desc: 'Standard. TP 50%, SL 10%, max 10% per position.' },
    { id: 'aggressive', label: 'AGGRESSIVE', icon: <Flame size={14} />, color: 'var(--danger)', shadow: 'var(--danger)', desc: 'High risk. TP 100%, SL 20%, max 25% per position.' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);
    const [riskMode, setRiskMode] = useState(1); // 0=conservative, 1=balanced, 2=aggressive

    const currentRisk = RISK_MODES[riskMode];

    const cycleRisk = () => {
        setRiskMode(prev => (prev + 1) % 3);
    };

    return (
        <aside className="sidebar" style={{
            width: isExpanded ? '240px' : '72px',
            transition: 'width 0.3s ease',
            background: 'var(--bg-card)',
            borderRight: '2px solid var(--border-color)',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: '100vh',
            overflow: 'visible'
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn-linear-icon sidebar-toggle"
                style={{
                    position: 'absolute',
                    top: '72px',
                    right: '-14px',
                    background: 'var(--bg-color)',
                    zIndex: 100,
                    padding: '5px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    boxShadow: '2px 2px 0px var(--accent-cyan)'
                }}
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div style={{ overflow: 'hidden', flexShrink: 0 }}>
                <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: isExpanded ? '0 20px' : '0 14px', justifyContent: isExpanded ? 'flex-start' : 'center' }}>
                    <div style={{ position: 'relative', width: isExpanded ? '40px' : '32px', height: isExpanded ? '40px' : '32px', flexShrink: 0, border: '2px solid var(--border-color)', borderRadius: '6px', boxShadow: '2px 2px 0px var(--accent-cyan)', padding: '3px', background: 'var(--bg-color)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="SMC AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    {isExpanded && (
                        <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--text-primary)', fontWeight: 900 }}>
                            SMC <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
                        </h1>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label={t.dashboard} isActive={pathname === '/dashboard'} isExpanded={isExpanded} />
                <NavItem href="/trade" icon={<Bot size={20} />} label={t.aiAgent} isActive={pathname === '/trade'} isExpanded={isExpanded} />
                <NavItem href="/trade/bsc" icon={<ArrowLeftRight size={20} />} label={t.bscTrading} isActive={pathname === '/trade/bsc'} isExpanded={isExpanded} />
                <NavItem href="/vault" icon={<Wallet size={20} />} label={t.vault} isActive={pathname === '/vault'} isExpanded={isExpanded} />
                <NavItem href="/futures" icon={<Activity size={20} />} label={t.futures} isActive={pathname === '/futures'} isExpanded={isExpanded} />
            </nav>

            {/* Risk Persona — Clickable Switcher */}
            <div className="sidebar-footer" style={{ padding: isExpanded ? '12px 16px' : '12px 8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={cycleRisk}
                    style={{
                        width: '100%',
                        background: 'var(--bg-color)',
                        border: `2px solid ${currentRisk.color}`,
                        borderRadius: '4px',
                        padding: isExpanded ? '10px 12px' : '10px 6px',
                        cursor: 'pointer',
                        textAlign: isExpanded ? 'left' : 'center',
                        boxShadow: `3px 3px 0px ${currentRisk.shadow}`,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isExpanded && <p style={{ fontSize: '0.65rem', margin: '0 0 4px 0', color: 'var(--text-secondary)', fontWeight: 700 }}>{t.riskPersona}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isExpanded ? 'flex-start' : 'center' }}>
                        <span style={{ color: currentRisk.color }}>{currentRisk.icon}</span>
                        {isExpanded && <span style={{ fontWeight: 800, fontSize: '0.78rem', color: currentRisk.color }}>{currentRisk.label}</span>}
                    </div>
                    {isExpanded && <p style={{ fontSize: '0.62rem', margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{currentRisk.desc}</p>}
                </button>

                {/* Social Icons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <a href="https://github.com/smc-ai" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isExpanded ? '36px' : '32px', height: isExpanded ? '36px' : '32px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-secondary)', transition: 'all 0.15s ease', textDecoration: 'none' }}>
                        <Github size={16} />
                    </a>
                    <a href="https://x.com/smcai_" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isExpanded ? '36px' : '32px', height: isExpanded ? '36px' : '32px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-secondary)', transition: 'all 0.15s ease', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href="https://t.me/SmcaiGlobalCommunity" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isExpanded ? '36px' : '32px', height: isExpanded ? '36px' : '32px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-secondary)', transition: 'all 0.15s ease', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    </a>
                </div>
            </div>
        </aside>
    );
}
