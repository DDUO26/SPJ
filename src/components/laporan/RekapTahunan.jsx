import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import { ambilSemuaKegiatanDb } from '../../services/kegiatanService';

const BULAN_URUT = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

export default function RekapTahunan() {
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const data = await ambilSemuaKegiatanDb();
      setDaftarKegiatan(data);
    } catch (error) {
      console.error('Gagal menarik rekap tahunan', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    // Inisialisasi 12 bulan
    const dataMap = {};
    BULAN_URUT.forEach(b => {
       dataMap[b] = { namaBulan: b.substring(0,3), totalKegiatan: 0, totalDana: 0 };
    });

    daftarKegiatan.forEach(keg => {
      if (!keg.bulan) return;
      const blnMatch = BULAN_URUT.find(b => String(keg.bulan).toUpperCase().includes(b));
      if (blnMatch) {
         dataMap[blnMatch].totalKegiatan += 1;
         dataMap[blnMatch].totalDana += Number(keg.dana) || 0;
      }
    });

    return BULAN_URUT.map(b => dataMap[b]);
  }, [daftarKegiatan]);

  if (loading) {
     return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat Rekap Tahunan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="text-indigo-600" />
                  Grafik Kegiatan Tahunan
               </h3>
               <p className="text-sm text-slate-500 mt-1">Tren jumlah kegiatan BOK dari Januari hingga Desember.</p>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600">Tahun 2026</div>
         </div>

         <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="namaBulan" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                     cursor={{ fill: '#f8fafc' }}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="totalKegiatan" name="Jumlah Kegiatan" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
