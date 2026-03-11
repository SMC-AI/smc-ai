"use client";

import { useEffect, useRef, useState } from "react";

const FLOW_NODES = [
    {
        id: "raw",
        label: "RAW DATA",
        sub: "Market Feed",
        icon: "⛓",
        color: "#94a3b8",
        glow: "rgba(148,163,184,0.35)",
        details: ["CEX/DEX OHLCV", "Order Book Depth", "Volume Delta", "Funding Rate"],
    },
    {
        id: "smc",
        label: "SMC ENGINE",
        sub: "OpenClaw 🦀",
        icon: "🦀",
        color: "#00f0ff",
        glow: "rgba(0,240,255,0.35)",
        details: ["Order Block Scan", "FVG Detection", "Liquidity Map", "CHoCH / BOS"],
    },
    {
        id: "xai",
        label: "xAI ORACLE",
        sub: "Sentiment 𝕏",
        icon: "𝕏",
        color: "#a78bfa",
        glow: "rgba(167,139,250,0.35)",
        details: ["Twitter/X Feed", "Mention Volume", "Sentiment Score", "Whale Alerts"],
    },
    {
        id: "signal",
        label: "SIGNAL",
        sub: "Fusion Layer",
        icon: "⚡",
        color: "#f59e0b",
        glow: "rgba(245,158,11,0.35)",
        details: ["SMC + Sentiment", "Confluence Check", "Risk Filter", "Signal Strength"],
    },
    {
        id: "exec",
        label: "EXECUTION",
        sub: "0ms RPC",
        icon: "✅",
        color: "#10b981",
        glow: "rgba(16,185,129,0.35)",
        details: ["Limit Order Set", "TP / SL / Trail", "Risk 2.5% Calc", "Position Live"],
    },
];

function FlowPacket({ active, color }: { active: boolean; color: string }) {
    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: color,
                transform: "translateY(-50%)",
                boxShadow: `0 0 6px ${color}`,
                animation: active ? "packetFlow 1.4s ease-in-out infinite" : "none",
            }}
        />
    );
}

export default function AIFlowSession() {
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startAutoPlay = () => {
        intervalRef.current = setInterval(() => {
            setActiveStep((prev) => {
                const next = (prev + 1) % FLOW_NODES.length;
                setCompletedSteps((c) => {
                    if (next === 0) return [];
                    return [...c, prev];
                });
                return next;
            });
        }, 2200);
    };

    useEffect(() => {
        startAutoPlay();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNodeClick = (idx: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveStep(idx);
        setCompletedSteps(Array.from({ length: idx }, (_, i) => i));
        startAutoPlay();
    };

    const activeNode = FLOW_NODES[activeStep];

    return (
        /* Root: fills whatever container places it */
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            overflow: "hidden",
            boxSizing: "border-box",
        }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "16px",
                flexShrink: 0,
            }}>
                <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 900, letterSpacing: "3px", color: "var(--accent-cyan)", marginBottom: "2px" }}>
                        ◆ LIVE SESSION
                    </div>
                    <div style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
                        AI Processing Flow
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.58rem", fontWeight: 800, color: "var(--success)" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", animation: "pulseGlow 1.5s infinite" }} />
                    OPENCLAW ACTIVE
                </div>
            </div>

            {/* ── Pipeline row ─────────────────────────────────── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                overflowX: "auto",
                overflowY: "visible",
                paddingTop: "14px",
                paddingBottom: "8px",
                marginBottom: "14px",
                flexShrink: 0,
                /* hide scrollbar visually but keep scroll */
                scrollbarWidth: "none",
            }}>
                {FLOW_NODES.map((node, idx) => {
                    const isActive = activeStep === idx;
                    const isDone = completedSteps.includes(idx);
                    return (
                        <div key={node.id} style={{ display: "flex", alignItems: "center", flex: idx < FLOW_NODES.length - 1 ? "1 1 0" : "0 0 auto", minWidth: 0 }}>
                            {/* Node */}
                            <div
                                onClick={() => handleNodeClick(idx)}
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", minWidth: "54px", flexShrink: 0 }}
                            >
                                {/* Circle */}
                                <div style={{
                                    width: "clamp(40px, 7vw, 54px)",
                                    height: "clamp(40px, 7vw, 54px)",
                                    borderRadius: "50%",
                                    border: `2px solid ${isActive || isDone ? node.color : "var(--border-color)"}`,
                                    background: isDone ? `${node.color}22` : isActive ? `${node.color}18` : "var(--bg-card)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                                    boxShadow: isActive
                                        ? `0 0 18px ${node.glow}, 3px 3px 0px ${node.color}`
                                        : isDone ? `2px 2px 0px ${node.color}` : "1px 1px 0px var(--border-color)",
                                    transition: "all 0.4s ease",
                                    transform: isActive ? "scale(1.1)" : "scale(1)",
                                    position: "relative",
                                    flexShrink: 0,
                                }}>
                                    <span style={{ lineHeight: 1, userSelect: "none" }}>{node.icon}</span>
                                    {isDone && !isActive && (
                                        <div style={{
                                            position: "absolute", top: "-3px", right: "-3px",
                                            width: "14px", height: "14px", borderRadius: "50%",
                                            background: node.color, display: "flex", alignItems: "center",
                                            justifyContent: "center", fontSize: "0.45rem", fontWeight: 900, color: "#000",
                                        }}>✓</div>
                                    )}
                                </div>
                                {/* Text */}
                                <div style={{ textAlign: "center", maxWidth: "60px" }}>
                                    <div style={{ fontSize: "clamp(0.48rem, 1.2vw, 0.6rem)", fontWeight: 900, letterSpacing: "0.5px", color: isActive || isDone ? node.color : "var(--text-secondary)", transition: "color 0.4s ease", whiteSpace: "nowrap" }}>
                                        {node.label}
                                    </div>
                                    <div style={{ fontSize: "clamp(0.42rem, 1vw, 0.52rem)", color: "var(--text-secondary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60px" }}>
                                        {node.sub}
                                    </div>
                                </div>
                            </div>

                            {/* Connector */}
                            {idx < FLOW_NODES.length - 1 && (
                                <div style={{
                                    flex: 1,
                                    minWidth: "12px",
                                    height: "2px",
                                    position: "relative",
                                    background: (isActive || isDone)
                                        ? `linear-gradient(90deg, ${node.color}, ${FLOW_NODES[idx + 1].color})`
                                        : "var(--border-color)",
                                    marginBottom: "24px",
                                    transition: "background 0.6s ease",
                                    overflow: "visible",
                                }}>
                                    <FlowPacket active={isActive || isDone} color={isDone || isActive ? FLOW_NODES[idx + 1].color : "#334155"} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Active detail card ───────────────────────────── */}
            <div
                key={activeStep}
                style={{
                    background: "var(--bg-card)",
                    border: `2px solid ${activeNode.color}`,
                    borderRadius: "4px",
                    padding: "12px 14px",
                    boxShadow: `3px 3px 0px ${activeNode.color}`,
                    flexShrink: 0,
                    animation: "fadeSlideUp 0.3s ease",
                }}
            >
                <div style={{ fontSize: "0.58rem", fontWeight: 900, color: activeNode.color, letterSpacing: "2px", marginBottom: "8px" }}>
                    {activeNode.icon} {activeNode.label} — PROCESSING
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
                    {activeNode.details.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "clamp(0.6rem, 1.5vw, 0.72rem)", fontWeight: 700, color: "var(--text-primary)" }}>
                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: activeNode.color, flexShrink: 0 }} />
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Progress bar ─────────────────────────────────── */}
            <div style={{ marginTop: "12px", height: "3px", background: "var(--border-color)", borderRadius: "2px", overflow: "hidden", flexShrink: 0 }}>
                <div style={{
                    height: "100%",
                    width: `${((activeStep + 1) / FLOW_NODES.length) * 100}%`,
                    background: "linear-gradient(90deg, #00f0ff, #a78bfa, #10b981)",
                    transition: "width 0.4s ease",
                    boxShadow: "0 0 6px rgba(0,240,255,0.6)",
                }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "0.48rem", color: "var(--text-secondary)", fontWeight: 700, flexShrink: 0, flexWrap: "wrap", gap: "4px" }}>
                <span>STEP {activeStep + 1} / {FLOW_NODES.length}</span>
                <span>Tap node to inspect · Auto-advances</span>
            </div>
        </div>
    );
}
