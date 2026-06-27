import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Phone, Mail, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { simpanPengaturanDb, ambilPengaturanDb, catatAuditDb } from '../../services/pengaturanService';

export default function ProfilPuskesmas() {
  const [formData, setFormData] = useState({
    namaPuskesmas: 'Puskesmas Percontohan',
    namaDinas: 'Dinas Kesehatan Kabupaten',
    alamat: 'Jl. Kesehatan No. 123, Kota Sehat',
    telepon: '0812-3456-7890',
    email: 'puskesmas@contoh.com',
    kodePos: '12345',
    logoUrl: '' // Bisa menggunakan base64 atau URL gambar dari internet
  });
  
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [status, setStatus] = useState(''); // 'sukses' atau 'error'

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    setLoading(true);
    try {
      const data = await ambilPengaturanDb('profil');
      if (data) {
        setFormData({ ...formData, ...data });
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesan('');
    
    try {
      await simpanPengaturanDb('profil', formData);
      await catatAuditDb('UPDATE', 'PROFIL PUSKESMAS', 'Memperbarui data identitas dasar puskesmas.');
      setStatus('sukses');
      setPesan('Profil Puskesmas berhasil disimpan!');
      setTimeout(() => setPesan(''), 3000);
    } catch (error) {
      setStatus('error');
      setPesan('Gagal menyimpan profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <Building2 size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profil Puskesmas</h2>
          <p className="text-slate-500">Kelola identitas dasar yang akan tercetak pada kop surat dan laporan.</p>
        </div>
      </div>

      {pesan && (
        <div className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold ${
          status === 'sukses' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {status === 'sukses' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {pesan}
        </div>
      )}

      <form onSubmit={handleSimpan} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Puskesmas</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" name="namaPuskesmas" value={formData.namaPuskesmas} onChange={handleChange} required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Dinas Kesehatan Induk</label>
            <div className="relative">
              <FileText size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" name="namaDinas" value={formData.namaDinas} onChange={handleChange} required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Alamat Lengkap</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <textarea 
              name="alamat" value={formData.alamat} onChange={handleChange} required rows={2}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nomor Telepon</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" name="telepon" value={formData.telepon} onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kode Pos</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" name="kodePos" value={formData.kodePos} onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  );
}
