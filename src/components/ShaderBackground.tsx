'use client';

export function ShaderBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            {/* Base */}
            <div className="absolute inset-0 bg-[#050A14]" />
            {/* Orb 1 — top-left sky blue */}
            <div className="gradient-orb orb-1" />
            {/* Orb 2 — bottom-right indigo */}
            <div className="gradient-orb orb-2" />
            {/* Orb 3 — center subtle */}
            <div className="gradient-orb orb-3" />
        </div>
    );
}
