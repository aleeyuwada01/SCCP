import React, { Suspense } from 'react';
import FramerGlobe from './FramerGlobe';

export function Globe() {
  return (
    <div className="w-full max-w-[520px] lg:max-w-[600px] aspect-square mx-auto relative flex items-center justify-center overflow-hidden">
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/8 blur-3xl scale-110" />
      
      <Suspense fallback={<div className="w-full h-full rounded-full bg-slate-100 animate-pulse"></div>}>
        <FramerGlobe 
          oceanColor="#e8f5e9"
          landColor="#065f46"
          dotSize={2.4}
          dotDensity={4}
          autoRotate={true}
          locations={[
            {
              name: "Katsina",
              coordinates: "12.989, 7.604",
              color: "#ef4444",
              pulse: true,
              showLabel: true,
              action: "none"
            },
            {
              name: "Abuja",
              coordinates: "9.058, 7.491",
              color: "#10b981",
              pulse: false,
              showLabel: true,
              action: "none"
            },
            {
              name: "Lagos",
              coordinates: "6.524, 3.379",
              color: "#10b981",
              pulse: false,
              showLabel: true,
              action: "none"
            }
          ]}
        />
      </Suspense>
      
      {/* Floating badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-[10px] z-10" style={{ animation: 'floatBadge 6s ease-in-out infinite' }}>
        <div className="font-bold text-slate-800">34 LGAs</div>
        <div className="text-emerald-600 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Monitoring
        </div>
      </div>

      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
