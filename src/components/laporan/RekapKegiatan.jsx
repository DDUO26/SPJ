import React, { useState, useEffect, useMemo } from 'react';
import { Activity, MapPin, Search } from 'lucide-react';
import { ambilSemuaKegiatanDb } from '../../services/kegiatanService';

export default function RekapKegiatan() {
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDesa, setSearchDesa] = useState('');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const data = await ambilSemuaKegiatanDb();
      setDaftarKegiatan(data);
    } catch (error) {
      console.error('Gagal menarik rekap kegiatan', error);
    } finally {
      setLoading(false);
    }
  };

  const rekapPerDesa = useMemo(() => {
    const rekap = {};
    daftarKegiatan.forEach(keg => {
      if (!keg.desa) return;
      const desaName = keg.desa.toUpperCase();
      if (!rekap[desaName]) {
        rekap[desaName] = { desa: keg.desa, totalKegiatan: 0, totalPegawai: 0 };
      }
      rekap[desaName].totalKegiatan += 1;
      // Pegawai usually comma separated
      if (keg.pegawai) {
         rekap[desaName].totalPegawai += keg.pegawai.split(',').length;
      }
    });

    return Object.values(rekap).sort((a, b) => b.totalKegiatan - a.totalKegiatan);
  }, [daftarKegiatan]);

  const filteredRekap = useMemo(() => {
      if (!searchDesa) return rekapPerDesa;
      return rekapPerDesa.filter(r => r.desa.toLowerCase().includes(searchDesa.toLowerCase()));
  }, [rekapPerDesa, searchDesa]);

  if (loading) {
     return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat Rekap Kegiatan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
               <Activity size={32} />
            </div>
            <div>
               <p className="text-slate-500 text-sm font-semibold mb-1">Total Kegiatan Terjadwal</p>
               <h3 className="text-4xl font-bold text-slate-800">{daftarKegiatan.length}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
               <MapPin size={32} />
            </div>
            <div>
               <p className="text-slate-500 text-sm font-semibold mb-1">Desa Dikunjungi</p>
               <h3 className="text-4xl font-bold text-slate-800">{rekapPerDesa.length}</h3>
            </div>
         </div>
      </div>

      {/* Tabel Detail Rekap */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800">Distribusi Kegiatan per Desa</h3>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
               <input
                 type="text"
                 placeholder="Cari Desa..."
                 value={searchDesa}
                 onChange={(e) => setSearchDesa(e.target.value)}
                 className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nama Desa</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Jumlah Kegiatan</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Total Penugasan Pegawai</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredRekap.map((r, i) => (
                     <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{r.desa}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold">{r.totalKegiatan}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">{r.totalPegawai} Penugasan</td>
                     </tr>
                  ))}
                  {filteredRekap.length === 0 && (
                     <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500">Tidak ada rekap desa yang ditemukan.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
