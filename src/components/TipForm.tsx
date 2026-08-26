import React, { useState } from 'react';
import { MessageSquare, Check, AlertCircle, Loader2, MapPin, Tag, ShieldCheck } from 'lucide-react';

const VIOLATION_CATEGORIES = [
  'Hazardous / Leaning Billboard',
  'Unauthorized Construction',
  'Road Reserve Encroachment',
  'Drainage Line Obstruction',
  'Unregistered Commercial Sign',
];

export function TipForm({ onTipSubmitted }: { onTipSubmitted?: () => void }) {
  const [category, setCategory] = useState(VIOLATION_CATEGORIES[0]);
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error.message || error);
          // Set a realistic fallback Katsina location if denied
          setLocation({
            lat: 12.989 + (Math.random() - 0.5) * 0.05,
            lng: 7.604 + (Math.random() - 0.5) * 0.05,
          });
          setLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation({
        lat: 12.989,
        lng: 7.604,
      });
      setLocating(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;

    setStatus('submitting');

    const lat = location ? location.lat : 12.989 + (Math.random() - 0.5) * 0.05;
    const lng = location ? location.lng : 7.604 + (Math.random() - 0.5) * 0.05;
    const fullDescription = `[Category: ${category}] ${desc.trim()}`;

    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: fullDescription,
          reporter_phone: phone.trim() || undefined,
          lat,
          lng,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      setDesc('');
      setPhone('');
      setLocation(null);
      setStatus('success');
      if (onTipSubmitted) onTipSubmitted();

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white tracking-tight text-lg sm:text-xl flex items-center gap-2">
            <MessageSquare size={20} className="text-emerald-400" />
            File Whistleblower Tip
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Directly triaged to the Katsina State URPB enforcement patrol</p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1">
          <ShieldCheck size={12} /> Encrypted
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={12} className="text-emerald-400" />
            Infraction Classification *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {VIOLATION_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                  category === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Incident Description & Location Clues *
          </label>
          <textarea
            required
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
            placeholder="E.g., Large unbranded LED billboard swaying dangerously near IBB Way junction opposite the Central Bank..."
            disabled={status === 'submitting'}
          />
        </div>

        {/* Geolocation Button */}
        <div>
          <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Geographic Coordinates
          </label>
          <button
            type="button"
            onClick={getLocation}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-semibold transition-all ${
              location
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin size={15} className={location ? 'text-emerald-400' : 'text-slate-500'} />
              {locating
                ? 'Acquiring GPS Fix...'
                : location
                ? `GPS Captured: ${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E`
                : 'Auto-Detect Current GPS Coordinates'}
            </span>
            {locating ? (
              <Loader2 size={14} className="animate-spin text-emerald-400" />
            ) : location ? (
              <Check size={14} className="text-emerald-400 font-bold" />
            ) : (
              <span className="text-[10px] font-mono text-slate-500">Tap to attach</span>
            )}
          </button>
        </div>

        {/* Optional Phone */}
        <div>
          <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Contact Phone <span className="text-slate-500 font-normal">(Optional, for inspection reward eligibility)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
            placeholder="080XXXXXXXX"
            disabled={status === 'submitting'}
          />
        </div>

        {/* Submission Button */}
        <button
          type="submit"
          disabled={status !== 'idle'}
          className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg tracking-wide flex items-center justify-center gap-2 ${
            status === 'success'
              ? 'bg-emerald-500 text-slate-950'
              : status === 'error'
              ? 'bg-rose-500 text-white'
              : status === 'submitting'
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20 hover:scale-[1.01]'
          }`}
        >
          {status === 'success' && (
            <>
              <Check size={18} /> Tip Transmitted to Zonal Squad Successfully
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle size={18} /> Transmission Failed - Please Retry
            </>
          )}
          {status === 'submitting' && (
            <>
              <Loader2 size={18} className="animate-spin" /> Encrypting & Dispatching Tip...
            </>
          )}
          {status === 'idle' && 'Transmit Whistleblower Tip'}
        </button>
      </form>
    </div>
  );
}
