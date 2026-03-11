"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Marquee({ children, speed = 20 }: { children: React.ReactNode, speed?: number }) {
    return (
        <div style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            position: "relative",
            display: "flex",
            width: "100%",
            borderTop: '1px solid rgba(0, 240, 255, 0.2)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            background: 'rgba(0, 240, 255, 0.05)',
            padding: '8px 0'
        }}>
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{ display: "flex", gap: "2rem", paddingLeft: "2rem" }}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
}
