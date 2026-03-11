"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Typewriter({
    text,
    delay = 0,
    speed = 50
}: {
    text: string,
    delay?: number,
    speed?: number
}) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setTimeout(() => {
            const intervalId = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                if (i >= text.length) clearInterval(intervalId);
            }, speed);

            return () => clearInterval(intervalId);
        }, delay);

        return () => clearTimeout(timer);
    }, [text, delay, speed]);

    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono inline-block"
        >
            {displayedText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-2 bg-cyan-500 ml-1"
                style={{ height: '1em', verticalAlign: 'text-bottom', backgroundColor: 'var(--accent-cyan)' }}
            />
        </motion.span>
    );
}
