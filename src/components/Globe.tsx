import React, { Suspense } from 'react';
import FramerGlobe from './FramerGlobe';

export function Globe() {
  return (
    <div className="w-full max-w-[500px] lg:max-w-[600px] aspect-square mx-auto relative flex items-center justify-center overflow-hidden">
      <Suspense fallback={<div className="w-full h-full rounded-full bg-slate-100 animate-pulse"></div>}>
        <FramerGlobe 
          oceanColor="#e0f2fe"
          landColor="#10b981"
          dotSize={2.2}
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
            }
          ]}
        />
      </Suspense>
    </div>
  );
}
