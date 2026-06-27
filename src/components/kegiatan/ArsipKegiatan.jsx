import React from 'react';
import { Archive, Smartphone, ArrowRight } from 'lucide-react';

export default function ArsipKegiatan() {
  return (
    <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-6">
         <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center rotate-3 mx-auto">
            <Archive size={40} className="text-indigo-600" />
         </div>
         <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center -rotate-6 border-4 border-white shadow-sm">
            <Smartphone size={24} className="text-emerald-500" />
         </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Arsip Kegiatan Digital</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Fitur ini sedang dalam tahap pengembangan. Nantinya, semua arsip dokumen dan dokumentasi dari HP petugas di lapangan akan otomatis tersinkronisasi dan tersimpan rapi di sini.
      </p>

      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-lg w-full text-left">
         <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
            Penyatuan Sistem Masa Depan <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">Segera Hadir</span>
         </h4>
         <ul className="space-y-3">
            {[
               'Upload foto dokumentasi kegiatan langsung dari HP.',
               'Sinkronisasi absensi dan koordinat lokasi (GPS).',
               'Arsip otomatis terhubung dengan SPJ yang dibuat.'
            ].map((item, i) => (
               <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <ArrowRight size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                  {item}
               </li>
            ))}
         </ul>
      </div>
    </div>
  );
}
