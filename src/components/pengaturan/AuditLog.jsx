import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, User, Calendar, Activity } from 'lucide-react';
import { ambilAuditDb } from '../../services/pengaturanService';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    setLoading(true);
    try {
      const data = await ambilAuditDb();
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    (log.aksi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.entitas || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.user || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500 flex flex-col h-full min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-4 rounded-2xl text-slate-600">
            <History size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Audit Log & Riwayat Sistem</h2>
            <p className="text-slate-500 text-sm mt-1">Pantau semua perubahan penting yang terjadi di dalam aplikasi.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
             <input 
               type="text" 
               placeholder="Cari riwayat..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-slate-800 text-sm transition-colors"
             />
          </div>
          <button onClick={tarikData} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto border border-slate-200 rounded-2xl bg-slate-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100">
              <th className="p-4 w-[180px]">Tanggal & Waktu</th>
              <th className="p-4 w-[120px]">Aksi</th>
              <th className="p-4 w-[180px]">Modul / Entitas</th>
              <th className="p-4">Deskripsi Aktivitas</th>
              <th className="p-4 w-[150px]">Pengguna</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
               <tr>
                 <td colSpan="5" className="py-20 text-center text-slate-400">
                   <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
                   <p>Memuat riwayat aktivitas...</p>
                 </td>
               </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center text-slate-400">
                  <Activity size={32} className="mx-auto mb-3 opacity-30" />
                  <p>Tidak ada riwayat aktivitas yang ditemukan.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const date = new Date(log.tanggal);
                return (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                    <td className="p-4 text-slate-600 font-mono text-xs">
                       <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400" />
                          {date.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        log.aksi === 'UPDATE' ? 'bg-amber-100 text-amber-700' :
                        log.aksi === 'TAMBAH' ? 'bg-emerald-100 text-emerald-700' :
                        log.aksi === 'HAPUS' ? 'bg-rose-100 text-rose-700' :
                        log.aksi === 'BACKUP' ? 'bg-blue-100 text-blue-700' :
                        log.aksi === 'RESTORE' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 text-xs">{log.entitas}</td>
                    <td className="p-4 text-slate-600">{log.deskripsi}</td>
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                          <User size={12} /> {log.user || 'Sistem'}
                       </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
