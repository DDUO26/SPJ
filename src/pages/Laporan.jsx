import React, { useState } from 'react';
import { BarChart2, Activity, FileCheck, DollarSign, Calendar } from 'lucide-react';

import RekapKegiatan from '../components/laporan/RekapKegiatan';
import RekapSPJ from '../components/laporan/RekapSPJ';
import RekapAnggaran from '../components/laporan/RekapAnggaran';
import RekapTahunan from '../components/laporan/RekapTahunan';

export default function Laporan() {
  const [activeTab, setActiveTab] = useState('kegiatan');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4 mb-2">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 size={24} className="text-indigo-600" />
              Laporan & Statistik
           </h2>
           <p className="text-sm text-slate-500 mt-1">Pantau rekapitulasi data BOK secara menyeluruh.</p>
        </div>
        <div className="flex flex-wrap space-x-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'kegiatan' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={16} />
            Rekap Kegiatan
          </button>
          <button
            onClick={() => setActiveTab('spj')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'spj' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck size={16} />
            Rekap SPJ
          </button>
          <button
            onClick={() => setActiveTab('anggaran')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'anggaran' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign size={16} />
            Rekap Anggaran
          </button>
          <button
            onClick={() => setActiveTab('tahunan')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'tahunan' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar size={16} />
            Rekap Tahunan
          </button>
        </div>
      </div>

      {/* Konten Tab */}
      <div className="mt-6">
        {activeTab === 'kegiatan' && <RekapKegiatan />}
        {activeTab === 'spj' && <RekapSPJ />}
        {activeTab === 'anggaran' && <RekapAnggaran />}
        {activeTab === 'tahunan' && <RekapTahunan />}
      </div>
    </div>
  );
}
