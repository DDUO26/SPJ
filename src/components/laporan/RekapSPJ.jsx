import React, { useState, useEffect, useMemo } from 'react';
import { FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { ambilSemuaSpjDb } from '../../services/spjService';

export default function RekapSPJ() {
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const data = await ambilSemuaSpjDb();
      setDaftarSpj(data);
    } catch (error) {
      console.error('Gagal menarik rekap SPJ', error);
    } finally {
      setLoading(false);
    }
  };

  const rekap = useMemo(() => {
    let lengkap = 0;
    let belumLengkap = 0;
    const missingItemsCount = {};

    daftarSpj.forEach(spj => {
      const cl = spj.checklist || {};
      // Definisi kelengkapan: minimal SPPD, Surat Tugas, Kwitansi, dll. (Anggap saja jika ada false = belum lengkap)
      // Tapi karena ini rekap umum, kita cek if any is missing.
      // Kita harus tahu apa saja checklist item nya.
      const keys = ['sppd', 'suratTugas', 'daftarHadir', 'dokumentasi', 'riilCost', 'kwitansi', 'suratPernyataan', 'laporan'];
      let isLengkap = true;
      keys.forEach(k => {
         if (!cl[k]) {
            isLengkap = false;
            missingItemsCount[k] = (missingItemsCount[k] || 0) + 1;
         }
      });

      if (isLengkap) lengkap++;
      else belumLengkap++;
    });

    return { lengkap, belumLengkap, missingItemsCount };
  }, [daftarSpj]);

  const total = daftarSpj.length;
  const persenLengkap = total === 0 ? 0 : Math.round((rekap.lengkap / total) * 100);

  if (loading) {
     return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat Rekap SPJ...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Kartu Kelengkapan */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold text-slate-800 mb-2">Status Kelengkapan SPJ Keseluruhan</h3>
               <p className="text-sm text-slate-500 mb-6">Persentase dokumen SPJ yang telah dinyatakan lengkap (100% checklist terpenuhi) dari total SPJ yang dientri.</p>
               
               <div className="flex items-center gap-8 justify-center md:justify-start">
                  <div>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total SPJ</p>
                     <p className="text-3xl font-extrabold text-slate-800">{total}</p>
                  </div>
                  <div>
                     <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Lengkap</p>
                     <p className="text-3xl font-extrabold text-emerald-600">{rekap.lengkap}</p>
                  </div>
                  <div>
                     <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">Kurang/Revisi</p>
                     <p className="text-3xl font-extrabold text-rose-600">{rekap.belumLengkap}</p>
                  </div>
               </div>
            </div>
            
            <div className="w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center relative shadow-inner">
               <div className="absolute w-full h-full rounded-full border-[16px] border-emerald-500 border-l-transparent border-b-transparent transform rotate-45" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${persenLengkap}%, 0 ${persenLengkap}%)`}}></div>
               <div className="text-center z-10">
                  <h2 className="text-4xl font-extrabold text-slate-800">{persenLengkap}%</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lengkap</p>
               </div>
            </div>
         </div>
      </div>

      {/* Dokumen yang Paling Sering Kurang */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
         <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Dokumen yang Sering Terlupakan
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(rekap.missingItemsCount).sort((a,b) => b[1] - a[1]).slice(0,4).map(([item, count], idx) => (
               <div key={idx} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                     <FileCheck size={80} className="text-amber-600" />
                  </div>
                  <p className="text-amber-800 font-bold capitalize text-sm mb-1">{item.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-2xl font-extrabold text-amber-600">{count} <span className="text-xs font-medium">SPJ</span></p>
               </div>
            ))}
            {Object.keys(rekap.missingItemsCount).length === 0 && (
               <div className="col-span-full py-8 text-center text-emerald-600 flex flex-col items-center gap-2">
                  <CheckCircle size={32} />
                  <p className="font-bold">Luar Biasa! Semua SPJ Lengkap.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
