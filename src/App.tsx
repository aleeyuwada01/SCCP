import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Activity, LayoutDashboard, FileText, AlertTriangle, MessageSquare, Check, X, Menu, LogOut, ChevronLeft, Search } from 'lucide-react';
import { TipForm } from './components/TipForm';
import { LandingPage } from './components/LandingPage';
import { AddBillboardModal } from './components/AddBillboardModal';
import { AddCaseModal } from './components/AddCaseModal';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [billboards, setBillboards] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [token, setToken] = useState(localStorage.getItem('sccp_token') || '');
  const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('sccp_user') || 'null'));
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [showAddBillboard, setShowAddBillboard] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.989, 7.604]);
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase();
    
    const matchedB = billboards.filter(b => 
      b.lga.toLowerCase().includes(query) || 
      (b.road_name && b.road_name.toLowerCase().includes(query))
    );
    const matchedC = cases.filter(c => 
      c.lga.toLowerCase().includes(query)
    );
    
    const allMatches = [...matchedB, ...matchedC];
    
    if (allMatches.length > 0) {
      const avgLat = allMatches.reduce((sum, item) => sum + item.lat, 0) / allMatches.length;
      const avgLng = allMatches.reduce((sum, item) => sum + item.lng, 0) / allMatches.length;
      setMapCenter([avgLat, avgLng]);
      setMapZoom(14); // Zoom in on the result
    } else {
      alert("No locations found matching that LGA or Road Name.");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWithAuth = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  };

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON for', res.url, text.substring(0, 50));
      return { error: 'Invalid JSON response' };
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const [bRes, cRes, tRes, aRes] = await Promise.all([
        fetchWithAuth('/api/billboards').then(safeJson),
        fetchWithAuth('/api/cases').then(safeJson),
        fetchWithAuth('/api/tips').then(safeJson),
        fetchWithAuth('/api/analytics').then(safeJson),
      ]);
      setBillboards(bRes.error ? [] : bRes);
      setCases(cRes.error ? [] : cRes);
      setTips(tRes.error ? [] : tRes);
      setAnalytics(aRes.error ? null : aRes);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleLogin = async (email: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password' })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('sccp_token', data.token);
        localStorage.setItem('sccp_user', JSON.stringify(data.user));
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('sccp_token');
    localStorage.removeItem('sccp_user');
    setShowLogin(false);
  };

  const getBillboardColor = (status: string) => {
    if (status.startsWith('Approved-Paid')) return '#10b981'; // Green
    if (status.includes('Due')) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const handleConvertTip = async (id: string, type: string) => {
    try {
      await fetchWithAuth(`/api/tips/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await fetchWithAuth(`/api/billboards/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved-Paid' })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    if (!showLogin) {
      return <LandingPage onLoginClick={() => setShowLogin(true)} />;
    }

    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center font-sans p-6 relative">
        <button 
          onClick={() => setShowLogin(false)} 
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ChevronLeft size={18} /> Back to Home
        </button>
        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-100 p-1">
              <img src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          </div>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Staff Login</h1>
            <p className="text-slate-500 text-sm">Select your role to access the dashboard</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => handleLogin('admin@sccp.ng')} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group relative overflow-hidden">
              <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-800">Admin Supervisor</div>
              <div className="text-sm text-slate-500 mt-1">Full access (CRUD), analytics</div>
            </button>
            <button onClick={() => handleLogin('rev@sccp.ng')} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50/50 transition-all group relative overflow-hidden">
              <div className="font-bold text-slate-900 text-lg group-hover:text-amber-800">Revenue Officer</div>
              <div className="text-sm text-slate-500 mt-1">Mark payments, convert tips</div>
            </button>
            <button onClick={() => handleLogin('insp1@sccp.ng')} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group relative overflow-hidden">
              <div className="font-bold text-slate-900 text-lg group-hover:text-indigo-800">Field Inspector</div>
              <div className="text-sm text-slate-500 mt-1">Register billboards, view cases</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static top-0 left-0 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl lg:shadow-sm z-30 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`p-4 border-b border-slate-200 bg-emerald-800 text-white shadow-md z-10 flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} h-24 shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-emerald-700 shadow-inner">
              <img src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                <h1 className="text-2xl font-black tracking-tight leading-none">SCCP</h1>
                <span className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mt-1">Katsina URPB</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavItem icon={<MapPin size={20} />} label="Map View" active={activeTab === 'map'} onClick={() => setActiveTab('map')} collapsed={!isSidebarOpen} />
          <NavItem icon={<FileText size={20} />} label="Signage Tracking" active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} collapsed={!isSidebarOpen} />
          <NavItem icon={<AlertTriangle size={20} />} label="Construction Flags" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} collapsed={!isSidebarOpen} />
          <NavItem icon={<MessageSquare size={20} />} label="Public Tips" active={activeTab === 'tips'} onClick={() => setActiveTab('tips')} collapsed={!isSidebarOpen} />
          {(currentUser?.role === 'supervisor' || currentUser?.role === 'revenue_officer') && (
            <NavItem icon={<LayoutDashboard size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} collapsed={!isSidebarOpen} />
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight capitalize truncate">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4 pl-4 sm:pl-6">
            <div className="hidden sm:flex items-center space-x-3 text-right">
              <div className="text-sm">
                <p className="font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{currentUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-sm text-emerald-800 font-bold uppercase shrink-0 border border-emerald-200">
              {currentUser?.name.substring(0, 2)}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col">
          {activeTab === 'map' && (
            <div className="flex-grow rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 h-full min-h-[500px]">
              {/* Map Search Overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-full max-w-sm pointer-events-auto px-4">
                <form onSubmit={handleMapSearch} className="relative shadow-lg rounded-xl overflow-hidden bg-white/95 backdrop-blur border border-slate-200">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LGA or Road Name..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                  <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center text-slate-400">
                    <Search size={18} />
                  </div>
                  <button type="submit" className="hidden">Search</button>
                </form>
              </div>

              <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} className="h-full w-full z-0">
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomleft"
                />
                
                {/* Billboards */}
                {billboards.map(b => (
                  <Marker key={b.id} position={[b.lat, b.lng]} icon={getMarkerIcon(getBillboardColor(b.status))}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold">{b.owner_name}</p>
                        <p className="text-sm">Status: {b.status}</p>
                        <p className="text-sm">Type: {b.structure_type}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Construction Cases */}
                {cases.map(c => (
                  <Marker key={c.id} position={[c.lat, c.lng]} icon={getMarkerIcon('#f97316')}> {/* Orange */}
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold">Construction Flag</p>
                        <p className="text-sm">Source: {c.detection_source}</p>
                        <p className="text-sm">Status: {c.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Public Tips */}
                {tips.filter(t => t.status === 'New').map(t => (
                  <Marker key={t.id} position={[t.lat, t.lng]} icon={getMarkerIcon('#8b5cf6')}> {/* Purple */}
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold">Public Tip</p>
                        <p className="text-sm">"{t.description}"</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-200 text-xs font-semibold z-[400] space-y-2 pointer-events-auto">
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span>Compliant Signage</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <span>Payment Due</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> <span>Unregistered/Overdue</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> <span>Construction Flag</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> <span>Public Tip</span></div>
              </div>

              {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-auto">
                  <button onClick={() => setShowAddBillboard(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105">
                    + Register Signage
                  </button>
                  <button onClick={() => setShowAddCase(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105">
                    + Flag Construction
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'registry' && (
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-800 text-lg">Signage Tracking</h3>
                {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                  <button onClick={() => setShowAddBillboard(true)} className="text-sm font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                    + Register Signage
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">ID / Permit</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billboards.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-800">{b.permit_number || 'None'}</div>
                        <div className="text-slate-400 text-[10px] font-mono mt-0.5">{b.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{b.owner_name}</td>
                      <td className="px-6 py-4 text-slate-600">{b.road_name}, {b.lga}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          b.status.startsWith('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 
                          b.status.includes('Due') ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-rose-50 text-rose-700 border-rose-200/50'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!b.status.startsWith('Approved-Paid') && (currentUser?.role === 'supervisor' || currentUser?.role === 'revenue_officer') && (
                          <button onClick={() => handleMarkPaid(b.id)} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200">
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {activeTab === 'cases' && (
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-800 text-lg">Construction Flags</h3>
                {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                  <button onClick={() => setShowAddCase(true)} className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                    + Report Flag
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Days Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map(c => {
                    const daysOpen = Math.floor((Date.now() - new Date(c.first_detected_at).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${daysOpen > 14 ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-6 py-4 font-bold text-slate-800 font-mono text-[11px]">{c.id}</td>
                        <td className="px-6 py-4 capitalize font-medium text-slate-700">{c.detection_source}</td>
                        <td className="px-6 py-4 text-slate-600">{c.lga}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/50">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${daysOpen > 14 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {daysOpen} {daysOpen > 14 && ' (SLA Breach)'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px] overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Reporter</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Convert To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 overflow-y-auto">
                    {tips.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 text-[11px] font-mono">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={t.description}>{t.description}</td>
                        <td className="px-6 py-4 text-slate-600">{t.reporter_phone || 'Anonymous'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                            t.status === 'New' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50' : 'bg-slate-50 text-slate-600 border-slate-200/50'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {t.status === 'New' && (currentUser?.role === 'supervisor' || currentUser?.role === 'revenue_officer') && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleConvertTip(t.id, 'billboard')} className="text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200/50 hover:bg-emerald-100 hover:border-emerald-300 transition-all">
                                Signage Flag
                              </button>
                              <button onClick={() => handleConvertTip(t.id, 'construction')} className="text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200/50 hover:bg-amber-100 hover:border-amber-300 transition-all">
                                Constr. Flag
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="w-full lg:w-[400px] shrink-0">
                <TipForm onTipSubmitted={fetchData} />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Registry</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{analytics.totalBillboards}</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compliance Rate</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {Math.round((analytics.compliant / Math.max(analytics.totalBillboards, 1)) * 100) || 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Est. Monthly Leakage</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      ₦{(analytics.leakageEstimateNaira / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Cases</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{analytics.activeCases}</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 h-[400px]">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-800 text-lg mb-6">Structures by LGA</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.lgaBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="lga" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      <AddBillboardModal 
        isOpen={showAddBillboard} 
        onClose={() => setShowAddBillboard(false)} 
        onAdded={fetchData} 
        token={token} 
      />
      
      <AddCaseModal 
        isOpen={showAddCase} 
        onClose={() => setShowAddCase(false)} 
        onAdded={fetchData} 
        token={token} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 rounded-xl text-sm font-semibold transition-all ${
        active 
          ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100/50' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
      }`}
      title={collapsed ? label : undefined}
    >
      <div className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}>
        {icon}
      </div>
      {!collapsed && (
        <span className="whitespace-nowrap">{label}</span>
      )}
    </button>
  );
}

