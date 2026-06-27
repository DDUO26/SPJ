import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import { ambilSemuaKegiatanDb } from '../../services/kegiatanService';

export default function RekapAnggaran() {
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const data = await ambilSemuaKegiatanDb();
      setDaftarKegiatan(data);
    } catch (error) {
      console.error('Gagal menarik rekap anggaran', error);
    } finally {
      setLoading(false);
    }
  };

  const rekap = useMemo(() => {
    let totalAnggaran = 0;
    const perBulan = {};

    daftarKegiatan.forEach(keg => {
      const dana = Number(keg.dana) || 0;
      totalAnggaran += dana;

      if (keg.bulan) {
         const bln = keg.bulan.toUpperCase();
         perBulan[bln] = (perBulan[bln] || 0) + dana;
      }
    });

    const sortedBulan = Object.entries(perBulan).sort((a,b) => b[1] - a[1]); // Descending by value

    return { totalAnggaran, sortedBulan };
  }, [daftarKegiatan]);

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  if (loading) {
     return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat Rekap Anggaran...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner Utama */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 shadow-lg shadow-indigo-500/30 text-white relative overflow-hidden">
         <div className="absolute -right-12 -top-12 opacity-10">
            <DollarSign size={200} />
         </div>
         <div className="relative z-10">
            <p className="text-indigo-100 font-semibold mb-2 uppercase tracking-widest text-sm">Total Anggaran Terserap (BOK)</p>
            <h2 className="text-5xl font-extrabold mb-4">{formatRp(rekap.totalAnggaran)}</h2>
            <div className="flex items-center gap-4">
               <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  <Activity size={18} />
                  <span className="font-bold text-sm">{daftarKegiatan.length} Kegiatan Didanai</span>
               </div>
               <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  <TrendingUp size={18} />
                  <span className="font-bold text-sm">Sesuai Jadwal</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Anggaran Tertinggi */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <PiggyBank className="text-emerald-500" />
               Bulan Penyerapan Tertinggi
            </h3>
            <div className="space-y-4">
               {rekap.sortedBulan.slice(0, 5).map(([bulan, dana], idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                           {idx + 1}
                        </div>
                        <p className="font-bold text-slate-700">{bulan}</p>
                     </div>
                     <p className="font-extrabold text-emerald-600">{formatRp(dana)}</p>
                  </div>
               ))}
               {rekap.sortedBulan.length === 0 && <p className="text-sm text-slate-500">Belum ada data anggaran yang tercatat.</p>}
            </div>
         </div>

         {/* Rincian Rata-Rata */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
            <div className="bg-blue-50 p-6 rounded-full mb-4">
               <Receipt size={48} className="text-blue-500" />
            </div>
            <p className="text-slate-500 font-semibold mb-2">Rata-Rata Dana per Kegiatan</p>
            <h3 className="text-3xl font-extrabold text-slate-800">
               {daftarKegiatan.length > 0 ? formatRp(rekap.totalAnggaran / daftarKegiatan.length) : 'Rp 0'}
            </h3>
            <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
               Angka ini didapat dari total anggaran terserap dibagi dengan jumlah titik kegiatan yang dilaksanakan.
            </p>
         </div>
      </div>
    </div>
  );
}
