import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CHECKLIST_ITEMS } from './constants';

export default function MonthlyBulkEditModal({
  monthlyBulkEditData, setMonthlyBulkEditData,
  tahunFilter,
  monthlyBulkProgram, setMonthlyBulkProgram,
  programUnik,
  monthlyBulkAnggaran, setMonthlyBulkAnggaran,
  monthlyBulkChecklist, setMonthlyBulkChecklist,
  monthlyBulkCatatan, setMonthlyBulkCatatan,
  monthlyBulkHapusCatatan, setMonthlyBulkHapusCatatan,
  handleSimpanMonthlyBulk
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
      <div className="bg-[#0F172A] w-[600px] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 overflow-y-auto scrollbar-thin">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Edit Masal {monthlyBulkEditData.monthName}</h2>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-sm text-blue-200">
            Pengaturan ini diterapkan ke <strong>semua kegiatan</strong> {monthlyBulkEditData.nama} di bulan {monthlyBulkEditData.monthName} {tahunFilter}. Kosongkan jika tidak ingin diubah.
          </div>

          <div className="space-y-5">
            {/* Program */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ubah Semua Program Menjadi:</label>
              <select 
                value={monthlyBulkProgram} 
                onChange={e => setMonthlyBulkProgram(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-slate-800 focus:border-blue-500"
              >
                <option value="">(Biarkan Sesuai Data Asli)</option>
                {programUnik.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Anggaran */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ubah Semua Anggaran Menjadi (Rp):</label>
              <input
                type="number"
                value={monthlyBulkAnggaran}
                onChange={(e) => setMonthlyBulkAnggaran(e.target.value)}
                placeholder="Kosongkan jika tidak diubah"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-slate-800 focus:border-blue-500"
              />
            </div>

            {/* Checklist */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tandai Berkas Berikut Menjadi Lengkap:</label>
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-800">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      monthlyBulkChecklist[item.key] ? 'bg-blue-500/100 border-blue-500' : 'bg-slate-700 border-slate-600'
                    }`}>
                      {monthlyBulkChecklist[item.key] && <CheckCircle size={10} className="text-slate-800" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={monthlyBulkChecklist[item.key] || false}
                      onChange={() => setMonthlyBulkChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Timpa Semua Catatan Menjadi:</label>
              <textarea
                disabled={monthlyBulkHapusCatatan}
                value={monthlyBulkCatatan}
                onChange={(e) => setMonthlyBulkCatatan(e.target.value)}
                placeholder="Ketik catatan baru untuk semua..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-slate-800 focus:border-blue-500 resize-none disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-bold text-rose-400">
                <input 
                  type="checkbox" 
                  checked={monthlyBulkHapusCatatan}
                  onChange={e => setMonthlyBulkHapusCatatan(e.target.checked)}
                  className="rounded bg-slate-800 border-rose-500/50 text-rose-500 focus:ring-rose-500" 
                />
                Hapus Semua Catatan Lama
              </label>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-center gap-3">
          <button 
            onClick={handleSimpanMonthlyBulk}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500/100 text-slate-800 transition-colors"
          >
            Terapkan Masal
          </button>
          <button 
            onClick={() => setMonthlyBulkEditData(null)}
            className="px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-800 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
