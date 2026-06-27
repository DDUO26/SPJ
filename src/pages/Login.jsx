import React, { useState, useEffect } from 'react';
import { Lock, User, LogIn, ShieldCheck, AlertCircle, Loader2, Plus, Zap, PieChart, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { ambilSemuaPenggunaDb, simpanPenggunaDb } from '../services/pengaturanService';
import heroImg from '../assets/berkas_3d_v2.png';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    periksaPenggunaDefault();
  }, []);

  const periksaPenggunaDefault = async () => {
    try {
      const pengguna = await ambilSemuaPenggunaDb();
      // Jika database kosong, buat akun admin default
      if (pengguna.length === 0) {
        await simpanPenggunaDb({
          id: 'admin_default',
          nama: 'Admin Sistem',
          username: 'admin',
          password: 'admin',
          peran: 'Admin',
          status: 'Aktif'
        });
      }
    } catch (error) {
      console.error("Gagal memeriksa pengguna:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setPesan('Username dan Password wajib diisi!');
      return;
    }

    setLoading(true);
    setPesan('');

    try {
      const pengguna = await ambilSemuaPenggunaDb();
      const userMatch = pengguna.find(
        (u) => u.username === username && u.password === password && u.status !== 'Nonaktif'
      );

      if (userMatch) {
        onLogin(userMatch);
      } else {
        setPesan('Username atau password salah!');
      }
    } catch (error) {
      setPesan('Gagal terhubung ke database. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
        <div className="flex flex-col items-center text-blue-600">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-bold">Memeriksa Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Kolom Kiri - Area Biru (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 relative flex-col justify-center overflow-hidden">
        
        {/* Logo Top Left */}
        <div className="absolute top-8 left-8 xl:top-12 xl:left-12 flex items-center gap-3 z-20">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Plus size={24} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none tracking-tight">BOK</h1>
            <p className="text-[8px] text-blue-200 uppercase tracking-widest mt-0.5">Bantuan Operasional<br/>Kesehatan</p>
          </div>
        </div>

        {/* Ornamen Latar */}
        <svg className="absolute top-12 right-12 w-32 h-32 opacity-20 z-0" fill="none" viewBox="0 0 100 100">
          <pattern id="dots" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle fill="white" cx="2" cy="2" r="1.5"></circle>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
        </svg>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[150px] opacity-40 translate-y-1/3 -translate-x-1/4"></div>

        {/* Konten Utama Kiri */}
        <div className="relative z-10 px-12 xl:px-20 w-full mt-12 flex flex-col justify-center">
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-4 leading-[1.15] tracking-tight">
            Sistem Informasi <br />
            Manajemen BOK
          </h1>
          <p className="text-blue-100 text-sm xl:text-base leading-relaxed max-w-sm mb-12">
            Kelola data Bantuan Operasional Kesehatan dengan lebih terstruktur, aman, dan efisien.
          </p>
          
          {/* Gambar Ilustrasi */}
          <div className="relative w-full max-w-md xl:max-w-lg -ml-4">
            <img src={heroImg} alt="Hero Illustration" className="w-full h-auto drop-shadow-2xl relative z-10 hover:-translate-y-2 transition-transform duration-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/40 rounded-full blur-3xl z-0"></div>
          </div>
        </div>

        {/* Footer Features (Kiri) */}
        <div className="absolute bottom-8 xl:bottom-12 w-full px-12 xl:px-20 z-10">
          <div className="bg-blue-900/30 backdrop-blur-md border border-blue-400/20 rounded-2xl p-4 grid grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-300 shrink-0"><ShieldCheck size={18} /></div>
              <div>
                <h4 className="text-white text-[11px] font-bold mb-0.5">Aman & Terpercaya</h4>
                <p className="text-[9px] text-blue-200/80 leading-tight">Data terlindungi dengan sistem keamanan berlapis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-300 shrink-0"><Zap size={18} /></div>
              <div>
                <h4 className="text-white text-[11px] font-bold mb-0.5">Cepat & Efisien</h4>
                <p className="text-[9px] text-blue-200/80 leading-tight">Proses kerja lebih cepat dan terintegrasi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-300 shrink-0"><PieChart size={18} /></div>
              <div>
                <h4 className="text-white text-[11px] font-bold mb-0.5">Terstruktur</h4>
                <p className="text-[9px] text-blue-200/80 leading-tight">Data rapi dan mudah dipantau setiap saat</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-[10px] text-blue-300/70 font-medium">
            SIMBOK &copy; 2026 Puskesmas Silian Raya
          </div>
        </div>
      </div>

      {/* Kolom Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white/50 lg:bg-transparent">
        
        {/* Background Pattern Kanan */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden lg:block">
          <div className="absolute top-20 right-20 w-64 h-64 border border-slate-100 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-slate-100 rounded-full"></div>
          <svg className="absolute top-10 right-10 w-32 h-32 opacity-[0.03]" fill="none" viewBox="0 0 100 100">
            <pattern id="dots-light" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle fill="currentColor" cx="2" cy="2" r="1.5"></circle>
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-light)"></rect>
          </svg>
        </div>

        <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 relative z-10">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-600 shadow-inner border border-blue-100">
              <ShieldCheck size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 flex justify-center items-center gap-2">
              Selamat Datang <span className="text-2xl">👋</span>
            </h2>
            <p className="text-sm text-slate-500 mt-2">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {pesan && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-2 border border-rose-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0" />
              {pesan}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username" 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password" 
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                Ingat saya
              </label>
              <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">Lupa password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sedang Masuk...
                </>
              ) : (
                <>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span className="bg-white px-4">atau masuk dengan</span>
            </div>
          </div>

          <button 
            type="button" 
            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Fingerprint size={18} className="text-slate-500" /> Gunakan Sidik Jari
          </button>

        </div>
      </div>
    </div>
  );
}
