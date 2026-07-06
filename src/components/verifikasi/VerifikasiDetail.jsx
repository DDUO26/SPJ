import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Edit, Trash2, Save } from 'lucide-react';
import { CHECKLIST_ITEMS } from './constants';

export default function VerifikasiDetail({
  selectedPegawaiDetail,
  getStatusPegawai,
  getSpjPegawai,
  catatanUmumInput, setCatatanUmumInput,
  handleSimpanCatatanUmum,
  selectedSpjsForEdit, setSelectedSpjsForEdit,
  openEditModalSingle,
  toggleSpjSelection,
  handleHapusSpj,
  openBulkEditSelected,
  handleHapusSemua
}) {
  return (
    <div className="w-[300px] shrink-0 bg-[#0F172A] text-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-700/50">
        <h3 className="text-base font-bold">Kekurangan & Revisi</h3>
      </div>

      {selectedPegawaiDetail ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status Badge */}
          {(() => {
            const st = getStatusPegawai(selectedPegawaiDetail);
            const spjList = getSpjPegawai(selectedPegawaiDetail);
            return (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
                st === 'lengkap' ? 'bg-emerald-500/100/20 text-emerald-400' :
                st === 'kurang' ? 'bg-amber-500/100/20 text-amber-400' :
                'bg-rose-500/100/20 text-rose-400'
              }`}>
                {st === 'lengkap' ? <CheckCircle size={16} /> : st === 'kurang' ? <AlertCircle size={16} /> : <XCircle size={16} />}
                {st === 'lengkap' ? 'Sempurna' : st === 'kurang' ? 'Kurang Lengkap' : 'Belum Ada Data'}
                <span className="ml-auto text-xs opacity-70">{spjList.length} entri</span>
              </div>
            );
          })()}

          {/* Catatan Umum Pegawai */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-600 mb-2 block">CATATAN UMUM PEGAWAI</label>
            <textarea
              value={catatanUmumInput}
              onChange={(e) => setCatatanUmumInput(e.target.value)}
              onBlur={handleSimpanCatatanUmum}
              placeholder="Ketik catatan khusus pegawai ini..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Daftar SPJ per tanggal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase text-slate-600 block">DETAIL PER TANGGAL</label>
              {getSpjPegawai(selectedPegawaiDetail).length > 0 && (
                <button
                  onClick={() => {
                    const allSpjIds = getSpjPegawai(selectedPegawaiDetail).map(s => s.id);
                    if (selectedSpjsForEdit.length === allSpjIds.length) {
                      setSelectedSpjsForEdit([]);
                    } else {
                      setSelectedSpjsForEdit(allSpjIds);
                    }
                  }}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCircle size={12} /> {selectedSpjsForEdit.length === getSpjPegawai(selectedPegawaiDetail).length ? 'BATAL PILIH SEMUA' : 'PILIH SEMUA'}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
              {getSpjPegawai(selectedPegawaiDetail).sort((a, b) => (a.tanggal > b.tanggal ? -1 : 1)).map(spj => {
                const requiredItems = CHECKLIST_ITEMS.filter(i => !i.optional);
                const cl = spj.checklist || {};
                const isLengkap = requiredItems.every(k => cl[k.key]);
                const filledAny = Object.values(cl).some(v => v);
                const st = isLengkap ? 'lengkap' : filledAny ? 'kurang' : 'belum';

                const checkedCount = requiredItems.filter(i => (spj.checklist || {})[i.key]).length;
                const missing = requiredItems.filter(i => !(spj.checklist || {})[i.key]);
                const isChecked = selectedSpjsForEdit.includes(spj.id);

                return (
                  <div
                    key={spj.id}
                    onClick={() => openEditModalSingle(spj.id)}
                    className={`rounded-xl p-3 border text-xs cursor-pointer transition-all hover:shadow-md ${
                      isChecked ? 'border-blue-500 bg-blue-500/100/10' :
                      st === 'lengkap' ? 'bg-emerald-500/100/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/100/20' :
                      st === 'kurang' && spj.catatan ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/20 hover:to-rose-500/20' :
                      st === 'kurang' ? 'bg-amber-500/100/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/100/20' :
                      'bg-rose-500/100/10 border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/100/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleSpjSelection(spj.id); }}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all hover:scale-110 ${
                            isChecked ? 'bg-blue-500/100 border-blue-500 shadow-sm shadow-blue-500/40' : 'border-slate-400 hover:border-blue-400 bg-slate-800'
                          }`}
                        >
                          {isChecked && <CheckCircle size={12} className="text-slate-800" />}
                        </div>
                        <span className="font-bold text-slate-600">{spj.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${st === 'lengkap' ? 'text-emerald-400' : st === 'kurang' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {checkedCount}/{requiredItems.length}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); openEditModalSingle(spj.id); }} className="text-slate-500 hover:text-blue-400">
                          <Edit size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleHapusSpj(spj.id); }} className="text-slate-500 hover:text-rose-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {missing.length > 0 && (
                      <div className="text-[10px] text-amber-400 mt-1 pl-5">
                        Kurang: {missing.map(m => m.label).join(', ')}
                      </div>
                    )}
                    {spj.catatan && (
                      <div className="text-[10px] text-rose-400 mt-1 italic pl-5">
                        Catatan: {spj.catatan}
                      </div>
                    )}
                  </div>
                );
              })}
              {getSpjPegawai(selectedPegawaiDetail).length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data SPJ.</p>
              )}
            </div>
            
            {/* Tombol Bulk Edit */}
            {selectedSpjsForEdit.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <button 
                  onClick={openBulkEditSelected}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500/100 text-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save size={14} /> Edit {selectedSpjsForEdit.length} Terpilih
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-slate-500 text-center">Klik pegawai di panel tengah untuk melihat detail kekurangan & revisi.</p>
        </div>
      )}

      {/* Hapus Semua */}
      {selectedPegawaiDetail && getSpjPegawai(selectedPegawaiDetail).length > 0 && (
        <div className="p-4 border-t border-slate-700/50">
          <button onClick={handleHapusSemua} className="w-full py-2.5 rounded-xl font-bold text-sm bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 transition-colors flex items-center justify-center gap-2">
            <Trash2 size={14} /> Hapus Semua
          </button>
        </div>
      )}
    </div>
  );
}
