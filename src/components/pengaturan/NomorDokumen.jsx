import React, { useState, useEffect } from 'react';
import { Save, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { simpanPengaturanDb, ambilPengaturanDb, catatAuditDb } from '../../services/pengaturanService';

export default function NomorDokumen() {
  const [formData, setFormData] = useState({
    formatSppd: '094/{no}/PKM-PC/{bln}/{thn}',
    formatKwitansi: 'KWT/{no}/PKM-PC/{bln}/{thn}',
    nomorMulai: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [status, setStatus] = useState(''); 

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    setLoading(true);
    try {
      const data = await ambilPengaturanDb('dokumen');
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

  const generatePreview = (format) => {
    const d = new Date();
    const bulan = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][d.getMonth()];
    const tahun = d.getFullYear();
    const no = String(formData.nomorMulai).padStart(3, '0');
    
    return format
      .replace('{no}', no)
      .replace('{bln}', bulan)
      .replace('{thn}', tahun);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesan('');
    
    try {
      await simpanPengaturanDb('dokumen', formData);
      await catatAuditDb('UPDATE', 'NOMOR DOKUMEN', 'Memperbarui format penomoran otomatis dokumen.');
      setStatus('sukses');
      setPesan('Format penomoran berhasil disimpan!');
      setTimeout(() => setPesan(''), 3000);
    } catch (error) {
      setStatus('error');
      setPesan('Gagal menyimpan format penomoran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <FileText size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan Nomor Dokumen</h2>
          <p className="text-slate-500">Konfigurasi struktur kode atau penomoran otomatis untuk pencetakan dokumen.</p>
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
        
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 text-sm text-blue-800 leading-relaxed">
           <span className="font-bold block mb-1">Panduan Variabel:</span>
           Gunakan kode berikut di dalam kotak input untuk membuat nomor yang dinamis:<br/>
           <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-bold mr-2">{'{no}'}</code> : Nomor urut otomatis (contoh: 001)<br/>
           <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-bold mr-2">{'{bln}'}</code> : Bulan Romawi saat ini (contoh: VI)<br/>
           <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-bold">{'{thn}'}</code> : Tahun saat ini (contoh: 2026)
        </div>

        <div className="space-y-5">
           <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Format Nomor SPPD</label>
             <input 
               type="text" name="formatSppd" value={formData.formatSppd} onChange={handleChange} required
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono text-slate-700 font-bold text-sm tracking-wide"
             />
             <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-1 rounded font-bold uppercase">Preview:</span>
                <span className="text-blue-600 font-bold font-mono tracking-wider">{generatePreview(formData.formatSppd)}</span>
             </div>
           </div>

           <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Format Nomor Kwitansi</label>
             <input 
               type="text" name="formatKwitansi" value={formData.formatKwitansi} onChange={handleChange} required
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono text-slate-700 font-bold text-sm tracking-wide"
             />
             <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-1 rounded font-bold uppercase">Preview:</span>
                <span className="text-blue-600 font-bold font-mono tracking-wider">{generatePreview(formData.formatKwitansi)}</span>
             </div>
           </div>

           <div className="pt-4 border-t border-slate-100">
             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Mulai Penomoran dari Angka</label>
             <input 
               type="number" name="nomorMulai" value={formData.nomorMulai} onChange={handleChange} required min="1"
               className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center text-slate-700"
             />
           </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Format'}
          </button>
        </div>
      </form>
    </div>
  );
}
