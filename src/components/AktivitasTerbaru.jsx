import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Calendar, AlertCircle, RefreshCw, Clock
} from 'lucide-react';
import { ambilSemuaKegiatanDb } from '../services/kegiatanService';
import { ambilSemuaSpjDb } from '../services/spjService';

const BULAN_FULL = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
const CHECKLIST_ITEMS = ['sppd', 'suratTugas', 'daftarHadir', 'dokumentasi', 'riilCost', 'kwitansi', 'suratPernyataan', 'laporan'];

export default function AktivitasTerbaru() {
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    setLoading(true);
    try {
      const [keg, spj] = await Promise.all([
        ambilSemuaKegiatanDb(),
        ambilSemuaSpjDb()
      ]);
      setDaftarKegiatan(keg);
      setDaftarSpj(spj);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const aktivitas = useMemo(() => {
    const list = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Jadwal Kegiatan (Hari ini & Besok)
    daftarKegiatan.forEach((keg, idx) => {
      if (!keg.tanggal || !keg.bulan) return;
      const blnSplit = String(keg.bulan).split(' ');
      const namaBulan = blnSplit[0].toUpperCase();
      const thn = parseInt(blnSplit[1]) || today.getFullYear();
      const monthIndex = BULAN_FULL.findIndex(b => b === namaBulan);
      
      if (monthIndex >= 0) {
        const kegDate = new Date(thn, monthIndex, parseInt(keg.tanggal));
        kegDate.setHours(0,0,0,0);
        
        const timeDiff = kegDate.getTime() - today.getTime();
        
        if (timeDiff === 0) {
          list.push({
            id: `keg_today_${keg.id || idx}`,
            type: 'kegiatan',
            title: `Hari Ini: ${keg.kegiatan}`,
            desc: `Lokasi: Desa ${keg.desa || '-'} | Petugas: ${keg.pegawai || 'Belum diatur'}`,
            time: 'Berlangsung',
            icon: <Calendar size={16} className="text-blue-600" />,
            bg: 'bg-blue-100',
            dateSort: kegDate.getTime() + 2 // Prioritaskan tampil di atas
          });
        } else if (timeDiff === 86400000) { // 1 day in ms
          list.push({
            id: `keg_tmrw_${keg.id || idx}`,
            type: 'kegiatan',
            title: `Besok: ${keg.kegiatan}`,
            desc: `Lokasi: Desa ${keg.desa || '-'} | Petugas: ${keg.pegawai || 'Belum diatur'}`,
            time: 'Mendatang',
            icon: <Clock size={16} className="text-indigo-600" />,
            bg: 'bg-indigo-100',
            dateSort: kegDate.getTime() + 1 // Prioritaskan di bawah "Hari Ini"
          });
        }
      }
    });

    // 2. Status SPJ (Berdasarkan tanggal pelaksanaan terbaru)
    const validSpjs = daftarSpj.filter(s => s.tanggal && s.tanggal.includes('-')).map(s => {
      return { ...s, parsedDate: new Date(s.tanggal) };
    }).sort((a, b) => b.parsedDate - a.parsedDate);

    // Ambil 10 SPJ terbaru untuk dimasukkan ke aktivitas
    validSpjs.slice(0, 10).forEach((spj, idx) => {
      const cl = spj.checklist || {};
      const missingCount = CHECKLIST_ITEMS.filter(k => !cl[k]).length;
      const hasCatatan = spj.catatan && spj.catatan.trim() !== '';

      let statusStr = '';
      let descStr = '';
      let icon = null;
      let bg = '';
      
      if (missingCount === 0 && !hasCatatan) {
        statusStr = `Selesai Diverifikasi`;
        descStr = `SPJ ${spj.program} (${spj.pegawaiNama})`;
        icon = <CheckCircle size={16} className="text-emerald-600" />;
        bg = 'bg-emerald-100';
      } else {
        statusStr = `Perlu Perbaikan SPJ`;
        if (hasCatatan) {
          descStr = `Catatan: ${spj.catatan} (${spj.pegawaiNama})`;
        } else {
          descStr = `Kurang dokumen pelengkap (${spj.pegawaiNama})`;
        }
        icon = <AlertCircle size={16} className="text-rose-600" />;
        bg = 'bg-rose-100';
      }

      list.push({
        id: `spj_${spj.id || idx}`,
        type: 'spj',
        title: statusStr,
        desc: descStr,
        time: spj.tanggal, 
        icon: icon,
        bg: bg,
        dateSort: spj.parsedDate.getTime()
      });
    });

    list.sort((a, b) => b.dateSort - a.dateSort);

    return list.slice(0, 6); // Tampilkan 6 item teratas
  }, [daftarKegiatan, daftarSpj]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
        <button onClick={tarikData} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : aktivitas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">Tidak ada jadwal hari ini/besok atau data SPJ.</p>
          </div>
        ) : (
          aktivitas.map((item) => (
            <div key={item.id} className="flex gap-4 items-start group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-1">{item.title}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap pt-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
