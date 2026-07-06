import React from 'react';
import { FileText, X, CheckCircle } from 'lucide-react';
import { CHECKLIST_ITEMS } from './constants';

export default function BulkEditModal({
  selectedSpjsForEdit,
  setIsBulkEditModalOpen,
  bulkEditChecklist, setBulkEditChecklist,
  bulkEditApplyChecklist, setBulkEditApplyChecklist,
  bulkEditApplyCatatan, setBulkEditApplyCatatan,
  bulkEditCatatan, setBulkEditCatatan,
  handleBulkEdit
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
      <div className="bg-[#0F172A] w-[850px] max-w-[95vw] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" /> Edit {selectedSpjsForEdit.length} Data SPJ
          </h3>
          <button onClick={() => setIsBulkEditModalOpen(false)} className="text-slate-600 hover:text-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase text-slate-600">Ceklist Kelengkapan</label>
              <button
                onClick={() => {
                  const isAllChecked = CHECKLIST_ITEMS.every(i => bulkEditChecklist[i.key]);
                  const newVal = {};
                  const newApply = { ...bulkEditApplyChecklist };
                  CHECKLIST_ITEMS.forEach(i => {
                    newVal[i.key] = !isAllChecked;
                    if (!isAllChecked) newApply[i.key] = true;
                  });
                  setBulkEditChecklist(newVal);
                  if (!isAllChecked) setBulkEditApplyChecklist(newApply);
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors bg-blue-500/100/10 px-2 py-1 rounded"
              >
                <CheckCircle size={12} /> {CHECKLIST_ITEMS.every(i => bulkEditChecklist[i.key]) ? 'BATAL CEK SEMUA' : 'CEK SEMUA'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.key} className="flex flex-col gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkEditApplyChecklist[item.key] || false}
                      onChange={(e) => setBulkEditApplyChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 w-3.5 h-3.5"
                    />
                    Ubah Status
                  </label>
                  <label
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                      !bulkEditApplyChecklist[item.key] ? 'opacity-40 pointer-events-none bg-slate-800 text-slate-500' :
                      bulkEditChecklist[item.key]
                        ? 'bg-emerald-500/100/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700 text-slate-500 border border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={bulkEditChecklist[item.key] || false}
                      onChange={() => setBulkEditChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      bulkEditChecklist[item.key] ? 'bg-emerald-500/100 border-emerald-500' : 'border-slate-500'
                    }`}>
                      {bulkEditChecklist[item.key] && <CheckCircle size={10} className="text-slate-800" />}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bulkEditApplyCatatan}
                onChange={(e) => setBulkEditApplyCatatan(e.target.checked)}
                className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 w-3.5 h-3.5"
              />
              Ubah Catatan Revisi
            </label>
            <textarea
              disabled={!bulkEditApplyCatatan}
              value={bulkEditCatatan}
              onChange={(e) => setBulkEditCatatan(e.target.value)}
              placeholder="Ketik catatan..."
              rows={2}
              className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 resize-none ${!bulkEditApplyCatatan ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex gap-3">
          <button onClick={() => setIsBulkEditModalOpen(false)} className="flex-1 py-2 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-800 transition-colors">
            Batal
          </button>
          <button onClick={handleBulkEdit} className="flex-1 py-2 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500/100 text-slate-800 transition-colors">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
