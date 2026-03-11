/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck, Shield, Flame, Feather, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ethers } from 'ethers';
import { vaultAbi } from '@/config/vaultAbi';

const RISK_MODES_EN = [
    { id: 'conservative', label: 'CONSERVATIVE', icon: <Shield size={20} />, color: 'var(--success)', desc: 'Low risk strategy. Aims for 20% Take Profit, sets 5% Stop Loss, trades max 5% of Vault per position. Ideal for capital preservation.', tp: '20%', sl: '5%', max: '5%' },
    { id: 'balanced', label: 'BALANCED', icon: <Feather size={20} />, color: 'var(--warning)', desc: 'Standard strategy. Aims for 50% Take Profit, sets 10% Stop Loss, trades max 10% of Vault per position. Best for steady growth.', tp: '50%', sl: '10%', max: '10%' },
    { id: 'aggressive', label: 'AGGRESSIVE', icon: <Flame size={20} />, color: 'var(--danger)', desc: 'High risk, high reward. Aims for 100% Take Profit, sets 20% Stop Loss, trades max 25% of Vault per position. For experienced traders.', tp: '100%', sl: '20%', max: '25%' },
];

const RISK_MODES_ZH = [
    { id: 'conservative', label: '保守', icon: <Shield size={20} />, color: 'var(--success)', desc: '低风险策略。目标止盈 20%，设置止损 5%，每笔交易最多使用金库的 5%。适合资本保值。', tp: '20%', sl: '5%', max: '5%' },
    { id: 'balanced', label: '平衡', icon: <Feather size={20} />, color: 'var(--warning)', desc: '标准策略。目标止盈 50%，设置止损 10%，每笔交易最多使用金库的 10%。适合稳健增长。', tp: '50%', sl: '10%', max: '10%' },
    { id: 'aggressive', label: '激进', icon: <Flame size={20} />, color: 'var(--danger)', desc: '高风险高回报。目标止盈 100%，设置止损 20%，每笔交易最多使用金库的 25%。适合经验丰富的交易者。', tp: '100%', sl: '20%', max: '25%' },
];

export default function Vault() {
    const [riskMode, setRiskMode] = useState(1);
    const [balance, setBalance] = useState('0.0000');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    // AI Agent address initialized for this Vault instance
    const AGENT_ADDRESS = '0x17858fcabaa514ec3aa28b14593372e115726411';
    const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || '';

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        if (!window.ethereum || !VAULT_ADDRESS) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const contract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, provider);
            
            const bnbBal = await contract.getUserBNBBalance(address);
            setBalance(Number(ethers.formatEther(bnbBal)).toFixed(4));
            
            // Check authorization
            const authStatus = await contract.isAgentAuthorized(address, AGENT_ADDRESS);
            setIsAuthorized(authStatus);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeposit = async () => {
        if (!window.ethereum || !VAULT_ADDRESS) return alert('Wallet or Vault not connected');
        setIsProcessing(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
            
            const depositAmount = window.prompt("Enter BNB to deposit to SMC Vault:", "0.01");
            if (!depositAmount || isNaN(Number(depositAmount))) {
                setIsProcessing(false);
                return;
            }

            const tx = await contract.depositBNB({ value: ethers.parseEther(depositAmount) });
            await tx.wait();
            checkStatus();
            alert('Deposit successful!');
        } catch (e: any) {
            console.error(e);
            alert(e.reason || 'Deposit failed');
        }
        setIsProcessing(false);
    };

    const handleWithdraw = async () => {
        if (!window.ethereum || !VAULT_ADDRESS) return alert('Wallet or Vault not connected');
        setIsProcessing(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const contract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
            
            const bnbBal = await contract.getUserBNBBalance(address);
            if (bnbBal === BigInt(0)) throw new Error("No BNB in vault to withdraw");

            const tokenAddr = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
            const tx = await contract.withdraw(tokenAddr, bnbBal);
            await tx.wait();
            checkStatus();
            alert('Withdrawal successful!');
        } catch (e: any) {
            console.error(e);
            alert(e.reason || e.message || 'Withdrawal failed');
        }
        setIsProcessing(false);
    };

    const handleToggleAuth = async () => {
        if (!window.ethereum || !VAULT_ADDRESS) return alert('Wallet or Vault not connected');
        setIsProcessing(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
            
            // Toggle the authorization status
            const tx = await contract.setAgent(AGENT_ADDRESS, !isAuthorized);
            await tx.wait();
            checkStatus();
        } catch (e: any) {
            console.error(e);
            alert(e.reason || 'Authorization change failed');
        }
        setIsProcessing(false);
    };

    const { lang: currentLang } = useLanguage();
    const RISK_MODES = currentLang === 'zh' ? RISK_MODES_ZH : RISK_MODES_EN;
    const currentRisk = RISK_MODES[riskMode];
    const labels = {
        en: { title: 'SMC VAULT', sub: 'Manage your AI-controlled capital', balance: 'Your Vault Balance', deposit: 'Deposit', withdraw: 'Withdraw', aiPerms: 'AI Permissions', agent: 'SMC Agent 01', agentSub: 'Full Auto-Trade Access', authorized: 'AUTHORIZED', revokeNote: 'Revoking access will immediately cancel all pending agent transactions.', revoke: 'Revoke Access', riskPersona: 'Risk Persona' },
        zh: { title: 'SMC 金库', sub: '管理您的 AI 自主资金', balance: '您的金库余额', deposit: '存入', withdraw: '提取', aiPerms: 'AI 权限', agent: 'SMC 智能体 01', agentSub: '完全自动交易授权', authorized: '已授权', revokeNote: '撤销权限将立即取消所有待执行的智能体交易。', revoke: '撤销权限', riskPersona: '风险模式' },
    }[currentLang];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div className="flex-between">
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {labels.title} <ShieldCheck className="text-success" />
                    </h1>
                    <p className="text-secondary">{labels.sub}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <Wallet size={40} className="text-cyan glow-text-cyan" />
                </div>

                <p className="text-secondary" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{labels.balance}</p>
                <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0 0 40px 0' }}>{balance} BNB</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '500px' }}>
                    <button onClick={handleDeposit} disabled={isProcessing} className="btn-primary flex-center" style={{ gap: '8px', padding: '16px', fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}>
                        {isProcessing ? <Loader2 className="spin" size={24} /> : <ArrowDownRight size={24} />} {labels.deposit}
                    </button>
                    <button onClick={handleWithdraw} disabled={isProcessing} className="btn-secondary flex-center" style={{ gap: '8px', padding: '16px', fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}>
                        {isProcessing ? <Loader2 className="spin" size={24} /> : <ArrowUpRight size={24} />} {labels.withdraw}
                    </button>
                </div>
            </div>

            <div className="grid-cols-2">
                <div className="glass-panel">
                    <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>{labels.aiPerms}</h3>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <div>
                            <strong style={{ display: 'block' }}>{labels.agent}</strong>
                            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{labels.agentSub}</span>
                        </div>
                        {isAuthorized ? (
                            <div className="badge badge-success">{labels.authorized}</div>
                        ) : (
                            <div className="badge badge-warning" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>UNAUTHORIZED</div>
                        )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {labels.revokeNote}
                    </p>
                    <button 
                        onClick={handleToggleAuth} 
                        disabled={isProcessing} 
                        className="btn-secondary flex-center" 
                        style={{ width: '100%', marginTop: '16px', color: isAuthorized ? 'var(--danger)' : 'var(--success)', borderColor: isAuthorized ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)', opacity: isProcessing ? 0.7 : 1 }}
                    >
                        {isProcessing ? <Loader2 className="spin" size={18} /> : null}
                        <span style={{ marginLeft: isProcessing ? '8px' : '0' }}>
                            {isAuthorized ? labels.revoke : 'Authorize Agent'}
                        </span>
                    </button>
                </div>

                <div className="glass-panel">
                    <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>{labels.riskPersona}</h3>

                    {/* 3 Mode Selector */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                        {RISK_MODES.map((mode, i) => (
                            <button
                                key={mode.id}
                                onClick={() => setRiskMode(i)}
                                style={{
                                    flex: 1,
                                    padding: '8px 4px',
                                    borderRadius: '12px',
                                    border: `2px solid ${riskMode === i ? mode.color : 'var(--border-color)'}`,
                                    background: riskMode === i ? `${mode.color}15` : 'transparent',
                                    color: riskMode === i ? mode.color : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: riskMode === i ? `2px 2px 0px ${mode.color}` : 'none',
                                }}
                            >
                                {mode.icon}
                                <span>{mode.label.slice(0, 4)}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: `1px solid ${currentRisk.color}30` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: currentRisk.color }}>{currentRisk.icon}</span>
                            <strong style={{ color: currentRisk.color, fontSize: '0.85rem' }}>{currentRisk.label}</strong>
                        </div>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {currentRisk.desc}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>TP</div>
                                <div style={{ fontWeight: 800, color: 'var(--success)' }}>{currentRisk.tp}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>SL</div>
                                <div style={{ fontWeight: 800, color: 'var(--danger)' }}>{currentRisk.sl}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>MAX</div>
                                <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{currentRisk.max}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
