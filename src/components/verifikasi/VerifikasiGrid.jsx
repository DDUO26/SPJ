import React from 'react';
import { Grid, List, Search, X, User, Edit, AlertCircle } from 'lucide-react';
import { BULAN_NAMES } from './constants';

export default function VerifikasiGrid({
  viewMode, setViewMode,
  tahunFilter, setTahunFilter,
  bulanFilter, setBulanFilter,
  searchQuery, setSearchQuery,
  filteredPegawai,
  getTotalAnggaran,
  getSpjByMonth,
  getStatusPegawai,
  selectedPegawaiDetail,
  selectPegawaiDetail,
  openMonthlyBulkEdit,
  openEditModalSingle,
  getStatusTanggal,
  getSpjPegawai,
  totalPegawaiData,
  totalAnggaranAll
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] text-slate-800 rounded-2xl shadow-xl border border-slate-800 overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Database Rekap SPJ</h3>
          <p className="text-xs text-slate-600 mt-0.5">Kelola dan edit seluruh rekap kegiatan.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button onClick={() => setViewMode('matriks')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'matriks' ? 'bg-slate-700 text-slate-800 shadow-sm' : 'text-slate-600'}`}>
              <Grid size={14} className="inline mr-1 mb-0.5" /> Matriks
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-700 text-slate-800 shadow-sm' : 'text-slate-600'}`}>
              <List size={14} className="inline mr-1 mb-0.5" /> List
            </button>
          </div>
          {/* Tahun & Bulan */}
          <div className="flex gap-2">
            <select value={tahunFilter} onChange={(e) => setTahunFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 outline-none">
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <select value={bulanFilter} onChange={(e) => setBulanFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 outline-none">
              <option value="ALL">Semua Bulan</option>
              {BULAN_NAMES.map((bln, idx) => (
                <option key={idx} value={String(idx)}>{bln}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="bg-slate-800 border border-slate-700 text-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none w-32 focus:w-48 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-600 hover:text-slate-800">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {filteredPegawai.length === 0 ? (
          <div className="text-center text-slate-600 py-20">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada data pegawai.</p>
            <p className="text-xs mt-1">Upload jadwal kegiatan atau input SPJ untuk memulai.</p>
          </div>
        ) : (
          <>
            {viewMode === 'matriks' && (
              <div className="flex items-center text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-4">
                <div className="w-[220px] shrink-0">Info Pegawai</div>
                <div className="flex-1">Rekapitulasi Per Bulan</div>
              </div>
            )}
            {filteredPegawai.map(nama => {
              const totalAnggaran = getTotalAnggaran(nama);
              const spjByMonth = getSpjByMonth(nama);
              const statusPeg = getStatusPegawai(nama);
              const isSelected = selectedPegawaiDetail === nama;

              return (
                <div
                  key={nama}
                  onClick={() => selectPegawaiDetail(nama)}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-blue-500 bg-blue-500/100/10 shadow-md' : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'
                  }`}
                >
                  {viewMode === 'matriks' ? (
                    <div className="flex flex-col xl:flex-row gap-6 items-start">
                      {/* Info Pegawai */}
                      <div className="xl:w-[220px] shrink-0 w-full flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{nama}</h4>
                          {totalAnggaran > 0 && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/100/10 text-emerald-400 border border-emerald-500/20">
                              Rp {totalAnggaran.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        <span className={`text-lg hidden xl:block`}>
                          {statusPeg === 'lengkap' ? '🟢' : statusPeg === 'kurang' ? '🟡' : '🔴'}
                        </span>
                      </div>

                      {/* Matriks Kalender 12 Bulan */}
                      {isSelected && (
                        <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-thin animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex gap-2 min-w-max">
                            {BULAN_NAMES.map((bln, idx) => {
                              const monthData = spjByMonth[idx] || [];
                              return (
                                <div key={idx} className="flex flex-col items-center min-w-[42px]">
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); openMonthlyBulkEdit(nama, idx); }}
                                    title={`Edit Masal ${bln}`}
                                    className="group flex items-center justify-center gap-1.5 mb-2 cursor-pointer w-full py-1 rounded-lg hover:bg-slate-800 transition-colors"
                                  >
                                    <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-800 transition-colors">{bln}</span>
                                    <div className={`w-[20px] h-[20px] rounded flex items-center justify-center transition-all ${
                                      monthData.length > 0 ? 'bg-blue-600 text-slate-800 group-hover:bg-blue-500/100 shadow-md shadow-blue-500/20' : 'bg-slate-800 border border-slate-700 text-slate-500 group-hover:bg-blue-500/100/20 group-hover:text-blue-400 group-hover:border-blue-500'
                                    }`}>
                                      <Edit size={10} />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1 w-full">
                                    {monthData.length > 0 ? (
                                      monthData.sort((a, b) => a.day - b.day).map((spj, si) => {
                                        const st = getStatusTanggal(spj);
                                        return (
                                          <div
                                            key={si}
                                            onClick={(e) => { e.stopPropagation(); openEditModalSingle(spj.id); }}
                                            title={`${spj.day}/${idx + 1} — ${st === 'lengkap' ? 'Lengkap' : st === 'kurang' ? 'Kurang' : 'Belum'}`}
                                            className={`w-full py-1 rounded text-[10px] font-bold flex items-center justify-center text-center px-1 cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${
                                              st === 'lengkap' ? 'bg-emerald-500/100/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/100/30' :
                                              st === 'kurang' ? 'bg-amber-500/100/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/100/30' :
                                              'bg-rose-500/100/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/100/30'
                                            }`}
                                          >
                                            {String(spj.day).padStart(2, '0')}/{String(idx + 1).padStart(2, '0')}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="w-full h-[26px] rounded border border-dashed border-slate-700 flex items-center justify-center">
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* List View */
                    <>
                      {/* Info Pegawai */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{nama}</h4>
                          {totalAnggaran > 0 && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/100/10 text-emerald-400 border border-emerald-500/20">
                              Rp {totalAnggaran.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        <span className={`text-lg`}>
                          {statusPeg === 'lengkap' ? '🟢' : statusPeg === 'kurang' ? '🟡' : '🔴'}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="space-y-1 mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                          {getSpjPegawai(nama).slice(0, 5).map(spj => {
                            const st = getStatusTanggal(spj);
                            return (
                              <div key={spj.id} className="flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${st === 'lengkap' ? 'bg-emerald-500/100' : st === 'kurang' ? 'bg-amber-400' : 'bg-rose-500/100'}`} />
                                <span className="font-medium text-slate-500">{spj.tanggal}</span>
                                <span className="text-slate-500">—</span>
                                <span className="text-slate-600 truncate">{spj.program}</span>
                                {spj.catatan && <AlertCircle size={12} className="text-amber-500 shrink-0" />}
                              </div>
                            );
                          })}
                          {getSpjPegawai(nama).length > 5 && (
                            <span className="text-[10px] text-blue-400 font-bold">+{getSpjPegawai(nama).length - 5} lainnya...</span>
                          )}
                          {getSpjPegawai(nama).length === 0 && (
                            <span className="text-xs text-slate-500 italic">Belum ada data SPJ</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700 flex items-center justify-between bg-slate-800/50 shrink-0">
        <span className="text-xs font-bold text-slate-600">Total: <span className="text-blue-400">{totalPegawaiData}</span> Pegawai</span>
        <span className="text-xs font-bold text-slate-600">
          Total Anggaran: <span className="text-emerald-400">Rp {totalAnggaranAll.toLocaleString('id-ID')}</span>
        </span>
      </div>
    </div>
  );
}
