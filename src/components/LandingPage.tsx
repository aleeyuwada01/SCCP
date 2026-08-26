import React, { useState } from 'react';
import {
  Shield, Map, ArrowRight, CheckCircle2, Menu, X, BarChart3, Users,
  Layers, Compass, ChevronDown, ExternalLink, AlertTriangle, MapPin
} from 'lucide-react';
import { TipForm } from './TipForm';
import { Globe } from './Globe';

interface LGAData {
  name: string;
  zone: string;
  monitoredAssets: number;
  complianceRate: number;
  activeInspectors: number;
  topViolation: string;
  status: 'optimal' | 'warning' | 'audit_due';
}

const LGA_DIRECTORY: LGAData[] = [
  { name: 'Katsina Central', zone: 'Central Senatorial', monitoredAssets: 482, complianceRate: 94.2, activeInspectors: 8, topViolation: 'Unregistered LED Signage', status: 'optimal' },
  { name: 'Daura Urban', zone: 'North Senatorial', monitoredAssets: 186, complianceRate: 91.5, activeInspectors: 4, topViolation: 'Road Reserve Encroachment', status: 'optimal' },
  { name: 'Funtua Commercial', zone: 'South Senatorial', monitoredAssets: 342, complianceRate: 86.8, activeInspectors: 6, topViolation: 'Unpermitted Gantry Billboards', status: 'warning' },
  { name: 'Dutsin-Ma Axis', zone: 'Central Senatorial', monitoredAssets: 144, complianceRate: 93.0, activeInspectors: 3, topViolation: 'Temporary Wall Drapes', status: 'optimal' },
  { name: 'Malumfashi Central', zone: 'South Senatorial', monitoredAssets: 168, complianceRate: 89.4, activeInspectors: 4, topViolation: 'Expired Commercial Permits', status: 'audit_due' },
  { name: 'Mani Zone', zone: 'North Senatorial', monitoredAssets: 94, complianceRate: 95.1, activeInspectors: 2, topViolation: 'Unlicensed Static Signs', status: 'optimal' },
];

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signage' | 'construction' | 'revenue' | 'public'>('signage');
  const [selectedLga, setSelectedLga] = useState<LGAData>(LGA_DIRECTORY[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden">
              <img src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg" alt="Katsina State Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">SCCP</h1>
              <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold mt-1">Katsina State URPB</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#features-section" className="hover:text-emerald-600 transition-colors">Platform</a>
            <a href="#lga-section" className="hover:text-emerald-600 transition-colors">LGA Radar</a>
            <a href="#report-section" className="hover:text-emerald-600 transition-colors">Report</a>
            <a href="#regulations-section" className="hover:text-emerald-600 transition-colors">Regulations</a>
          </div>
          
          {/* Desktop Nav */}
          <button 
            onClick={onLoginClick}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md px-6 py-3 rounded-full transition-all hover:scale-105"
          >
            Staff Portal <ArrowRight size={16} />
          </button>

          {/* Mobile Nav Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-24 left-0 w-full bg-white border-b border-slate-100 shadow-lg p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
            <a href="#features-section" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 py-1">Platform</a>
            <a href="#lga-section" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 py-1">LGA Radar</a>
            <a href="#report-section" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 py-1">Report</a>
            <a href="#regulations-section" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 py-1">Regulations</a>
            <button 
              onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-6 py-4 rounded-xl transition-all"
            >
              Access Staff Portal <ArrowRight size={16} />
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-36 pb-16 relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none -z-10"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32 mb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official Katsina State Portal
              </div>
              <h2 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Modernizing <br/>
                <span className="text-emerald-600">Urban Regulation</span>
              </h2>
              
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                The Signage and Construction Compliance Platform (SCCP) monitors and regulates urban structures across Katsina State through geospatial tracking and public collaboration.
              </p>

              <div className="flex gap-4 pt-4">
                <button onClick={() => document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all hover:scale-105">
                  Report an Issue
                </button>
                <button onClick={onLoginClick} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-full font-bold transition-all">
                  Staff Sign In
                </button>
              </div>

              {/* Inline Stats under Hero */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="text-2xl font-black text-slate-900">34</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">LGAs Active</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">₦540M+</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Leakage Blocked</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">&lt; 24h</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Inspection SLA</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end z-10">
              <Globe />
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Total Assets</span>
                  <Layers size={16} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-slate-900">10,480+</div>
                <p className="text-xs text-slate-500 mt-2">Billboards & construction footprints under GIS monitoring</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Compliance Rate</span>
                  <CheckCircle2 size={16} className="text-blue-500" />
                </div>
                <div className="text-3xl font-black text-blue-600">92.4%</div>
                <p className="text-xs text-slate-500 mt-2">Permitted vs. unregistered structures across Katsina State</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Citizen Reports</span>
                  <Users size={16} className="text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-600">1,420+</div>
                <p className="text-xs text-slate-500 mt-2">Anonymous tips verified and investigated by field teams</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Leakage Recovery</span>
                  <BarChart3 size={16} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-600">₦540M</div>
                <p className="text-xs text-slate-500 mt-2">State internally generated revenue safeguarded annually</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Pillars Section */}
        <section id="features-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Comprehensive Regulatory Platform</h2>
            <p className="text-slate-600">Bringing transparency, efficiency, and safety to urban planning and structure management across all 34 Local Government Areas.</p>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-2 mb-10 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {[
              { id: 'signage', label: 'Outdoor Advertising', icon: Layers },
              { id: 'construction', label: 'Construction Audit', icon: Compass },
              { id: 'revenue', label: 'Revenue & Permitting', icon: BarChart3 },
              { id: 'public', label: 'Public Participation', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 shadow-xl shadow-slate-200/20">
            {activeTab === 'signage' && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Layers size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Automated Billboard Inventory & Spatial Auditing</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Every outdoor structure in Katsina State—from unipolar displays on Kano Road to commercial gantries in Funtua—is registered with verified GPS coordinates, structural dimensions, owner contacts, and permit renewal cycles.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Real-time status color coding: <strong>Approved-Paid</strong>, <strong>Payment Due</strong>, and <strong>Unregistered</strong>.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Automatic setback calculation to ensure clearance from public highways and utility poles.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Field inspector photo uploads with timestamp and GPS accuracy verification.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 text-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Sample Asset Record</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">PMT-004 Approved</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Structure ID</span>#b104-KanoRd</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Type</span>Unipole LED (10×20m)</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Location</span>Katsina Central LGA</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Fee Audit</span>₦1,200,000 / yr</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">GPS</span>12.989°N, 7.604°E</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Safety Clearance</span>14.5m (Compliant)</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-700 font-medium">
                    ✓ Structural Integrity Certified • Next Annual Audit Due in 184 Days
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'construction' && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Compass size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Satellite & Drone Encroachment Surveillance</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Protecting municipal master plans by automatically flagging unapproved site development, drainage line obstructions, and high-rise developments before construction proceeds beyond foundation stages.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /> Detection from high-resolution satellite imagery, commercial drones, and field patrols.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /> Instant Stop-Work Order generation with digital case tracking.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /> Estimated footprint mapping with square meter coverage and zoning classification.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 text-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Case #c108 • Flagged</span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">Stop Work Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Detection</span>Satellite Anomaly</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Est. Footprint</span>450 m²</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Zone</span>Daura Commercial Sector</div>
                    <div><span className="text-slate-400 block text-xs font-bold uppercase">Dispatch</span>Inspector Team 2</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 font-medium">
                    ⚠ Encroachment on Drainage Buffer Zone (6.2m violation). Site sealed pending review.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <BarChart3 size={24} className="text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Treasury Protection & Automated Billing</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Eliminating manual revenue leakages through standardized digital billing tiers, invoice generation, direct banking reconciliation, and automatic penalty surcharges for overdue compliance.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5" /> Role-based revenue officer clearance: only verified staff can approve tax receipts.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5" /> Real-time revenue leakage projection based on unregistered structure count.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5" /> Cryptographic audit trail for every status change and fee receipt.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 text-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">State IGR Fiscal Audit</span>
                    <span className="text-xs font-bold text-emerald-600">Q3 Real-time</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between p-3 rounded-xl bg-white border border-slate-100">
                      <span>Compliant Permits Collected:</span>
                      <span className="font-bold text-emerald-600">₦320,500,000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-white border border-slate-100">
                      <span>Unregistered Signage Backlog:</span>
                      <span className="font-bold text-amber-600">₦184,000,000</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-white border border-slate-100">
                      <span>Enforcement Penalties:</span>
                      <span className="font-bold text-blue-600">₦36,000,000</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-right font-medium">
                    Total Managed: <strong className="text-slate-900">₦540,500,000</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'public' && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Anonymous Whistleblower & Citizen Intake</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Every citizen in Katsina State can act as a vigilant observer. Submit unapproved structures or hazardous billboards directly with GPS location and photo evidence without exposing personal identity.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Zero IP or personal tracking; optional callback phone for reward programs.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> One-click conversion from public tip into active billboard or construction case.</li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Triaged within 24 hours by URPB zonal enforcement officers.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 text-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Citizen Tip #t-9812</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Converted to Case</span>
                  </div>
                  <p className="text-slate-600 text-sm italic bg-white p-4 rounded-xl border border-slate-100">
                    "Dangerous leaning gantry billboard during storm near Katsina Central Market roundabout..."
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Status: <strong className="text-emerald-600">Resolved • Dismantled</strong></span>
                    <span>Response Time: <strong className="text-slate-900">4.2 Hours</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LGA Compliance Radar */}
        <section id="lga-section" className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">LGA Regulatory Compliance Index</h2>
                <p className="text-slate-600">Live monitoring breakdown across Katsina State senatorial districts.</p>
              </div>
              <p className="text-xs text-slate-400 font-medium">Updated hourly from URPB GIS Feed</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* LGA Selector List */}
              <div className="lg:col-span-5 space-y-2.5">
                {LGA_DIRECTORY.map((lga) => (
                  <button
                    key={lga.name}
                    onClick={() => setSelectedLga(lga)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedLga.name === lga.name
                        ? 'bg-white border-emerald-200 shadow-lg shadow-emerald-100/50'
                        : 'bg-white/60 border-slate-100 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {lga.name}
                        {lga.status === 'optimal' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        {lga.status === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        {lga.status === 'audit_due' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{lga.zone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600">{lga.complianceRate}%</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{lga.monitoredAssets} Assets</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected LGA Detail */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/20">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest block mb-1">{selectedLga.zone}</span>
                    <h3 className="text-2xl font-black text-slate-900">{selectedLga.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Overall Rating</span>
                    <span className="text-3xl font-black text-emerald-600">{selectedLga.complianceRate}%</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 my-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Monitored Assets</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">{selectedLga.monitoredAssets} Units</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Field Staff</span>
                    <span className="text-xl font-bold text-blue-600 mt-1 block">{selectedLga.activeInspectors} Officers</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Infraction</span>
                    <span className="text-xs font-bold text-amber-600 mt-1 block truncate" title={selectedLga.topViolation}>{selectedLga.topViolation}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-emerald-600 shrink-0" />
                    <span>State Enforcement Mandate active for {selectedLga.name}.</span>
                  </div>
                  <button onClick={onLoginClick} className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    View in GIS <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Public Tip Section */}
        <section id="report-section" className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-extrabold mb-6">See something unsafe? <br/>Report it immediately.</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Notice an unstable billboard or unapproved construction? Submit an anonymous tip with a photo and location. Our inspection team will review it within 24 hours.
                </p>
                <div className="space-y-4">
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-5">
                    <div className="w-11 h-11 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">100% Anonymous</p>
                      <p className="text-xs text-slate-400 mt-0.5">Your identity is never tracked or shared.</p>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-5">
                    <div className="w-11 h-11 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">Automatic Geolocation</p>
                      <p className="text-xs text-slate-400 mt-0.5">Attach your coordinates with a single click to guide the patrol.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white text-slate-900 p-2 rounded-[2.5rem] shadow-2xl">
                <TipForm />
              </div>
            </div>
          </div>
        </section>

        {/* URPB Regulations / FAQ */}
        <section id="regulations-section" className="py-24 max-w-4xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">URPB Standards & Frequently Asked Questions</h2>
            <p className="text-slate-600">Key requirements under the Katsina State Urban and Regional Planning Law.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What structures require official permits in Katsina State?",
                a: "All outdoor advertising structures (Unipoles, Gantries, LED displays, Rooftop signs, Static boards) and physical construction developments (Commercial, Industrial, and Residential projects above single story) require registered permits from the Katsina State URPB."
              },
              {
                q: "How does the SCCP calculate advertising licensing fees?",
                a: "Annual fees are calculated based on structure type, square meter surface area, illumination class (LED vs. Static), and municipal zoning tier (Metropolitan arterial vs. inter-state corridor). All payments must be remitted directly to the State IGR Single Treasury Account."
              },
              {
                q: "What happens when an unauthorized structure is flagged?",
                a: "A 48-hour compliance notice is issued to the identified owner. If unaddressed, a Stop-Work Order or Demolition Notice is executed by the URPB enforcement task force, accompanied by statutory penalty surcharges."
              },
              {
                q: "Can I verify a billboard or building permit validity online?",
                a: "Yes. Every authorized structure is issued a unique Permit Identifier (e.g. PMT-001). Licensed operators and law enforcement can look up asset permits in real time through the staff portal."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-200 ${activeFaq === index ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 p-0.5">
                  <img src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-black text-slate-900 text-lg">SCCP</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Signage & Construction Compliance Platform. Powered by Katsina State URPB.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Headquarters</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Katsina State URPB Complex,<br/>Kano Road, PMB 2001,<br/>Katsina State, Nigeria</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Contact</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Enforcement Desk: 0800-URPB-KTS<br/>Email: compliance@urpb.kt.gov.ng<br/>Hours: Mon – Fri (8:00 AM – 4:30 PM)</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Quick Access</h4>
              <button onClick={onLoginClick} className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                Staff Portal
              </button>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} Government of Katsina State. All rights reserved.</p>
            <p className="text-xs text-slate-400">Katsina State Urban & Regional Planning Board</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
