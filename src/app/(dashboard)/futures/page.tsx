"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDownRight, EyeOff, Share2, Search, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';

// Demo tokens for Futures search prediction
const FUTURES_TOKENS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'BNBUSDT', name: 'Binance Coin' },
    { symbol: 'PEPEUSDT', name: 'Pepe' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'XRPUSDT', name: 'Ripple' },
    { symbol: 'ADAUSDT', name: 'Cardano' },
    { symbol: 'AVAXUSDT', name: 'Avalanche' },
    { symbol: 'LINKUSDT', name: 'Chainlink' },
    { symbol: 'MATICUSDT', name: 'Polygon' },
    { symbol: 'WIFUSDT', name: 'Dogwifhat' },
    { symbol: 'SHIBUSDT', name: 'Shiba Inu' },
    { symbol: 'OPUSDT', name: 'Optimism' },
    { symbol: 'ARBUSDT', name: 'Arbitrum' },
    { symbol: 'APTUSDT', name: 'Aptos' },
    { symbol: 'SUIUSDT', name: 'Sui' },
    { symbol: 'TONUSDT', name: 'Toncoin' },
    { symbol: 'TRXUSDT', name: 'TRON' },
    { symbol: 'DOTUSDT', name: 'Polkadot' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash' }
];

export default function FuturesDEX() {
    const { t } = useLanguage();
    
    // Core Layout State
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [searchInput, setSearchInput] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Order State
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
    const [limitPrice, setLimitPrice] = useState<string>('');
    const [marginType] = useState<'ISOLATED'>('ISOLATED'); // Strict Isolated Enforced
    const [leverage, setLeverage] = useState<number>(20);
    const [posSize, setPosSize] = useState<string>('');
    
    // Mock Data State
    const [priceUsd, setPriceUsd] = useState<string>('0.00');
    const [wallet, setWallet] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    // Share Modal State
    interface PositionData {
        symbol: string;
        side: string;
        size: number;
        entryPrice: number;
        markPrice: number;
        leverage: number;
        pnlUsd?: number;
        roe?: number;
    }

    const [showShareModal, setShowShareModal] = useState(false);
    const [mockShareData, setMockShareData] = useState<PositionData | null>(null); // For PNL image capture payload
    const [hideSize, setHideSize] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');

    // Real Positions Data Array (Empty for production readiness to remove mock trades)
    // We keep the map logic intact to satisfy responsive layout fixes.
    const [positions] = useState<PositionData[]>([]);

    // Derived State
    const calcCost = posSize ? (parseFloat(posSize) * parseFloat(priceUsd) / leverage) : 0;
    const estFee = posSize ? (parseFloat(posSize) * parseFloat(priceUsd) * 0.0004) : 0; 
    
    const calcLiquidation = () => {
        if (!posSize || !priceUsd) return 0;
        const entry = parseFloat(priceUsd);
        const dropRatio = 1 / leverage;
        return side === 'BUY' ? entry * (1 - dropRatio + 0.005) : entry * (1 + dropRatio - 0.005);
    };

    // Fetch Real Market Price
    useEffect(() => {
        let isMounted = true;
        const fetchPrice = async () => {
            try {
                const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`);
                const data = await res.json();
                if (isMounted && data.price) {
                    setPriceUsd(parseFloat(data.price).toFixed(symbol.includes('USDT') ? 2 : 4));
                }
            } catch (err) {
                console.error("Failed to fetch futures price:", err);
            }
        };

        fetchPrice(); // Initial fetch
        const interval = setInterval(fetchPrice, 3000); // Poll every 3s
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [symbol]);

    // Check Wallet Hook
    useEffect(() => {
        const checkWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        setWallet(accounts[0].address);
                        const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x34ACF4fe61fA4e67B62e03070632060ef595113B";
                        const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
                        const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
                        try {
                            const bal = await contract.getUserBNBBalance(accounts[0].address);
                            setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
                        } catch {
                            setBalance('0.00'); // Failsafe if not deposited
                        }
                    }
                } catch { }
            }
        };
        checkWallet();
    }, []);

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const handleShareDownload = async () => {
        if (!shareRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(shareRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `SMC_AI_PNL_${symbol}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 104px)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', flex: 1, minHeight: 0 }} className="bsc-trading-grid">
                
                {/* Left — TradingView Chart & Controls */}
                <div className="bsc-trading-chart-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', overflow: 'hidden' }}>
                    
                    {/* Header: Search & Info */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', flexWrap: 'wrap', gap: '12px' }}>
                        
                        <div style={{ position: 'relative', width: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px 8px' }}>
                                <Search size={14} color="var(--text-secondary)" />
                                <input 
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    placeholder={t.searchPairPlaceholder}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', padding: '4px', fontSize: '0.8rem', width: '100%' }}
                                />
                            </div>

                            {showDropdown && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '4px', zIndex: 50, maxHeight: '300px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                    {FUTURES_TOKENS.filter(token => token.symbol.toLowerCase().includes(searchInput.toLowerCase())).map(tItem => (
                                        <div 
                                            key={tItem.symbol}
                                            onClick={() => {
                                                setSymbol(tItem.symbol);
                                                setSearchInput('');
                                                setShowDropdown(false);
                                            }}
                                            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontWeight: 800 }}>{tItem.symbol}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>Perp</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Empty space where Orderblock badge used to be */}
                        </div>
                    </div>

                    {/* Main TV Chart */}
                    <div style={{ flex: 1, background: '#000', position: 'relative' }}>
                        <iframe
                            key={`tv_fut_${symbol}`}
                            src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_fut_${symbol}&symbol=BINANCE:${symbol}.P&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0a0e1a&studies=["RSI@tv-basicstudies"]&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`}
                            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
                            title={`${symbol} Perpetual Chart`}
                        />
                    </div>
                </div>

                {/* Right — Order Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
                    
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-base)' }}>
                        <Zap size={18} color="var(--accent-cyan)" />
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>{t.futuresTitle.toUpperCase()}</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', boxShadow: 'var(--shadow-base)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>WALLET</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>{wallet ? formatAddr(wallet) : '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>{t.futuresBalance?.toUpperCase()}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>${balance ?? '0.00'}</div>
                        </div>
                    </div>

                    {/* Order Controls */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', padding: '12px', flexShrink: 0 }}>
                        
                        {/* Order Type Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button onClick={() => setOrderType('MARKET')} style={{ flex: 1, padding: '6px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid', borderColor: orderType === 'MARKET' ? 'var(--accent-cyan)' : 'var(--border-color)', background: orderType === 'MARKET' ? 'rgba(0,240,255,0.1)' : 'transparent', color: orderType === 'MARKET' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>MARKET</button>
                            <button onClick={() => setOrderType('LIMIT')} style={{ flex: 1, padding: '6px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid', borderColor: orderType === 'LIMIT' ? 'var(--accent-cyan)' : 'var(--border-color)', background: orderType === 'LIMIT' ? 'rgba(0,240,255,0.1)' : 'transparent', color: orderType === 'LIMIT' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>LIMIT</button>
                        </div>
                        
                        {/* Selected Margin Display */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <div style={{ padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid var(--warning)', background: 'rgba(234,179,8,0.1)', color: 'var(--warning)', borderRadius: '12px' }}>
                                MARGIN: {marginType}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                            {(['BUY', 'SELL'] as const).map(s => (
                                <button key={s} onClick={() => setSide(s)}
                                    style={{
                                        padding: '10px', fontWeight: 800, fontSize: '0.9rem', border: '1px solid',
                                        borderColor: side === s ? (s === 'BUY' ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)',
                                        background: side === s ? (s === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'transparent',
                                        color: side === s ? (s === 'BUY' ? 'var(--success)' : 'var(--danger)') : 'var(--text-secondary)',
                                        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}>
                                    {s === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />} 
                                    {s === 'BUY' ? 'LONG' : 'SHORT'}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>LEVERAGE</span>
                                <span style={{ color: 'var(--accent-cyan)' }}>{leverage}x</span>
                            </div>
                            <input type="range" min="1" max="200" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                <span>1x</span>
                                <span>{t.leverageMax} 200x</span>
                            </div>
                        </div>

                        {orderType === 'LIMIT' && (
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>LIMIT PRICE (USDT)</label>
                                <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={priceUsd} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{t.posSize.toUpperCase()} ({symbol.replace('USDT', '')})</label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" value={posSize} onChange={(e) => setPosSize(e.target.value)} placeholder="0.0" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                                <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>≈ ${ (parseFloat(posSize || '0') * (orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : parseFloat(priceUsd))).toFixed(2) }</span>
                                    <button onClick={() => { if(balance && priceUsd) { setPosSize((parseFloat(balance) * leverage / (orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : parseFloat(priceUsd))).toFixed(5)); } }} style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', borderRadius: '2px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>MAX</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', fontSize: '0.75rem', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Margin Required</span>
                                <span style={{ fontWeight: 700 }}>${calcCost.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{t.liquidationPrice}</span>
                                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>${calcLiquidation().toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{t.estFees}</span>
                                <span style={{ fontWeight: 700 }}>${estFee.toFixed(3)}</span>
                            </div>
                        </div>

                        <button className={side === 'BUY' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px', background: side === 'BUY' ? 'var(--success)' : 'var(--danger)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }} disabled={!wallet || !posSize}>
                            {side === 'BUY' ? t.openLong : t.openShort} {symbol.replace('USDT', '')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Panel — Active Positions (Mocked) */}
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', height: '180px', flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <div onClick={() => setActiveTab('positions')} style={{ color: activeTab === 'positions' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottom: activeTab === 'positions' ? '2px solid var(--accent-cyan)' : 'none', paddingBottom: '4px', cursor: 'pointer' }}>Active Positions (1)</div>
                    <div onClick={() => setActiveTab('orders')} style={{ color: activeTab === 'orders' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottom: activeTab === 'orders' ? '2px solid var(--accent-cyan)' : 'none', paddingBottom: '4px', cursor: 'pointer' }}>Open Orders (0)</div>
                    <div onClick={() => setActiveTab('history')} style={{ color: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--text-secondary)', borderBottom: activeTab === 'history' ? '2px solid var(--accent-cyan)' : 'none', paddingBottom: '4px', cursor: 'pointer' }}>Closed Positions history</div>
                </div>
                
                {/* Position Table */}
                <div style={{ flex: 1, overflowX: 'auto' }}>
                    <div style={{ minWidth: '800px', padding: '12px 16px' }}>
                        {activeTab === 'positions' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 0.5fr 1fr 1fr 1fr 1fr 40px', gap: '12px', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>Pair</div>
                                    <div>Size</div>
                                    <div>Entry</div>
                                    <div>Mark</div>
                                    <div>Liq. Price</div>
                                    <div>PNL (ROE%)</div>
                                    <div style={{ textAlign: 'right' }}></div>
                                </div>
                                {positions.length > 0 ? positions.map((pos, idx) => {
                                    const pnlUsd = (pos.markPrice - pos.entryPrice) * pos.size * (pos.side === 'LONG' ? 1 : -1);
                                    const roe = (pnlUsd / (pos.entryPrice * pos.size / pos.leverage)) * 100;
                                    return (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 0.5fr 1fr 1fr 1fr 1fr 40px', gap: '12px', fontSize: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.015)', padding: '10px 8px', borderRadius: '12px', marginBottom: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900 }}>
                                                <div style={{ width: '4px', height: '14px', background: pos.side === 'LONG' ? 'var(--success)' : 'var(--danger)', borderRadius: '2px' }} />
                                                {pos.symbol} <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>{pos.leverage}x</span>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{pos.size}</div>
                                            <div style={{ fontWeight: 600 }}>${pos.entryPrice.toFixed(2)}</div>
                                            <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>${pos.markPrice.toFixed(2)}</div>
                                            <div style={{ color: 'var(--danger)' }}>${(pos.entryPrice * 0.95).toFixed(2)}</div>
                                            <div style={{ fontWeight: 800, color: pnlUsd >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                {pnlUsd >= 0 ? '+' : ''}{pnlUsd.toFixed(2)} ({roe.toFixed(2)}%)
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button onClick={() => { setMockShareData({ ...pos, pnlUsd, roe }); setShowShareModal(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '0 0 8px rgba(0, 240, 255, 0.8)', animation: 'pulse 2s infinite' }}>
                                                    <Share2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', color: 'var(--text-secondary)', fontSize: '0.75rem', flexDirection: 'column', gap: '8px', opacity: 0.6 }}>
                                        No active positions found.
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'history' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ opacity: 0.5 }}><TrendingUp size={32} /></div>
                                No closed positions found in recent history.
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Empty open orders
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Share PNL Modal overlay */}
            {showShareModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    <div style={{ width: '440px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Share2 size={16}/> {t.sharePnlTitle}</h3>
                            <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>

                        {/* Pnl Image Target */}
                        <div style={{ padding: '24px', background: 'var(--bg-color)', display: 'flex', justifyContent: 'center' }}>
                            
                            {/* Neo-brutalism Card that will be snapshotted */}
                            <div ref={shareRef} style={{ width: '360px', background: '#0a0e1a', padding: '24px', border: '3px solid #00f0ff', position: 'relative', overflow: 'hidden', boxShadow: '8px 8px 0px rgba(0,240,255,0.3)', color: '#fff' }}>
                                
                                {/* Background Grid Overlay */}
                                <div style={{ position: 'absolute', inset: 0, backgroundSize: '20px 20px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', pointerEvents: 'none' }}></div>
                                
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>{mockShareData?.symbol || symbol}</div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                <span style={{ padding: '2px 8px', background: mockShareData?.side === 'LONG' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: mockShareData?.side === 'LONG' ? '#10b981' : '#ef4444', border: `1px solid ${mockShareData?.side === 'LONG' ? '#10b981' : '#ef4444'}`, fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {mockShareData?.side || 'LONG'}
                                                </span>
                                                <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 800 }}>{mockShareData?.leverage || leverage}x</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/logo.png" alt="SMC AI" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00f0ff' }}>SMC AI</span>
                                        </div>
                                    </div>

                                    {/* Huge Main Number */}
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: (mockShareData?.roe || 0) >= 0 ? '#10b981' : '#ef4444', textShadow: `0 0 20px ${(mockShareData?.roe || 0) >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`, marginBottom: '4px', lineHeight: 1 }}>
                                        {(mockShareData?.roe || 0) >= 0 ? '+' : ''}{(mockShareData?.roe || 0).toFixed(2)}%
                                    </div>
                                    
                                    {!hideSize && (
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                                            PnL: {(mockShareData?.pnlUsd || 0) >= 0 ? '+' : ''}${(mockShareData?.pnlUsd || 0).toFixed(2)}
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)', margin: '16px 0' }}></div>

                                    {/* Stats & QR Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>{t.entryPrice}</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' }}>${(mockShareData?.entryPrice || 0).toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>{t.markPrice}</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: '#00f0ff' }}>${(mockShareData?.markPrice || 0).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '8px', background: '#fff' }}>
                                            <QRCodeCanvas value="https://smc-ai.io" size={60} level="H" />
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '16px', textAlign: 'right' }}>
                                        {t.scanToVerify}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={hideSize} onChange={(e) => setHideSize(e.target.checked)} />
                                <EyeOff size={14} /> {t.hidePositionSize}
                            </label>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleShareDownload} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <ArrowDownRight size={16} /> {t.downloadPng}
                                </button>
                                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Just closed a killer %2B${(mockShareData?.roe || 0).toFixed(1)}%25 ROE on ${mockShareData?.symbol || symbol} using @smcai_ ! %0A%0AValidate my proof of concepts directly on-chain. %0A%0Ahttps://smc-ai.io`, '_blank')} className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {t.shareTwitter}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
