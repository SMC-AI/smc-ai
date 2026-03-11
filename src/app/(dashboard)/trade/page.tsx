/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, Bot, User, BarChart2, Loader2, Zap, Wallet, X } from 'lucide-react';
import { ethers } from 'ethers';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isTyping?: boolean;
    tradeExecuted?: {
        symbol: string;
        side: string;
        size: string;
        entry: string;
        sl: string;
        tp: string;
        confidence: string;
    };
    tradeProposal?: {
        symbol: string;
        tokenAddress: string;
        action: string;
        entry: string;
        sl: string;
        tp: string;
        confidence: string;
        status: 'pending' | 'confirmed' | 'rejected';
        isFutures?: boolean;
        leverage?: number;
        marginType?: string;
    };
}

// Renders markdown-like bold (**text**) as <strong>, strips em-dashes
function renderMarkdown(text: string) {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<span key={key++}>{text.slice(lastIndex, match.index).replace(/—/g, ', ')}</span>);
        }
        parts.push(<strong key={key++}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(<span key={key++}>{text.slice(lastIndex).replace(/—/g, ', ')}</span>);
    }
    return parts;
}

// Renders a message with line breaks and markdown bold
function MessageContent({ content }: { content: string }) {
    return (
        <>
            {content.split('\n').map((line, i) => (
                <span key={i}>
                    {renderMarkdown(line)}
                    {i < content.split('\n').length - 1 && <br />}
                </span>
            ))}
        </>
    );
}

// Typewriter hook: reveals text char by char
function useTypewriter(text: string, speed = 18) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        if (!text) return;
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayed, done };
}

function TypewriterMessage({ content }: { content: string }) {
    const { displayed } = useTypewriter(content);
    return <MessageContent content={displayed} />;
}

export default function AIAgentPage() {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeChart, setActiveChart] = useState<string | null>(null);
    const [wallet, setWallet] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [latestAiIndex, setLatestAiIndex] = useState(-1);
    
    // Position State
    const [positions, setPositions] = useState<any[]>([]);
    const [tradeHistory, setTradeHistory] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTradeData = useCallback(async () => {
        if (!wallet) return;
        try {
            const [posRes, histRes] = await Promise.all([
                fetch(`/api/trade/positions?walletAddress=${wallet}`),
                fetch(`/api/trade/history?walletAddress=${wallet}`)
            ]);
            const posData = await posRes.json();
            const histData = await histRes.json();
            
            if (posData.positions) {
                // Map Supabase trade history slightly to match visual UI expectations
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPos = posData.positions.map((p: any) => ({
                    id: p.id,
                    symbol: p.symbol,
                    side: p.side,
                    size: `$${p.size_usd}`,
                    entry: p.entry_price.toString(),
                    sl: p.sl_price?.toString() || 'Auto',
                    tp: p.tp_price?.toString() || 'Auto',
                    pnl: '+0.00%', // Start at 0, mocking will take over
                    status: p.status,
                    time: new Date(p.created_at).toLocaleTimeString()
                }));
                // Only replace if length changes, otherwise let the mock PNL tick
                setPositions(prev => {
                    if (prev.length !== mappedPos.length) return mappedPos;
                    // Inject new ones if IDs differ basically
                    const existingIds = new Set(prev.map(x => x.id));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const hasNew = mappedPos.some((x: any) => !existingIds.has(x.id));
                    if (hasNew) return mappedPos;
                    return prev;
                });
            }
            if (histData.history) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setTradeHistory(histData.history.map((h: any) => ({
                    id: h.id,
                    symbol: h.symbol,
                    side: h.side,
                    size: `$${h.size_usd}`,
                    entry: h.entry_price.toString(),
                    pnl: h.status === 'CLOSED_TP' ? '+12.5%' : (h.status === 'CLOSED_SL' ? '-2.5%' : '0.0%'),
                    sl: h.sl_price?.toString() || 'Auto',
                    tp: h.tp_price?.toString() || 'Auto',
                    status: h.status,
                    time: new Date(h.created_at).toLocaleTimeString()
                })));
            }
        } catch (e) {
            console.error('Failed to fetch trade data', e);
        }
    }, [wallet]);

    // Polling active positions
    useEffect(() => {
        fetchTradeData();
        const poller = setInterval(fetchTradeData, 10000); // refresh every 10s
        return () => clearInterval(poller);
    }, [fetchTradeData]);

    // Mock live PNL updates
    useEffect(() => {
        if (positions.filter(p => p.status === 'OPEN').length === 0) return;
        const interval = setInterval(() => {
            setPositions(prev => prev.map(p => {
                if (p.status !== 'OPEN') return p;
                
                // Random fluctuation logic for mock presentation
                const changePct = (Math.random() * 2 - 0.8) * 0.5; // Slight bullish bias
                const isLong = p.side.includes('BUY') || p.side.includes('LONG');
                
                let currentPnl = parseFloat(p.pnl) || 0;
                currentPnl += (isLong ? changePct : -changePct);
                
                // If PNL hits TP or SL, close it
                let newStatus = 'OPEN';
                if (p.tp !== 'Auto' && currentPnl > 5.0) newStatus = 'CLOSED (TP)';
                if (p.sl !== 'Auto' && currentPnl < -2.0) newStatus = 'CLOSED (SL)';
                
                const formatPnl = currentPnl > 0 ? `+${currentPnl.toFixed(2)}%` : `${currentPnl.toFixed(2)}%`;
                return { ...p, pnl: formatPnl, status: newStatus };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, [positions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, loading]);

    // Auto-detect wallet connection on load
    useEffect(() => {
        const sendGreeting = async (addr: string, bal: string) => {
            setLoading(true);
            try {
                // Fetch trending tokens to make the greeting dynamic but fast & free
                const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
                const data = await res.json();

                let marketUpdate = t.marketUpdateActive;
                if (data && data.coins && data.coins.length >= 3) {
                    const top3 = data.coins.slice(0, 3).map((c: { item: { symbol: string } }) => c.item.symbol).join(', ');
                    marketUpdate = t.marketUpdateTrending.replace('{top3}', top3);
                }

                const greetingStr = t.tradeAgentGreeting1.replace('{bal}', bal).replace('{marketUpdate}', marketUpdate);
                setMessages([{ role: 'assistant', content: greetingStr }]);
                setLatestAiIndex(0);
            } catch {
                setMessages([{ role: 'assistant', content: t.tradeAgentGreeting2.replace('{bal}', bal) }]);
                setLatestAiIndex(0);
            } finally {
                setLoading(false);
            }
        };

        const checkWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        const addr = accounts[0].address;
                        setWallet(addr);
                        let balStr = "0.0000";
                        if (typeof window.ethereum !== 'undefined' && window.ethereum) {
                            const prov = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                            const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x6f913dC219e2B76878a8345cAB7d0577F3ce97e5"; // Updated to recent vault if absent
                            const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
                            const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, prov);
                            const balRaw = await contract.getUserBNBBalance(addr);
                            balStr = parseFloat(ethers.formatEther(balRaw)).toFixed(4);
                            setBalance(balStr);
                        }
                        sendGreeting(addr, balStr);
                    }
                } catch { /* ignore */ }
            }
        };
        checkWallet();

        // Listen for wallet changes
        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = (...args: unknown[]) => {
                const accounts = args[0] as string[];
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                } else {
                    setWallet(null);
                    setBalance(null);
                }
            };
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchBalance = async (address: string) => {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x6f913dC219e2B76878a8345cAB7d0577F3ce97e5";
            const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
            const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
            const bal = await contract.getUserBNBBalance(address);
            setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
        } catch { /* ignore */ }
    };

    const triggerGreeting = useCallback(async (addr: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: addr,
                    messages: [{ role: 'user', content: 'hi, i just connected my wallet' }]
                })
            });
            const data = await res.json();
            if (data.success && data.data?.content) {
                const text = data.data.content.replace(/```action[\s\S]*?```/g, '').trim();
                setMessages([{ role: 'assistant', content: text }]);
                setLatestAiIndex(0);
            } else {
                setMessages([{ role: 'assistant', content: "Hey! SMC AI connected. What do you want to analyze today?" }]);
                setLatestAiIndex(0);
            }
        } catch {
            setMessages([{ role: 'assistant', content: "Hey! SMC AI connected. What do you want to analyze today?" }]);
            setLatestAiIndex(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    fetchBalance(accounts[0]);
                    triggerGreeting(accounts[0]);
                }
            } catch (e) {
                console.error("User rejected wallet request", e);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    // Build positions summary for agent memory
    const buildPositionsSummary = useCallback(() => {
        if (positions.length === 0 && tradeHistory.length === 0) return '';
        let summary = '\n[My current positions: ';
        if (positions.length > 0) {
            summary += positions.filter(p => p.status === 'OPEN').map(p => `${p.side} ${p.symbol} @ $${p.entry} PNL:${p.pnl}`).join(', ');
        }
        if (tradeHistory.length > 0) {
            summary += ' | Recent closed: ' + tradeHistory.slice(0, 3).map(h => `${h.symbol} ${h.status}`).join(', ');
        }
        summary += ']';
        return summary;
    }, [positions, tradeHistory]);

    // Confirm a proposed trade
    const handleConfirmProposal = async (msgIndex: number) => {
        const proposal = messages[msgIndex]?.tradeProposal;
        if (!proposal || !wallet) return;

        // Update proposal status
        setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, tradeProposal: { ...m.tradeProposal!, status: 'confirmed' as const } } : m));
        setLoading(true);

        try {
            const tradeData = {
                symbol: proposal.symbol, side: proposal.action,
                size: '0.01 BNB', entry: proposal.entry,
                sl: proposal.sl, tp: proposal.tp, confidence: proposal.confidence
            };
            const executeRes = await fetch('/api/trade/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenAddress: proposal.tokenAddress,
                    action: proposal.action || 'BUY',
                    amountUsd: 5,
                    walletAddress: wallet,
                    tradeDetails: tradeData
                })
            });
            const execData = await executeRes.json();
            let resultMsg: string;
            if (execData.success) {
                const hashDisp = execData.txHash ? `${execData.txHash.substring(0, 10)}...` : 'Simulated';
                resultMsg = `✅ Trade Executed! ${proposal.action} ${proposal.symbol}\nEntry: $${proposal.entry} | SL: $${proposal.sl} | TP: $${proposal.tp}\nTxHash: ${hashDisp}`;
                fetchTradeData();
                setActiveChart(proposal.symbol);
            } else {
                resultMsg = `❌ Execution Failed: ${execData.error}`;
            }
            setMessages(prev => {
                const next = [...prev, { role: 'assistant' as const, content: resultMsg, tradeExecuted: execData.success ? { symbol: proposal.symbol, side: proposal.action, size: '0.01 BNB', entry: proposal.entry, sl: proposal.sl, tp: proposal.tp, confidence: proposal.confidence } : undefined }];
                setLatestAiIndex(next.length - 1);
                return next;
            });
        } catch {
            setMessages(prev => [...prev, { role: 'assistant' as const, content: '❌ Could not reach Vault Network.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Reject a proposed trade
    const handleRejectProposal = (msgIndex: number) => {
        setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, tradeProposal: { ...m.tradeProposal!, status: 'rejected' as const } } : m));
        setMessages(prev => [...prev, { role: 'assistant' as const, content: 'Trade cancelled. No worries! Want me to look at something else?' }]);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !wallet) return;

        const userMsg = input.trim();
        setInput('');
        // Append positions summary to user message for agent memory
        const posContext = buildPositionsSummary();
        const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg + posContext }];
        // Show clean message to user (without positions context)
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: wallet,
                    sessionId: 'default-session',
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await res.json();

            if (data.success && data.data?.content) {
                let textContent = data.data.content;
                let tradeData = undefined;
                let proposalData = undefined;

                // Parse action blocks
                const actionMatch = textContent.match(/```action\n([\s\S]*?)\n```/);
                if (actionMatch) {
                    try {
                        const action = JSON.parse(actionMatch[1]);
                        if (action.type === 'LOAD_CHART') {
                            setActiveChart(action.symbol);
                        } else if (action.type === 'PROPOSE_TRADE') {
                            // Show confirmation card — don't execute yet
                            proposalData = {
                                symbol: action.symbol || 'TOKEN',
                                tokenAddress: action.tokenAddress || '',
                                action: action.action || 'BUY',
                                entry: action.entry || 'Market',
                                sl: action.sl || 'Auto',
                                tp: action.tp || 'Auto',
                                confidence: action.confidence || '90%',
                                status: 'pending' as const,
                            };
                            setActiveChart(action.symbol || 'BNB');
                        } else if (action.type === 'PROPOSE_FUTURES_TRADE') {
                            proposalData = {
                                symbol: action.symbol || 'TOKEN',
                                tokenAddress: '', // Futures usually don't need a specific CA here, just symbol
                                action: action.action || 'LONG',
                                entry: action.entry || 'Market',
                                sl: action.sl || 'Auto',
                                tp: action.tp || 'Auto',
                                confidence: action.confidence || '90%',
                                status: 'pending' as const,
                                isFutures: true,
                                leverage: action.leverage || 20,
                                marginType: action.marginType || 'ISOLATED'
                            };
                            setActiveChart(action.symbol || 'BTCUSDT');
                        } else if (action.type === 'EXECUTE_TRADE') {
                            tradeData = {
                                symbol: action.symbol || 'TOKEN', side: action.action || 'BUY',
                                size: action.size || '0.01 BNB', entry: action.entry || 'Market',
                                sl: action.sl || 'Auto', tp: action.tp || 'Auto', confidence: action.confidence || '95%'
                            };
                            try {
                                const executeRes = await fetch('/api/trade/execute', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        tokenAddress: action.tokenAddress || '0x55d398326f99059ff775485246999027b3197955',
                                        action: action.action || 'BUY',
                                        amountUsd: 5,
                                        walletAddress: wallet,
                                        tradeDetails: tradeData
                                    })
                                });
                                const execData = await executeRes.json();
                                if (execData.success) {
                                    const hashDisp = execData.txHash ? `[${execData.txHash.substring(0, 10)}...](https://bscscan.com/tx/${execData.txHash})` : 'Simulated (No Agent Key)';
                                    textContent += `\n\n✅ Vault Execution Confirmed\nTxHash: ${hashDisp}`;
                                    fetchTradeData();
                                    setActiveChart(action.symbol || 'BNB');
                                } else {
                                    textContent += `\n\n❌ Vault Execution Failed\n${execData.error}`;
                                    tradeData = undefined;
                                }
                            } catch {
                                textContent += `\n\n❌ Execution Error\nCould not reach Vault Network.`;
                                tradeData = undefined;
                            }
                        } else if (action.type === 'OPEN_TRADE_PANEL') {
                            const qs = new URLSearchParams({
                                symbol: action.symbol || '',
                                entry: action.entry || '',
                                tp: action.tp || '',
                                sl: action.sl || '',
                                side: action.side || 'BUY',
                            }).toString();
                            textContent = (textContent.replace(/```action\n[\s\S]*?\n```/, '').trim()) +
                                '\n\n→ Opening BSC Trading Panel with pre-loaded signal...';
                            setTimeout(() => { window.location.href = `/trade/bsc?${qs}`; }, 1800);
                        } else if (action.type === 'SCAN_RADAR') {
                            console.log("AI requested SCAN_RADAR");
                        }
                    } catch (e) { console.error("Failed to parse action block", e); }
                    textContent = textContent.replace(/```action\n[\s\S]*?\n```/, '').trim();
                }

                // Strip em-dashes from AI response
                textContent = textContent.replace(/—/g, ', ');

                const newMsg: ChatMessage = { role: 'assistant', content: textContent, tradeExecuted: tradeData, tradeProposal: proposalData };
                setMessages(prev => {
                    const next = [...prev, newMsg];
                    setLatestAiIndex(next.length - 1);
                    return next;
                });
            } else {
                const errDetail = data.error || 'Unknown error';
                setMessages(prev => [...prev, { role: 'assistant', content: `Hmm, ran into an issue: ${errDetail}` }]);
            }

        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection dropped. Try again in a sec?' }]);
        } finally {
            setLoading(false);
        }
    };

    // Wallet gate screen
    if (!wallet) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 160px)' }}>
                <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '48px 40px' }}>
                    <div style={{
                        width: '72px', height: '72px', margin: '0 auto 24px',
                        background: 'rgba(0,240,255,0.08)', border: '1px solid var(--accent-cyan)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 24px rgba(0,240,255,0.2)'
                    }}>
                        <Wallet size={32} style={{ color: 'var(--accent-cyan)' }} />
                    </div>
                    <h2 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>{t.walletNotConnected}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {t.connectWalletPrompt}
                    </p>
                    <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        onClick={connectWallet}
                    >
                        <Wallet size={18} />
                        {t.walletNotConnected}
                    </button>
                    <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Supports MetaMask and any EIP-1193 compatible wallet.
                    </p>
                </div>
            </div>
        );
    }

    const showRightPanel = activeChart || positions.length > 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: showRightPanel ? '1fr 450px' : '1fr', gap: '20px', height: 'calc(100vh - 120px)' }}>

            {/* Chat Interface */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid var(--accent-cyan)', padding: '6px', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                            <Zap size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>SMC AI Agent</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>OpenClaw Engine v2 · Online</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {balance && (
                            <div style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
                                {balance} BNB
                            </div>
                        )}
                        <div style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {formatAddr(wallet)}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '12px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            alignItems: 'flex-start'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(0,240,255,0.08)',
                                border: msg.role === 'assistant' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: msg.role === 'assistant' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                            }}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div style={{
                                background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                padding: msg.role === 'user' ? '12px 16px' : '4px 0',
                                borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '0',
                                border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                                maxWidth: '82%',
                                fontSize: '0.88rem',
                                lineHeight: '1.65',
                                color: 'var(--text-primary)',
                            }}>
                                {msg.role === 'assistant' && i === latestAiIndex ? (
                                    <TypewriterMessage content={msg.content} />
                                ) : (
                                    <MessageContent content={msg.content} />
                                )}

                                {/* Trade Execution Card */}
                                {msg.tradeExecuted && (
                                    <div style={{
                                        marginTop: '14px',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--success)',
                                        borderRadius: '6px',
                                        padding: '14px',
                                        boxShadow: '3px 3px 0px var(--success)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--success)', fontSize: '0.78rem', letterSpacing: '1px' }}>
                                                <div style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', animation: 'pulseGlow 1.5s infinite' }} />
                                                {t.tradeExecutedTitle}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: '3px', color: 'var(--success)' }}>
                                                Simulated
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '0.78rem' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>{t.symbolLabel}</div>
                                                <div style={{ fontWeight: 800 }}>
                                                    {msg.tradeExecuted.symbol} <span style={{ color: msg.tradeExecuted.side?.includes('BUY') || msg.tradeExecuted.side?.includes('LONG') ? 'var(--success)' : 'var(--danger)' }}>{msg.tradeExecuted.side}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>{t.sizeLabel}</div>
                                                <div style={{ fontWeight: 800 }}>{msg.tradeExecuted.size}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.73rem', fontWeight: 700, textAlign: 'center' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>{t.entryLabel}</div>
                                                <div style={{ color: 'var(--accent-cyan)' }}>${msg.tradeExecuted.entry}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>{t.slLabel}</div>
                                                <div style={{ color: 'var(--danger)' }}>${msg.tradeExecuted.sl}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>{t.tpLabel}</div>
                                                <div style={{ color: 'var(--success)' }}>${msg.tradeExecuted.tp}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
                                            {t.confidenceLabel} {msg.tradeExecuted.confidence} · SMC Confluence Confirmed
                                        </div>
                                    </div>
                                )}

                                {/* Trade Proposal Confirmation Card */}
                                {msg.tradeProposal && (
                                    <div style={{
                                        marginTop: '14px',
                                        background: 'var(--bg-color)',
                                        border: `2px solid ${msg.tradeProposal.status === 'confirmed' ? 'var(--success)' : msg.tradeProposal.status === 'rejected' ? 'var(--danger)' : 'var(--accent-cyan)'}`,
                                        borderRadius: '6px',
                                        padding: '14px',
                                        boxShadow: `3px 3px 0px ${msg.tradeProposal.status === 'confirmed' ? 'var(--success)' : msg.tradeProposal.status === 'rejected' ? 'var(--danger)' : 'var(--accent-cyan)'}`,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,240,255,0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: msg.tradeProposal.status === 'confirmed' ? 'var(--success)' : msg.tradeProposal.status === 'rejected' ? 'var(--danger)' : 'var(--accent-cyan)', fontSize: '0.78rem', letterSpacing: '1px' }}>
                                                <div style={{ width: 6, height: 6, background: msg.tradeProposal.status === 'pending' ? 'var(--accent-cyan)' : msg.tradeProposal.status === 'confirmed' ? 'var(--success)' : 'var(--danger)', borderRadius: '50%', animation: msg.tradeProposal.status === 'pending' ? 'pulseGlow 1.5s infinite' : 'none' }} />
                                                {msg.tradeProposal.status === 'pending' ? (msg.tradeProposal.isFutures ? '📊 FUTURES SIGNAL' : '📊 TRADE SIGNAL') : msg.tradeProposal.status === 'confirmed' ? '✅ CONFIRMED' : '❌ REJECTED'}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(0,240,255,0.12)', padding: '3px 8px', borderRadius: '3px', color: 'var(--accent-cyan)' }}>
                                                {msg.tradeProposal.confidence} Confidence
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '0.78rem' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>{msg.tradeProposal.isFutures ? 'PAIR' : 'TOKEN'}</div>
                                                <div style={{ fontWeight: 800 }}>
                                                    {msg.tradeProposal.symbol} <span style={{ color: msg.tradeProposal.action.includes('LONG') || msg.tradeProposal.action.includes('BUY') ? 'var(--success)' : 'var(--danger)' }}>{msg.tradeProposal.action}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>
                                                    {msg.tradeProposal.isFutures ? 'MARGIN / LEV' : 'CA'}
                                                </div>
                                                <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                                    {msg.tradeProposal.isFutures 
                                                        ? <><span style={{ color: 'var(--warning)' }}>{msg.tradeProposal.marginType}</span> · {msg.tradeProposal.leverage}x</> 
                                                        : <>{msg.tradeProposal.tokenAddress.slice(0, 8)}...{msg.tradeProposal.tokenAddress.slice(-6)}</>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.73rem', fontWeight: 700, textAlign: 'center' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>ENTRY</div>
                                                <div style={{ color: 'var(--accent-cyan)' }}>${msg.tradeProposal.entry}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>SL</div>
                                                <div style={{ color: 'var(--danger)' }}>${msg.tradeProposal.sl}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '3px' }}>TP</div>
                                                <div style={{ color: 'var(--success)' }}>${msg.tradeProposal.tp}</div>
                                            </div>
                                        </div>
                                        {msg.tradeProposal.status === 'pending' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                                <button
                                                    onClick={() => handleConfirmProposal(i)}
                                                    className="btn-primary"
                                                    style={{ padding: '10px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px' }}
                                                >
                                                    <Zap size={14} /> {msg.tradeProposal.isFutures ? 'OPEN POS' : 'CONFIRM SWAP'}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectProposal(i)}
                                                    style={{ padding: '10px', fontSize: '0.8rem', fontWeight: 800, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <X size={14} /> REJECT
                                                </button>
                                            </div>
                                        )}
                                        {msg.tradeProposal.status !== 'pending' && (
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
                                                {msg.tradeProposal.status === 'confirmed' ? 'Trade sent to Vault for execution' : 'Trade signal dismissed'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'rgba(0,240,255,0.08)', border: '1px solid var(--accent-cyan)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)'
                            }}>
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1s ease-in-out infinite' }} />
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1s ease-in-out 0.2s infinite' }} />
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1s ease-in-out 0.4s infinite' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-color)', borderRadius: '8px', padding: '6px 6px 6px 16px', border: '1px solid var(--border-color)' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            placeholder={t.typeMessagePlaceholder}
                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', paddingRight: '8px' }}
                        />
                        <button
                            className="btn-primary"
                            style={{ padding: '9px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
                            onClick={handleSendMessage}
                            disabled={loading || !input.trim()}
                        >
                            <Send size={15} />
                            {t.send}
                        </button>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)', paddingLeft: '4px' }}>
                        {t.examplesTitle} {t.example1}, {t.example2}, {t.example3}
                    </div>
                </div>
            </div>

            {/* Dynamic Right Panel: Chart & Positions */}
            {showRightPanel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden' }}>
                    
                    {/* Chart Panel */}
                    {activeChart && (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: positions.length > 0 ? 0.6 : 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <BarChart2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                                    {activeChart}/USDT
                                </h3>
                                <button
                                    onClick={() => setActiveChart(null)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <iframe
                                    src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_${activeChart}&symbol=BINANCE:${activeChart}USDT&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=0a0e1a&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title={`${activeChart} Chart`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Positions & History Panel */}
                    {positions.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: activeChart ? 0.4 : 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', minHeight: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulseGlow 2s infinite' }} />
                                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Positions & History</h3>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[...positions, ...tradeHistory].map(pos => {
                                    const isLong = pos.side.includes('BUY') || pos.side.includes('LONG');
                                    const isProfit = pos.pnl.startsWith('+');
                                    
                                    return (
                                        <div key={pos.id} style={{ 
                                            background: 'var(--bg-color)', 
                                            border: `1px solid ${pos.status === 'OPEN' ? (isLong ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)'}`, 
                                            borderRadius: '6px', 
                                            padding: '12px',
                                            opacity: pos.status === 'OPEN' ? 1 : 0.6
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{pos.symbol}</span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '12px', background: isLong ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isLong ? 'var(--success)' : 'var(--danger)' }}>
                                                        {pos.side}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                    {pos.status}
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Size / Entry</div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{pos.size} @ ${pos.entry}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Live PNL</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: pos.status === 'OPEN' ? (isProfit ? 'var(--success)' : 'var(--danger)') : 'var(--text-primary)' }}>
                                                        {pos.pnl}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px', fontSize: '0.7rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>SL:</span> <span style={{ color: 'var(--danger)', fontWeight: 600 }}>${pos.sl}</span>
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>TP:</span> <span style={{ color: 'var(--success)', fontWeight: 600 }}>${pos.tp}</span>
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'right', color: 'var(--text-secondary)' }}>
                                                    {pos.time}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
