"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Zap, Flame, Activity, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';

interface VolumeMover {
  token: string;
  name?: string;
  thumb?: string;
  volume: number;
  price: number | string;
  change: number;
  smartScore: number;
}

interface CoinGeckoItem {
  item: {
    symbol: string;
    name: string;
    large: string;
    data: {
      total_volume: string;
      price: number | string;
      price_change_percentage_24h?: { usd: number };
    }
  }
}

interface GeckoPoolItem {
  id: string;
  attributes: {
    name: string;
    address: string;
    base_token_price_usd: string;
    volume_usd: { h24: string };
    price_change_percentage: { h24: string };
    reserve_in_usd: string;
  };
  relationships: {
    base_token: { data: { id: string } };
    network?: { data?: { id?: string } };
  };
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [dataPoints, setDataPoints] = useState<number[]>(Array(50).fill(100)); // Chart baseline
  const [initialBalance, setInitialBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [volumeMovers, setVolumeMovers] = useState<VolumeMover[]>([
    { token: 'AIX', name: 'Alpha Index', thumb: '', volume: 12.4, price: 0.045, change: 142.5, smartScore: 98 },
    { token: 'MEME', name: 'Memecoin', thumb: '', volume: 5.4, price: 0.00012, change: 65.2, smartScore: 85 },
    { token: 'FLOKI', name: 'Floki', thumb: '', volume: 24.1, price: 0.00008, change: 12.4, smartScore: 60 }
  ]);
  const [topPools, setTopPools] = useState<GeckoPoolItem[]>([]);
  const [newPools, setNewPools] = useState<GeckoPoolItem[]>([]);
  const [showRiskTip, setShowRiskTip] = useState(false);
  const [tokenLogos, setTokenLogos] = useState<Record<string, string>>({});
  const [whaleTransfers, setWhaleTransfers] = useState<{ hash: string; from: string; to: string; value: string; timeStamp: string; tokenSymbol?: string }[]>([]);
  const [whaleLoading, setWhaleLoading] = useState(false);

  const fetchTrendingTokens = async () => {
    setIsScanning(true);
    try {
      const [cgkRes, geckoRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/search/trending'),
        fetch('/api/market/trending')
      ]);
      const data = await cgkRes.json();
      const geckoData = await geckoRes.json();

      if (data && data.coins) {
        const newMovers = data.coins.slice(0, 4).map((c: CoinGeckoItem) => ({
          token: c.item.symbol.toUpperCase(),
          name: c.item.name,
          thumb: c.item.large,
          volume: c.item.data.total_volume ? parseFloat(c.item.data.total_volume.replace(/[^0-9.-]+/g, "")) / 1000000 : (Math.random() * 50 + 10),
          price: c.item.data.price,
          change: c.item.data.price_change_percentage_24h?.usd || (Math.random() * 50 - 20),
          smartScore: Math.floor(Math.random() * 30 + 70)
        }));
        setVolumeMovers(newMovers);
        setLastUpdated(new Date());
      }

      if (geckoData && geckoData.success) {
        // Build token logo map from included data
        if (geckoData.included && Array.isArray(geckoData.included)) {
          const logoMap: Record<string, string> = {};
          geckoData.included.forEach((item: { id?: string; attributes?: { image_url?: string } }) => {
            if (item.id && item.attributes?.image_url) {
              logoMap[item.id] = item.attributes.image_url;
            }
          });
          setTokenLogos(prev => ({ ...prev, ...logoMap }));
        }

        if (geckoData.trending && geckoData.trending.length > 0) {
          const bscTrending = geckoData.trending.filter((p: GeckoPoolItem) => p.relationships?.network?.data?.id === 'bsc' || p.id?.startsWith('bsc_'));
          setTopPools(bscTrending.slice(0, 5));
        }
        if (geckoData.new_pairs && geckoData.new_pairs.length > 0) {
          const bscNew = geckoData.new_pairs.filter((p: GeckoPoolItem) => p.relationships?.network?.data?.id === 'bsc' || p.id?.startsWith('bsc_'));
          setNewPools(bscNew.slice(0, 5));
        }
      }

    } catch (err) {
      console.error('Failed to fetch trending tokens', err);
    }
    setIsScanning(false);
  };

  const fetchWhaleData = async () => {
    setWhaleLoading(true);
    try {
      // Fetch large BNB internal transactions from BSCScan (public API)
      const res = await fetch('https://api.bscscan.com/api?module=account&action=txlist&address=0xF977814e90dA44bFA03b6295A0616a897441aceC&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=YourApiKeyToken');
      const data = await res.json();
      if (data.status === '1' && data.result) {
        setWhaleTransfers(data.result.slice(0, 5).map((tx: { hash: string; from: string; to: string; value: string; timeStamp: string }) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: (parseFloat(tx.value) / 1e18).toFixed(2),
          timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleTimeString(),
          tokenSymbol: 'BNB'
        })));
      }
    } catch {
      // Fallback: generate sample whale data so UI is not empty
      setWhaleTransfers([
        { hash: '0xa1b2...demo', from: '0xF977...aceC', to: '0x3c11...2f8a', value: '2450.00', timeStamp: new Date().toLocaleTimeString(), tokenSymbol: 'BNB' },
        { hash: '0xc3d4...demo', from: '0x28C6...e4D7', to: '0xF977...aceC', value: '1890.50', timeStamp: new Date().toLocaleTimeString(), tokenSymbol: 'BNB' },
        { hash: '0xe5f6...demo', from: '0xF977...aceC', to: '0x5aE0...9b12', value: '3200.00', timeStamp: new Date().toLocaleTimeString(), tokenSymbol: 'BNB' },
      ]);
    }
    setWhaleLoading(false);
  };

  useEffect(() => {
    fetchTrendingTokens();
    fetchWhaleData();
    const whaleInterval = setInterval(fetchWhaleData, 30000);

    // Simulate real-time data for the Whale/Volume Tracker
    const trackerInterval = setInterval(() => {
      setVolumeMovers(prev => prev.map(m => {
        const volBump = (Math.random() - 0.45) * 0.1;
        // avoid price string operations failing
        const currentPrice = typeof m.price === 'string' ? parseFloat(m.price.replace(/[^0-9.-]+/g, "")) || 0.0001 : m.price;
        const priceBump = (Math.random() - 0.5) * (currentPrice * 0.02);
        const changeBump = (Math.random() - 0.4) * 0.5;
        return {
          ...m,
          volume: Math.max(1, m.volume + volBump),
          price: Math.max(0.000001, currentPrice + priceBump),
          change: m.change + changeBump
        };
      }));
    }, 2500);

    const fetchRealBalance = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || "0x6f913dC219e2B76878a8345cAB7d0577F3ce97e5";
            const VAULT_ABI = ["function getUserBNBBalance(address user) external view returns (uint256)"];
            const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
            const balRaw = await contract.getUserBNBBalance(accounts[0].address);
            const bal = parseFloat(ethers.formatEther(balRaw));
            setInitialBalance(bal);
            setCurrentBalance(bal);
            setDataPoints(Array(50).fill(bal));
          } else {
            setCurrentBalance(0);
          }
        } catch { /* ignore */ }
      }
    };
    fetchRealBalance();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', fetchRealBalance);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum?.removeListener('accountsChanged', fetchRealBalance);
      }
      clearInterval(trackerInterval);
      clearInterval(whaleInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format timestamp helper
  const getUpdateString = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  // Determine PnL Status
  const pnl = currentBalance - initialBalance;
  const pnlPercent = initialBalance > 0 ? (pnl / initialBalance) * 100 : 0;

  let statusColor = 'var(--accent-cyan)';
  let statusClass = 'text-cyan';

  if (pnlPercent > 0.05) {
    statusColor = 'var(--success)';
    statusClass = 'text-success';
  } else if (pnlPercent < -0.05) {
    statusColor = 'var(--danger)';
    statusClass = 'text-danger';
  }

  const maxData = Math.max(...dataPoints, initialBalance * 1.01);
  const minData = Math.min(...dataPoints, initialBalance * 0.99);
  const range = maxData - minData || 1;
  const width = 1000;
  const height = 200;
  const padding = 20;

  const getCoordinates = (val: number, index: number) => {
    const x = (index / (dataPoints.length - 1)) * width;
    const y = height - padding - ((val - minData) / range) * (height - (padding * 2));
    return { x, y };
  };

  const points = dataPoints.map((val, i) => getCoordinates(val, i));
  const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* BSC Whale Tracker */}
      <div className="glass-panel" style={{
        display: 'flex', flexDirection: 'column', gap: '12px',
        borderColor: 'rgba(139, 92, 246, 0.4)',
        background: 'rgba(139, 92, 246, 0.05)',
      }}>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%' }}>
              <Eye className="text-purple" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{t.bscWhaleTracker}</h3>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {whaleLoading ? t.scanningChain : `${whaleTransfers.length} ${t.recentTransfers}`}
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={fetchWhaleData} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            {whaleLoading ? t.scanning : t.refresh}
          </button>
        </div>
        {whaleTransfers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {whaleTransfers.map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>🐋</span>
                  <div>
                    <span style={{ fontWeight: 700 }}>{parseFloat(tx.value).toLocaleString()} {tx.tokenSymbol}</span>
                    <span style={{ color: 'var(--text-secondary)', margin: '0 6px' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.7rem' }}>{tx.from.slice(0, 6)}...→{tx.to.slice(0, 6)}...</span>
                  </div>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{tx.timeStamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Portfolio Card - OKX Style */}
          <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
            <div style={{
              position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px',
              background: `radial-gradient(circle, ${statusColor}22 0%, rgba(0,0,0,0) 70%)`,
              zIndex: 0,
              transition: 'background 1s ease'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.totalEstBalance} <Eye size={14} style={{ cursor: 'pointer' }} />
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }} className="text-primary">
                      ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.livePnl} </span>
                    <span className={statusClass} style={{ fontWeight: 600, transition: 'color 0.5s ease' }}>
                      {pnl > 0 ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      {' '}({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(3)}%)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                  {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf, i) => (
                    <button
                      key={tf}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: i === 0 ? 600 : 400
                      }}
                      className="hover-bg-glass"
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '200px', width: '100%', position: 'relative', marginTop: '32px' }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={statusColor} stopOpacity="0.4" style={{ transition: 'stop-color 1s ease' }} />
                      <stop offset="100%" stopColor={statusColor} stopOpacity="0" style={{ transition: 'stop-color 1s ease' }} />
                    </linearGradient>
                  </defs>
                  {[0, 50, 100, 150].map(y => (
                    <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
                  ))}
                  <path d={areaPath} fill="url(#chartGradient)" style={{ transition: 'd 1s linear' }} />
                  <path d={linePath} fill="none" stroke={statusColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'd 1s linear, stroke 1s ease' }} />
                  <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill="var(--bg-card)" stroke={statusColor} strokeWidth="3" className="animate-pulse-glow" style={{ transition: 'cx 1s linear, cy 1s linear, stroke 1s ease', boxShadow: `0 0 10px ${statusColor}` }} />
                </svg>
              </div>
            </div>
          </div>

          {/* Smart Money Radar / Top Volume Movers */}
          <div>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Flame className="text-danger" size={24} /> {t.smartMoneyRadar}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t.lastUpdated1h.replace('{time}', getUpdateString())}
                </div>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '6px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={fetchTrendingTokens}
                disabled={isScanning}
              >
                {isScanning ? <Activity size={16} className="animate-pulse" /> : <Zap size={16} />}
                {isScanning ? t.scanning : t.scanMarket}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {volumeMovers.map(item => (
                <div key={item.token} className="glass-panel flex-between" style={{ padding: '16px 24px', borderColor: item.smartScore > 80 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass)', transition: 'all 0.5s ease' }}>
                  <div className="flex-center" style={{ gap: '16px' }}>
                    {item.thumb ? (
                      <Image
                        src={item.thumb}
                        alt={item.token}
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%' }}
                        unoptimized={true}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {item.token ? item.token[0] : '?'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.token}
                        {item.smartScore > 90 && <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>HOT</span>}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', transition: 'all 0.3s' }}>{t.vol.replace('{vol}', (item.volume || 0).toFixed(1)).replace('{score}', item.smartScore.toString())}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, transition: 'color 0.3s' }} className={item.change > 0 ? "text-success" : "text-danger"}>
                      {item.change > 0 ? '+' : ''}{(item.change || 0).toFixed(1)}%
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', transition: 'all 0.3s' }}>
                      ${typeof item.price === 'number' ? item.price.toFixed(5) : item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Agent Quick Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ flex: 1 }}>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div className="flex-center" style={{ gap: '8px' }}>
                <Zap className="text-cyan animate-pulse-glow" size={24} style={{ borderRadius: '50%' }} />
                <h2 style={{ margin: 0 }}>{t.aiAgentQuickPanel}</h2>
              </div>
              <div className="badge badge-cyan">{t.active}</div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                {t.agentGreeting}
              </p>
            </div>

            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
              {t.pendingSignals}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '12px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <strong>$AIX</strong>
                  <div className="badge badge-success">{t.buying}</div>
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{t.execSniper}</p>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Activity size={18} /> {t.openFullAiTerminal}
            </button>
          </div>
        </div>
      </div>

      {/* Oracle Network Market Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>

        {/* Top Search / Trending Pools */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Activity className="text-cyan" size={24} /> {t.topBscTargetPools}
            </h2>
            <div className="badge badge-cyan">{t.oracleNode}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>{t.pair}</span>
            <span style={{ textAlign: 'right' }}>{t.action}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topPools.length > 0 ? topPools.map((pool) => {
              const baseSymbol = pool.attributes.name.split(' / ')[0] || 'WBNB';
              const poolAddress = pool.attributes.address;
              const baseTokenId = pool.relationships?.base_token?.data?.id;
              const logoUrl = baseTokenId ? tokenLogos[baseTokenId] : null;
              return (
                <div key={pool.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={baseSymbol} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--accent-cyan)', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.8rem' }}>
                        {baseSymbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <strong style={{ display: 'block' }}>{pool.attributes.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ${parseFloat(pool.attributes.base_token_price_usd || '0').toFixed(6)} • Liq: ${(parseFloat(pool.attributes.reserve_in_usd || '0') / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <strong style={{ display: 'block', color: parseFloat(pool.attributes.price_change_percentage?.h24 || '0') >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {parseFloat(pool.attributes.price_change_percentage?.h24 || '0') >= 0 ? '+' : ''}
                        {parseFloat(pool.attributes.price_change_percentage?.h24 || '0').toFixed(2)}%
                      </strong>
                    </div>
                    <Link href={`/trade/bsc?symbol=${baseSymbol}&address=${poolAddress}`}>
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', minWidth: '60px' }}>{t.trade}</button>
                    </Link>
                  </div>
                </div>
              )
            }) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t.scanningNetworkData}</p>
            )}
          </div>
        </div>

        {/* New Pairs */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div className="flex-between">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Zap className="text-warning" size={24} /> {t.newPairsEscrow}
              <div
                style={{ display: 'flex', alignItems: 'center', cursor: 'help', position: 'relative' }}
                onMouseEnter={() => setShowRiskTip(true)}
                onMouseLeave={() => setShowRiskTip(false)}
              >
                <AlertTriangle size={16} className="text-danger animate-pulse" />
                {showRiskTip && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', width: '240px', backgroundColor: 'rgba(0,0,0,0.95)', color: '#fff', border: '1px solid var(--danger)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.72rem', zIndex: 200, pointerEvents: 'none', lineHeight: 1.5, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#ef4444' }}>{t.highRiskDesignation}</strong>
                    {t.highRiskWait}
                  </div>
                )}
              </div>
            </h2>
            <div className="badge badge-warning">{t.oracleNode}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>{t.pair}</span>
            <span style={{ textAlign: 'right' }}>{t.action}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {newPools.length > 0 ? newPools.map((pool) => {
              const baseSymbol = pool.attributes.name.split(' / ')[0] || 'WBNB';
              const poolAddress = pool.attributes.address;
              const baseTokenId = pool.relationships?.base_token?.data?.id;
              const logoUrl = baseTokenId ? tokenLogos[baseTokenId] : null;

              return (
                <div key={pool.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={baseSymbol} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--warning)', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', fontWeight: 800, fontSize: '0.8rem' }}>
                        {baseSymbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <strong style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {pool.attributes.name}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ${parseFloat(pool.attributes.base_token_price_usd || '0').toFixed(6)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                        ${(parseFloat(pool.attributes.volume_usd?.h24 || '0') / 1000).toFixed(1)}K
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: parseFloat(pool.attributes.price_change_percentage?.h24 || '0') >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {parseFloat(pool.attributes.price_change_percentage?.h24 || '0') >= 0 ? '+' : ''}
                        {parseFloat(pool.attributes.price_change_percentage?.h24 || '0').toFixed(2)}%
                      </span>
                    </div>
                    <Link href={`/trade/bsc?symbol=${baseSymbol}&address=${poolAddress}`}>
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', minWidth: '60px' }}>{t.trade}</button>
                    </Link>
                  </div>
                </div>
              )
            }) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t.scanningNewDeployments}</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

