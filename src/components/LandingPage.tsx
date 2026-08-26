import React, { useState } from 'react';
import { Shield, Map, ArrowRight, CheckCircle2, Menu, X, BarChart3, Users } from 'lucide-react';
import { TipForm } from './TipForm';
import { Globe } from './Globe';

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <button 
              onClick={onLoginClick}
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
                <button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-full font-bold transition-all">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end z-10">
              <Globe />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-2">34</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Local Governments</p>
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-2">10k+</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Structures Tracked</p>
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900 mb-2">1,200+</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Citizen Reports</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-24 max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Comprehensive Regulatory Platform</h2>
            <p className="text-slate-600">Bringing transparency, efficiency, and safety to urban planning and structure management.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <Map className="text-emerald-600" size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Geospatial Tracking</h4>
              <p className="text-slate-600 leading-relaxed">Map-based visualization of all approved and flagged billboards, signage, and ongoing construction projects across the state.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="text-blue-600" size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Revenue & Compliance</h4>
              <p className="text-slate-600 leading-relaxed">Streamline registration, automate payment tracking, and identify unregistered structures for accurate revenue generation.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-amber-600" size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Public Participation</h4>
              <p className="text-slate-600 leading-relaxed">Empower citizens to anonymously report hazardous structures or unauthorized constructions directly to the authorities.</p>
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
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">100% Anonymous</p>
                    <p className="text-xs text-slate-400 mt-1">Your identity is never tracked or shared.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white text-slate-900 p-2 rounded-[2.5rem] shadow-2xl">
                <TipForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Katsina State Urban & Regional Planning Board.
          </p>
        </div>
      </footer>
    </div>
  );
}
