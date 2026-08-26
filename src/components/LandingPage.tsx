import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  BarChart3,
  Users,
  Eye,
  AlertTriangle,
  Building2,
  FileCheck2,
  Compass,
  Radio,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  PhoneCall,
  Search,
  Check
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

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 flex flex-col antialiased">
      {/* Top Government System Banner */}
      <div className="bg-slate-950/90 border-b border-emerald-950/60 py-1.5 px-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold tracking-wider">OFFICIAL PORTAL</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Katsina State Urban & Regional Planning Board (URPB)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400 hidden md:inline">Surveillance Status: <strong className="text-emerald-400">34/34 LGAs Active</strong></span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-emerald-400 font-medium">GPS Accuracy: ±1.2m</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-[#070b14]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Agency Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10 border border-emerald-500/30 overflow-hidden p-1">
              <img
                src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg"
                alt="Katsina State Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">SCCP</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  v2.4 Live
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Signage & Construction Compliance
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Platform Pillars</a>
            <a href="#lga-index" className="hover:text-emerald-400 transition-colors">LGA Radar</a>
            <a href="#report-section" className="hover:text-emerald-400 transition-colors">Citizen Portal</a>
            <a href="#regulations" className="hover:text-emerald-400 transition-colors">URPB Regulations</a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 px-4 py-2.5 rounded-xl transition-all"
            >
              Report Infraction
            </button>
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
            >
              Staff Portal <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none rounded-xl border border-slate-800 bg-slate-900/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-[#070b14] px-6 py-6 space-y-4 animate-in slide-in-from-top-3">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400 py-1">Platform Pillars</a>
              <a href="#lga-index" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400 py-1">LGA Radar</a>
              <a href="#report-section" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400 py-1">Citizen Portal</a>
              <a href="#regulations" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400 py-1">URPB Regulations</a>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="w-full text-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 py-3 rounded-xl"
              >
                Report Infraction
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-emerald-400 py-3 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Access Staff Portal <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-7">
              {/* Official Badging */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-inner">
                <Radio size={14} className="text-emerald-400 animate-pulse" />
                <span>KATSINA STATE GIS COMPLIANCE ENGINE</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
                Intelligent <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Urban Governance
                </span> <br />
                & Regulation
              </h1>

              {/* Mission Statement */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                The official regulatory portal for Katsina State Urban and Regional Planning Board.
                Unifying outdoor advertising audits, satellite building surveillance, revenue protection,
                and citizen-driven reporting across all 34 Local Government Areas.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-7 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  Report Illegal Structure <ArrowRight size={16} />
                </button>
                <button
                  onClick={onLoginClick}
                  className="bg-slate-900 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700/80 px-7 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Building2 size={16} className="text-emerald-400" />
                  Staff Sign In
                </button>
              </div>

              {/* Live Status Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg text-left">
                <div>
                  <div className="text-2xl font-black text-white font-mono">34</div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">LGAs Active</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">₦540M+</div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">Leakage Blocked</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">&lt; 24h</div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">Inspection SLA</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Globe */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="w-full max-w-[500px] lg:max-w-none flex justify-center">
                <Globe />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Banner */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>TOTAL ASSETS</span>
                <Layers size={16} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">10,480+</div>
              <p className="text-xs text-slate-400 mt-2">Billboards & construction footprints under GIS monitoring</p>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>COMPLIANCE RATE</span>
                <CheckCircle2 size={16} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono">92.4%</div>
              <p className="text-xs text-slate-400 mt-2">Permitted vs. unregistered structures across Katsina State</p>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>CITIZEN REPORTS</span>
                <Users size={16} className="text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">1,420+</div>
              <p className="text-xs text-slate-400 mt-2">Anonymous tips verified and investigated by field teams</p>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>LEAKAGE RECOVERY</span>
                <BarChart3 size={16} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">₦540,000,000</div>
              <p className="text-xs text-slate-400 mt-2">State internally generated revenue safeguarded annually</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold">
            PLATFORM CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for State-Wide Compliance
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            A comprehensive regulatory toolset that bridges satellite intelligence, field inspector tablets,
            and citizen participation into a unified command dashboard.
          </p>
        </div>

        {/* Interactive Pillar Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: 'signage', label: 'Outdoor Advertising', icon: Layers },
            { id: 'construction', label: 'Satellite Construction Audit', icon: Compass },
            { id: 'revenue', label: 'Revenue & Permitting', icon: BarChart3 },
            { id: 'public', label: 'Whistleblower Network', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

          {activeTab === 'signage' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Automated Billboard Inventory & Spatial Auditing
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Every outdoor structure in Katsina State—from unipolar displays on Kano Road to commercial gantries in Funtua—is registered with verified GPS coordinates, structural dimensions, owner contacts, and permit renewal cycles.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>Real-time status color coding: <strong>Approved-Paid</strong>, <strong>Payment Due</strong>, and <strong>Unregistered</strong>.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>Automatic setback calculation to ensure clearance from public highways and utility poles.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>Field inspector photo uploads with timestamp and GPS accuracy verification.</span>
                  </li>
                </ul>
              </div>

              {/* Feature Mockup Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400 font-bold">SAMPLE ASSET RECORD</span>
                  <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">PMT-004 APPROVED</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div><span className="text-slate-500 block text-[10px]">STRUCTURE ID</span> #b104-KanoRd</div>
                  <div><span className="text-slate-500 block text-[10px]">TYPE</span> Unipole LED (10x20m)</div>
                  <div><span className="text-slate-500 block text-[10px]">LOCATION</span> Katsina Central LGA</div>
                  <div><span className="text-slate-500 block text-[10px]">FEE AUDIT</span> ₦1,200,000 / yr</div>
                  <div><span className="text-slate-500 block text-[10px]">GPS</span> 12.989°N, 7.604°E</div>
                  <div><span className="text-slate-500 block text-[10px]">SAFETY CLEARANCE</span> 14.5m (Compliant)</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-emerald-400">
                  ✓ Structural Integrity Certified • Next Annual Audit Due in 184 Days
                </div>
              </div>
            </div>
          )}

          {activeTab === 'construction' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Compass size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Satellite & Drone Encroachment Surveillance
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Protecting municipal master plans by automatically flagging unapproved site development, drainage line obstructions, and high-rise developments before construction proceeds beyond foundation stages.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                    <span>Detection sources from high-resolution satellite imagery, commercial drone runs, and field patrols.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                    <span>Instant Stop-Work Order generation with digital case tracking.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                    <span>Estimated footprint mapping with square meter coverage and zoning classification.</span>
                  </li>
                </ul>
              </div>

              {/* Case Mockup */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400 font-bold">CASE #c108 • FLAGGED</span>
                  <span className="text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">STOP WORK ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div><span className="text-slate-500 block text-[10px]">DETECTION</span> Satellite Anomaly</div>
                  <div><span className="text-slate-500 block text-[10px]">ESTIMATED FOOTPRINT</span> 450 m²</div>
                  <div><span className="text-slate-500 block text-[10px]">ZONE</span> Daura Commercial Sector</div>
                  <div><span className="text-slate-500 block text-[10px]">DISPATCH</span> Inspector Team 2</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-amber-300">
                  ⚠ Encroachment on Drainage Buffer Zone (6.2m violation). Site sealed pending review.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Treasury Protection & Automated Billing
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Eliminating manual revenue leakages through standardized digital billing tiers, invoice generation, direct banking reconciliation, and automatic penalty surcharges for overdue compliance.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                    <span>Role-based revenue officer clearance: only verified staff can approve tax receipts.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                    <span>Real-time revenue leakage projection based on unregistered structure count.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                    <span>Cryptographic audit trail for every status change and fee receipt.</span>
                  </li>
                </ul>
              </div>

              {/* Revenue Matrix */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400 font-bold">STATE IGR FISCAL AUDIT</span>
                  <span className="text-emerald-400">Q3 REAL-TIME</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between p-2 rounded bg-slate-900/60">
                    <span>Compliant Permits Collected:</span>
                    <span className="text-emerald-400 font-bold">₦320,500,000</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900/60">
                    <span>Unregistered Signage Backlog:</span>
                    <span className="text-amber-400 font-bold">₦184,000,000</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900/60">
                    <span>Enforcement Penalties Surcharged:</span>
                    <span className="text-cyan-400 font-bold">₦36,000,000</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 text-right">
                  Total Managed Fiscal Volume: <strong className="text-white font-bold">₦540,500,000</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'public' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Anonymous Whistleblower & Citizen Intake
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Every citizen in Katsina State can act as a vigilant observer. Submit unapproved structures or hazardous billboards directly with GPS location and photo evidence without exposing personal identity.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>Zero IP or personal tracking; optional callback phone for reward programs.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>One-click administrative conversion from public tip into active billboard or construction case.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>Triaged within 24 hours by URPB zonal enforcement officers.</span>
                  </li>
                </ul>
              </div>

              {/* Triage Preview */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400 font-bold">CITIZEN TIP #t-9812</span>
                  <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">CONVERTED TO CASE</span>
                </div>
                <p className="text-slate-300 text-[11px] italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  "Dangerous leaning gantry billboard during storm near Katsina Central Market roundabout..."
                </p>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Status: <strong className="text-emerald-400">Resolved • Dismantled</strong></span>
                  <span>Response Time: <strong>4.2 Hours</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LGA Compliance Radar Section */}
      <section id="lga-index" className="py-20 bg-slate-950/80 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold mb-3">
                ZONAL SURVEILLANCE RADAR
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                LGA Regulatory Compliance Index
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Live monitoring breakdown across Katsina State senatorial districts.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Updated hourly from URPB GIS Feed
            </div>
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
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      {lga.name}
                      {lga.status === 'optimal' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      {lga.status === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                      {lga.status === 'audit_due' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{lga.zone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-emerald-400">{lga.complianceRate}%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{lga.monitoredAssets} Assets</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected LGA Detail HUD */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                    {selectedLga.zone}
                  </span>
                  <h3 className="text-2xl font-black text-white">{selectedLga.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Overall Rating</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">{selectedLga.complianceRate}%</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 my-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Monitored Assets</span>
                  <span className="text-xl font-bold text-white font-mono mt-1 block">{selectedLga.monitoredAssets} Units</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Field Staff Deployed</span>
                  <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">{selectedLga.activeInspectors} Officers</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Primary Infraction</span>
                  <span className="text-xs font-bold text-amber-300 mt-1 block truncate" title={selectedLga.topViolation}>
                    {selectedLga.topViolation}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/50 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-emerald-400 shrink-0" />
                  <span>State Enforcement Mandate active for {selectedLga.name}.</span>
                </div>
                <button
                  onClick={onLoginClick}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1"
                >
                  View in GIS <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Tip Section */}
      <section id="report-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-mono font-semibold">
              <AlertTriangle size={14} /> PUBLIC SAFETY WHISTLEBLOWER
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              See a Hazardous or Unauthorized Structure?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Help protect Katsina communities from collapsed billboards, encroached road buffers, and illegal developments.
              Your report goes straight to the zonal enforcement squad.
            </p>

            <div className="space-y-4 pt-2">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">100% Confidential & Secure</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your IP and identity are never stored or published. You may optionally leave a phone number for inspection updates.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Automatic Geolocation Capture</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attach your device coordinates with a single click to guide the inspection patrol directly to the spot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <TipForm />
          </div>
        </div>
      </section>

      {/* Regulatory Standards & FAQs */}
      <section id="regulations" className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold">
              OFFICIAL GUIDELINES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              URPB Standards & Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Key requirements under the Katsina State Urban and Regional Planning Law.
            </p>
          </div>

          <div className="space-y-3.5">
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
              <div
                key={index}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${activeFaq === index ? 'rotate-180 text-emerald-400' : ''}`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Government Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src="https://bpp.kt.gov.ng/wp-content/uploads/2022/10/cropped-kts-logo-e1666441403264.jpg"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-white font-mono text-base">SCCP KATSINA</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Signage & Construction Compliance Platform. Powered by Katsina State Urban & Regional Planning Board.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono mb-3">Headquarters</h4>
              <p className="text-slate-400 leading-relaxed">
                Katsina State URPB Complex,<br />
                Kano Road, PMB 2001,<br />
                Katsina State, Nigeria
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono mb-3">Public Hotlines</h4>
              <p className="text-slate-400 leading-relaxed">
                Enforcement Desk: 0800-URPB-KTS<br />
                Email: compliance@urpb.kt.gov.ng<br />
                Hours: Mon - Fri (8:00 AM - 4:30 PM)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono mb-3">Authorized Access</h4>
              <button
                onClick={onLoginClick}
                className="w-full text-center bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold py-2.5 rounded-xl transition-colors"
              >
                Access Staff Portal
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} Government of Katsina State. All rights reserved.</p>
            <p className="font-mono text-slate-500">Security: TLS 1.3 • AES-256 Whistleblower Encryption</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
