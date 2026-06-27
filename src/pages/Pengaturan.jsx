import React, { useState } from 'react';
import { 
  Building2, Users, Sliders, FileText, 
  DownloadCloud, UploadCloud, History, Info 
} from 'lucide-react';

import ProfilPuskesmas from '../components/pengaturan/ProfilPuskesmas';
import PenggunaAkses from '../components/pengaturan/PenggunaAkses';
import ParameterAplikasi from '../components/pengaturan/ParameterAplikasi';
import NomorDokumen from '../components/pengaturan/NomorDokumen';
import BackupDatabase from '../components/pengaturan/BackupDatabase';
import RestoreDatabase from '../components/pengaturan/RestoreDatabase';
import AuditLog from '../components/pengaturan/AuditLog';
import TentangAplikasi from '../components/pengaturan/TentangAplikasi';

// Placeholder untuk tab yang belum aktif
const Placeholder = ({ judul, icon: Icon, deskripsi }) => (
  <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[50vh] flex flex-col items-center justify-center">
    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
       <Icon size={40} className="text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Pengaturan {judul}</h2>
    <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
      {deskripsi}
    </p>
    <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm">
       Sedang Dalam Pengembangan
    </div>
  </div>
);

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('Profil');

  const tabs = [
    { id: 'Profil', label: 'Profil Puskesmas', icon: Building2, desc: 'Kelola identitas, logo, alamat, dan informasi dasar Puskesmas untuk keperluan kop surat.' },
    { id: 'Pengguna', label: 'Pengguna & Akses', icon: Users, desc: 'Atur akun staf, ubah kata sandi, dan kelola level hak akses (Admin, Pegawai, dll).' },
    { id: 'Parameter', label: 'Parameter Aplikasi', icon: Sliders, desc: 'Konfigurasi variabel global aplikasi seperti satuan default, nama dinas, dan batasan sistem.' },
    { id: 'NomorDokumen', label: 'Nomor Dokumen', icon: FileText, desc: 'Atur format penomoran otomatis untuk SPPD, Kwitansi, dan dokumen administrasi lainnya.' },
    { id: 'Backup', label: 'Backup Database', icon: DownloadCloud, desc: 'Cadangkan (backup) seluruh data aplikasi ke format aman untuk mencegah kehilangan data.' },
    { id: 'Restore', label: 'Restore Database', icon: UploadCloud, desc: 'Pulihkan data aplikasi dari file cadangan yang pernah dibuat sebelumnya.' },
    { id: 'AuditLog', label: 'Audit Log', icon: History, desc: 'Pantau riwayat aktivitas pengguna (siapa yang mengubah/menghapus data dan kapan).' },
    { id: 'Tentang', label: 'Tentang Aplikasi', icon: Info, desc: 'Informasi versi sistem, lisensi, petunjuk penggunaan, dan kontak bantuan pengembang.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-2">
         <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
         <p className="text-sm text-slate-500 mt-1">Konfigurasi pusat, manajemen akses, dan pemeliharaan basis data.</p>
      </div>

      {/* Scrollable Tabs */}
      <div className="relative">
         <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide snap-x">
            {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`snap-start whitespace-nowrap px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${
                        isActive 
                           ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-500/20' 
                           : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
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
        {activeTab === 'Profil' && <ProfilPuskesmas />}
        {activeTab === 'Pengguna' && <PenggunaAkses />}
        {activeTab === 'Parameter' && <ParameterAplikasi />}
        {activeTab === 'NomorDokumen' && <NomorDokumen />}
        {activeTab === 'Backup' && <BackupDatabase />}
        {activeTab === 'Restore' && <RestoreDatabase />}
        {activeTab === 'AuditLog' && <AuditLog />}
        {activeTab === 'Tentang' && <TentangAplikasi />}
      </div>
    </div>
  );
}
