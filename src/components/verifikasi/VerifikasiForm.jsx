import React, { useState } from 'react';
import { FileText, Save, CheckCircle, ToggleLeft, ToggleRight, Calendar, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { simpanSpjDb } from '../../services/spjService';
import { CHECKLIST_ITEMS } from './constants';

export default function VerifikasiForm({
  pegawaiUnik,
  programUnik,
  daftarSpj,
  tarikSemuaData,
  setLoading
}) {
  const [modeBorongan, setModeBorongan] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState('');
  const [tanggalInput, setTanggalInput] = useState(new Date().toISOString().split('T')[0]);
  const [programInput, setProgramInput] = useState('');
  const [anggaranInput, setAnggaranInput] = useState('');
  const [checklist, setChecklist] = useState({
    sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
    riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
  });
  const [catatanRevisi, setCatatanRevisi] = useState('');

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSemuaChecklist = () => {
    const semuaCek = Object.values(checklist).every(v => v);
    const newVal = {};
    CHECKLIST_ITEMS.forEach(item => { newVal[item.key] = !semuaCek; });
    setChecklist(newVal);
  };

  const handleSimpan = async () => {
    if (!selectedPegawai) return toast.error('Pilih pegawai terlebih dahulu');
    if (!tanggalInput) return toast.error('Masukkan tanggal');

    // Mencegah entri data ganda (nama dan tanggal sama)
    const isDuplicate = daftarSpj.some(s => s.pegawaiNama === selectedPegawai && s.tanggal === tanggalInput);
    if (isDuplicate) {
      toast.error(`Gagal: SPJ untuk ${selectedPegawai} pada tanggal ${tanggalInput} sudah ada! Jika ingin mengubahnya, silakan cari dan edit data tersebut.`, { duration: 5000 });
      return;
    }

    const dataSpj = {
      pegawaiNama: selectedPegawai,
      tanggal: tanggalInput,
      program: programInput || '(Umum)',
      anggaran: Number(anggaranInput) || 0,
      checklist: { ...checklist },
      catatan: catatanRevisi || ''
    };

    try {
      setLoading(true);
      await simpanSpjDb(dataSpj);
      await tarikSemuaData();
      toast.success('SPJ berhasil disimpan');

      if (!modeBorongan) {
        resetForm();
      } else {
        // Mode borongan: keep pegawai & catatan, reset tanggal & checklist
        setTanggalInput(new Date().toISOString().split('T')[0]);
        setAnggaranInput('');
        setChecklist({
          sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
          riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
        });
      }
    } catch (err) {
      toast.error('Gagal menyimpan SPJ');
    }
  };

  const resetForm = () => {
    setSelectedPegawai('');
    setTanggalInput(new Date().toISOString().split('T')[0]);
    setProgramInput('');
    setAnggaranInput('');
    setChecklist({
      sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
      riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
    });
    setCatatanRevisi('');
  };

  return (
    <div className="w-[340px] shrink-0 bg-[#0F172A] text-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-700/50">
        <h3 className="text-base font-bold flex items-center gap-2">
          <FileText size={18} className="text-blue-400" /> Input SPJ Baru
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {/* Mode Borongan */}
        <div className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-2.5">
          <span className="text-xs font-semibold text-slate-500">Mode Borongan</span>
          <button onClick={() => setModeBorongan(!modeBorongan)} className="text-blue-400">
            {modeBorongan ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-500" />}
          </button>
        </div>

        {/* Nama Pegawai */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600 mb-1 block">Nama Pegawai</label>
          <div className="relative">
            <select
              value={selectedPegawai}
              onChange={(e) => setSelectedPegawai(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Pilih Pegawai...</option>
              {pegawaiUnik.map(nama => (
                <option key={nama} value={nama}>{nama}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Tanggal & Program */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-600 mb-1 block">Tanggal</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="date"
                value={tanggalInput}
                onChange={(e) => setTanggalInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-600 mb-1 block">Program</label>
            <select
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">Pilih Program (Umum)</option>
              {programUnik.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Anggaran */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600 mb-1 block">Anggaran (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">Rp</span>
            <input
              type="number"
              value={anggaranInput}
              onChange={(e) => setAnggaranInput(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Ceklist Kelengkapan */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase text-slate-600">Ceklist Kelengkapan</label>
            <button
              onClick={toggleSemuaChecklist}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <CheckCircle size={12} /> PILIH SEMUA
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CHECKLIST_ITEMS.map(item => (
              <label
                key={item.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                  checklist[item.key]
                    ? 'bg-emerald-500/100/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-600 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => toggleChecklist(item.key)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  checklist[item.key] ? 'bg-emerald-500/100 border-emerald-500' : 'border-slate-600'
                }`}>
                  {checklist[item.key] && <CheckCircle size={10} className="text-slate-800" />}
                </div>
                {item.label}
              </label>
            ))}
          </div>
        </div>

        {/* Catatan Revisi */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600 mb-1 block">Catatan Revisi Saat Input</label>
          <textarea
            value={catatanRevisi}
            onChange={(e) => setCatatanRevisi(e.target.value)}
            placeholder="Ketik jika ada kurang / revisi..."
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Tombol Bawah */}
      <div className="p-4 border-t border-slate-700/50 flex gap-3">
        <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
          Reset
        </button>
        <button onClick={handleSimpan} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500/100 transition-colors flex items-center justify-center gap-2">
          <Save size={16} /> Simpan
        </button>
      </div>
    </div>
  );
}
