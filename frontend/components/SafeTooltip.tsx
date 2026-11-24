'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SafeTooltipProps {
  text: string;
  className?: string;
}

export function SafeTooltip({ text, className = '' }: SafeTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top' as 'top' | 'bottom' });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isVisible) {
        setShouldRender(true);
        } else {
        timeout = setTimeout(() => {
            setShouldRender(false);
        }, 250);
        }
        return () => clearTimeout(timeout);
    }, [isVisible]);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const tooltipWidth = 280;
        const tooltipHeight = 60;
        const gap = 10;

        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const placement = spaceAbove > tooltipHeight + gap || spaceAbove > spaceBelow ? 'top' : 'bottom';

        let top =
        placement === 'top'
            ? rect.top + scrollY - gap
            : rect.bottom + scrollY + gap;

        let left = rect.left + scrollX + rect.width / 2;

        const minLeft = scrollX + 12;

        const maxLeft = scrollX + viewportWidth - 12;

        left = Math.max(minLeft + tooltipWidth / 2, Math.min(left, maxLeft - tooltipWidth / 2));

        setCoords({ top, left, placement });
    };

    const handleShow = () => {
        updatePosition();
        setIsVisible(true);
    };

    return (
        <>
            <div
                ref={triggerRef}
                tabIndex={0}
                onMouseEnter={handleShow}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={handleShow}
                onBlur={() => setIsVisible(false)}
                className={`inline-flex items-center max-w-sm cursor-help group outline-none ${className}`}
            >
                <p className="truncate text-sm font-medium text-zinc-500 transition-all duration-300 group-hover:text-violet-500 group-focus-visible:text-violet-500 border-b border-dashed border-zinc-300/80 group-hover:border-violet-400/70 group-focus-visible:border-violet-400/70 pb-0.5">
                    {text}
                </p>
            </div>

            {mounted && shouldRender && createPortal(
                <div
                    ref={tooltipRef}
                    style={{
                    top: coords.top,
                    left: coords.left,
                    transform:
                        coords.placement === 'top'
                        ? 'translate(-50%, -100%)'
                        : 'translate(-50%, 0)',
                    }}
                    className={`absolute z-[9999] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isVisible
                        ? 'opacity-100 scale-100 blur-0'
                        : 'opacity-0 scale-[0.94] blur-[4px]'
                    }`}
                >
                    <div className="relative max-w-[280px]">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3.5 text-[13px] text-zinc-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">

                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

                            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />

                            <p className="relative leading-relaxed font-medium tracking-tight text-zinc-100/95">
                                {text}
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
                )}
            </>
    );
}