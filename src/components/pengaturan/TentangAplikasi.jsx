import React from 'react';
import { Info, Code, ShieldCheck, Heart, Cpu, MonitorSmartphone } from 'lucide-react';

export default function TentangAplikasi() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <Info size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tentang Aplikasi</h2>
          <p className="text-slate-500">Informasi sistem SIMBOK, pengembang, dan lisensi penggunaan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri - Info Aplikasi */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-white/20 p-3 rounded-2xl">
                    <MonitorSmartphone size={32} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-wider">SIMBOK</h3>
                    <p className="text-slate-300 text-sm font-medium">Sistem Informasi Manajemen BOK</p>
                 </div>
              </div>

              <div className="space-y-3 font-mono text-sm border-t border-white/10 pt-6">
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Versi</span>
                    <span className="font-bold text-emerald-400">v1.0.0 (Enterprise)</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Lisensi</span>
                    <span className="font-bold">Proprietary Puskesmas</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Rilis Terakhir</span>
                    <span className="font-bold">Juni 2026</span>
                 </div>
                 <div className="flex justify-between pb-2">
                    <span className="text-slate-400">Mesin Database</span>
                    <span className="font-bold text-amber-400">Google Firestore Cloud</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <ShieldCheck size={18} className="text-emerald-500" /> Jaminan Keamanan Data
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                 Aplikasi ini menggunakan sistem database NoSQL dari Google (Firebase Firestore) yang menjamin keamanan data terenkripsi. Seluruh jejak perubahan data terekam secara otomatis di dalam modul <strong>Audit Log</strong> untuk transparansi penuh.
              </p>
           </div>
        </div>

        {/* Kolom Kanan - Tentang Developer */}
        <div className="space-y-6">
           <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 h-full flex flex-col justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-200">
                 <Code size={36} className="text-blue-600" />
              </div>
              <h4 className="font-black text-xl text-blue-950 mb-1">Dikembangkan Dengan Cerdas</h4>
              <p className="text-blue-700 text-sm mb-6 max-w-xs mx-auto">
                 Dirancang khusus untuk mengotomatisasi pembuatan SPPD dan laporan keuangan Puskesmas.
              </p>
              
              <div className="mt-auto space-y-4">
                 <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                    Dibuat menggunakan <Heart size={16} className="text-rose-500 fill-rose-500" /> oleh
                 </div>
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-200 font-bold text-slate-700">
                    <Cpu size={18} /> Antigravity IDE (Agentic AI)
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
