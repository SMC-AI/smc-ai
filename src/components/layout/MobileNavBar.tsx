"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bot, Wallet, Activity, ArrowLeftRight } from 'lucide-react';

const tabs = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/trade', icon: Bot, label: 'AI' },
    { href: '/trade/bsc', icon: ArrowLeftRight, label: 'Trade' },
    { href: '/vault', icon: Wallet, label: 'Vault' },
    { href: '/futures', icon: Activity, label: 'Futures' },
];

export default function MobileNavBar() {
    const pathname = usePathname();

    return (
        <nav style={{
            display: 'none',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'var(--bg-card)',
            borderTop: '2px solid var(--border-color)',
            zIndex: 200,
            alignItems: 'stretch',
        }} className="mobile-nav-bar">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                    <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: '4px',
                            color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            borderTop: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                            background: isActive ? 'rgba(0,240,255,0.05)' : 'transparent',
                            transition: 'all 0.15s ease',
                        }}>
                            <Icon size={20} />
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                                {tab.label}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
