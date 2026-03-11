"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeftRight, TrendingUp, TrendingDown, Settings, ChevronDown, Info, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';

// Retrieves URL search params on client
function useSearchParams() {
    const [params, setParams] = useState<URLSearchParams | null>(null);
    useEffect(() => {
        setParams(new URLSearchParams(window.location.search));
    }, []);
    return params;
}

export default function BSCTradingPage() {
    const params = useSearchParams();
    const { t } = useLanguage();

    // State — pre-filled from query params (passed by AI agent via OPEN_TRADE_PANEL action)
    const [symbol, setSymbol] = useState('BNB');
    const [tokenAddress, setTokenAddress] = useState('');
    const [fromAmount, setFromAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [tp, setTp] = useState('');
    const [sl, setSl] = useState('');
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [activeTab, setActiveTab] = useState<'swap' | 'tp-sl'>('swap');
    const [chartProvider, setChartProvider] = useState<'TradingView' | 'GeckoTerminal'>('TradingView');
    const [tradeAddress, setTradeAddress] = useState<string>('');
    const [addrAutoFilled, setAddrAutoFilled] = useState(false);
    const [wallet, setWallet] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [priceUsd, setPriceUsd] = useState<string | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const POPULAR_TOKENS = [
        { symbol: 'BNB', name: 'BNB', address: 'native' },
        { symbol: 'ETH', name: 'Ethereum (BSC)', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' },
        { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955' },
        { symbol: 'CAKE', name: 'PancakeSwap', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
        { symbol: 'BTCB', name: 'Bitcoin BEP20', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' },
    ];

    // Load wallet on mount
    useEffect(() => {
        const checkWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        const addr = accounts[0].address;
                        setWallet(addr);
                        const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x6f913dC219e2B76878a8345cAB7d0577F3ce97e5"; // Updated to recent vault address
                        const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
                        const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
                        const bal = await contract.getUserBNBBalance(addr);
                        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
                    }
                } catch { /* ignore */ }
            }
        };
        checkWallet();
    }, []);

    // Pre-fill from AI agent params
    useEffect(() => {
        if (!params) return;
        const sym = params.get('symbol');
        const addrParam = params.get('address');
        const tpParam = params.get('tp');
        const slParam = params.get('sl');
        const sideParam = params.get('side');

        if (sym) setSymbol(sym.toUpperCase());
        if (addrParam) {
            setTradeAddress(addrParam);
            setTokenAddress(addrParam); // Auto-fill into swap panel CA field
            setAddrAutoFilled(true);
            setChartProvider('GeckoTerminal'); // Auto-switch for specific contracts
        }
        if (tpParam) setTp(tpParam);
        if (slParam) setSl(slParam);
        if (sideParam && (sideParam.includes('LONG') || sideParam === 'BUY')) setSide('BUY');
        else if (sideParam && (sideParam.includes('SHORT') || sideParam === 'SELL')) setSide('SELL');
    }, [params]);

    // Fetch token price from CoinGecko
    useEffect(() => {
        const fetchPrice = async () => {
            setLoadingPrice(true);
            try {
                const coinMap: Record<string, string> = {
                    BNB: 'binancecoin', ETH: 'ethereum', BTC: 'bitcoin', BTCB: 'bitcoin',
                    CAKE: 'pancakeswap-token', USDT: 'tether', SOL: 'solana', MATIC: 'matic-network'
                };
                const coinId = coinMap[symbol] || symbol.toLowerCase();
                const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
                const data = await res.json();
                if (data[coinId]?.usd) {
                    setPriceUsd(data[coinId].usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
                }
            } catch { /* ignore */ }
            setLoadingPrice(false);
        };
        fetchPrice();
    }, [symbol]);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x6f913dC219e2B76878a8345cAB7d0577F3ce97e5";
                    const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
                    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
                    const bal = await contract.getUserBNBBalance(accounts[0]);
                    setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
                }
            } catch { }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const handleSwap = async () => {
        if (!wallet || !fromAmount) return;

        const floatAmount = parseFloat(fromAmount);
        const floatBalance = parseFloat(balance || '0');

        if (floatAmount > floatBalance) {
            setTxStatus('error');
            alert('Insufficient Vault Balance!');
            setTimeout(() => setTxStatus('idle'), 4000);
            return;
        }

        setTxStatus('pending');

        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error("Please install MetaMask to execute swaps.");
            }

            const activeTokenDef = POPULAR_TOKENS.find(t => t.symbol === symbol) || POPULAR_TOKENS[0];
            const activeAddress = activeTokenDef.address === 'native' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : activeTokenDef.address;
            const bnbAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

            let srcToken = side === 'BUY' ? bnbAddress : activeAddress;
            let dstToken = side === 'BUY' ? activeAddress : bnbAddress;

            // If buying BNB with BNB we can't swap, so force USDT as opposite pair
            if (srcToken === dstToken && srcToken === bnbAddress) {
                if (side === 'BUY') { srcToken = '0x55d398326f99059fF775485246999027B3197955'; } // Buy BNB with USDT
                else { dstToken = '0x55d398326f99059fF775485246999027B3197955'; } // Sell BNB for USDT
            }

            const amountWei = ethers.parseUnits(fromAmount, 18).toString();
            const slipNum = parseFloat(slippage) || 1;

            const res = await fetch('/api/swap/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    src: srcToken,
                    dst: dstToken,
                    amount: amountWei,
                    from: wallet,
                    slippage: slipNum
                })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || data.error || "Failed to build transaction");
            }

            const txData = data.data.tx;

            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const signer = await provider.getSigner();

            const txResponse = await signer.sendTransaction({
                to: txData.to,
                data: txData.data,
                value: txData.value,
            });

            await txResponse.wait();
            setTxStatus('success');
            setTimeout(() => setTxStatus('idle'), 4000);

        } catch (err) {
            console.error('Swap Error:', err);
            setTxStatus('error');
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            alert("Swap Failed: " + errorMessage);
            setTimeout(() => setTxStatus('idle'), 4000);
        }
    };

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', height: 'calc(100vh - 104px)' }} className="bsc-trading-grid">

            {/* Left — TradingView Chart */}
            <div className="bsc-trading-chart-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', overflow: 'hidden' }}>
                {/* Chart Header */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--accent-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                                {symbol.slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{symbol}/USDT</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>BSC · PancakeSwap</div>
                            </div>
                        </div>
                        {loadingPrice ? (
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
                        ) : priceUsd ? (
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>${priceUsd}</div>
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {POPULAR_TOKENS.map(t => (
                            <button key={t.symbol}
                                onClick={() => setSymbol(t.symbol)}
                                style={{
                                    padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700,
                                    border: `1px solid ${symbol === t.symbol ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                                    background: symbol === t.symbol ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: symbol === t.symbol ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                    borderRadius: '12px', cursor: 'pointer'
                                }}>
                                {t.symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Provider Toggle */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                    <button
                        onClick={() => setChartProvider('TradingView')}
                        style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 700, background: chartProvider === 'TradingView' ? 'rgba(0,240,255,0.05)' : 'transparent', color: chartProvider === 'TradingView' ? 'var(--accent-cyan)' : 'var(--text-secondary)', border: 'none', borderBottom: chartProvider === 'TradingView' ? '2px solid var(--accent-cyan)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {t.chartProviderCustom}
                    </button>
                    <button
                        onClick={() => setChartProvider('GeckoTerminal')}
                        style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 700, background: chartProvider === 'GeckoTerminal' ? 'rgba(0,240,255,0.05)' : 'transparent', color: chartProvider === 'GeckoTerminal' ? 'var(--accent-cyan)' : 'var(--text-secondary)', border: 'none', borderBottom: chartProvider === 'GeckoTerminal' ? '2px solid var(--accent-cyan)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {t.chartProviderGecko}
                    </button>
                </div>

                {/* Chart Render */}
                <div style={{ flex: 1, background: '#000', position: 'relative' }}>
                    {chartProvider === 'TradingView' ? (
                        <iframe
                            key={`tv_${symbol}`}
                            src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_bsc_${symbol}&symbol=BINANCE:${symbol}USDT&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0a0e1a&studies=["RSI@tv-basicstudies","MACD@tv-basicstudies"]&theme=dark&style=1&timezone=Etc%2FUTC&locale=en`}
                            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
                            title={`${symbol} TradingView Chart`}
                            allow="clipboard-write"
                        />
                    ) : (
                        <iframe
                            key={`gt_${tradeAddress || symbol}`}
                            src={`https://www.geckoterminal.com/bsc/pools/${tradeAddress || (symbol === 'BNB' ? '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae' : POPULAR_TOKENS.find(t => t.symbol === symbol)?.address)}?embed=1&info=0&swaps=0`}
                            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
                            title={`${symbol} GeckoTerminal Chart`}
                            allow="clipboard-write"
                        />
                    )}
                </div>

                {/* SMC Signal Banner (shown when AI pre-fills data) */}
                {(tp || sl) && (
                    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,240,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            <Info size={14} />
                            SMC AI Signal Pre-loaded
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {tp && <span>TP: <strong style={{ color: 'var(--success)' }}>${tp}</strong></span>}
                            {sl && <span>SL: <strong style={{ color: 'var(--danger)' }}>${sl}</strong></span>}
                            <span>Side: <strong style={{ color: side === 'BUY' ? 'var(--success)' : 'var(--danger)' }}>{side}</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right — Trade Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>

                {/* Wallet Status */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', boxShadow: 'var(--shadow-base)' }}>
                    {wallet ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>WALLET</div>
                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700 }}>{formatAddr(wallet)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>BALANCE</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{balance ?? '—'} BNB</div>
                            </div>
                        </div>
                    ) : (
                        <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={connectWallet}>
                            {t.walletNotConnected}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-base)', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                        {[{ id: 'swap', label: 'Swap' }, { id: 'tp-sl', label: 'TP / SL Manager' }].map(tab => (
                            <button key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'swap' | 'tp-sl')}
                                style={{
                                    flex: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                                    background: activeTab === tab.id ? 'rgba(0,240,255,0.06)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '12px' }}>
                        {activeTab === 'swap' ? (
                            <>
                                {/* Side selector */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    {(['BUY', 'SELL'] as const).map(s => (
                                        <button key={s} onClick={() => setSide(s)}
                                            style={{
                                                padding: '8px', fontWeight: 800, fontSize: '0.8rem', border: '1px solid',
                                                borderColor: side === s ? (s === 'BUY' ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)',
                                                background: side === s ? (s === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'transparent',
                                                color: side === s ? (s === 'BUY' ? 'var(--success)' : 'var(--danger)') : 'var(--text-secondary)',
                                                borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                            }}>
                                            {s === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                {/* Token selector */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TOKEN</label>
                                    <div style={{ position: 'relative' }}>
                                        <select value={symbol} onChange={e => setSymbol(e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                            {POPULAR_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol} — {t.name}</option>)}
                                        </select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                                    </div>
                                </div>

                                {/* Custom address */}
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block' }}>TOKEN ADDRESS (CA)</label>
                                        {addrAutoFilled && tokenAddress && (
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: '12px', padding: '2px 6px' }}>
                                                ✓ CA Auto-Injected
                                            </span>
                                        )}
                                    </div>
                                    <input type="text" value={tokenAddress} onChange={e => { setTokenAddress(e.target.value); setAddrAutoFilled(false); }} placeholder="0x... (auto-filled when routing from market)"
                                        style={{ width: '100%', padding: '8px 10px', background: addrAutoFilled && tokenAddress ? 'rgba(16,185,129,0.06)' : 'var(--bg-color)', border: `1px solid ${addrAutoFilled && tokenAddress ? 'var(--success)' : 'var(--border-color)'}`, borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none', fontFamily: 'monospace' }} />
                                </div>

                                {/* Amount */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>AMOUNT (BNB)</label>
                                    <input type="number" value={fromAmount} onChange={e => setFromAmount(e.target.value)} placeholder="0.0"
                                        style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                                    {balance && <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Available: {balance} BNB</div>}
                                </div>

                                {/* Slippage */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        <Settings size={11} style={{ display: 'inline', marginRight: '4px' }} />
                                        {t.slippageTolerance}
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {['0.1', '0.5', '1.0', '2.0'].map(v => (
                                            <button key={v} onClick={() => setSlippage(v)}
                                                style={{
                                                    flex: 1, padding: '6px 4px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid',
                                                    borderColor: slippage === v ? 'var(--accent-cyan)' : 'var(--border-color)',
                                                    background: slippage === v ? 'rgba(0,240,255,0.1)' : 'transparent',
                                                    color: slippage === v ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                                    borderRadius: '12px', cursor: 'pointer'
                                                }}>{v}%</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Swap button */}
                                <button
                                    className={side === 'BUY' ? 'btn-primary' : 'btn-secondary'}
                                    style={{
                                        width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: txStatus === 'success' ? 'var(--success)' : txStatus === 'error' ? 'var(--danger)' : side === 'BUY' ? 'var(--accent-cyan)' : 'transparent',
                                        color: side === 'BUY' || txStatus === 'success' || txStatus === 'error' ? '#000' : 'var(--danger)',
                                        border: side === 'SELL' ? '2px solid var(--danger)' : 'none',
                                    }}
                                    onClick={handleSwap}
                                    disabled={txStatus === 'pending' || !wallet || !fromAmount}>
                                    {txStatus === 'pending' ? (
                                        <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.executing}</>
                                    ) : txStatus === 'success' ? (
                                        <><CheckCircle2 size={16} /> {t.swapSuccess}</>
                                    ) : txStatus === 'error' ? (
                                        <><AlertTriangle size={16} /> {t.swapFailed}</>
                                    ) : (
                                        <><ArrowLeftRight size={16} /> {side} {symbol}</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* TP/SL Manager */}
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                                    Set your Take Profit and Stop Loss levels. SMC AI auto-fills these from signal analysis.
                                </p>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', display: 'block', marginBottom: '6px' }}>TAKE PROFIT (USD)</label>
                                    <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="0.00"
                                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid var(--success)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', display: 'block', marginBottom: '6px' }}>STOP LOSS (USD)</label>
                                    <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="0.00"
                                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid var(--danger)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ENTRY PRICE (USD)</label>
                                    <input type="number" placeholder={priceUsd || '0.00'}
                                        style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }} />
                                </div>

                                {/* Risk/Reward preview */}
                                {tp && sl && (
                                    <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '0.78rem' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.68rem' }}>RISK/REWARD PREVIEW</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--success)' }}>TP: +${(parseFloat(tp) - (parseFloat(priceUsd?.replace(/,/g, '') || '0') || parseFloat(tp) * 0.95)).toFixed(2)}</span>
                                            <span style={{ color: 'var(--danger)' }}>SL: -${((parseFloat(priceUsd?.replace(/,/g, '') || '0') || parseFloat(sl) * 1.05) - parseFloat(sl)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                <button className="btn-primary" style={{ width: '100%', padding: '10px', fontWeight: 800, fontSize: '0.85rem' }}
                                    disabled={!wallet || !tp || !sl}>
                                    Set TP/SL Order
                                </button>
                                <p style={{ marginTop: '10px', fontSize: '0.68rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    Vault contract required for on-chain TP/SL execution
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* SMC AI Suggestion Card */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-base)', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '1px' }}>SMC AI RECOMMENDATION</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        {tp && sl ? (
                            <>Signal pre-loaded from AI analysis. Take Profit at <strong style={{ color: 'var(--success)' }}>${tp}</strong> and Stop Loss at <strong style={{ color: 'var(--danger)' }}>${sl}</strong>. Activate TP/SL Manager tab to set the order.</>
                        ) : (
                            <>Go to AI Agent and ask for a signal on <strong>{symbol}</strong>. The agent will pre-fill your TP, SL, and entry automatically.</>
                        )}
                    </div>
                    <a href="/trade" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                        → Open AI Agent
                    </a>
                </div>
            </div>
        </div>
    );
}
