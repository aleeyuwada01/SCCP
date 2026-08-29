import React, { useState, useEffect, useMemo, useRef } from 'react';
import MapGL, { Marker as MapMarker, Popup as MapPopup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { MapPin, LayoutDashboard, FileText, AlertTriangle, MessageSquare, Menu, LogOut, ChevronLeft, Search, ChevronDown, ChevronUp, Eye, EyeOff, Filter, Download, Clock, TrendingUp, Shield, Users, X as XIcon } from 'lucide-react';
import { TipForm } from './components/TipForm';
import { LandingPage } from './components/LandingPage';
import { AddBillboardModal } from './components/AddBillboardModal';
import { AddCaseModal } from './components/AddCaseModal';

// Mapbox 3D Map
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

// Helper: parse tip category from description prefix like "[Category] text"
function parseTipCategory(description: string): { category: string; text: string } {
  const match = description.match(/^\[([^\]]+)\]\s*(.*)/s);
  if (match) return { category: match[1], text: match[2] };
  return { category: 'General', text: description };
}

// Helper: days remaining until expiry
function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Case status workflow order
const CASE_STATUS_FLOW = ['Flagged', 'Under Review', 'Stop Work Order', 'Resolved', 'Approved'];

const getCaseStatusColor = (status: string) => {
  switch (status) {
    case 'Flagged': return 'bg-rose-50 text-rose-700 border-rose-200/50';
    case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200/50';
    case 'Stop Work Order': return 'bg-orange-50 text-orange-700 border-orange-200/50';
    case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-200/50';
    default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
  }
};

// Chart colors
const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4', '#8b5cf6'];

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [billboards, setBillboards] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [token, setToken] = useState(localStorage.getItem('urpb_token') || '');
  const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('urpb_user') || 'null'));
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [showAddBillboard, setShowAddBillboard] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);

  // Map state (3D perspective)
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 7.604,
    latitude: 12.989,
    zoom: 12,
    pitch: 60,
    bearing: -17
  });
  const markerClickedRef = useRef(false);
  const prevViewRef = useRef<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<{type: string; data: any} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignageLayer, setShowSignageLayer] = useState(true);
  const [showConstructionLayer, setShowConstructionLayer] = useState(true);
  const [showTipsLayer, setShowTipsLayer] = useState(true);
  const [showStreetNames, setShowStreetNames] = useState(false);

  // Cinematic camera: fly to marker on click, fly back on deselect
  const flyToMarker = (lng: number, lat: number) => {
    prevViewRef.current = { ...viewState };
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 17.5,
      pitch: 72,
      bearing: (viewState.bearing || 0) + 30,
      duration: 2000,
      essential: true
    });
  };
  const handleDeselectMarker = () => {
    setSelectedMarker(null);
    if (prevViewRef.current) {
      mapRef.current?.flyTo({
        center: [prevViewRef.current.longitude, prevViewRef.current.latitude],
        zoom: prevViewRef.current.zoom,
        pitch: prevViewRef.current.pitch,
        bearing: prevViewRef.current.bearing,
        duration: 1500,
        essential: true
      });
      prevViewRef.current = null;
    }
  };

  // Registry state
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState('all');
  const [registryTypeFilter, setRegistryTypeFilter] = useState('all');
  const [expandedBillboard, setExpandedBillboard] = useState<string | null>(null);

  // Cases state
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [caseStatusFilter, setCaseStatusFilter] = useState('all');

  // Tips state
  const [tipStatusFilter, setTipStatusFilter] = useState('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    const matchedB = billboards.filter(b => 
      b.lga.toLowerCase().includes(query) || 
      (b.road_name && b.road_name.toLowerCase().includes(query))
    );
    const matchedC = cases.filter(c => c.lga.toLowerCase().includes(query));
    const allMatches = [...matchedB, ...matchedC];
    if (allMatches.length > 0) {
      const avgLat = allMatches.reduce((sum, item) => sum + item.lat, 0) / allMatches.length;
      const avgLng = allMatches.reduce((sum, item) => sum + item.lng, 0) / allMatches.length;
      mapRef.current?.flyTo({ center: [avgLng, avgLat], zoom: 14, duration: 1500 });
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

  // Load citizen-submitted tips from localStorage (submitted via landing page TipForm)
  const loadCitizenTips = (): any[] => {
    try {
      return JSON.parse(localStorage.getItem('urpb_citizen_tips') || '[]');
    } catch { return []; }
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

      const bOk = !bRes.error && Array.isArray(bRes);
      const cOk = !cRes.error && Array.isArray(cRes);
      const tOk = !tRes.error && Array.isArray(tRes);
      const aOk = !aRes.error && aRes.totalBillboards !== undefined;

      if (bOk && cOk && tOk && aOk) {
        // Merge citizen-submitted tips from localStorage
        const citizenTips = loadCitizenTips();
        const existingIds = new Set(tRes.map((t: any) => t.id));
        const newCitizenTips = citizenTips.filter((t: any) => !existingIds.has(t.id));

        setBillboards(bRes);
        setCases(cRes);
        setTips([...tRes, ...newCitizenTips]);
        setAnalytics(aRes);
        return;
      }
    } catch (err) {
      console.warn('API unavailable, loading demo data', err);
    }

    // Fallback: demo data
    const now = new Date().toISOString();
    const demoBillboards = [
      { id: 'b1', lat: 12.989, lng: 7.604, lga: 'Katsina', road_name: 'Kano Road', owner_name: 'Musa Ads Ltd', owner_phone: '08011111111', dimensions: '10x20', structure_type: 'Unipole', permit_number: 'PMT-001', status: 'Approved-Paid', fee_amount: 50000000, issue_date: '2024-01-01', expiry_date: '2025-06-01', created_at: now },
      { id: 'b2', lat: 13.001, lng: 7.599, lga: 'Katsina', road_name: 'IBB Way', owner_name: 'Unknown', owner_phone: '', dimensions: '5x10', structure_type: 'Wall Drape', permit_number: null, status: 'Unregistered', fee_amount: 0, issue_date: null, expiry_date: null, created_at: now },
      { id: 'b3', lat: 11.121, lng: 7.319, lga: 'Funtua', road_name: 'Zaria Rd', owner_name: 'Global Signage', owner_phone: '08022222222', dimensions: '20x40', structure_type: 'Gantry', permit_number: 'PMT-002', status: 'Approved-Payment Due', fee_amount: 100000000, issue_date: '2024-05-01', expiry_date: '2025-05-01', created_at: now },
      { id: 'b4', lat: 13.015, lng: 7.612, lga: 'Katsina', road_name: 'Ring Road', owner_name: 'Katsina Media', owner_phone: '08033333333', dimensions: '10x20', structure_type: 'Unipole', permit_number: 'PMT-003', status: 'Approved-Paid', fee_amount: 50000000, issue_date: '2024-02-15', expiry_date: '2025-08-15', created_at: now },
      { id: 'b5', lat: 13.030, lng: 7.290, lga: 'Daura', road_name: "Mai'adua Rd", owner_name: 'Local Biz', owner_phone: '', dimensions: '3x6', structure_type: 'Static', permit_number: null, status: 'Unregistered', fee_amount: 0, issue_date: null, expiry_date: null, created_at: now },
      { id: 'b6', lat: 12.990, lng: 7.585, lga: 'Katsina', road_name: 'Hospital Rd', owner_name: 'Health Ads', owner_phone: '08044444444', dimensions: '10x20', structure_type: 'LED', permit_number: 'PMT-004', status: 'Approved-Payment Due', fee_amount: 120000000, issue_date: '2024-06-10', expiry_date: '2025-03-10', created_at: now },
      { id: 'b7', lat: 12.800, lng: 7.500, lga: 'Dutsin-Ma', road_name: 'University Rd', owner_name: 'Student Promo', owner_phone: '', dimensions: '5x10', structure_type: 'Wall Drape', permit_number: null, status: 'Unregistered', fee_amount: 0, issue_date: null, expiry_date: null, created_at: now },
    ];
    const demoCases = [
      { id: 'c1', lat: 12.995, lng: 7.610, lga: 'Katsina', first_detected_at: now, detection_source: 'satellite', footprint_estimate_m2: 250, status: 'Flagged', assigned_to: 'u3', resolution_note: null },
      { id: 'c2', lat: 13.045, lng: 7.301, lga: 'Daura', first_detected_at: new Date(Date.now() - 20 * 86400000).toISOString(), detection_source: 'drone', footprint_estimate_m2: 400, status: 'Under Review', assigned_to: 'u3', resolution_note: null },
      { id: 'c3', lat: 12.980, lng: 7.590, lga: 'Katsina', first_detected_at: new Date(Date.now() - 5 * 86400000).toISOString(), detection_source: 'field_inspection', footprint_estimate_m2: 150, status: 'Flagged', assigned_to: 'u3', resolution_note: null },
      { id: 'c4', lat: 11.130, lng: 7.320, lga: 'Funtua', first_detected_at: new Date(Date.now() - 10 * 86400000).toISOString(), detection_source: 'satellite', footprint_estimate_m2: 600, status: 'Stop Work Order', assigned_to: 'u3', resolution_note: 'Site sealed. Owner served notice.' },
      { id: 'c5', lat: 12.992, lng: 7.620, lga: 'Katsina', first_detected_at: new Date(Date.now() - 2 * 86400000).toISOString(), detection_source: 'drone', footprint_estimate_m2: 120, status: 'Flagged', assigned_to: 'u3', resolution_note: null },
      { id: 'c6', lat: 12.810, lng: 7.510, lga: 'Dutsin-Ma', first_detected_at: new Date(Date.now() - 15 * 86400000).toISOString(), detection_source: 'satellite', footprint_estimate_m2: 350, status: 'Approved', assigned_to: 'u3', resolution_note: 'Planning permit verified.' },
    ];
    const demoTips = [
      { id: 't1', lat: 12.990, lng: 7.600, description: '[Hazardous / Leaning Billboard] Dangerous leaning structure near Central Market roundabout, risk of collapse during storm', photo_url: null, reporter_phone: '08033333333', status: 'New', created_at: now },
      { id: 't2', lat: 13.010, lng: 7.595, description: '[Unauthorized Construction] Unpermitted commercial building on residential plot off IBB Way', photo_url: null, reporter_phone: '', status: 'New', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 't3', lat: 12.985, lng: 7.615, description: '[Road Reserve Encroachment] Shop structures extending into highway setback on Kano Road', photo_url: null, reporter_phone: '09012345678', status: 'Converted', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 't4', lat: 13.020, lng: 7.580, description: '[Drainage Line Obstruction] New wall blocks drainage channel behind Government College', photo_url: null, reporter_phone: '', status: 'New', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 't5', lat: 12.975, lng: 7.605, description: '[Unregistered Commercial Sign] Large LED screen installed without permit on Ring Road', photo_url: null, reporter_phone: '07044556677', status: 'Dismissed', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
    ];
    const demoAnalytics = {
      totalBillboards: 7,
      compliant: 4,
      leakageEstimateNaira: 54000000,
      activeCases: 5,
      lgaBreakdown: [
        { lga: 'Katsina', count: 4 },
        { lga: 'Funtua', count: 1 },
        { lga: 'Daura', count: 1 },
        { lga: 'Dutsin-Ma', count: 1 },
      ]
    };

    // Merge citizen-submitted tips from localStorage
    const citizenTips = loadCitizenTips();
    const allTips = [...demoTips, ...citizenTips];

    setBillboards(demoBillboards);
    setCases(demoCases);
    setTips(allTips);
    setAnalytics(demoAnalytics);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Demo user profiles
  const DEMO_USERS: Record<string, { id: string; name: string; role: string; email: string }> = {
    'admin@urpb.ng': { id: 'u1', name: 'Admin Supervisor', role: 'supervisor', email: 'admin@urpb.ng' },
    'rev@urpb.ng': { id: 'u2', name: 'Revenue Officer', role: 'revenue_officer', email: 'rev@urpb.ng' },
    'insp1@urpb.ng': { id: 'u3', name: 'Field Inspector 1', role: 'inspector', email: 'insp1@urpb.ng' },
  };

  const handleLogin = async (email: string) => {
    setLoginLoading(email);
    // Brief delay for UX feel
    await new Promise(r => setTimeout(r, 800));
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
        localStorage.setItem('urpb_token', data.token);
        localStorage.setItem('urpb_user', JSON.stringify(data.user));
        setLoginLoading(null);
        return;
      }
    } catch (err) {
      console.warn('API login unavailable, using demo mode', err);
    }
    const demoUser = DEMO_USERS[email];
    if (demoUser) {
      const demoToken = 'demo-token-' + demoUser.id;
      setToken(demoToken);
      setCurrentUser(demoUser);
      localStorage.setItem('urpb_token', demoToken);
      localStorage.setItem('urpb_user', JSON.stringify(demoUser));
    } else {
      alert('Login failed: unknown user');
    }
    setLoginLoading(null);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('urpb_token');
    localStorage.removeItem('urpb_user');
    setShowLogin(false);
  };

  // Signage: green family
  const getBillboardColor = (status: string) => {
    if (status.startsWith('Approved-Paid')) return '#10b981'; // emerald-500
    if (status.includes('Due')) return '#6ee7b7'; // emerald-300 (lighter)
    return '#065f46'; // emerald-900 (darker)
  };

  // Construction: orange family
  const getCaseMarkerColor = (status: string) => {
    switch (status) {
      case 'Flagged': return '#ea580c'; // orange-600
      case 'Under Review': return '#fb923c'; // orange-400
      case 'Stop Work Order': return '#9a3412'; // orange-800
      case 'Resolved': return '#fdba74'; // orange-300
      case 'Approved': return '#fed7aa'; // orange-200
      default: return '#f97316';
    }
  };

  const handleConvertTip = async (id: string, type: string) => {
    try {
      await fetchWithAuth(`/api/tips/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.warn('API unavailable for tip conversion', err);
    }
    // Update locally for demo mode
    setTips(prev => prev.map(t => t.id === id ? { ...t, status: 'Converted' } : t));
  };

  const handleDismissTip = (id: string) => {
    setTips(prev => prev.map(t => t.id === id ? { ...t, status: 'Dismissed' } : t));
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await fetchWithAuth(`/api/billboards/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved-Paid' })
      });
    } catch (err) {
      console.warn('API unavailable for status update', err);
    }
    setBillboards(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved-Paid' } : b));
  };

  const handleUpdateCaseStatus = (id: string, newStatus: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  // --- Computed / Filtered Data ---
  const filteredBillboards = useMemo(() => {
    return billboards.filter(b => {
      if (registryStatusFilter !== 'all') {
        if (registryStatusFilter === 'paid' && !b.status.startsWith('Approved-Paid')) return false;
        if (registryStatusFilter === 'due' && !b.status.includes('Due')) return false;
        if (registryStatusFilter === 'unregistered' && b.status !== 'Unregistered') return false;
      }
      if (registryTypeFilter !== 'all' && b.structure_type !== registryTypeFilter) return false;
      if (registrySearch) {
        const q = registrySearch.toLowerCase();
        return (
          (b.owner_name || '').toLowerCase().includes(q) ||
          (b.road_name || '').toLowerCase().includes(q) ||
          (b.lga || '').toLowerCase().includes(q) ||
          (b.permit_number || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [billboards, registrySearch, registryStatusFilter, registryTypeFilter]);

  const filteredCases = useMemo(() => {
    if (caseStatusFilter === 'all') return cases;
    if (caseStatusFilter === 'sla_breach') {
      return cases.filter(c => {
        const days = Math.floor((Date.now() - new Date(c.first_detected_at).getTime()) / 86400000);
        return days > 14;
      });
    }
    return cases.filter(c => c.status === caseStatusFilter);
  }, [cases, caseStatusFilter]);

  const filteredTips = useMemo(() => {
    if (tipStatusFilter === 'all') return tips;
    return tips.filter(t => t.status === tipStatusFilter);
  }, [tips, tipStatusFilter]);

  const structureTypes = useMemo(() => {
    const types = new Set(billboards.map(b => b.structure_type).filter(Boolean));
    return Array.from(types);
  }, [billboards]);

  // Registry summary stats
  const registryStats = useMemo(() => {
    const total = billboards.length;
    const paid = billboards.filter(b => b.status.startsWith('Approved-Paid')).length;
    const due = billboards.filter(b => b.status.includes('Due')).length;
    const unreg = billboards.filter(b => b.status === 'Unregistered').length;
    return { total, paid, due, unreg, rate: total > 0 ? Math.round(((paid + due) / total) * 100) : 0 };
  }, [billboards]);

  // Enhanced analytics
  const enhancedAnalytics = useMemo(() => {
    if (!analytics) return null;
    const paidRevenue = billboards.filter(b => b.status.startsWith('Approved-Paid')).reduce((s, b) => s + (b.fee_amount || 0), 0);
    const dueRevenue = billboards.filter(b => b.status.includes('Due')).reduce((s, b) => s + (b.fee_amount || 0), 0);
    const unregEstimate = billboards.filter(b => b.status === 'Unregistered').length * 25000000;
    const revenueBreakdown = [
      { name: 'Collected', value: paidRevenue / 100 },
      { name: 'Overdue', value: dueRevenue / 100 },
      { name: 'Unregistered Est.', value: unregEstimate / 100 },
    ];
    // Compliance trend (simulated monthly data for demo)
    const complianceTrend = [
      { month: 'Jan', rate: 78 }, { month: 'Feb', rate: 80 }, { month: 'Mar', rate: 82 },
      { month: 'Apr', rate: 85 }, { month: 'May', rate: 87 }, { month: 'Jun', rate: 89 },
      { month: 'Jul', rate: 90 }, { month: 'Aug', rate: registryStats.rate },
    ];
    // Tips funnel
    const newTips = tips.filter(t => t.status === 'New').length;
    const convertedTips = tips.filter(t => t.status === 'Converted').length;
    const dismissedTips = tips.filter(t => t.status === 'Dismissed').length;
    const tipsFunnel = [
      { stage: 'Submitted', count: tips.length },
      { stage: 'Pending', count: newTips },
      { stage: 'Converted', count: convertedTips },
      { stage: 'Dismissed', count: dismissedTips },
    ];
    // Top violations
    const violationCounts: Record<string, number> = {};
    tips.forEach(t => {
      const { category } = parseTipCategory(t.description);
      violationCounts[category] = (violationCounts[category] || 0) + 1;
    });
    const topViolations = Object.entries(violationCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return { ...analytics, revenueBreakdown, complianceTrend, tipsFunnel, topViolations, paidRevenue, dueRevenue, unregEstimate };
  }, [analytics, billboards, tips, registryStats]);

  // --- RENDER ---

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
            {[
              { email: 'admin@urpb.ng', label: 'Admin Supervisor', desc: 'Full access (CRUD), analytics', icon: '🛡️', activeClass: 'border-emerald-500 bg-emerald-50/50', hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/50', textActive: 'text-emerald-800', textHover: 'text-slate-900 group-hover:text-emerald-800' },
              { email: 'rev@urpb.ng', label: 'Revenue Officer', desc: 'Mark payments, convert tips', icon: '💰', activeClass: 'border-amber-500 bg-amber-50/50', hoverClass: 'hover:border-amber-500 hover:bg-amber-50/50', textActive: 'text-amber-800', textHover: 'text-slate-900 group-hover:text-amber-800' },
              { email: 'insp1@urpb.ng', label: 'Field Inspector', desc: 'Register billboards, view cases', icon: '🔍', activeClass: 'border-indigo-500 bg-indigo-50/50', hoverClass: 'hover:border-indigo-500 hover:bg-indigo-50/50', textActive: 'text-indigo-800', textHover: 'text-slate-900 group-hover:text-indigo-800' },
            ].map(role => {
              const isLoading = loginLoading === role.email;
              const isDisabled = loginLoading !== null;
              return (
                <button
                  key={role.email}
                  onClick={() => handleLogin(role.email)}
                  disabled={isDisabled}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                    isLoading
                      ? role.activeClass
                      : isDisabled
                        ? 'border-slate-100 opacity-50 cursor-not-allowed'
                        : `border-slate-100 ${role.hoverClass}`
                  }`}
                >
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-lg flex items-center gap-2 ${isLoading ? role.textActive : role.textHover}`}>
                        <span>{role.icon}</span> {role.label}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{isLoading ? 'Authenticating...' : role.desc}</div>
                    </div>
                    {isLoading && (
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const tabLabel = (tab: string) => {
    const map: Record<string, string> = { map: 'Map View', registry: 'Signage Tracking', cases: 'Construction Flags', tips: 'Public Tips', analytics: 'Analytics' };
    return map[tab] || tab;
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static top-0 left-0 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl lg:shadow-sm z-30 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}>
        <div className={`p-4 border-b border-slate-200 bg-emerald-800 text-white shadow-md z-10 flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} h-24 shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-emerald-700 shadow-inner">
              <img src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap">
                <h1 className="text-2xl font-black tracking-tight leading-none">URPB</h1>
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
        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-200 text-[10px] text-slate-400 font-medium">
            <p>URPB v2.0 • Demo Mode</p>
            <p className="mt-0.5">Katsina State URPB</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {tabLabel(activeTab)}
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
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col">
          {/* ═══════════════ MAP VIEW ═══════════════ */}
          {activeTab === 'map' && (
            <div className="flex-grow rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 h-full min-h-[500px]">
              {/* Search */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10] w-full max-w-sm pointer-events-auto px-4">
                <form onSubmit={handleMapSearch} className="relative shadow-lg rounded-xl overflow-hidden bg-white/95 backdrop-blur border border-slate-200">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search LGA or Road Name..." className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-medium" />
                  <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center text-slate-400"><Search size={18} /></div>
                </form>
              </div>

              <MapGL
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onClick={() => {
                  if (markerClickedRef.current) {
                    markerClickedRef.current = false;
                    return;
                  }
                  handleDeselectMarker();
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                mapboxAccessToken={MAPBOX_TOKEN}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                onLoad={(evt) => {
                  const map = evt.target;
                  if (!map.getSource('mapbox-dem')) {
                    map.addSource('mapbox-dem', {
                      type: 'raster-dem',
                      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                      tileSize: 512,
                      maxzoom: 14
                    });
                  }
                  // Add 3D buildings
                  const layers = map.getStyle().layers;
                  const labelLayerId = layers?.find((l: any) => l.type === 'symbol' && l.layout?.['text-field'])?.id;
                  if (!map.getLayer('3d-buildings')) {
                    map.addLayer({
                      id: '3d-buildings',
                      source: 'composite',
                      'source-layer': 'building',
                      filter: ['==', 'extrude', 'true'],
                      type: 'fill-extrusion',
                      minzoom: 14,
                      paint: {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, ['get', 'height']],
                        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, ['get', 'min_height']],
                        'fill-extrusion-opacity': 0.7
                      }
                    }, labelLayerId);
                  }
                  // Hide street names by default
                  map.getStyle().layers?.forEach((layer: any) => {
                    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                      map.setLayoutProperty(layer.id, 'visibility', 'none');
                    }
                  });
                }}
              >
                <NavigationControl position="bottom-left" showCompass visualizePitch />
                
                {/* Signage Layer — billboard signpost icons */}
                {showSignageLayer && billboards.map(b => (
                  <MapMarker key={`b-${b.id}`} longitude={b.lng} latitude={b.lat} anchor="bottom">
                    <div
                      onClick={(e) => { e.stopPropagation(); markerClickedRef.current = true; setSelectedMarker({type: 'billboard', data: b}); flyToMarker(b.lng, b.lat); }}
                      className={`map-marker ${selectedMarker?.type === 'billboard' && selectedMarker?.data?.id === b.id ? 'selected' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      <svg width="30" height="42" viewBox="0 0 30 42" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }}>
                        <ellipse cx="15" cy="40" rx="6" ry="2" fill="rgba(0,0,0,0.25)"/>
                        <rect x="13" y="20" width="4" height="20" fill="#6b7280" rx="1.5"/>
                        <rect x="1" y="1" width="28" height="19" rx="3" fill={getBillboardColor(b.status)} stroke="white" strokeWidth="2"/>
                        <rect x="5" y="6" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.5)"/>
                        <rect x="5" y="11" width="14" height="2.5" rx="1" fill="rgba(255,255,255,0.3)"/>
                      </svg>
                      {selectedMarker?.type === 'billboard' && selectedMarker?.data?.id === b.id && (
                        <span className="marker-pulse-ring" style={{ color: getBillboardColor(b.status), top: '2px', left: '2px', right: '2px', bottom: '22px', borderRadius: '4px' }} />
                      )}
                    </div>
                  </MapMarker>
                ))}

                {/* Construction Layer — building icons */}
                {showConstructionLayer && cases.map(c => (
                  <MapMarker key={`c-${c.id}`} longitude={c.lng} latitude={c.lat} anchor="bottom">
                    <div
                      onClick={(e) => { e.stopPropagation(); markerClickedRef.current = true; setSelectedMarker({type: 'case', data: c}); flyToMarker(c.lng, c.lat); }}
                      className={`map-marker ${selectedMarker?.type === 'case' && selectedMarker?.data?.id === c.id ? 'selected' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      <svg width="26" height="38" viewBox="0 0 26 38" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }}>
                        <ellipse cx="13" cy="36" rx="6" ry="2" fill="rgba(0,0,0,0.25)"/>
                        <path d="M3 14 L13 4 L23 14 L23 35 L3 35 Z" fill={getCaseMarkerColor(c.status)} stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                        <rect x="7" y="17" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                        <rect x="15" y="17" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                        <rect x="7" y="24" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                        <rect x="15" y="24" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                        <rect x="10" y="30" width="6" height="5" rx="1" fill="rgba(255,255,255,0.35)"/>
                      </svg>
                      {selectedMarker?.type === 'case' && selectedMarker?.data?.id === c.id && (
                        <span className="marker-pulse-ring" style={{ color: getCaseMarkerColor(c.status), top: '4px', left: '2px', right: '2px', bottom: '4px', borderRadius: '4px' }} />
                      )}
                    </div>
                  </MapMarker>
                ))}

                {/* Tips Layer — speech bubble icons */}
                {showTipsLayer && tips.filter(t => t.status === 'New').map(t => (
                  <MapMarker key={`t-${t.id}`} longitude={t.lng} latitude={t.lat} anchor="bottom">
                    <div
                      onClick={(e) => { e.stopPropagation(); markerClickedRef.current = true; setSelectedMarker({type: 'tip', data: t}); flyToMarker(t.lng, t.lat); }}
                      className={`map-marker ${selectedMarker?.type === 'tip' && selectedMarker?.data?.id === t.id ? 'selected' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      <svg width="28" height="36" viewBox="0 0 28 36" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }}>
                        <ellipse cx="14" cy="34" rx="5" ry="2" fill="rgba(0,0,0,0.25)"/>
                        <path d="M2 2 Q2 1 3 1 L25 1 Q26 1 26 2 L26 20 Q26 21 25 21 L17 21 L14 28 L11 21 L3 21 Q2 21 2 20 Z" fill="#8b5cf6" stroke="white" strokeWidth="1.5"/>
                        <rect x="11" y="5" width="6" height="2.5" rx="1.2" fill="rgba(255,255,255,0.8)"/>
                        <text x="14" y="18" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="bold">!</text>
                      </svg>
                      {selectedMarker?.type === 'tip' && selectedMarker?.data?.id === t.id && (
                        <span className="marker-pulse-ring" style={{ color: '#8b5cf6', top: '0', left: '2px', right: '2px', bottom: '14px', borderRadius: '4px' }} />
                      )}
                    </div>
                  </MapMarker>
                ))}

                {/* Billboard Popup */}
                {selectedMarker?.type === 'billboard' && (() => {
                  const b = selectedMarker.data;
                  return (
                    <MapPopup longitude={b.lng} latitude={b.lat} onClose={handleDeselectMarker} closeOnClick={false} anchor="bottom" maxWidth="280px">
                      <div className="p-2 min-w-[220px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900">{b.owner_name}</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${b.status.startsWith('Approved-Paid') ? 'bg-emerald-100 text-emerald-700' : b.status.includes('Due') ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-900/10 text-emerald-900'}`}>{b.status}</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <p><strong>Type:</strong> {b.structure_type} ({b.dimensions})</p>
                          <p><strong>Location:</strong> {b.road_name}, {b.lga}</p>
                          {b.permit_number && <p><strong>Permit:</strong> {b.permit_number}</p>}
                          {b.fee_amount > 0 && <p><strong>Annual Fee:</strong> ₦{(b.fee_amount / 100).toLocaleString()}</p>}
                          {b.expiry_date && <p><strong>Expires:</strong> {new Date(b.expiry_date).toLocaleDateString()}</p>}
                          <p className="text-[10px] text-slate-400 pt-1">GPS: {b.lat.toFixed(4)}°N, {b.lng.toFixed(4)}°E</p>
                        </div>
                        <button onClick={() => { setActiveTab('registry'); setExpandedBillboard(b.id); }} className="mt-2 text-[10px] font-bold text-emerald-600 hover:text-emerald-700">→ View in Registry</button>
                      </div>
                    </MapPopup>
                  );
                })()}

                {/* Case Popup */}
                {selectedMarker?.type === 'case' && (() => {
                  const c = selectedMarker.data;
                  return (
                    <MapPopup longitude={c.lng} latitude={c.lat} onClose={handleDeselectMarker} closeOnClick={false} anchor="bottom" maxWidth="260px">
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900">Construction Flag</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{c.status}</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <p><strong>Source:</strong> {c.detection_source}</p>
                          <p><strong>LGA:</strong> {c.lga}</p>
                          <p><strong>Footprint:</strong> {c.footprint_estimate_m2} m²</p>
                          <p><strong>Detected:</strong> {new Date(c.first_detected_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => { setActiveTab('cases'); setExpandedCase(c.id); }} className="mt-2 text-[10px] font-bold text-orange-600 hover:text-orange-700">→ View Case</button>
                      </div>
                    </MapPopup>
                  );
                })()}

                {/* Tip Popup */}
                {selectedMarker?.type === 'tip' && (() => {
                  const t = selectedMarker.data;
                  return (
                    <MapPopup longitude={t.lng} latitude={t.lat} onClose={handleDeselectMarker} closeOnClick={false} anchor="bottom" maxWidth="260px">
                      <div className="p-2 min-w-[200px]">
                        <span className="font-extrabold text-slate-900 block mb-1">Public Tip</span>
                        <p className="text-xs text-slate-600 italic">"{parseTipCategory(t.description).text.substring(0, 80)}..."</p>
                        <p className="text-[10px] text-slate-400 mt-1">Category: {parseTipCategory(t.description).category}</p>
                      </div>
                    </MapPopup>
                  );
                })()}
              </MapGL>

              {/* Layer Toggle Panel */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 text-xs font-semibold z-[10] space-y-3 pointer-events-auto w-56">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Map Layers</div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-emerald-600"></span> Signage</span>
                  <button onClick={() => setShowSignageLayer(!showSignageLayer)} className={`p-1 rounded transition-colors ${showSignageLayer ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {showSignageLayer ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-orange-600"></span> Construction</span>
                  <button onClick={() => setShowConstructionLayer(!showConstructionLayer)} className={`p-1 rounded transition-colors ${showConstructionLayer ? 'text-orange-600' : 'text-slate-300'}`}>
                    {showConstructionLayer ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-violet-600"></span> Public Tips</span>
                  <button onClick={() => setShowTipsLayer(!showTipsLayer)} className={`p-1 rounded transition-colors ${showTipsLayer ? 'text-violet-600' : 'text-slate-300'}`}>
                    {showTipsLayer ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer group border-t border-slate-100 pt-2.5">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-slate-500"></span> Street Names</span>
                  <button onClick={() => {
                    const map = mapRef.current?.getMap?.() ?? mapRef.current;
                    if (!map) return;
                    const style = map.getStyle();
                    style?.layers?.forEach((layer: any) => {
                      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                        map.setLayoutProperty(layer.id, 'visibility', showStreetNames ? 'none' : 'visible');
                      }
                    });
                    setShowStreetNames(!showStreetNames);
                  }} className={`p-1 rounded transition-colors ${showStreetNames ? 'text-slate-600' : 'text-slate-300'}`}>
                    {showStreetNames ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </label>
                <div className="border-t border-slate-100 pt-2.5 space-y-2 text-[10px] text-slate-500">
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Signage Status</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#10b981'}}></span> Compliant (Paid)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#6ee7b7'}}></span> Payment Due</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#065f46'}}></span> Unregistered</div>
                </div>
                <div className="border-t border-slate-100 pt-2.5 space-y-2 text-[10px] text-slate-500">
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Construction Status</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#ea580c'}}></span> Flagged</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#fb923c'}}></span> Under Review</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#9a3412'}}></span> Stop Work Order</div>
                </div>
              </div>

              {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                <div className="absolute bottom-6 right-6 z-[10] flex flex-col gap-3 pointer-events-auto">
                  <button onClick={() => setShowAddBillboard(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105">+ Register Signage</button>
                  <button onClick={() => setShowAddCase(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105">+ Flag Construction</button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ SIGNAGE TRACKING ═══════════════ */}
          {activeTab === 'registry' && (
            <div className="flex flex-col gap-5 h-full min-h-0">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{registryStats.total}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Compliant & Paid</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{registryStats.paid}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Payment Due</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{registryStats.due}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Unregistered</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">{registryStats.unreg}</div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={registrySearch} onChange={e => setRegistrySearch(e.target.value)} placeholder="Search owner, LGA, road, permit..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <select value={registryStatusFilter} onChange={e => setRegistryStatusFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl text-sm px-3 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="all">All Status</option>
                  <option value="paid">Approved-Paid</option>
                  <option value="due">Payment Due</option>
                  <option value="unregistered">Unregistered</option>
                </select>
                <select value={registryTypeFilter} onChange={e => setRegistryTypeFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl text-sm px-3 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="all">All Types</option>
                  {structureTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                  <button onClick={() => setShowAddBillboard(true)} className="text-sm font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap">+ Register Signage</button>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 w-8"></th>
                      <th className="px-6 py-4">ID / Permit</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBillboards.map(b => {
                      const isExpanded = expandedBillboard === b.id;
                      const daysLeft = daysUntilExpiry(b.expiry_date);
                      return (
                        <React.Fragment key={b.id}>
                          <tr className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isExpanded ? 'bg-emerald-50/30' : ''}`} onClick={() => setExpandedBillboard(isExpanded ? null : b.id)}>
                            <td className="px-6 py-4 text-slate-400">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-800">{b.permit_number || 'None'}</div>
                              <div className="text-slate-400 text-[10px] font-mono mt-0.5">{b.id}</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{b.owner_name}</td>
                            <td className="px-6 py-4 text-slate-600">{b.road_name}, {b.lga}</td>
                            <td className="px-6 py-4 text-slate-600">{b.structure_type}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                b.status.startsWith('Approved-Paid') ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 
                                b.status.includes('Due') ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-rose-50 text-rose-700 border-rose-200/50'
                              }`}>{b.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              {daysLeft !== null ? (
                                <span className={`text-xs font-bold ${daysLeft < 0 ? 'text-rose-600' : daysLeft < 60 ? 'text-amber-600' : 'text-slate-500'}`}>
                                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                </span>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                              {!b.status.startsWith('Approved-Paid') && (currentUser?.role === 'supervisor' || currentUser?.role === 'revenue_officer') && (
                                <button onClick={() => handleMarkPaid(b.id)} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200">Mark Paid</button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={8} className="px-6 py-5">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Dimensions</span><span className="text-slate-700 font-medium">{b.dimensions}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Annual Fee</span><span className="text-slate-700 font-medium">{b.fee_amount ? `₦${(b.fee_amount / 100).toLocaleString()}` : '—'}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Phone</span><span className="text-slate-700 font-medium">{b.owner_phone || '—'}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">GPS Coordinates</span><span className="text-slate-700 font-medium">{b.lat.toFixed(4)}°N, {b.lng.toFixed(4)}°E</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Issue Date</span><span className="text-slate-700 font-medium">{b.issue_date ? new Date(b.issue_date).toLocaleDateString() : '—'}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Expiry Date</span><span className="text-slate-700 font-medium">{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : '—'}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Created</span><span className="text-slate-700 font-medium">{new Date(b.created_at).toLocaleDateString()}</span></div>
                                  <div>
                                    <span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Map</span>
                                    <button onClick={() => { setActiveTab('map'); setTimeout(() => mapRef.current?.flyTo({ center: [b.lng, b.lat], zoom: 16, duration: 1500 }), 100); }} className="text-emerald-600 font-bold hover:text-emerald-700 text-xs">View on Map →</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {filteredBillboards.length === 0 && (
                  <div className="p-12 text-center text-slate-400 text-sm font-medium">No signage records match your filters.</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ CONSTRUCTION FLAGS ═══════════════ */}
          {activeTab === 'cases' && (
            <div className="flex flex-col gap-5 h-full min-h-0">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex flex-wrap gap-2">
                  {['all', 'Flagged', 'Under Review', 'Stop Work Order', 'Resolved', 'Approved', 'sla_breach'].map(f => (
                    <button key={f} onClick={() => setCaseStatusFilter(f)} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      caseStatusFilter === f
                        ? f === 'sla_breach' ? 'bg-rose-600 text-white border-rose-600' : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>
                      {f === 'all' ? 'All' : f === 'sla_breach' ? `SLA Breach (${cases.filter(c => Math.floor((Date.now() - new Date(c.first_detected_at).getTime()) / 86400000) > 14).length})` : f}
                    </button>
                  ))}
                </div>
                <div className="ml-auto">
                  {(currentUser?.role === 'supervisor' || currentUser?.role === 'inspector') && (
                    <button onClick={() => setShowAddCase(true)} className="text-sm font-bold bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">+ Report Flag</button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 w-8"></th>
                      <th className="px-6 py-4">Case ID</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Footprint</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Days Open</th>
                      {(currentUser?.role === 'supervisor') && <th className="px-6 py-4 text-right">Workflow</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map(c => {
                      const daysOpen = Math.floor((Date.now() - new Date(c.first_detected_at).getTime()) / 86400000);
                      const isExpanded = expandedCase === c.id;
                      const currentIdx = CASE_STATUS_FLOW.indexOf(c.status);
                      const nextStatus = currentIdx >= 0 && currentIdx < CASE_STATUS_FLOW.length - 1 ? CASE_STATUS_FLOW[currentIdx + 1] : null;
                      return (
                        <React.Fragment key={c.id}>
                          <tr className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${daysOpen > 14 ? 'bg-rose-50/20' : ''} ${isExpanded ? 'bg-blue-50/30' : ''}`} onClick={() => setExpandedCase(isExpanded ? null : c.id)}>
                            <td className="px-6 py-4 text-slate-400">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                            <td className="px-6 py-4 font-bold text-slate-800 font-mono text-[11px]">{c.id}</td>
                            <td className="px-6 py-4 capitalize font-medium text-slate-700">{c.detection_source.replace('_', ' ')}</td>
                            <td className="px-6 py-4 text-slate-600">{c.lga}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{c.footprint_estimate_m2} m²</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getCaseStatusColor(c.status)}`}>{c.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold flex items-center gap-1.5 ${daysOpen > 14 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {daysOpen > 14 && <Clock size={12} />}
                                {daysOpen}d {daysOpen > 14 && <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">SLA BREACH</span>}
                              </span>
                            </td>
                            {(currentUser?.role === 'supervisor') && (
                              <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                {nextStatus && (
                                  <button onClick={() => handleUpdateCaseStatus(c.id, nextStatus)} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200">
                                    → {nextStatus}
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={8} className="px-6 py-5">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Detection Source</span><span className="text-slate-700 font-medium capitalize">{c.detection_source.replace('_', ' ')}</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Est. Footprint</span><span className="text-slate-700 font-medium">{c.footprint_estimate_m2} m²</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">GPS</span><span className="text-slate-700 font-medium">{c.lat.toFixed(4)}°N, {c.lng.toFixed(4)}°E</span></div>
                                  <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Assigned Inspector</span><span className="text-slate-700 font-medium">{c.assigned_to || '—'}</span></div>
                                </div>
                                {c.resolution_note && (
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Resolution Note</span>
                                    <p className="text-slate-700">{c.resolution_note}</p>
                                  </div>
                                )}
                                {/* Status Timeline */}
                                <div className="mt-4 flex items-center gap-1">
                                  {CASE_STATUS_FLOW.map((s, i) => {
                                    const isCurrent = s === c.status;
                                    const isPast = CASE_STATUS_FLOW.indexOf(c.status) > i;
                                    return (
                                      <React.Fragment key={s}>
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                          isCurrent ? 'bg-emerald-600 text-white border-emerald-600' : isPast ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                        }`}>{s}</div>
                                        {i < CASE_STATUS_FLOW.length - 1 && <div className={`w-4 h-px ${isPast ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {filteredCases.length === 0 && (
                  <div className="p-12 text-center text-slate-400 text-sm font-medium">No cases match your filter.</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ PUBLIC TIPS ═══════════════ */}
          {activeTab === 'tips' && (
            <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
              <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {['all', 'New', 'Converted', 'Dismissed'].map(f => {
                    const count = f === 'all' ? tips.length : tips.filter(t => t.status === f).length;
                    return (
                      <button key={f} onClick={() => setTipStatusFilter(f)} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        tipStatusFilter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}>
                        {f === 'all' ? 'All' : f}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tipStatusFilter === f ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 w-8"></th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Reporter</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTips.map(t => {
                        const { category, text } = parseTipCategory(t.description);
                        const isExpanded = expandedTip === t.id;
                        const catColors: Record<string, string> = {
                          'Hazardous / Leaning Billboard': 'bg-rose-50 text-rose-600 border-rose-200',
                          'Unauthorized Construction': 'bg-orange-50 text-orange-600 border-orange-200',
                          'Road Reserve Encroachment': 'bg-amber-50 text-amber-600 border-amber-200',
                          'Drainage Line Obstruction': 'bg-blue-50 text-blue-600 border-blue-200',
                          'Unregistered Commercial Sign': 'bg-indigo-50 text-indigo-600 border-indigo-200',
                        };
                        return (
                          <React.Fragment key={t.id}>
                            <tr className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : ''}`} onClick={() => setExpandedTip(isExpanded ? null : t.id)}>
                              <td className="px-6 py-4 text-slate-400">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                              <td className="px-6 py-4 text-slate-400 text-[11px] font-mono">{new Date(t.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${catColors[category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{category}</span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={text}>{text}</td>
                              <td className="px-6 py-4 text-slate-600">{t.reporter_phone || 'Anonymous'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                  t.status === 'New' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50' :
                                  t.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                                  t.status === 'Dismissed' ? 'bg-slate-50 text-slate-500 border-slate-200/50' :
                                  'bg-slate-50 text-slate-600 border-slate-200/50'
                                }`}>{t.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                {t.status === 'New' && (currentUser?.role === 'supervisor' || currentUser?.role === 'revenue_officer') && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleConvertTip(t.id, 'billboard')} className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 hover:bg-emerald-100 transition-all">Signage</button>
                                    <button onClick={() => handleConvertTip(t.id, 'construction')} className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg border border-amber-200/50 hover:bg-amber-100 transition-all">Constr.</button>
                                    <button onClick={() => handleDismissTip(t.id)} className="text-[10px] font-bold uppercase bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-100 transition-all">Dismiss</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={7} className="px-6 py-5">
                                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="text-slate-400 block font-bold uppercase text-[10px] mb-2">Full Description</span>
                                      <p className="text-slate-700 whitespace-normal leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">"{text}"</p>
                                    </div>
                                    <div className="space-y-3">
                                      <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">GPS Coordinates</span><span className="text-slate-700 font-medium">{t.lat.toFixed(4)}°N, {t.lng.toFixed(4)}°E</span></div>
                                      <div><span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Submitted</span><span className="text-slate-700 font-medium">{new Date(t.created_at).toLocaleString()}</span></div>
                                      <button onClick={() => { setActiveTab('map'); setTimeout(() => mapRef.current?.flyTo({ center: [t.lng, t.lat], zoom: 16, duration: 1500 }), 100); }} className="text-emerald-600 font-bold hover:text-emerald-700 text-xs">View on Map →</button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTips.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">No tips match this filter.</div>
                  )}
                </div>
              </div>
              
              <div className="w-full lg:w-[400px] shrink-0">
                <TipForm onTipSubmitted={fetchData} />
              </div>
            </div>
          )}

          {/* ═══════════════ ANALYTICS ═══════════════ */}
          {activeTab === 'analytics' && enhancedAnalytics && (
            <div className="space-y-8">
              {/* Top Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Registry</div>
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{enhancedAnalytics.totalBillboards}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Signage structures tracked</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compliance Rate</div>
                  <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">{registryStats.rate}%</span>
                  <p className="text-[10px] text-slate-400 mt-1">{registryStats.paid + registryStats.due} of {registryStats.total} registered</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Revenue Collected</div>
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₦{(enhancedAnalytics.paidRevenue / 100).toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400 mt-1">From compliant permits</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Cases</div>
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{enhancedAnalytics.activeCases}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Construction flags open</p>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Structures by LGA */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Structures by LGA</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enhancedAnalytics.lgaBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="lga" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Revenue Breakdown</h3>
                  <div className="flex-1 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={enhancedAnalytics.revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} label={({ name, value }) => `₦${value.toLocaleString()}`}>
                          {enhancedAnalytics.revenueBreakdown.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(value: any) => `₦${Number(value).toLocaleString()}`} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Compliance Trend */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Compliance Trend (Monthly)</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enhancedAnalytics.complianceTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(value: any) => `${value}%`} />
                        <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tips Funnel + Top Violations */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2"><Shield size={16} className="text-indigo-500" /> Citizen Tips Pipeline</h3>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Funnel */}
                    <div className="space-y-2">
                      {enhancedAnalytics.tipsFunnel.map((item: any, i: number) => {
                        const maxCount = Math.max(...enhancedAnalytics.tipsFunnel.map((f: any) => f.count), 1);
                        const width = Math.max((item.count / maxCount) * 100, 20);
                        return (
                          <div key={item.stage}>
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                              <span>{item.stage}</span><span>{item.count}</span>
                            </div>
                            <div className="h-5 rounded-lg overflow-hidden bg-slate-100">
                              <div className="h-full rounded-lg transition-all" style={{ width: `${width}%`, backgroundColor: CHART_COLORS[i] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Top Violations */}
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Top Violation Types</div>
                      <div className="space-y-2">
                        {enhancedAnalytics.topViolations.map((v: any, i: number) => (
                          <div key={v.type} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-medium truncate max-w-[140px]" title={v.type}>{v.type}</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{v.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      <AddBillboardModal isOpen={showAddBillboard} onClose={() => setShowAddBillboard(false)} onAdded={fetchData} token={token} />
      <AddCaseModal isOpen={showAddCase} onClose={() => setShowAddCase(false)} onAdded={fetchData} token={token} />
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
