import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Home, FileText, Activity, Database, Folder, 
  CheckCircle, Hospital, BarChart2, Settings, 
  ChevronDown, Bell, Calendar, LogOut, Menu, X, FileCheck
} from 'lucide-react';

// Memanggil 3 Ruangan yang sudah kita buat
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Sppd from './pages/Sppd';
import Kegiatan from './pages/Kegiatan';
import Verifikasi from './pages/Verifikasi';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';
import Login from './pages/Login';
import { ambilSemuaSpjDb } from './services/spjService';
import HasilPemeriksaan from './components/HasilPemeriksaan';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('simbokUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('simbokUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('simbokUser');
    }
  }, [currentUser]);

  const activeRole = currentUser?.peran || 'Pegawai';

  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail && e.detail.menu) {
        const menuMap = {
          'Dashboard': '/dashboard',
          'Status SPJ': '/status-spj',
          'SPJ': '/spj',
          'Daftar POA': '/poa',
          'Master Data': '/master-data',
          'Dokumen': '/dokumen',
          'Verifikasi': '/verifikasi',
          'Puskesmas': '/puskesmas',
          'Laporan': '/laporan',
          'Pengaturan': '/pengaturan'
        };
        const path = menuMap[e.detail.menu];
        if (path) navigate(path);
      }
    };
    window.addEventListener('navigateMenu', handleNavigate);
    return () => window.removeEventListener('navigateMenu', handleNavigate);
  }, [navigate]);

  useEffect(() => {
    if (!currentUser || activeRole === 'Pegawai') return;

    const hitungPending = async () => {
      try {
        const semuaSpj = await ambilSemuaSpjDb();
        const jumlahPending = semuaSpj.filter(spj => spj.status === 'Menunggu Verifikasi').length;
        setPendingCount(jumlahPending);
      } catch (error) {
        console.error("Gagal menghitung SPJ pending:", error);
      }
    };

    hitungPending();

    const handleSpjChange = () => {
      hitungPending();
    };

    window.addEventListener('spjDataChanged', handleSpjChange);
    return () => window.removeEventListener('spjDataChanged', handleSpjChange);
  }, [currentUser, activeRole]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Status SPJ', path: '/status-spj', icon: <FileCheck size={20} /> },
    { name: 'SPJ', path: '/spj', icon: <FileText size={20} /> },
    { name: 'Daftar POA', path: '/poa', icon: <Activity size={20} /> },
    { name: 'Master Data', path: '/master-data', icon: <Database size={20} /> },
    { name: 'Dokumen', path: '/dokumen', icon: <Folder size={20} /> },
    { name: 'Verifikasi', path: '/verifikasi', icon: <CheckCircle size={20} />, badge: pendingCount },
    { name: 'Puskesmas', path: '/puskesmas', icon: <Hospital size={20} /> },
    { name: 'Laporan', path: '/laporan', icon: <BarChart2 size={20} /> },
    { name: 'Pengaturan', path: '/pengaturan', icon: <Settings size={20} /> },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (activeRole === 'Pegawai') {
      return ['Dashboard', 'Status SPJ', 'Daftar POA', 'Master Data'].includes(item.name);
    }
    return true;
  });

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div className={`flex h-screen ${isDashboard ? 'bg-[#060913]' : 'bg-[#F8FAFC]'} font-sans overflow-hidden w-full relative`}>
      <Toaster position="top-center" />
      
      {/* OVERLAY UNTUK MOBILE MENU */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (MENU KIRI) */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0B1120] text-white flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} print:hidden`}>
        <div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex shrink-0">
                <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md">
                  <rect x="4" y="14" width="22" height="12" rx="3" fill="#2563eb" />
                  <rect x="9" y="9" width="12" height="22" rx="3" fill="#2563eb" />
                  <rect x="14" y="20" width="22" height="10" rx="3" fill="#10b981" />
                  <rect x="20" y="14" width="10" height="22" rx="3" fill="#10b981" />
                  <path d="M12 19h6v-6h2v6h6v2h-6v6h-2v-6h-6v-2z" fill="#ffffff" fillOpacity="0.3" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight leading-none">BOK</h1>
                <p className="text-[7px] text-slate-400 uppercase tracking-widest leading-tight mt-1">Bantuan Operasional<br/>Kesehatan</p>
              </div>
            </div>
            <button className="hidden lg:block bg-slate-800 text-slate-400 hover:text-white p-1.5 rounded-full transition-colors">
              <ChevronDown size={14} className="rotate-90" />
            </button>
            <button 
              className="lg:hidden bg-slate-800 text-slate-400 hover:text-white p-1.5 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-2 px-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[24px] text-center shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                    {item.badge}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Profil User di Bawah Sidebar (Sesuai Desain) */}
        <div>
          <div className="relative overflow-hidden p-6 mb-4 mx-4 bg-blue-600/20 rounded-3xl border border-blue-500/20">
            {/* Background Salib Air */}
            <svg viewBox="0 0 100 100" className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 text-blue-500" fill="currentColor">
               <path d="M20 40h20v-20h20v20h20v20h-20v20h-20v-20h-20z" />
            </svg>
            <p className="text-4xl text-blue-400 mb-1 font-serif opacity-60 leading-none">"</p>
            <p className="text-[11px] text-blue-100 font-medium leading-relaxed relative z-10 pr-2">Kelola data dengan akurat, tingkatkan pelayanan kesehatan masyarakat.</p>
          </div>
          <div className="p-3 mx-4 mb-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 flex items-center justify-between group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nama)}&background=0D8ABC&color=fff`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="truncate pr-2">
                <p className="text-sm font-bold truncate text-white">{currentUser.nama}</p>
                <p className="text-[10px] text-slate-400 truncate text-emerald-400">{currentUser.peran}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                import('firebase/auth').then(({ signOut }) => {
                  import('./firebase').then(({ auth }) => {
                    signOut(auth);
                  });
                });
                setCurrentUser(null);
              }} 
              className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors shrink-0" 
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className={`flex-1 overflow-auto w-full ${isDashboard ? 'bg-[#060913]' : 'bg-slate-50'} relative print:overflow-visible print:bg-white flex flex-col`}>
        
        {/* HEADER ATAS */}
        <header className={`${isDashboard ? 'bg-[#0B1120]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center border-b print:hidden`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 -ml-2 rounded-xl transition-colors ${isDashboard ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className={`text-lg md:text-2xl font-bold flex items-center gap-2 ${isDashboard ? 'text-white' : 'text-slate-800'}`}>
                Halo, {currentUser.nama.split(' ')[0]} <span className="text-xl hidden sm:inline">👋</span>
              </h2>
              <p className={`text-xs md:text-sm mt-0.5 hidden sm:block ${isDashboard ? 'text-slate-300' : 'text-slate-500'}`}>Kelola data BOK dengan mudah dan akurat</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className={`hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl shadow-sm border ${isDashboard ? 'bg-[#151B2B] border-white/10' : 'bg-white border-slate-200'}`}>
                <Calendar size={16} className={isDashboard ? 'text-slate-300' : 'text-slate-400'} />
                <span className={`text-sm font-semibold ${isDashboard ? 'text-white' : 'text-slate-700'}`}>Tahun Anggaran 2025</span>
                <ChevronDown size={16} className={isDashboard ? 'text-slate-300 ml-2' : 'text-slate-400 ml-2'} />
             </div>
             <button className={`relative p-2.5 rounded-xl shadow-sm border ${isDashboard ? 'bg-[#151B2B] border-white/10 hover:bg-white/5 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
             </button>
          </div>
        </header>

        {/* MENGGANTI HALAMAN SESUAI KLIK MENU */}
        <div className="p-4 md:p-8 w-full space-y-6 md:space-y-8 print:p-0 print:space-y-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rute Bebas (Bisa diakses Pegawai & Role Lain) */}
            <Route path="/dashboard" element={<Dashboard activeRole={activeRole} activeUser={currentUser} />} />
            <Route path="/status-spj" element={<HasilPemeriksaan activeRole={activeRole} activeUser={currentUser} />} />
            <Route path="/poa" element={<Kegiatan activeRole={activeRole} />} />
            <Route path="/master-data" element={<MasterData activeRole={activeRole} />} />
            
            {/* Rute Khusus (Admin / Bendahara) */}
            {activeRole !== 'Pegawai' && (
              <>
                <Route path="/spj" element={<Sppd />} />
                <Route path="/verifikasi" element={<Verifikasi />} />
                <Route path="/laporan" element={<Laporan />} />
                <Route path="/pengaturan" element={<Pengaturan />} />
                <Route path="/dokumen" element={<div className="p-10 text-center font-bold text-slate-500">Modul Dokumen Belum Tersedia</div>} />
                <Route path="/puskesmas" element={<div className="p-10 text-center font-bold text-slate-500">Modul Puskesmas Belum Tersedia</div>} />
              </>
            )}

            {/* Fallback Jika tidak ada route yang cocok / Tidak berhak */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}