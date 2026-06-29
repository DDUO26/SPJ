import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, Activity, Database, Folder, 
  CheckCircle, Hospital, BarChart2, Settings, 
  ChevronDown, Bell, Calendar, LogOut, Menu, X
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

export default function App() {
  // Mengatur halaman pertama yang terbuka adalah Dashboard
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('simbokUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('simbokUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('simbokUser');
    }
  }, [currentUser]);

  const activeRole = currentUser?.peran || 'Pegawai';

  useEffect(() => {
    if (activeRole === 'Pegawai' && !['Dashboard', 'Daftar POA', 'Master Data'].includes(activeMenu)) {
      setActiveMenu('Dashboard');
    }
  }, [activeRole, activeMenu]);

  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail && e.detail.menu) {
        setActiveMenu(e.detail.menu);
      }
    };
    window.addEventListener('navigateMenu', handleNavigate);
    return () => window.removeEventListener('navigateMenu', handleNavigate);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} /> },
    { name: 'SPJ', icon: <FileText size={20} /> },
    { name: 'Daftar POA', icon: <Activity size={20} /> },
    { name: 'Master Data', icon: <Database size={20} /> },
    { name: 'Dokumen', icon: <Folder size={20} /> },
    { name: 'Verifikasi', icon: <CheckCircle size={20} /> },
    { name: 'Puskesmas', icon: <Hospital size={20} /> },
    { name: 'Laporan', icon: <BarChart2 size={20} /> },
    { name: 'Pengaturan', icon: <Settings size={20} /> },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (activeRole === 'Pegawai') {
      return ['Dashboard', 'Daftar POA', 'Master Data'].includes(item.name);
    }
    return true;
  });

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden w-full relative">
      
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
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  activeMenu === item.name 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </button>
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
              onClick={() => setCurrentUser(null)} 
              className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors shrink-0" 
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 overflow-auto w-full bg-slate-50 relative print:overflow-visible print:bg-white flex flex-col">
        
        {/* HEADER ATAS */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                Halo, {currentUser.nama.split(' ')[0]} <span className="text-xl hidden sm:inline">👋</span>
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5 hidden sm:block">Kelola data BOK dengan mudah dan akurat</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-xl shadow-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Tahun Anggaran 2025</span>
                <ChevronDown size={16} className="text-slate-400 ml-2" />
             </div>
             <button className="relative bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm hover:bg-slate-50">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
             </button>
          </div>
        </header>

        {/* MENGGANTI HALAMAN SESUAI KLIK MENU */}
        <div className="p-4 md:p-8 w-full space-y-6 md:space-y-8 print:p-0 print:space-y-0">
          {activeMenu === 'Dashboard' && <Dashboard activeRole={activeRole} activeUser={currentUser} />}
          {activeMenu === 'Master Data' && <MasterData activeRole={activeRole} />}
          {activeMenu === 'SPJ' && <Sppd />}
          {activeMenu === 'Daftar POA' && <Kegiatan activeRole={activeRole} />}
          {activeMenu === 'Verifikasi' && <Verifikasi />}
          {activeMenu === 'Laporan' && <Laporan />}
          {activeMenu === 'Pengaturan' && <Pengaturan />}
        </div>

      </div>
    </div>
  );
}