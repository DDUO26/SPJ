import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileJson, TriangleAlert, Database } from 'lucide-react';
import { restoreSeluruhDataDb } from '../../services/pengaturanService';

export default function RestoreDatabase() {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleUploadJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setPesan('Harap pilih file dengan format .json (Contoh: SIMBOK_Backup.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target.result;
        const jsonData = JSON.parse(fileContent);

        if (!jsonData.meta || jsonData.meta.app !== 'SIMBOK' || !jsonData.data) {
          setStatus('error');
          setPesan('File JSON tidak valid atau bukan file backup resmi dari aplikasi SIMBOK.');
          return;
        }

        if (window.confirm(`File valid. Dibuat pada: ${new Date(jsonData.meta.tanggalBackup).toLocaleString('id-ID')}.\n\nPERINGATAN: Memulihkan data (restore) akan menimpa data yang ada jika ada kesamaan ID. Apakah Anda yakin ingin melanjutkan?`)) {
          eksekusiRestore(jsonData.data);
        } else {
          if (fileInputRef.current) fileInputRef.current.value = '';
          setStatus('');
          setPesan('Proses restore dibatalkan oleh pengguna.');
        }

      } catch (error) {
        setStatus('error');
        setPesan('Gagal membaca file JSON. Pastikan file tidak rusak.');
      }
    };
    reader.readAsText(file);
  };

  const eksekusiRestore = async (dataBackup) => {
    setLoading(true);
    setStatus('');
    setPesan('Memulihkan data ke server, mohon jangan tutup halaman ini...');

    try {
      await restoreSeluruhDataDb(dataBackup);
      setStatus('sukses');
      setPesan('Sukses! Seluruh data berhasil dipulihkan.');
    } catch (error) {
      setStatus('error');
      setPesan('Terjadi kesalahan saat memulihkan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
          <UploadCloud size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Restore Database</h2>
          <p className="text-slate-500">Pulihkan data sistem menggunakan file .json hasil pencadangan (backup).</p>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8 flex gap-4">
        <div className="text-rose-500 shrink-0 mt-1">
           <TriangleAlert size={24} />
        </div>
        <div className="text-sm text-rose-800 leading-relaxed">
           <span className="font-bold block mb-1">Peringatan Kritis!</span>
           <p>Melakukan proses <strong>Restore</strong> akan menimpa dan menggabungkan data saat ini dengan data dari masa lalu (saat backup dibuat). Jika data di database saat ini lebih baru dari file backup, data tersebut akan tetap aman, namun data lama akan tertimpa. Lakukan ini hanya jika sistem mengalami kegagalan fatal (crash) atau data hilang.</p>
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
         <input 
           type="file"
           accept=".json"
           ref={fileInputRef}
           onChange={handleUploadJson}
           className="hidden"
           id="file-upload-backup"
         />
         <label 
           htmlFor={loading ? "" : "file-upload-backup"}
           className={`px-10 py-6 border-2 border-dashed ${loading ? 'border-slate-300 text-slate-400 bg-slate-50' : 'border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 cursor-pointer'} rounded-2xl flex flex-col items-center gap-3 transition-all`}
         >
           {loading ? <RefreshCw size={36} className="animate-spin" /> : <FileJson size={36} />}
           <div className="text-center">
             <span className="text-lg font-bold block">{loading ? 'Memproses Restore...' : 'Pilih File Backup (.json)'}</span>
             <span className="text-sm opacity-80 block mt-1">Klik di sini untuk menelusuri file komputer Anda.</span>
           </div>
         </label>
      </div>
    </div>
  );
}
