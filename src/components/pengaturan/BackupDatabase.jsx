import React, { useState } from 'react';
import { DownloadCloud, CheckCircle, AlertCircle, Database, ShieldAlert } from 'lucide-react';
import { backupSeluruhDataDb } from '../../services/pengaturanService';

export default function BackupDatabase() {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [status, setStatus] = useState('');

  const handleBackup = async () => {
    setLoading(true);
    setPesan('Mempersiapkan data backup, mohon tunggu...');
    setStatus('');
    
    try {
      const dataBackup = await backupSeluruhDataDb();
      
      // Tambahkan metadata
      const fileData = {
        meta: {
          app: 'SIMBOK',
          versi: '1.0.0',
          tanggalBackup: new Date().toISOString()
        },
        data: dataBackup
      };
      
      const jsonString = JSON.stringify(fileData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const tanggal = new Date().toISOString().split('T')[0];
      link.download = `SIMBOK_Backup_${tanggal}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatus('sukses');
      setPesan('Backup berhasil! File JSON telah diunduh ke komputer Anda.');
    } catch (error) {
      setStatus('error');
      setPesan('Terjadi kesalahan saat membackup data. Silakan coba lagi.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <DownloadCloud size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Backup Database</h2>
          <p className="text-slate-500">Amankan data sistem dengan mencadangkannya ke komputer Anda.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex gap-4">
        <div className="text-blue-500 shrink-0 mt-1">
           <ShieldAlert size={24} />
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
           <span className="font-bold block mb-1">Mengapa Backup Penting?</span>
           <p>Melakukan backup (pencadangan) secara rutin akan memastikan Anda tidak akan pernah kehilangan data Pegawai, Jadwal Kegiatan, SPJ, dan Pengaturan jika sewaktu-waktu terjadi masalah pada server. Sistem akan membungkus seluruh data Anda menjadi satu file <strong>.json</strong> yang bisa Anda simpan di Flashdisk atau Google Drive.</p>
        </div>
      </div>

      {pesan && (
        <div className={`mb-8 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold ${
          status === 'sukses' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
          status === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          'bg-slate-100 text-slate-600 border border-slate-200 animate-pulse'
        }`}>
          {status === 'sukses' ? <CheckCircle size={18} /> : status === 'error' ? <AlertCircle size={18} /> : <Database size={18} className="animate-bounce" />}
          {pesan}
        </div>
      )}

      <div className="border-t border-slate-100 pt-8 flex flex-col items-center justify-center">
         <button 
           onClick={handleBackup}
           disabled={loading}
           className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl flex flex-col items-center gap-2 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
         >
           <DownloadCloud size={32} />
           <span className="text-lg">{loading ? 'Memproses Backup...' : 'Mulai Proses Backup'}</span>
         </button>
         <p className="text-xs text-slate-400 mt-4 font-medium">Proses ini membutuhkan koneksi internet yang stabil.</p>
      </div>
    </div>
  );
}
