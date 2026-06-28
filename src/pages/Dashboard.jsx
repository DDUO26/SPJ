import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hospital, Folder, Database, AlertCircle, 
  BarChart2, CheckCircle, FilePlus, ArrowUpRight, 
  Info, Target, FileText, FileCheck, XCircle, CloudUpload, Activity,
  Bell, ChevronDown, ChevronUp, Calendar, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

import imgBerkas3D from '../assets/berkas_3d_v2.png';
import HasilPemeriksaan from '../components/HasilPemeriksaan';
import AktivitasTerbaru from '../components/AktivitasTerbaru';
import { ambilSemuaSpjDb } from '../services/spjService';
export default function Dashboard({ activeRole, activeUser }) {
  const [activeTab, setActiveTab] = useState(activeRole === 'Pegawai' ? 'pemeriksaan' : 'statistik'); // 'statistik' | 'pemeriksaan'
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
      { name: 'SPJ', value: 0, color: 'bg-blue-500', icon: <FileText size={14} className="text-blue-600" />, bgIcon: 'bg-blue-100' },
      { name: 'Kegiatan', value: 0, color: 'bg-indigo-500', icon: <Activity size={14} className="text-indigo-600" />, bgIcon: 'bg-indigo-100' },
      { name: 'Entri Data', value: 0, color: 'bg-amber-500', icon: <Database size={14} className="text-amber-600" />, bgIcon: 'bg-amber-100' },
      { name: 'Dokumen Pendukung', value: 0, color: 'bg-emerald-500', icon: <Folder size={14} className="text-emerald-600" />, bgIcon: 'bg-emerald-100' },
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
      { name: 'SPJ', value: Math.round((sumSpj / filteredSpj.length) * 100), color: 'bg-blue-500', icon: <FileText size={14} className="text-blue-600" />, bgIcon: 'bg-blue-100' },
      { name: 'Kegiatan', value: Math.round((sumKegiatan / filteredSpj.length) * 100), color: 'bg-indigo-500', icon: <Activity size={14} className="text-indigo-600" />, bgIcon: 'bg-indigo-100' },
      { name: 'Entri Data', value: Math.round((sumEntri / filteredSpj.length) * 100), color: 'bg-amber-500', icon: <Database size={14} className="text-amber-600" />, bgIcon: 'bg-amber-100' },
      { name: 'Dokumen Pendukung', value: Math.round((sumDokumen / filteredSpj.length) * 100), color: 'bg-emerald-500', icon: <Folder size={14} className="text-emerald-600" />, bgIcon: 'bg-emerald-100' },
    ];
  }, [filteredSpj]);

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 mb-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveTab('statistik')}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'statistik' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <BarChart2 size={18} />
          Statistik & Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('pemeriksaan')}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'pemeriksaan' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <FileCheck size={18} />
          Hasil Pemeriksaan Berkas
        </button>
      </div>

      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 4 KARTU STATISTIK ATAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Kartu 1 - Biru */}
            <div className="bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-500/30 text-white relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3.5 rounded-2xl shrink-0 shadow-sm">
                  <Hospital size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-100 text-[13px] font-medium mb-0.5">Total Puskesmas</p>
                  <h3 className="text-4xl font-bold tracking-tight">0</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-medium ml-[68px]">
                Segera Hadir <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Kartu 2 - Hijau Pastel */}
            <div className="bg-[#ECFDF5] rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-col justify-between h-[140px]">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500 p-3.5 rounded-2xl shrink-0 shadow-sm text-white">
                  <FileCheck size={28} />
                </div>
                <div>
                  <p className="text-slate-500 text-[13px] font-medium mb-0.5">Total SPJ</p>
                  <h3 className="text-4xl font-bold text-slate-800 tracking-tight">0</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold ml-[68px]">
                Segera Hadir <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Kartu 3 - Ungu Pastel */}
            <div className="bg-[#EEF2FF] rounded-3xl p-6 shadow-sm border border-indigo-100 flex flex-col justify-between h-[140px]">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 p-3.5 rounded-2xl shrink-0 shadow-sm text-white">
                  <Folder size={28} />
                </div>
                <div>
                  <p className="text-slate-500 text-[13px] font-medium mb-0.5">Total Kegiatan</p>
                  <h3 className="text-4xl font-bold text-slate-800 tracking-tight">0</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold ml-[68px]">
                Segera Hadir <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Kartu 4 - Oranye Pastel */}
            <div className="bg-[#FFFBEB] rounded-3xl p-6 shadow-sm border border-amber-100 flex flex-col justify-between h-[140px]">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 p-3.5 rounded-2xl shrink-0 shadow-sm text-white">
                  <FilePlus size={28} />
                </div>
                <div>
                  <p className="text-slate-500 text-[13px] font-medium mb-0.5">Entri Data</p>
                  <h3 className="text-4xl font-bold text-slate-800 tracking-tight">0</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold ml-[68px]">
                Segera Hadir <ArrowUpRight size={14} />
              </div>
            </div>
          </div>

          {/* BARIS TENGAH: KELENGKAPAN SPJ & AKTIVITAS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Gambar Folder Tengah */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 xl:col-span-2 flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-6 relative z-30">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">Kelengkapan Data SPJ</h3>
                  <Info size={16} className="text-slate-400 cursor-pointer" />
                </div>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)} 
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none bg-slate-50 text-slate-600 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="ALL">Semua Bulan</option>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                    <option key={m} value={String(idx)}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Kotak Melayang Total SPJ (Tengah Atas) */}
              <div className="absolute top-8 right-1/4 bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-4 z-20">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total SPJ</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">{statsKelengkapan.total} <span className="text-[11px] text-slate-400 font-normal block mt-1">Sesuai Filter</span></p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between mt-12 mb-8 relative">
                
                {/* Bagian Kiri (Lengkap) */}
                <div className="text-left z-10 relative mt-10 md:mt-0 ml-4">
                  <p className="text-sm font-semibold text-slate-500 mb-1">Data Lengkap</p>
                  <h2 className="text-[72px] font-extrabold text-blue-500 leading-none mb-1 tracking-tighter">{statsKelengkapan.pctLengkap}%</h2>
                  <p className="text-slate-800 font-bold mb-4 text-xl">{statsKelengkapan.lengkap} <span className="text-slate-400 font-medium text-sm">SPJ</span></p>
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full inline-block">Lengkap</div>
                  
                  {/* Panah SVG Kiri */}
                  <svg className="hidden lg:block absolute top-[40%] -right-16 w-24 h-16 pointer-events-none z-20">
                    <defs><marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker></defs>
                    <path d="M 0 60 Q 40 10 80 10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-blue)" />
                  </svg>
                </div>

                {/* Gambar Tengah */}
                <div className="flex items-end justify-center relative z-10 px-4 mt-8 md:mt-0 mx-auto w-[350px] lg:w-[450px]">
                  <img src={imgBerkas3D} alt="Ilustrasi Berkas 3D" className="w-full h-auto object-contain mix-blend-multiply z-10 hover:-translate-y-2 transition-transform duration-500 scale-105" />
                </div>

                {/* Bagian Kanan (Belum Lengkap) */}
                <div className="text-right z-10 relative mt-10 md:mt-0 mr-4">
                  <p className="text-sm font-semibold text-slate-500 mb-1">Data Belum Lengkap</p>
                  <h2 className="text-[72px] font-extrabold text-indigo-500 leading-none mb-1 tracking-tighter">{statsKelengkapan.pctBelum}%</h2>
                  <p className="text-slate-800 font-bold mb-4 text-xl">{statsKelengkapan.belum} <span className="text-slate-400 font-medium text-sm">SPJ</span></p>
                  <div className="bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full inline-block">Belum Lengkap</div>

                  {/* Panah SVG Kanan */}
                  <svg className="hidden lg:block absolute top-[40%] -left-16 w-24 h-16 pointer-events-none z-20">
                    <defs><marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" /></marker></defs>
                    <path d="M 100 60 Q 60 10 20 10" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
                  </svg>
                </div>
              </div>

              {/* Progress Bar Bawah */}
              <div className="mt-auto pt-4">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
                  <div className="h-full bg-blue-500" style={{ width: `${statsKelengkapan.pctLengkap}%` }}></div>
                  <div className="h-full bg-indigo-400" style={{ width: `${statsKelengkapan.pctBelum}%` }}></div>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                  <Target size={16} className="text-slate-400" /> Target Kelengkapan 100% pada 31 Desember 2025
                </p>
              </div>
            </div>

            {/* Aktivitas Terbaru */}
            <AktivitasTerbaru />
          </div>

          {/* BARIS BAWAH: 3 KOLOM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kolom 1: Kelengkapan per Kategori */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Kelengkapan per Kategori</h3>
                <button className="text-xs text-blue-600 font-medium">Lihat detail</button>
              </div>
              <div className="space-y-6">
                {kategoriData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bgIcon}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                        <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom 2: Tren Kelengkapan Data */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Tren Kelengkapan Data</h3>
                <select className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2 py-1 outline-none bg-slate-50">
                  <option>6 Bulan Terakhir</option>
                </select>
              </div>
              <div className="flex items-center gap-4 mb-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-blue-500 rounded-full"></div> <span className="text-slate-600">Lengkap</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-indigo-400 rounded-full"></div> <span className="text-slate-600">Belum Lengkap</span></div>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="lengkap" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                    <Line type="monotone" dataKey="belum" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Kolom 3: Akses Cepat */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Akses Cepat</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Tambah SPJ', icon: <FilePlus size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-600 hover:text-white', borderColor: 'border-blue-100' },
                  { name: 'Tambah Kegiatan', icon: <FileText size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:bg-indigo-600 hover:text-white', borderColor: 'border-indigo-100' },
                  { name: 'Entri Data', icon: <Database size={24} />, color: 'text-amber-600', bg: 'bg-amber-50', hover: 'hover:bg-amber-600 hover:text-white', borderColor: 'border-amber-100' },
                  { name: 'Upload Dokumen', icon: <CloudUpload size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-600 hover:text-white', borderColor: 'border-emerald-100' },
                  { name: 'Verifikasi SPJ', icon: <CheckCircle size={24} />, color: 'text-teal-600', bg: 'bg-teal-50', hover: 'hover:bg-teal-600 hover:text-white', borderColor: 'border-teal-100' },
                  { name: 'Laporan', icon: <BarChart2 size={24} />, color: 'text-sky-600', bg: 'bg-sky-50', hover: 'hover:bg-sky-600 hover:text-white', borderColor: 'border-sky-100' }
                ].map((btn, idx) => (
                  <button key={idx} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 gap-3 border ${btn.borderColor} ${btn.bg} group cursor-pointer`}>
                    <div className={`${btn.color} group-hover:scale-110 transition-transform bg-white p-2.5 rounded-xl shadow-sm group-${btn.hover}`}>
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{btn.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'pemeriksaan' && (
        <HasilPemeriksaan activeRole={activeRole} activeUser={activeUser} />
      )}
    </div>
  );
}