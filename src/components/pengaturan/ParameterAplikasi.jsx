import React, { useState, useEffect } from 'react';
import { Save, Sliders, CheckCircle, AlertCircle, DollarSign, Map } from 'lucide-react';
import { simpanPengaturanDb, ambilPengaturanDb, catatAuditDb } from '../../services/pengaturanService';

export default function ParameterAplikasi() {
  const [formData, setFormData] = useState({
    tarifDalamDaerah: 150000,
    tarifLuarDaerah: 350000,
    batasHariMax: 5,
    defaultUangSaku: 50000
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
      const data = await ambilPengaturanDb('parameter');
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
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesan('');
    
    try {
      await simpanPengaturanDb('parameter', formData);
      await catatAuditDb('UPDATE', 'PARAMETER', 'Memperbarui pengaturan parameter aplikasi (Tarif, dll).');
      setStatus('sukses');
      setPesan('Parameter berhasil disimpan!');
      setTimeout(() => setPesan(''), 3000);
    } catch (error) {
      setStatus('error');
      setPesan('Gagal menyimpan parameter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <Sliders size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Parameter Aplikasi</h2>
          <p className="text-slate-500">Atur nominal baku dan batas maksimal untuk otomatisasi perhitungan.</p>
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

      <form onSubmit={handleSimpan} className="space-y-8">
        
        {/* Tarif Perjalanan */}
        <div>
           <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Map size={16} className="text-blue-500" /> Tarif Dasar Perjalanan
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Dalam Daerah (Rp)</label>
               <div className="relative">
                 <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                 <input 
                   type="number" name="tarifDalamDaerah" value={formData.tarifDalamDaerah} onChange={handleChange}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 font-bold text-slate-700"
                 />
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Luar Daerah (Rp)</label>
               <div className="relative">
                 <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                 <input 
                   type="number" name="tarifLuarDaerah" value={formData.tarifLuarDaerah} onChange={handleChange}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 font-bold text-slate-700"
                 />
               </div>
             </div>
           </div>
        </div>

        {/* Batasan Sistem */}
        <div>
           <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Sliders size={16} className="text-purple-500" /> Batasan Sistem
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Maksimal Hari Perjalanan</label>
               <div className="flex items-center gap-3">
                 <input 
                   type="number" name="batasHariMax" value={formData.batasHariMax} onChange={handleChange}
                   className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 font-bold text-center text-slate-700"
                 />
                 <span className="text-sm font-bold text-slate-500">Hari</span>
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Default Uang Saku Harian (Rp)</label>
               <div className="relative">
                 <span className="absolute left-4 top-3 text-slate-400 font-bold">Rp</span>
                 <input 
                   type="number" name="defaultUangSaku" value={formData.defaultUangSaku} onChange={handleChange}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 font-bold text-slate-700"
                 />
               </div>
             </div>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Parameter'}
          </button>
        </div>
      </form>
    </div>
  );
}
