"use client";

import { useTheme } from "next-themes";
import { Settings, Sun, Moon, Globe } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsButton() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!mounted) {
        return <button className="btn-linear-icon" style={{ width: 38, height: 38, opacity: 0 }} />;
    }

    return (
        <div ref={ref} style={{ position: 'relative', zIndex: 999999 }}>
            <button
                onClick={() => setOpen(!open)}
                className="btn-linear-icon"
                aria-label="Settings"
                title={t.settings}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38 }}
            >
                <Settings size={20} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '4px 4px 0px var(--text-primary)',
                    padding: '16px',
                    zIndex: 99999, // Force over hero section
                    minWidth: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}>
                    {/* Theme Section */}
                    <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t.theme}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setTheme('dark')}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `2px solid ${theme === 'dark' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                                    background: theme === 'dark' ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                }}
                            >
                                <Moon size={14} />{t.darkMode}
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `2px solid ${theme === 'light' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                                    background: theme === 'light' ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                }}
                            >
                                <Sun size={14} />{t.lightMode}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid var(--border-color)' }} />

                    {/* Language Section */}
                    <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={12} /> {t.language}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setLang('en')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `2px solid ${lang === 'en' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                                    background: lang === 'en' ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                }}
                            >
                                🇺🇸 EN
                            </button>
                            <button
                                onClick={() => setLang('zh')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: `2px solid ${lang === 'zh' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                                    background: lang === 'zh' ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                }}
                            >
                                🇨🇳 中文
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
