// Centralized API client — always points to the same origin in production,
// or uses relative URLs so Next.js proxying works in dev.

const BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

export async function fetchMarketData(tokenAddress: string) {
    const res = await fetch(`${BASE_URL}/api/market/token/${tokenAddress}`);
    if (!res.ok) throw new Error('Failed to fetch market data');
    return res.json();
}

export async function fetchTrendingTokens() {
    const res = await fetch(`${BASE_URL}/api/market/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending tokens');
    return res.json();
}

export async function executeTrade(
    tokenAddress: string,
    action: 'BUY' | 'SELL',
    amountUsd: number,
    walletAddress: string
) {
    const res = await fetch(`${BASE_URL}/api/trade/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress, action, amountUsd, walletAddress }),
    });
    if (!res.ok) throw new Error('Trade execution failed');
    return res.json();
}
