import React, { useState } from 'react';
import { 
  Users, MapPin, Briefcase, Bookmark, 
  ListTodo, DollarSign, CreditCard, Calendar 
} from 'lucide-react';

import Pegawai from '../components/master/Pegawai';
import DataDesa from '../components/master/DataDesa';
import Pejabat from '../components/master/Pejabat';

// Placeholder untuk tab yang belum aktif
const Placeholder = ({ judul, icon: Icon }) => (
  <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[50vh] flex flex-col items-center justify-center">
    <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center rotate-3 mx-auto mb-6">
       <Icon size={40} className="text-indigo-600" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Master {judul}</h2>
    <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
      Halaman pengelolaan data {judul} ini sudah disiapkan dan akan segera hadir pada pengembangan tahap selanjutnya.
    </p>
    <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm">
       Segera Hadir (Coming Soon)
    </div>
  </div>
);

export default function MasterData({ activeRole = 'Admin' }) {
  const [activeTab, setActiveTab] = useState('Pegawai');

  const tabs = [
    { id: 'Pegawai', label: 'Pegawai', icon: Users },
    { id: 'Pejabat', label: 'Pejabat', icon: Briefcase },
    { id: 'Desa', label: 'Desa', icon: MapPin },
    { id: 'Program', label: 'Program', icon: Bookmark },
    { id: 'Kegiatan', label: 'Jenis Kegiatan', icon: ListTodo },
    { id: 'Biaya', label: 'Standar Biaya', icon: DollarSign },
    { id: 'Rekening', label: 'Rekening Belanja', icon: CreditCard },
    { id: 'Tahun', label: 'Tahun Anggaran', icon: Calendar },
  ];

  const filteredTabs = tabs.filter(tab => {
    if (activeRole === 'Pegawai') return tab.id === 'Pegawai';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-2">
         <h2 className="text-2xl font-bold text-slate-800">Master Data</h2>
         <p className="text-sm text-slate-500 mt-1">Kelola data referensi utama yang digunakan di seluruh sistem.</p>
      </div>

      {/* Scrollable Tabs */}
      <div className="relative">
         <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide snap-x">
            {filteredTabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`snap-start whitespace-nowrap px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${
                        isActive 
                           ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                           : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                     }`}
                  >
                     <Icon size={18} />
                     {tab.label}
                  </button>
               )
            })}
         </div>
      </div>

      {/* Konten Tab */}
      <div className="mt-4">
        {activeTab === 'Pegawai' && <Pegawai activeRole={activeRole} />}
        {activeTab === 'Pejabat' && activeRole === 'Admin' && <Pejabat />}
        {activeTab === 'Desa' && <DataDesa />}
        
        {/* Placeholders */}
        {activeTab === 'Program' && <Placeholder judul="Program" icon={Bookmark} />}
        {activeTab === 'Kegiatan' && <Placeholder judul="Jenis Kegiatan" icon={ListTodo} />}
        {activeTab === 'Biaya' && <Placeholder judul="Standar Biaya" icon={DollarSign} />}
        {activeTab === 'Rekening' && <Placeholder judul="Rekening Belanja" icon={CreditCard} />}
        {activeTab === 'Tahun' && <Placeholder judul="Tahun Anggaran" icon={Calendar} />}
      </div>
    </div>
  );
}
