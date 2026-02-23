'use client';

export function ShaderBackground() {
    return (
        <>
            {/* Full-screen animated shader via iframe */}
            <iframe
                src="https://cdn.21st.dev/minhxthanh/animated-shader-background/default/bundle.1749003393329.html?theme=dark&dark=true"
                className="fixed inset-0 w-full h-full border-none pointer-events-none -z-10"
                style={{ colorScheme: 'normal' }}
                aria-hidden="true"
                tabIndex={-1}
                title="Animated background"
                loading="eager"
            />
            {/* Fallback dark bg visible before iframe loads */}
            <div className="fixed inset-0 -z-20 bg-[#050A14]" />
        </>
    );
}
