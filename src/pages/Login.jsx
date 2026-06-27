import React, { useState, useEffect } from 'react';
import { Lock, User, LogIn, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ambilSemuaPenggunaDb, simpanPenggunaDb } from '../services/pengaturanService';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

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
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* Kolom Kiri - Latar Belakang (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative flex-col justify-center items-center overflow-hidden">
        {/* Ornamen Latar */}
        <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-10 text-white" fill="currentColor">
           <path d="M20 40h20v-20h20v20h20v20h-20v20h-20v-20h-20z" />
        </svg>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-700 rounded-full blur-[120px] opacity-60 translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex flex-wrap gap-1 p-4 mx-auto mb-8 border border-white/20 shadow-2xl">
            <div className="w-full h-4 bg-white rounded-md mb-1"></div>
            <div className="w-4 h-full bg-white rounded-md"></div>
            <div className="flex-1 h-full bg-emerald-400 rounded-md"></div>
            <div className="w-full h-6 bg-white/50 rounded-md mt-1"></div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Sistem Informasi <br />
            Manajemen BOK
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md mx-auto">
            Kelola data Bantuan Operasional Kesehatan dengan lebih terstruktur, aman, dan efisien.
          </p>
        </div>
      </div>

      {/* Kolom Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang!</h2>
            <p className="text-sm text-slate-500 mt-2">Masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          {pesan && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-2 border border-rose-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0" />
              {pesan}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
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

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">SIMBOK &copy; 2026 Puskesmas Silian Raya</p>
          </div>

        </div>
      </div>
    </div>
  );
}
