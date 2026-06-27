import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { simpanPenggunaDb, ambilSemuaPenggunaDb, hapusPenggunaDb, catatAuditDb } from '../../services/pengaturanService';

export default function PenggunaAkses() {
  const [daftarPengguna, setDaftarPengguna] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  
  // State form
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [peran, setPeran] = useState('Pegawai');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    setLoading(true);
    try {
      const data = await ambilSemuaPenggunaDb();
      setDaftarPengguna(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!nama || !username || !password) {
      setPesan('Harap isi semua bidang wajib!');
      return;
    }
    
    setLoading(true);
    setPesan('');
    
    try {
      await simpanPenggunaDb({ nama, username, password, peran, status: 'Aktif' });
      await catatAuditDb('TAMBAH', 'PENGGUNA', `Menambahkan pengguna baru: ${username} (${peran}).`);
      
      setPesan('Pengguna berhasil ditambahkan!');
      setNama(''); setUsername(''); setPassword(''); setPeran('Pegawai');
      await tarikData();
      
      setTimeout(() => setPesan(''), 3000);
    } catch (error) {
      setPesan('Gagal menambahkan pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async (id, uname) => {
    if (!window.confirm(`Yakin ingin menghapus pengguna ${uname}?`)) return;
    
    setLoading(true);
    try {
      await hapusPenggunaDb(id);
      await catatAuditDb('HAPUS', 'PENGGUNA', `Menghapus pengguna: ${uname}.`);
      await tarikData();
    } catch (error) {
      alert("Gagal menghapus pengguna");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Keterangan */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
         <div className="bg-blue-100 p-3 rounded-full text-blue-600 shrink-0">
            <Shield size={24} />
         </div>
         <div>
            <h3 className="font-bold text-blue-900 text-lg mb-1">Manajemen Pengguna Lokal</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
               Buat akun lokal untuk staf Anda. Fitur otentikasi login saat ini sedang disiapkan. Mendaftarkan nama pengguna di sini akan mempermudah migrasi data ke sistem login resmi nantinya.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Tambah */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><UserPlus size={20} /></div>
             <h3 className="font-bold text-slate-800">Tambah Akun</h3>
          </div>
          
          {pesan && (
            <div className={`mb-4 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              pesan.includes('Gagal') || pesan.includes('Harap') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {pesan.includes('Gagal') || pesan.includes('Harap') ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
              {pesan}
            </div>
          )}

          <form onSubmit={handleSimpan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Nama Lengkap</label>
              <input 
                type="text" value={nama} onChange={e => setNama(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Username</label>
              <input 
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="Contoh: budi123"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                 <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                 <input 
                   type="password" value={password} onChange={e => setPassword(e.target.value)}
                   className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="***"
                 />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Hak Akses / Peran</label>
              <select 
                value={peran} onChange={e => setPeran(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold"
              >
                 <option value="Admin">Admin (Akses Penuh)</option>
                 <option value="Pegawai">Pegawai (Entri Terbatas)</option>
                 <option value="Pimpinan">Pimpinan (Hanya Baca)</option>
              </select>
            </div>
            
            <button 
              type="submit" disabled={loading}
              className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Simpan Pengguna
            </button>
          </form>
        </div>

        {/* Daftar Pengguna */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><Users size={20} /></div>
                <h3 className="font-bold text-slate-800">Daftar Akun Terdaftar</h3>
             </div>
             <button onClick={tarikData} className="text-slate-400 hover:text-slate-800 transition-colors p-2">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3 pl-0">Info Pengguna</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Akses</th>
                  <th className="p-3 text-right pr-0">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {daftarPengguna.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">Belum ada data pengguna.</td>
                  </tr>
                ) : (
                  daftarPengguna.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 pl-0 font-bold text-slate-700">{user.nama}</td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{user.username}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          user.peran === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.peran === 'Pimpinan' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.peran}
                        </span>
                      </td>
                      <td className="p-3 pr-0 text-right">
                        <button 
                          onClick={() => handleHapus(user.id, user.username)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
