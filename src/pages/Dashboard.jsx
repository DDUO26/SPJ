import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hospital, Folder, Database, AlertCircle, 
  BarChart2, CheckCircle, FilePlus, ArrowUpRight, 
  Info, Target, FileText, FileCheck, XCircle, CloudUpload, Activity,
  Bell, ChevronDown, ChevronUp, Calendar, AlertTriangle, ArrowUp
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import Tilt from 'react-parallax-tilt';

import AktivitasTerbaru from '../components/AktivitasTerbaru';
import { ambilSemuaSpjDb } from '../services/spjService';

export default function Dashboard({ activeRole, activeUser }) {
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      const spj = await ambilSemuaSpjDb();
      setDaftarSpj(spj);
    };
    fetchData();
  }, []);

  const parseTanggalSPJ = (tgl) => {
    if (!tgl) return null;
    if (tgl.includes('-')) {
      const d = new Date(tgl);
      return { month: d.getMonth(), year: d.getFullYear() };
    }
    return null;
  };

  const filteredSpj = useMemo(() => {
    if (selectedMonth === 'ALL') return daftarSpj;
    return daftarSpj.filter(s => {
      const p = parseTanggalSPJ(s.tanggal);
      if (!p) return false;
      return String(p.month) === selectedMonth;
    });
  }, [daftarSpj, selectedMonth]);

  const statsKelengkapan = useMemo(() => {
    let lengkap = 0;
    let belum = 0;
    filteredSpj.forEach(s => {
      const cl = s.checklist || {};
      const isLengkap = cl.sppd && cl.suratTugas && cl.dokumentasi && cl.riilCost && cl.suratPernyataan && cl.laporan;
      if (isLengkap) lengkap++;
      else belum++;
    });
    const total = lengkap + belum;
    const pctLengkap = total === 0 ? 0 : Math.round((lengkap / total) * 100);
    const pctBelum = total === 0 ? 0 : Math.round((belum / total) * 100);
    return { lengkap, belum, total, pctLengkap, pctBelum };
  }, [filteredSpj]);

  const trendData = useMemo(() => {
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();
    const result = [];
    for (let i = 0; i <= 11; i++) {
      let blnLengkap = 0;
      let blnBelum = 0;
      daftarSpj.forEach(s => {
        const p = parseTanggalSPJ(s.tanggal);
        if (p && p.month === i && p.year === currentYear) {
          const cl = s.checklist || {};
          const isLengkap = cl.sppd && cl.suratTugas && cl.dokumentasi && cl.riilCost && cl.suratPernyataan && cl.laporan;
          if (isLengkap) blnLengkap++;
          else blnBelum++;
        }
      });
      const t = blnLengkap + blnBelum;
      const pL = t === 0 ? 0 : Math.round((blnLengkap / t) * 100);
      const pB = t === 0 ? 0 : Math.round((blnBelum / t) * 100);
      result.push({ name: mNames[i], lengkap: pL, belum: pB });
    }
    return result;
  }, [daftarSpj]);

  const kategoriData = useMemo(() => {
    if (filteredSpj.length === 0) return [
      { name: 'SPJ', value: 0, color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_#3b82f6]' },
      { name: 'Kegiatan', value: 0, color: 'bg-indigo-500', shadow: 'shadow-[0_0_10px_#6366f1]' },
      { name: 'Entri Data', value: 0, color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_#f59e0b]' },
      { name: 'Dokumen Pendukung', value: 0, color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_#10b981]' },
    ];
    let sumSpj = 0, sumKegiatan = 0, sumEntri = 0, sumDokumen = 0;
    filteredSpj.forEach(s => {
      const cl = s.checklist || {};
      sumSpj += ((cl.sppd ? 1 : 0) + (cl.suratTugas ? 1 : 0)) / 2;
      sumKegiatan += ((cl.dokumentasi ? 1 : 0) + (cl.laporan ? 1 : 0)) / 2;
      sumDokumen += (cl.suratPernyataan ? 1 : 0);
      sumEntri += cl.riilCost ? 1 : 0;
    });
    return [
      { name: 'SPJ', value: Math.round((sumSpj / filteredSpj.length) * 100), color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_#3b82f6]' },
      { name: 'Kegiatan', value: Math.round((sumKegiatan / filteredSpj.length) * 100), color: 'bg-indigo-500', shadow: 'shadow-[0_0_10px_#6366f1]' },
      { name: 'Entri Data', value: Math.round((sumEntri / filteredSpj.length) * 100), color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_#f59e0b]' },
      { name: 'Dokumen Pendukung', value: Math.round((sumDokumen / filteredSpj.length) * 100), color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_#10b981]' },
    ];
  }, [filteredSpj]);

  const circleRadius = 60;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (statsKelengkapan.pctLengkap / 100) * circleCircumference;

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* TOP 4 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="w-full">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="neon-bottom-line" style={{'--neon-color': '#3b82f6'}}></div>
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 border border-blue-500/30">
                    <Hospital size={22} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">Total Puskesmas</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">185</h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium z-10 mt-4">
                <ArrowUp size={12} /> <span className="text-slate-400">12% dari bulan lalu</span>
              </div>
              
              {/* Mini chart in background */}
              <svg className="absolute bottom-4 right-0 w-24 h-12 opacity-50 z-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 40 Q 20 20 40 30 T 80 10 T 100 0" fill="none" stroke="#3b82f6" strokeWidth="2" className="neon-path" />
                <circle cx="80" cy="10" r="2" fill="#3b82f6" className="animate-pulse-glow" />
                <circle cx="100" cy="0" r="2" fill="#3b82f6" className="animate-pulse-glow" />
              </svg>
            </div>
          </Tilt>

          {/* Card 2 */}
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="w-full">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="neon-bottom-line" style={{'--neon-color': '#10b981'}}></div>
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/30">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">Total SPJ</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{statsKelengkapan.total}</h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium z-10 mt-4">
                <ArrowUp size={12} /> <span className="text-slate-400">8% dari bulan lalu</span>
              </div>
              <svg className="absolute bottom-4 right-0 w-24 h-12 opacity-50 z-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 30 Q 30 40 50 20 T 90 5 T 100 15" fill="none" stroke="#10b981" strokeWidth="2" className="neon-path" />
                <circle cx="90" cy="5" r="2" fill="#10b981" className="animate-pulse-glow" />
                <circle cx="100" cy="15" r="2" fill="#10b981" className="animate-pulse-glow" />
              </svg>
            </div>
          </Tilt>

          {/* Card 3 */}
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="w-full">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="neon-bottom-line" style={{'--neon-color': '#8b5cf6'}}></div>
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/30">
                    <Folder size={22} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">Total Kegiatan</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">542</h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium z-10 mt-4">
                <ArrowUp size={12} /> <span className="text-slate-400">16% dari bulan lalu</span>
              </div>
              <svg className="absolute bottom-4 right-0 w-24 h-12 opacity-50 z-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 40 Q 20 10 50 30 T 90 10 T 100 0" fill="none" stroke="#8b5cf6" strokeWidth="2" className="neon-path" />
                <circle cx="90" cy="10" r="2" fill="#8b5cf6" className="animate-pulse-glow" />
                <circle cx="100" cy="0" r="2" fill="#8b5cf6" className="animate-pulse-glow" />
              </svg>
            </div>
          </Tilt>

          {/* Card 4 */}
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="w-full">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="neon-bottom-line" style={{'--neon-color': '#f59e0b'}}></div>
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400 border border-amber-500/30">
                    <FilePlus size={22} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">Entri Data</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">342</h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium z-10 mt-4">
                <ArrowUp size={12} /> <span className="text-slate-400">10% dari bulan lalu</span>
              </div>
              <svg className="absolute bottom-4 right-0 w-24 h-12 opacity-50 z-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 30 Q 30 10 60 20 T 90 0 T 100 5" fill="none" stroke="#f59e0b" strokeWidth="2" className="neon-path" />
                <circle cx="90" cy="0" r="2" fill="#f59e0b" className="animate-pulse-glow" />
                <circle cx="100" cy="5" r="2" fill="#f59e0b" className="animate-pulse-glow" />
              </svg>
            </div>
          </Tilt>

        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Kelengkapan Data SPJ - Large Left Widget */}
          <div className="glass-card rounded-[2rem] p-8 xl:col-span-2 flex flex-col relative overflow-hidden">
            
            {/* Background glowing waves */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            {/* Wavy lines in the background */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none">
              <path d="M0,150 Q200,50 400,150 T800,150 T1200,150" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" className="animate-pulse-glow" />
              <path d="M0,200 Q300,100 600,200 T1200,200" fill="none" stroke="url(#blueGlow)" strokeWidth="1" className="animate-pulse-glow" style={{animationDelay: '1s'}} />
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="blueGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex items-center justify-between gap-2 mb-8 relative z-30">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Kelengkapan Data SPJ</h3>
                <Info size={16} className="text-slate-400 cursor-pointer" />
              </div>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="bg-[#111827] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none text-slate-300 font-medium cursor-pointer hover:bg-white/5 transition-colors"
              >
                <option value="ALL">Semua Bulan</option>
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                  <option key={m} value={String(idx)}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 flex-1 justify-center md:justify-start pl-0 md:pl-10">
              
              {/* Circular Progress Ring */}
              <div className="relative w-[240px] h-[240px] shrink-0 flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-pulse-glow"></div>
                <div className="absolute inset-[-20px] rounded-full border border-purple-500/10 shadow-[0_0_80px_rgba(139,92,246,0.1)]"></div>
                
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle cx="80" cy="80" r={circleRadius} fill="none" stroke="#1e293b" strokeWidth="12" />
                  
                  {/* Progress Arc */}
                  <circle 
                    cx="80" cy="80" r={circleRadius} fill="none" stroke="url(#arcGradient)" strokeWidth="12" 
                    strokeLinecap="round" 
                    style={{
                      strokeDasharray: circleCircumference,
                      '--target-offset': circleOffset,
                      strokeDashoffset: circleCircumference
                    }}
                    className="animate-circle drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  />
                  <defs>
                    <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <h2 className="text-5xl font-bold text-white glow-text-blue">{statsKelengkapan.pctLengkap}%</h2>
                  <p className="text-slate-300 font-medium mt-1">Lengkap</p>
                  <p className="text-[10px] text-green-400 mt-2 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">↑ 5% dari bulan lalu</p>
                </div>
                
                {/* Horizontal Neon Base Line under Circle */}
                <div className="absolute -bottom-8 w-64 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
              </div>

              {/* Stats on the right */}
              <div className="flex flex-col gap-6 w-full max-w-sm mt-8 md:mt-0">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                      <span className="text-3xl font-bold text-white">{statsKelengkapan.lengkap}</span>
                    </div>
                    <p className="text-sm text-slate-400">SPJ Lengkap</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-purple-400 mb-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]"></div>
                      <span className="text-3xl font-bold text-white">{statsKelengkapan.belum}</span>
                    </div>
                    <p className="text-sm text-slate-400">SPJ Belum Lengkap</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-full text-slate-400">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Target 100% pada</p>
                      <p className="font-semibold text-slate-200">31 Desember 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-full text-slate-400">
                      <Database size={16} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Total SPJ</p>
                      <p className="font-semibold text-slate-200">{statsKelengkapan.total}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Progress menuju target</span>
                    <span className="text-white">{statsKelengkapan.pctLengkap}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000"
                      style={{ width: `${statsKelengkapan.pctLengkap}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mini stat cards below main area */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 relative z-20">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-2"><ArrowUpRight size={14} className="text-green-400"/> SPJ Lengkap Hari Ini</p>
                <h4 className="text-xl font-bold text-white">+8</h4>
                <p className="text-[10px] text-green-400 mt-1">↑ 3% dibanding kemarin</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-2"><AlertCircle size={14} className="text-amber-400"/> Deadline Terdekat</p>
                <h4 className="text-xl font-bold text-white">5 SPJ</h4>
                <p className="text-[10px] text-amber-400 mt-1">7 hari lagi</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-2"><CheckCircle size={14} className="text-purple-400"/> Rata-rata Penyelesaian</p>
                <h4 className="text-xl font-bold text-white">2,3 hari</h4>
                <p className="text-[10px] text-slate-500 mt-1">dari pengajuan hingga lengkap</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-2"><BarChart2 size={14} className="text-blue-400"/> Progress Bulanan</p>
                <h4 className="text-xl font-bold text-white">87%</h4>
                <p className="text-[10px] text-slate-500 mt-1">target 185 SPJ</p>
              </div>
            </div>

          </div>

          {/* Aktivitas Terbaru Widget */}
          <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-lg">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white">Aktivitas Terbaru</h3>
                <button className="text-xs text-blue-400 font-medium flex items-center gap-1 hover:text-blue-300 transition-colors">
                  <Activity size={12} /> Refresh
                </button>
             </div>
             
             {/* Note: I will create a dark mode friendly activity list inline here instead of AktivitasTerbaru component to ensure full dark theme match without modifying another file right now */}
             <div className="flex-1 overflow-y-auto p-2">
                {[
                  { title: "Besok: Kunjungan Lapangan Pemantauan Tumbuh Kembang dan Masalah Gizi Ibu dan Anak", lok: "Desa Silian Satu", pet: "Rini Sumarni, Amd.Keb", time: "08:30" },
                  { title: "Besok: Pelaksanaan Kunjungan Rumah atau Follow UP Klien/UBM", lok: "Desa Silian Satu", pet: "Richard Wiranugra, SKM", time: "09:00" },
                  { title: "Besok: Pendampingan Rujukan Balita Stunting/Gizi buruk", lok: "Desa Silian Satu", pet: "Fransesica Sanda, SST", time: "10:00" },
                  { title: "Besok: Pelaksanaan Kelas Ibu Hamil", lok: "Desa Silian Satu", pet: "Juvita Patricia Poli, Amd.Keb", time: "11:30" },
                  { title: "Besok: Pelacakan dan pengawasan minum obat untuk ODGJ berat", lok: "Desa Silian Satu", pet: "Johnson Manasseh, Amd.Kep", time: "13:00" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                    <div className="mt-1 relative">
                       <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6] z-10 relative"></div>
                       {i !== 4 && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-white/10 group-hover:bg-purple-500/50"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200 leading-snug mb-1">{act.title}</p>
                      <p className="text-[11px] text-slate-500">Lokasi: {act.lok} | Petugas: {act.pet}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20 block mb-1">Mendatang</span>
                      <span className="text-xs font-mono text-slate-400">{act.time}</span>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="p-4 border-t border-white/5 bg-white/5 text-center">
                <button className="text-sm text-slate-300 hover:text-white transition-colors w-full flex items-center justify-center gap-1 font-medium bg-white/5 py-2 rounded-lg hover:bg-white/10 border border-white/5">Lihat Semua Aktivitas <ChevronDown size={14} /></button>
             </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Tren Kelengkapan Data */}
          <div className="glass-card rounded-[2rem] p-8 border border-white/5 xl:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B1120] to-[#0B1120] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-lg font-bold text-white">Tren Kelengkapan Data</h3>
              <select className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1.5 outline-none bg-[#111827]">
                <option>6 Bulan Terakhir</option>
              </select>
            </div>
            
            <div className="flex items-center gap-6 mb-8 text-xs font-semibold relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div> 
                <span className="text-slate-300">Lengkap</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_#8b5cf6]"></div> 
                <span className="text-slate-300">Belum Lengkap</span>
              </div>
            </div>

            <div className="h-56 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <defs>
                    <linearGradient id="colorLengkap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBelum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', fontSize: '12px', color: '#fff' }} 
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="lengkap" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLengkap)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, className: "animate-pulse-glow" }} />
                  <Area type="monotone" dataKey="belum" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBelum)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, className: "animate-pulse-glow" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* Kelengkapan per Kategori */}
            <div className="glass-card rounded-[2rem] p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white">Kelengkapan per Kategori</h3>
                <button className="text-[10px] text-blue-400 font-medium hover:text-blue-300">Lihat detail</button>
              </div>
              <div className="space-y-4">
                {kategoriData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-sm ${item.color} ${item.shadow}`}></span>
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-white">{item.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} ${item.shadow} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Tahunan / Akses Cepat mix */}
            <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden flex-1 flex flex-col">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[50px] rounded-full pointer-events-none"></div>
               
               <h3 className="text-base font-bold text-white mb-4 relative z-10 flex items-center gap-2">Target Tahunan <Target size={14} className="text-blue-400"/></h3>
               
               <div className="flex items-center justify-between mt-auto relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full animate-pulse-glow"></div>
                    <div className="w-16 h-16 rounded-full border border-blue-500/50 flex items-center justify-center bg-[#0B1120] relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <div className="w-12 h-12 rounded-full border border-purple-500/50 flex items-center justify-center bg-[#0B1120]">
                         <Target size={24} className="text-white glow-text-blue" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                     <h2 className="text-3xl font-bold text-white glow-text-blue">87%</h2>
                     <p className="text-[10px] text-slate-400">161 / 185 SPJ</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                     <p className="text-[10px] text-slate-400 mb-0.5">Target</p>
                     <p className="text-sm font-bold text-white">185 SPJ</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                     <p className="text-[10px] text-slate-400 mb-0.5">Tersisa</p>
                     <p className="text-sm font-bold text-amber-400">24 SPJ</p>
                  </div>
               </div>

               {/* Wavy bottom border */}
               <svg className="absolute bottom-0 left-0 w-full h-12 opacity-40 z-0" viewBox="0 0 100 20" preserveAspectRatio="none">
                 <path d="M0 10 Q 25 20 50 10 T 100 10 L 100 20 L 0 20 Z" fill="url(#waveGradient)" className="animate-gradient-x" />
                 <defs>
                   <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
                     <stop offset="0%" stopColor="#3b82f6" />
                     <stop offset="50%" stopColor="#8b5cf6" />
                     <stop offset="100%" stopColor="#3b82f6" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
          </div>

          {/* Quick Access Grid replacing older design to fit nicely in bottom row */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/5 xl:col-span-3">
             <h3 className="text-base font-bold text-white mb-6">Akses Cepat</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Tambah SPJ', icon: <FilePlus size={20} />, color: 'text-blue-400', shadow: 'shadow-[0_0_15px_#3b82f6]', bg: 'bg-[#151B2B]', border: 'border-blue-500/30', hoverBg: 'hover:bg-blue-600/20' },
                  { name: 'Tambah Kegiatan', icon: <FileText size={20} />, color: 'text-purple-400', shadow: 'shadow-[0_0_15px_#8b5cf6]', bg: 'bg-[#151B2B]', border: 'border-purple-500/30', hoverBg: 'hover:bg-purple-600/20' },
                  { name: 'Entri Data', icon: <Database size={20} />, color: 'text-amber-400', shadow: 'shadow-[0_0_15px_#f59e0b]', bg: 'bg-[#151B2B]', border: 'border-amber-500/30', hoverBg: 'hover:bg-amber-600/20' },
                  { name: 'Upload Dokumen', icon: <CloudUpload size={20} />, color: 'text-emerald-400', shadow: 'shadow-[0_0_15px_#10b981]', bg: 'bg-[#151B2B]', border: 'border-emerald-500/30', hoverBg: 'hover:bg-emerald-600/20' },
                  { name: 'Verifikasi SPJ', icon: <CheckCircle size={20} />, color: 'text-teal-400', shadow: 'shadow-[0_0_15px_#14b8a6]', bg: 'bg-[#151B2B]', border: 'border-teal-500/30', hoverBg: 'hover:bg-teal-600/20' },
                  { name: 'Laporan', icon: <BarChart2 size={20} />, color: 'text-indigo-400', shadow: 'shadow-[0_0_15px_#6366f1]', bg: 'bg-[#151B2B]', border: 'border-indigo-500/30', hoverBg: 'hover:bg-indigo-600/20' }
                ].map((btn, idx) => (
                  <button key={idx} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 gap-3 border ${btn.border} ${btn.bg} ${btn.hoverBg} group cursor-pointer relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className={`p-3 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform ${btn.color} ${btn.shadow}`}>
                      {btn.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight relative z-10">{btn.name}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}