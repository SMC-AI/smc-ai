"use client";

import { MessageSquare, ShieldAlert, Bot } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const GUIDE_STEPS = {
    en: {
        titles: ["Welcome to SMC AI", "Setting Your Risk Persona", "Understanding SMC Logic"],
        contents: [
            `Hello! I am your SMC AI Assistant. I will manage your capital autonomously by analyzing the BSC market using Smart Money Concepts (SMC). Let's start by setting up your Vault. You remain in control of your funds at all times.`,
            `Great. Before I trade, I need to know your style. Are you looking for steady, low-risk accumulation, or aggressive institutional sniping? Choose a Persona below. You can override my Stop Loss and Take Profit anytime.`,
            `Perfect. When I find a trade, it's usually based on an FVG (Fair Value Gap) or a BOS (Break of Structure). If you ever wonder "Why did AI buy this token?", just ask me here, and I'll break down the chart logic for you.`
        ],
        nextStep: "Next Step",
        restart: "Restart",
        heading: "SMC AI",
        subheading: "| Your Personal Guide",
        desc: "Interactive onboarding and trading logic explanation"
    },
    zh: {
        titles: ["欢迎来到 SMC AI", "设置您的风险模式", "理解 SMC 逻辑"],
        contents: [
            `您好！我是您的 SMC AI 助手。我将通过分析 BSC 市场的智能资金概念（SMC）自主管理您的资金。让我们先设置您的金库（Vault）。您始终保持对资金的完全控制权。`,
            `很好。在交易之前，我需要了解您的风格。您是在寻求稳健的低风险积累，还是激进的机构级狙击？请选择以下风险模式。您可以随时覆盖我的止损和止盈设置。`,
            `完美。当我发现一笔交易时，通常基于 FVG（公允价值缺口）或 BOS（结构突破）。如果您想知道"AI 为什么购买这个代币？"，请直接在这里询问我，我会为您拆解图表逻辑。`
        ],
        nextStep: "下一步",
        restart: "重新开始",
        heading: "SMC AI",
        subheading: "| 您的专属指南",
        desc: "互动式入门和交易逻辑说明"
    }
};

export default function AIGuide() {
    const [step, setStep] = useState(1);
    const { lang } = useLanguage();
    const g = GUIDE_STEPS[lang];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div className="flex-between">
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {g.heading} <span className="text-secondary" style={{ fontSize: '1rem' }}>{g.subheading}</span>
                    </h1>
                    <p className="text-secondary">{g.desc}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', gap: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-cyan)' }}></div>

                <div style={{ flexShrink: 0 }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={32} className="text-cyan glow-text-cyan" />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', color: 'var(--accent-cyan)' }}>
                        {g.titles[step - 1]}
                    </h2>

                    <div style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '24px' }}>
                        <p>{g.contents[step - 1]}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {step < 3 ? (
                            <button className="btn-primary" onClick={() => setStep(step + 1)}>
                                {g.nextStep}
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={() => setStep(1)}>
                                {g.restart}
                            </button>
                        )}
                        {step > 1 && (
                            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
                                &larr;
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {[1, 2, 3].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStep(s)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: `2px solid ${step >= s ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                            background: step >= s ? 'var(--accent-cyan)' : 'transparent',
                            color: step >= s ? '#000' : 'var(--text-secondary)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            boxShadow: step === s ? '2px 2px 0px rgba(0,240,255,0.5)' : 'none',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {s}
                    </button>
                ))}
                <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
                {[MessageSquare, ShieldAlert, Bot].map((Icon, i) => (
                    <span key={i} style={{ color: step > i ? 'var(--accent-cyan)' : 'var(--text-secondary)', transition: 'color 0.3s' }}>
                        <Icon size={18} />
                    </span>
                ))}
            </div>
        </div>
    );
}
