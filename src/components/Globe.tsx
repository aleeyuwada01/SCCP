import React from 'react';

/**
 * Premium CSS globe with animated grid lines, orbital rings, glow effects,
 * and a pulsing Katsina location marker. No external dependencies needed.
 */
export function Globe() {
  return (
    <div className="w-full max-w-[520px] lg:max-w-[580px] aspect-square mx-auto relative flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl scale-110 animate-pulse" />

      {/* Orbital Ring 1 - slow */}
      <div className="absolute inset-[-10px] rounded-full border border-emerald-200/30" style={{ animation: 'globeSpin 20s linear infinite' }} />
      
      {/* Orbital Ring 2 - tilted */}
      <div className="absolute inset-[-20px] rounded-full border border-emerald-300/20" style={{ animation: 'globeSpin 30s linear infinite reverse', transform: 'rotateX(60deg) rotateZ(30deg)' }} />
      
      {/* Orbital Ring 3 */}
      <div className="absolute inset-[-5px] rounded-full border border-dashed border-slate-300/20" style={{ animation: 'globeSpin 25s linear infinite', transform: 'rotateX(75deg) rotateZ(-20deg)' }} />

      {/* Main Globe Body */}
      <div className="relative w-[85%] aspect-square rounded-full overflow-hidden" style={{
        background: 'radial-gradient(circle at 35% 30%, #d1fae5, #a7f3d0 30%, #6ee7b7 50%, #34d399 70%, #10b981 85%, #059669 100%)',
        boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.15), inset 15px 15px 40px rgba(255,255,255,0.25), 0 0 60px rgba(16,185,129,0.2), 0 0 120px rgba(16,185,129,0.1)',
      }}>
        {/* Atmosphere highlight */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }} />

        {/* Grid lines (latitude) */}
        {[20, 35, 50, 65, 80].map(pct => (
          <div key={`lat-${pct}`} className="absolute left-0 right-0 border-t border-emerald-800/10" style={{ top: `${pct}%` }} />
        ))}

        {/* Grid lines (longitude - vertical arcs simulated) */}
        {[25, 40, 55, 70].map(pct => (
          <div key={`lng-${pct}`} className="absolute top-0 bottom-0 border-l border-emerald-800/8" style={{ left: `${pct}%` }} />
        ))}

        {/* Africa-like landmass shape (simplified SVG overlay) */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }}>
          {/* West Africa region */}
          <path d="M85 60 Q90 55 100 58 Q108 60 112 68 Q115 75 118 85 Q120 95 115 105 Q112 112 108 118 Q105 125 100 130 Q95 128 90 120 Q85 112 82 105 Q78 95 80 85 Q82 75 85 65Z" fill="#065f46" />
          {/* Central/East */}
          <path d="M110 70 Q118 68 125 75 Q130 82 128 92 Q126 100 122 108 Q118 115 112 118 Q108 112 110 100 Q112 88 110 78Z" fill="#065f46" />
          {/* Southern */}
          <path d="M95 125 Q100 130 108 128 Q112 132 108 140 Q105 148 100 150 Q95 148 92 142 Q88 135 90 130Z" fill="#065f46" />
          {/* Mediterranean coast hint */}
          <path d="M75 50 Q85 45 95 48 Q100 50 105 52 Q95 55 85 55Z" fill="#065f46" />
        </svg>

        {/* Nigeria region highlight */}
        <div className="absolute" style={{ top: '38%', left: '40%', width: '12%', height: '10%' }}>
          <div className="w-full h-full rounded-sm bg-emerald-900/25 border border-emerald-700/20" />
        </div>

        {/* Katsina Marker */}
        <div className="absolute" style={{ top: '35%', left: '44%' }}>
          {/* Pulse rings */}
          <div className="absolute -inset-4 rounded-full border-2 border-red-400/40 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-7 rounded-full border border-red-300/20 animate-ping" style={{ animationDuration: '3s' }} />
          {/* Core dot */}
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 relative z-10 border-2 border-white" />
          {/* Label */}
          <div className="absolute left-5 -top-1 whitespace-nowrap z-20">
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg border border-slate-200/80 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-800 tracking-wide">KATSINA</span>
            </div>
          </div>
        </div>

        {/* Secondary location dots */}
        {[
          { top: '42%', left: '38%', label: 'Abuja' },
          { top: '45%', left: '50%', label: 'Lagos' },
        ].map(loc => (
          <div key={loc.label} className="absolute" style={{ top: loc.top, left: loc.left }}>
            <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full" />
          </div>
        ))}

        {/* Animated scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" style={{ animation: 'scanLine 4s linear infinite' }} />
        </div>
      </div>

      {/* Floating data badges */}
      <div className="absolute -top-2 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-[10px] z-10" style={{ animation: 'floatBadge 6s ease-in-out infinite' }}>
        <div className="font-bold text-slate-800">34 LGAs</div>
        <div className="text-emerald-600 font-bold">Active Monitoring</div>
      </div>

      <div className="absolute bottom-4 left-0 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-[10px] z-10" style={{ animation: 'floatBadge 6s ease-in-out infinite 3s' }}>
        <div className="font-bold text-slate-800">GIS Engine</div>
        <div className="text-emerald-600 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </div>
      </div>

      <div className="absolute top-1/3 -left-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-[10px] z-10" style={{ animation: 'floatBadge 5s ease-in-out infinite 1.5s' }}>
        <div className="font-bold text-slate-800">10,480+</div>
        <div className="text-slate-500 font-medium">Assets Tracked</div>
      </div>

      <style>{`
        @keyframes globeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
