"use client";

import Link from 'next/link';
import { ArrowLeft, Shield, Bot, Zap, Terminal, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

// Custom Collapsible Code Block with Syntax Highlighting Theme
const CodeBlock = ({ title, code, language = 'javascript' }: { title: string, code: string, language?: string }) => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (isOpen) {
            Prism.highlightAll();
        }
    }, [isOpen, code]);

    return (
        <div style={{ background: 'var(--bg-color)', border: '1px solid var(--text-primary)', borderRadius: '12px', overflow: 'hidden' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'var(--text-primary)', color: 'var(--bg-card)', padding: '12px 16px', fontSize: '0.85rem', fontWeight: 800, borderBottom: isOpen ? '2px solid var(--text-primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} /> {title}
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {isOpen && (
                <div style={{ padding: '24px', backgroundColor: '#2d2d2d', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, padding: 0, background: 'transparent' }} className={`language-${language}`}>
                        <code className={`language-${language}`} style={{ fontSize: '0.85rem', fontFamily: 'var(--font-space-mono)', lineHeight: 1.6 }}>
                            {code}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export default function DocsPage() {
    const { t, lang } = useLanguage();

    return (
        <div style={{ minHeight: '100vh', width: '100vw', maxWidth: '100%', overflowX: 'hidden', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}>

            {/* Navigation Bar */}
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
                background: 'var(--bg-card)'
            }}>
                <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.8rem' }}>
                        <ArrowLeft size={16} /> <span style={{ display: 'inline-block', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-on-very-small">{t.backToHome}</span>
                    </button>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: 'clamp(0.8rem, 3.5vw, 1.1rem)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="SMC AI Logo" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: '2px 2px 0px var(--accent-cyan)', padding: '2px', background: 'var(--bg-card)' }} />
                    {t.protocolDocs}
                </div>
            </nav>

            {/* Main Content Area */}
            <div style={{ padding: 'clamp(24px, 5vw, 80px) 5%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>

                {/* Header Title */}
                <div style={{ marginBottom: '24px', minHeight: 'min-content' }}>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1, wordBreak: 'break-word', paddingBottom: '8px' }}>
                        {lang === 'en' ? 'SMC AI ' : 'SMC AI '}
                        <span style={{ color: 'var(--accent-cyan)', WebkitTextStroke: '1px var(--text-primary)' }}>
                            {lang === 'en' ? 'ARCHITECTURE' : '架构'}
                        </span>
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '800px', lineHeight: 1.7, paddingBottom: '16px' }}>
                        {t.docsIntro1}
                    </p>
                    <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '800px', lineHeight: 1.7, paddingBottom: '16px' }}>
                        {t.docsIntro2}
                    </p>
                </div>

                {/* Section 1: OpenClaw Agent */}
                <section className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flexShrink: 0, background: 'var(--text-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--accent-cyan)' }}>
                            <Bot size={28} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS1Title}</h2>
                    </div>
                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS1P1}
                    </p>
                    <CodeBlock
                        title={t.docsS1CodeTitle}
                        code={`// Core initialization sequence for the OpenClaw Engine
const engine = new OpenClawCore({
    rpcEndpoint: process.env.PRIVATE_NODE_URL,
    mempoolStream: true,
    latencyThreshold: '10ms',
    modules: ['SMC_DETECTION', 'LIQUIDITY_MAPPING']
});

await engine.syncHistoricalData(TokenAddress, '15m');
const structuralBias = engine.calculateMarketBias();

console.log("[OPENCLAW] Synchronized to block altitude.");
console.log(\`[OPENCLAW] Current structural bias: \${structuralBias}\`);`}
                    />
                </section>

                {/* Section 2: Smart Money Concepts (SMC) */}
                <section className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--accent-purple)' }}>
                            <Shield size={32} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS2Title}</h2>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS2P1}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        <li style={{ background: 'rgba(37, 99, 235, 0.05)', borderLeft: '4px solid var(--accent-cyan)', padding: '16px', borderRadius: '0 4px 4px 0' }}>
                            <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>{t.docsS2FvgTitle}</strong>
                            {t.docsS2FvgDesc}
                        </li>
                        <li style={{ background: 'rgba(124, 58, 237, 0.05)', borderLeft: '4px solid var(--accent-purple)', padding: '16px', borderRadius: '0 4px 4px 0' }}>
                            <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--accent-purple)', marginBottom: '4px' }}>{t.docsS2ObTitle}</strong>
                            {t.docsS2ObDesc}
                        </li>
                        <li style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid var(--danger)', padding: '16px', borderRadius: '0 4px 4px 0' }}>
                            <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--danger)', marginBottom: '4px' }}>{t.docsS2LiqTitle}</strong>
                            {t.docsS2LiqDesc}
                        </li>
                    </ul>
                </section>

                {/* Section 3: xAI Integration */}
                <section className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--warning)' }}>
                            <Search size={32} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS3Title}</h2>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS3P1}
                    </p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS3P2}
                    </p>
                    <CodeBlock
                        title={t.docsS3CodeTitle}
                        code={`// Validating SMC setup against xAI sentiment API
const technicalThesis = { action: 'LONG', asset: '$ETH', structure: 'OB+FVG' };

const xAiResponse = await xAiClient.analyzeSentiment({
    target: technicalThesis.asset,
    timeframe: '1hr',
    weightMetrics: ['volume', 'influencer_bias']
});

if (xAiResponse.score > 75 && technicalThesis.action === 'LONG') {
    engine.approveTrade(technicalThesis);
} else {
    engine.discard(technicalThesis, "xAI Narrative Conflict");
}`}
                    />
                </section>

                {/* Section 4: 1inch Execution */}
                <section className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--success)' }}>
                            <Zap size={32} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS4Title}</h2>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS4P1}
                    </p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS4P2}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
                        <div style={{ flex: 1, minWidth: '200px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800, marginBottom: '4px' }}>{t.docsS4SlipTitle}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{t.docsS4SlipDesc}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800, marginBottom: '4px' }}>{t.docsS4LiqTitle}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{t.docsS4LiqDesc}</div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Vault System & Audit */}
                <section className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--text-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--text-primary)' }}>
                            <Shield size={32} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS5Title}</h2>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS5P1}
                    </p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS5P2}
                    </p>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', background: 'var(--bg-color)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={20} color="var(--success)" /> {t.docsS5AuditTitle}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div style={{ padding: '12px', borderLeft: '4px solid var(--success)', background: 'var(--bg-card)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{t.docsS5Audit1Title}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--success)' }}>{t.docsS5Audit1Desc}</div>
                            </div>
                            <div style={{ padding: '12px', borderLeft: '4px solid var(--accent-cyan)', background: 'var(--bg-card)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{t.docsS5Audit2Title}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 900 }}>{t.docsS5Audit2Desc}</div>
                            </div>
                            <div style={{ padding: '12px', borderLeft: '4px solid var(--accent-purple)', background: 'var(--bg-card)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{t.docsS5Audit3Title}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 900 }}>{t.docsS5Audit3Desc}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Institutional Risk Management */}
                <section className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--danger)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--text-primary)' }}>
                            <Shield size={32} color="var(--bg-color)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>{t.docsS6Title}</h2>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS6P1}
                    </p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7, fontWeight: 500 }}>
                        {t.docsS6P2}
                    </p>
                </section>

                {/* Footer Padding Space */}
                <div style={{ height: '80px' }} />

            </div>
        </div>
    );
}
