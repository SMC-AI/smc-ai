"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Activity, Shield, LayoutDashboard, Bot, Code, CheckCircle, Crosshair, BarChart, Database, Zap, Search } from 'lucide-react';
import SettingsButton from '@/components/ui/SettingsButton';
import AIFlowSession from '@/components/ui/AIFlowSession';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
    const { t } = useLanguage();
    return (
        <div style={{ minHeight: '100vh', width: '100vw', maxWidth: '100%', overflowX: 'hidden', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>

            {/* Isolated Landing Nav */}
            <nav style={{
                height: '80px',
                borderBottom: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5%',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--bg-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="SMC AI Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '2px 2px 0px var(--accent-cyan)', padding: '3px', background: 'var(--bg-card)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <SettingsButton />
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            {t.launchDapp} <ArrowRight size={16} />
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" style={{
                padding: 'clamp(40px, 6vw, 100px) 5%',
                maxWidth: '1600px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                gap: 'clamp(24px, 4vw, 60px)',
                alignItems: 'start',
            }}>
                <div style={{ zIndex: 10 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        background: 'var(--warning)',
                        color: '#000',
                        border: '1px solid #000',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        borderRadius: '12px',
                        marginBottom: '32px',
                        boxShadow: '4px 4px 0px #000'
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} className="animate-pulse-glow" />
                        SYSTEM ONLINE: OPENCLAW ENGINE ACTIVE
                    </div>
                    <h1 className="hero-title" style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                        {t.heroTitle.replace('NEVER SLEEPS.', '').replace('永不眠。', '')}
                        <span style={{ color: 'var(--accent-cyan)', WebkitTextStroke: '1px var(--text-primary)' }}>
                            {t.heroTitle.includes('NEVER SLEEPS') ? 'NEVER SLEEPS.' : '永不眠。'}
                        </span>
                    </h1>
                    <p className="hero-description" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '48px', lineHeight: 1.6, maxWidth: '640px', fontWeight: 600 }}>
                        {t.heroDesc}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                                {t.launchDapp} <Terminal size={18} />
                            </button>
                        </Link>
                        <Link href="/docs" style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                                {t.readTheDocs} <Code size={18} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* AI Flow Session Visualization */}
                <div className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 28px)', display: 'flex', flexDirection: 'column', minHeight: 'clamp(320px, 40vw, 420px)', maxHeight: '500px', overflow: 'hidden', boxSizing: 'border-box' }}>
                    <AIFlowSession />
                </div>
            </section>

            {/* Marquee Updates */}
            <section style={{ borderTop: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', padding: '24px 0', background: 'var(--accent-cyan)', color: '#000', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                    style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontWeight: 900, letterSpacing: '2px', display: 'flex', gap: 'clamp(20px, 4vw, 64px)', textTransform: 'uppercase', width: 'max-content' }}
                >
                    <span style={{ flexShrink: 0 }}>{t.mq1}</span>
                    <span style={{ flexShrink: 0 }}>✦</span>
                    <span style={{ flexShrink: 0 }}>{t.mq2}</span>
                    <span style={{ flexShrink: 0 }}>✦</span>
                    <span style={{ flexShrink: 0 }}>{t.mq3}</span>
                    <span style={{ flexShrink: 0 }}>✦</span>
                    <span style={{ flexShrink: 0 }}>{t.mq4}</span>
                    <span style={{ flexShrink: 0 }}>✦</span>
                    <span style={{ flexShrink: 0 }}>{t.mq1}</span>
                    <span style={{ flexShrink: 0 }}>✦</span>
                    <span style={{ flexShrink: 0 }}>{t.mq2}</span>
                </motion.div>
            </section>

            {/* How SMC AI Works (Restored in Brutalist Theme) */}
            <section style={{ padding: 'clamp(40px, 8vw, 120px) 5%', maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-color)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 80px)' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>{t.howItWorks}.</h2>
                    <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: '700px', margin: '16px auto 0 auto', fontWeight: 600, padding: '0 8px' }}>
                        {t.howItWorksDesc}
                    </p>
                </div>

                <div className="grid-cols-3" style={{ gap: 'clamp(24px, 3vw, 40px)' }}>
                    {/* Step 1 */}
                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', position: 'relative', overflow: 'hidden', paddingTop: '28px' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', fontWeight: 900, color: 'var(--border-color)', opacity: 0.3, lineHeight: 1 }}>1</div>
                        <div style={{ background: 'var(--accent-purple)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Database size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase' }}>{t.archS1Title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                            {t.archS1Desc}
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', position: 'relative', overflow: 'hidden', paddingTop: '28px' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', fontWeight: 900, color: 'var(--border-color)', opacity: 0.3, lineHeight: 1 }}>2</div>
                        <div style={{ background: 'var(--accent-cyan)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Bot size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase' }}>{t.archS2Title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                            {t.archS2Desc}
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', position: 'relative', overflow: 'hidden', paddingTop: '28px' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', fontWeight: 900, color: 'var(--border-color)', opacity: 0.3, lineHeight: 1 }}>3</div>
                        <div style={{ background: 'var(--success)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Zap size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase' }}>{t.archS3Title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                            {t.archS3Desc}
                        </p>
                    </div>
                </div>
            </section>

            {/* OpenClaw Agent Skills & Performance Section (Agent Showcase) */}
            <section style={{ padding: 'clamp(40px, 8vw, 120px) 5%', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
                    <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--text-primary)', color: 'var(--bg-card)', fontWeight: 800, fontSize: '0.9rem', borderRadius: '12px', marginBottom: '20px', boxShadow: '4px 4px 0px var(--accent-purple)' }}>
                        SKILL.MD REFERENCE
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>{t.autonomousPrecision}</h2>
                    <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: '700px', margin: '16px auto 0 auto', fontWeight: 600, padding: '0 8px' }}>
                        {t.autonomousDesc}
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid-cols-3" style={{ gap: 'clamp(24px, 3vw, 40px)', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', background: 'var(--bg-card)', paddingTop: '24px', overflow: 'visible' }}>
                        <div style={{ background: 'var(--success)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Crosshair size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px' }}>70% ACCURACY</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.5 }}>
                            {t.stat1Desc}
                        </p>
                    </div>

                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', background: 'var(--bg-card)', paddingTop: '24px', overflow: 'visible' }}>
                        <div style={{ background: 'var(--accent-purple)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Activity size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px' }}>AUTO-TRADE SMC</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.5 }}>
                            {t.stat2Desc}
                        </p>
                    </div>

                    <div className="glass-panel" style={{ border: '4px solid var(--text-primary)', background: 'var(--bg-card)', paddingTop: '24px', overflow: 'visible' }}>
                        <div style={{ background: 'var(--accent-cyan)', width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '3px 3px 0px #000' }}>
                            <Search size={24} color="#000" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: '12px' }}>xAI SENTIMENT</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 600, lineHeight: 1.5 }}>
                            {t.stat3Desc}
                        </p>
                    </div>
                </div>

                {/* Agent Chat Showcase: Signal Auto Execution + Chart + SMC */}
                <div className="agent-showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '40px', alignItems: 'flex-start' }}>

                    {/* Visual Chat Mockup */}
                    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '4px solid var(--text-primary)' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', border: '1px solid #000' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)', border: '1px solid #000' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)', border: '1px solid #000' }} />
                            </div>
                            <span style={{ color: 'var(--bg-card)', fontWeight: 800, fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)', letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>SMC_AGENT_CONSOLE_V2.EXE</span>
                        </div>

                        <div style={{ padding: '24px', background: 'var(--bg-color)', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-space-mono)', fontSize: '0.70rem', overflowX: 'auto' }}>
                            {/* User Request */}
                            <div style={{ alignSelf: 'flex-end', background: 'var(--border-color)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '8px 8px 0px 8px', maxWidth: '85%', border: '1px solid var(--text-primary)', boxShadow: '4px 4px 0px var(--text-primary)' }}>
                                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.75rem' }}>Analyze $ETH on the 15m timeframe using Smart Money Concepts. If sentiment is bullish, execute a trade with exactly 2.5% capital risk limit.</p>
                            </div>

                            {/* Agent Processing */}
                            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '16px', borderRadius: '8px 8px 8px 0', maxWidth: '95%', border: '1px solid var(--text-primary)', boxShadow: '4px 4px 0px var(--accent-cyan)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Bot size={18} style={{ color: 'var(--accent-cyan)' }} />
                                    <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>OpenClaw System</span>
                                </div>

                                {/* Console Logs / Thought Process */}
                                <div style={{ background: 'var(--text-primary)', color: 'var(--bg-card)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.70rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div><span style={{ color: 'var(--success)' }}>[+]</span> Scanning 15m structural liquidity...</div>
                                    <div><span style={{ color: 'var(--warning)' }}>[!]</span> Internal sweep of sell-side liquidity at $3,450.</div>
                                    <div><span style={{ color: 'var(--success)' }}>[+]</span> Bullish CHoCH (Change of Character) detected at $3,485.</div>
                                    <div><span style={{ color: 'var(--success)' }}>[+]</span> Unmitigated 15m Bullish Order Block (OB) identified at $3,465 with adjoining FVG.</div>
                                    <div><span style={{ color: 'var(--accent-cyan)' }}>[?]</span> Querying xAI for Twitter/X Sentiment Analysis...</div>
                                    <div><span style={{ color: 'var(--success)' }}>[✓]</span> xAI Response: Social Sentiment is <span style={{ color: 'var(--success)', fontWeight: 800 }}>EXTREME BULLISH (89/100)</span>. Mention volume rising 45% hourly.</div>
                                </div>

                                {/* SMC Chart — precisely annotated */}
                                <div style={{ background: 'var(--bg-color)', border: '1px solid var(--text-primary)', padding: '12px', marginBottom: '16px', borderRadius: '12px', position: 'relative' }}>
                                    {/* Chart header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>$ETH/USDC</span>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)' }}>15m · SMC · OpenClaw</span>
                                    </div>

                                    {/* Main chart body */}
                                    <div style={{ display: 'flex', gap: 0 }}>
                                        {/* Y-axis */}
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '5px', fontSize: '0.48rem', color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap', minWidth: '36px', height: '150px' }}>
                                            <span>$3,500</span>
                                            <span>$3,487</span>
                                            <span>$3,475</span>
                                            <span>$3,462</span>
                                            <span>$3,450</span>
                                            <span>$3,437</span>
                                            <span>$3,425</span>
                                        </div>

                                        {/* Candle chart area */}
                                        <div style={{ flex: 1, position: 'relative', height: '150px', borderLeft: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>

                                            {/* Horizontal gridlines */}
                                            {[16.6, 33.3, 50, 66.6, 83.3].map((pct, i) => (
                                                <div key={i} style={{ position: 'absolute', top: `${pct}%`, left: 0, right: 0, height: '1px', background: 'var(--border-color)', opacity: 0.2 }} />
                                            ))}

                                            {/* SESSION HIGH line — Swing High / BSL */}
                                            <div style={{ position: 'absolute', top: '5%', left: 0, right: 0, height: '1px', background: 'var(--danger)', opacity: 0.75 }} />
                                            <div style={{ position: 'absolute', top: '1%', right: '2px', fontSize: '0.44rem', color: 'var(--danger)', fontWeight: 900, zIndex: 3 }}>BSL $3,500</div>

                                            {/* SESSION LOW — SSL Sweep */}
                                            <div style={{ position: 'absolute', bottom: '3%', left: 0, right: 0, height: '1px', background: 'var(--danger)', opacity: 0.75, borderTop: '1px dashed var(--danger)' }} />
                                            <div style={{ position: 'absolute', bottom: '4%', left: '2px', fontSize: '0.44rem', color: 'var(--danger)', fontWeight: 900, zIndex: 3 }}>SSL $3,425 ← SWEPT</div>

                                            {/* OB Zone — at the base of the impulse move (candle 3 area, lower section) */}
                                            <div style={{ position: 'absolute', left: '33%', bottom: '12%', width: '18%', height: '20%', background: 'rgba(0,240,255,0.1)', border: '1px dashed var(--accent-cyan)', zIndex: 1 }} />
                                            <div style={{ position: 'absolute', left: '33%', bottom: '33%', fontSize: '0.44rem', color: 'var(--accent-cyan)', fontWeight: 900, zIndex: 3 }}>OB $3,465</div>

                                            {/* FVG Zone — gap between candle 3 close and candle 4 open (middle section) */}
                                            <div style={{ position: 'absolute', left: '48%', top: '35%', width: '14%', height: '12%', background: 'rgba(245,158,11,0.15)', border: '1px dashed var(--warning)', zIndex: 1 }} />
                                            <div style={{ position: 'absolute', left: '48%', top: '31%', fontSize: '0.44rem', color: 'var(--warning)', fontWeight: 900, zIndex: 3 }}>FVG</div>

                                            {/* CHoCH line — structural break above previous lower high */}
                                            <div style={{ position: 'absolute', left: '54%', top: '38%', right: 0, height: '1px', background: 'var(--success)', opacity: 0.9, zIndex: 2 }} />
                                            <div style={{ position: 'absolute', left: '54%', top: '29%', fontSize: '0.44rem', color: 'var(--success)', fontWeight: 900, zIndex: 3 }}>CHoCH ↑</div>

                                            {/* Candle bars — Bearish trend → SSL Sweep → CHoCH → Bullish impulse */}
                                            <div style={{ position: 'absolute', inset: '0 4px 0 4px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>

                                                {/* Candle 1 — bearish impulse from high */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-start', flex: 1, paddingTop: '5%' }}>
                                                    <div style={{ width: '2px', height: '8%', background: 'var(--danger)' }} />
                                                    <div style={{ width: '100%', maxWidth: '14px', height: '38%', background: 'var(--danger)', border: '1px solid rgba(0,0,0,0.3)' }} />
                                                    <div style={{ width: '2px', height: '10%', background: 'var(--danger)' }} />
                                                </div>

                                                {/* Candle 2 — bearish continuation */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-start', flex: 1, paddingTop: '30%' }}>
                                                    <div style={{ width: '2px', height: '6%', background: 'var(--danger)' }} />
                                                    <div style={{ width: '100%', maxWidth: '14px', height: '30%', background: 'var(--danger)', border: '1px solid rgba(0,0,0,0.3)' }} />
                                                    <div style={{ width: '2px', height: '12%', background: 'var(--danger)' }} />
                                                </div>

                                                {/* Candle 3 — SSL Sweep candle (long wick down to low, small bull body) */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', flex: 1, position: 'relative' }}>
                                                    <div style={{ width: '2px', height: '3%', background: 'var(--success)' }} />
                                                    <div style={{ width: '100%', maxWidth: '13px', height: '12%', background: 'var(--success)' }} />
                                                    <div style={{ width: '2px', height: '50%', background: 'var(--danger)' }} />
                                                </div>

                                                {/* Candle 4 — strong bullish CHoCH candle (breaks structure) */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-start', flex: 1, paddingTop: '15%' }}>
                                                    <div style={{ width: '2px', height: '5%', background: 'var(--success)' }} />
                                                    <div style={{ width: '100%', maxWidth: '14px', height: '50%', background: 'var(--success)', border: '1px solid rgba(0,0,0,0.3)' }} />
                                                    <div style={{ width: '2px', height: '6%', background: 'var(--success)' }} />
                                                </div>

                                                {/* Candle 5 — continuation bullish at OB mitigation zone */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-start', flex: 1, paddingTop: '8%' }}>
                                                    <div style={{ width: '2px', height: '4%', background: 'var(--success)' }} />
                                                    <div style={{ width: '100%', maxWidth: '14px', height: '35%', background: 'var(--success)', border: '1px solid rgba(0,0,0,0.3)' }} />
                                                    <div style={{ width: '2px', height: '5%', background: 'var(--success)' }} />
                                                </div>

                                            </div> {/* candles */}
                                        </div> {/* chart area */}
                                    </div> {/* y-axis + chart row */}

                                    {/* X-axis labels */}
                                    <div style={{ display: 'flex', paddingLeft: '42px', marginTop: '4px', gap: 0 }}>
                                        <span style={{ flex: 1, textAlign: 'center', fontSize: '0.46rem', color: 'var(--text-secondary)' }}>17:00</span>
                                        <span style={{ flex: 1, textAlign: 'center', fontSize: '0.46rem', color: 'var(--text-secondary)' }}>17:15</span>
                                        <span style={{ flex: 1, textAlign: 'center', fontSize: '0.46rem', color: 'var(--text-secondary)' }}>17:30</span>
                                        <span style={{ flex: 1, textAlign: 'center', fontSize: '0.46rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>NOW</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderLeft: '4px solid var(--accent-cyan)', marginBottom: '16px' }}>
                                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.75rem' }}>[THESIS VALIDATED: SMC STRUCTURE + xAI SENTIMENT ALIGNED]</span>
                                </div>

                                <div className="terminal-info-grid" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>ACTION:</span>
                                    <span style={{ color: 'var(--success)' }}>LIMIT LONG $ETH/USDC</span>

                                    <span style={{ color: 'var(--text-secondary)' }}>ORDER BLOCK ENTRY:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>$3,465.50 (Mitigation Zone)</span>

                                    <span style={{ color: 'var(--text-secondary)' }}>CAPITAL ALLOCATED:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>2.5% ($2,125.00)</span>

                                    <div style={{ borderTop: '2px dashed var(--border-color)', margin: '8px 0', gridColumn: '1 / -1' }} />

                                    <span style={{ color: 'var(--danger)' }}>HARD STOP LOSS:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>$3,445.00 (Below manipulation wick)</span>

                                    <span style={{ color: 'var(--warning)' }}>TRAILING STOP:</span>
                                    <span style={{ color: 'var(--text-primary)' }}>Trigger +$3,510.00 (Step: 1.0%)</span>

                                    <span style={{ color: 'var(--success)' }}>TAKE PROFIT (TP1):</span>
                                    <span style={{ color: 'var(--text-primary)' }}>$3,580.00 (Buyside Liquidity Pool)</span>
                                </div>
                                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem' }}>
                                    <CheckCircle size={18} />
                                    <span>TRADE EXECUTED. <span style={{ color: 'var(--text-secondary)', fontSize: '0.70rem' }}>0ms latency RPC.</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Explainer Text beside Chat */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', paddingLeft: '24px' }}>
                        <h3 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '24px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                            {t.intelTitle} <span style={{ color: 'var(--accent-purple)' }}>{t.intelAccent}</span>
                        </h3>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: 600, lineHeight: 1.6 }}>
                            {t.intelDesc}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.15rem', fontWeight: 700 }}>
                                <div style={{ flexShrink: 0, background: 'var(--accent-cyan)', padding: '10px', borderRadius: '12px', border: '1px solid #000', boxShadow: '2px 2px 0px #000' }}>
                                    <BarChart size={24} color="#000" />
                                </div>
                                {t.intelList1}
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.15rem', fontWeight: 700 }}>
                                <div style={{ flexShrink: 0, background: 'var(--accent-purple)', padding: '10px', borderRadius: '12px', border: '1px solid #000', boxShadow: '2px 2px 0px #000' }}>
                                    <Search size={24} color="#000" />
                                </div>
                                {t.intelList2}
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.15rem', fontWeight: 700 }}>
                                <div style={{ flexShrink: 0, background: 'var(--danger)', padding: '10px', borderRadius: '12px', border: '1px solid #000', boxShadow: '2px 2px 0px #000' }}>
                                    <Shield size={24} color="#000" />
                                </div>
                                {t.intelList3}
                            </li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* Platform Ecosystem / Routing */}
            <section style={{ padding: '80px 5%', background: 'var(--border-color)', borderTop: '4px solid var(--text-primary)', borderBottom: '4px solid var(--text-primary)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--bg-color)' }}>{t.ecosystem}.</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '32px' }}>
                        <Link href="/trade" style={{ textDecoration: 'none' }}>
                            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', height: '100%', padding: 'clamp(20px, 3vw, 32px)' }}>
                                <div style={{ flexShrink: 0, padding: '16px', background: 'var(--accent-cyan)', border: '1px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000' }}>
                                    <Bot size={32} color="#000" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase' }}>{t.aiAgentTitle}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.5, fontWeight: 600 }}>
                                        {t.aiAgentDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', height: '100%', padding: 'clamp(20px, 3vw, 32px)' }}>
                                <div style={{ flexShrink: 0, padding: '16px', background: 'var(--success)', border: '1px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000' }}>
                                    <LayoutDashboard size={32} color="#000" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase' }}>{t.dashboardTitle}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.5, fontWeight: 600 }}>
                                        {t.dashboardDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/trade/bsc" style={{ textDecoration: 'none' }}>
                            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', height: '100%', padding: 'clamp(20px, 3vw, 32px)' }}>
                                <div style={{ flexShrink: 0, padding: '16px', background: 'var(--warning)', border: '1px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000' }}>
                                    <ArrowRight size={32} color="#000" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase' }}>{t.bscTradingTitle}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.5, fontWeight: 600 }}>
                                        {t.bscTradingDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '64px 5%', textAlign: 'center', background: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        <img src="/logo.png" alt="SMC AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '2px' }}>SMC AI</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontWeight: 600 }}>
                    {t.footerCopy}<br />
                    {t.footerDisclaimer}
                </p>
            </footer>
        </div>
    );
}
