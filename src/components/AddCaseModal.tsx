import React, { useState } from 'react';
import { X, MapPin, Check, Loader2 } from 'lucide-react';

export function AddCaseModal({ isOpen, onClose, onAdded, token }: { isOpen: boolean, onClose: () => void, onAdded: () => void, token: string }) {
  const [lga, setLga] = useState('Katsina');
  const [lat, setLat] = useState(12.98);
  const [lng, setLng] = useState(7.60);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  if (!isOpen) return null;

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error.message || error);
          alert('Unable to get location.');
          setLocating(false);
        }
      );
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lga,
          lat,
          lng,
        })
      });
      if (res.ok) {
        onAdded();
        onClose();
      } else {
        alert('Failed to create flag');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Add Construction Flag</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          <form id="add-case" onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">LGA</label>
              <input required value={lga} onChange={e => setLga(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location Coordinates</label>
              <div className="flex gap-2">
                <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Lat" />
                <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Lng" />
              </div>
              <button type="button" onClick={getLocation} className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100">
                {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />} Get Current Location
              </button>
            </div>
          </form>
        </div>
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button form="add-case" type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Flag Site
          </button>
        </div>
      </div>
    </div>
  );
}
