import React, { useState } from 'react';
import { Calendar, List, Archive } from 'lucide-react';

import JadwalKegiatan from '../components/kegiatan/JadwalKegiatan';
import KalenderKegiatan from '../components/kegiatan/KalenderKegiatan';
import ArsipKegiatan from '../components/kegiatan/ArsipKegiatan';

export default function Kegiatan({ activeRole = 'Admin' }) {
  const [activeTab, setActiveTab] = useState('jadwal');

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4 mb-2 print:hidden">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen Kegiatan</h2>
           <p className="text-sm text-slate-500 mt-1">Kelola jadwal, pantau kalender, dan arsipkan kegiatan Puskesmas.</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'jadwal' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={18} />
             DAFTAR POA
          </button>
          <button
            onClick={() => setActiveTab('kalender')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'kalender' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar size={18} />
            Kalender Kegiatan
          </button>
          {activeRole === 'Admin' && (
             <button
               onClick={() => setActiveTab('arsip')}
               className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                 activeTab === 'arsip' 
                   ? 'bg-white text-indigo-600 shadow-sm' 
                   : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Archive size={18} />
               Arsip Kegiatan
             </button>
          )}
        </div>
      </div>

      {/* Konten Tab */}
      <div className="mt-6 print:mt-0">
        {activeTab === 'jadwal' && <JadwalKegiatan activeRole={activeRole} />}
        {activeTab === 'kalender' && <KalenderKegiatan />}
        {activeTab === 'arsip' && activeRole === 'Admin' && <ArsipKegiatan />}
      </div>
    </div>
  );
}