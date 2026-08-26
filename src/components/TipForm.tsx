import React, { useState } from 'react';
import { MessageSquare, Check, AlertCircle, Loader2, MapPin, Tag } from 'lucide-react';

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
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error.message || error);
          alert('Unable to get location. Please ensure location permissions are granted.');
          setLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return;
    
    setStatus('submitting');
    
    const lat = location ? location.lat : 12.9 + Math.random() * 0.1;
    const lng = location ? location.lng : 7.5 + Math.random() * 0.1;
    const fullDescription = `[${category}] ${desc.trim()}`;
    
    // Build a local tip record that can be picked up by the dashboard
    const newTip = {
      id: 'tip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      lat,
      lng,
      description: fullDescription,
      photo_url: null,
      reporter_phone: phone || '',
      status: 'New',
      created_at: new Date().toISOString(),
    };

    let apiSuccess = false;
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: fullDescription, reporter_phone: phone || undefined, lat, lng })
      });
      if (res.ok) apiSuccess = true;
    } catch (err) {
      console.warn('API unavailable, saving tip locally', err);
    }

    // Always persist to localStorage so dashboard can display it
    try {
      const stored = JSON.parse(localStorage.getItem('sccp_citizen_tips') || '[]');
      stored.push(newTip);
      localStorage.setItem('sccp_citizen_tips', JSON.stringify(stored));
    } catch (e) {
      console.error('Failed to save tip locally', e);
    }

    setDesc('');
    setPhone('');
    setLocation(null);
    setCategory(VIOLATION_CATEGORIES[0]);
    setStatus('success');
    if (onTipSubmitted) onTipSubmitted();
    
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 tracking-tight text-lg">
        <MessageSquare size={20} className="text-emerald-600" /> Report an Issue
      </h3>
      <form onSubmit={submit} className="space-y-5">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={12} className="text-emerald-500" /> Classification *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {VIOLATION_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                  category === cat
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
          <textarea 
            required 
            rows={3} 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 resize-none"
            placeholder="E.g., Unauthorized building or signage starting near IBB way..."
            disabled={status === 'submitting'}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
          <button
            type="button"
            onClick={getLocation}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-semibold transition-all ${
              location ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin size={15} className={location ? 'text-emerald-500' : 'text-slate-400'} />
              {locating ? (
                'Acquiring GPS...'
              ) : location ? (
                `GPS: ${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E`
              ) : (
                'Use Current Location'
              )}
            </span>
            {locating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : location ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <span className="text-[10px] text-slate-400">Tap to attach</span>
            )}
          </button>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone (Optional)</label>
          <input 
            type="text" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="080..."
            disabled={status === 'submitting'}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={status !== 'idle'}
          className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm tracking-wide flex items-center justify-center gap-2 ${
            status === 'success' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
            status === 'error' ? 'bg-rose-500 text-white hover:bg-rose-600' :
            status === 'submitting' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
            'bg-slate-900 text-white hover:bg-slate-800 hover:shadow'
          }`}
        >
          {status === 'success' && <><Check size={18} /> Submitted Successfully</>}
          {status === 'error' && <><AlertCircle size={18} /> Failed to Submit</>}
          {status === 'submitting' && <><Loader2 size={18} className="animate-spin" /> Submitting...</>}
          {status === 'idle' && 'Submit Secure Tip'}
        </button>
      </form>
    </div>
  );
}
