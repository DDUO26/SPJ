import React from 'react';
import { FileText, User, Car, Zap, MapPin } from 'lucide-react';

export default function SppdForm({
  daftarPegawai,
  daftarDesa,
  daftarSekolah,
  daftarKegiatan,
  pegawaiTerpilih,
  setPegawaiTerpilih,
  maksudPerjalanan,
  setMaksudPerjalanan,
  alatAngkut,
  setAlatAngkut,
  perjalananList,
  handlePilihKegiatan,
  tambahPerjalanan,
  hapusPerjalanan,
  ubahPerjalanan,
  handleCetak
}) {

  const handlePilihPegawai = (e) => {
    const id = e.target.value;
    const pegawai = daftarPegawai.find(p => p.id === id);
    setPegawaiTerpilih(pegawai);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm print:hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-400" /> Buat Surat Perjalanan Dinas (SPPD)
        </h3>
        <button 
          onClick={handleCetak}
          disabled={!pegawaiTerpilih || !perjalananList[0]?.desaTujuan || !perjalananList[0]?.tanggal}
          className="bg-emerald-600 hover:bg-emerald-700 text-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cetak Dokumen SPPD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><User size={14}/> Pilih Pegawai yang Berangkat</label>
          <select value={pegawaiTerpilih ? pegawaiTerpilih.id : ''} onChange={handlePilihPegawai} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">-- Pilih Pegawai --</option>
            {daftarPegawai.map(peg => (
              <option key={peg.id} value={peg.id}>{peg.nama} - {peg.jabatanFungsional}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Car size={14}/> Alat Angkut</label>
          <input type="text" value={alatAngkut} onChange={(e) => setAlatAngkut(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><FileText size={14}/> Maksud Perjalanan Dinas</label>
          <input type="text" value={maksudPerjalanan} onChange={(e) => setMaksudPerjalanan(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Pelayanan Imunisasi Rutin Lengkap..." />
        </div>
      </div>

      {/* SEKSI MULTI-TUJUAN */}
      <div className="mb-2 flex justify-between items-center">
        <h4 className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={18}/> Daftar Tujuan Perjalanan</h4>
        <button 
          type="button" 
          onClick={tambahPerjalanan}
          disabled={perjalananList.length >= 3}
          className="text-xs bg-indigo-500/20 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Tambah Tujuan (Max 3 Hari)
        </button>
      </div>

      <div className="space-y-4">
        {perjalananList.map((perjalanan, index) => (
          <div key={perjalanan.id} className="p-5 bg-indigo-50/50 border border-indigo-500/20 rounded-2xl relative">
            {perjalananList.length > 1 && (
              <button 
                onClick={() => hapusPerjalanan(index)}
                className="absolute top-4 right-4 text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 px-2 py-1 rounded"
              >
                Hapus
              </button>
            )}
            
            <div className="mb-4 pr-16">
              <label className="block text-xs font-bold text-indigo-900 mb-1.5 flex items-center gap-1">
                <Zap size={14} className="text-amber-500 fill-amber-500" /> Tarik Jadwal BOK (Tujuan {index + 1})
              </label>
              <select value={perjalanan.idKegiatan} onChange={(e) => handlePilihKegiatan(index, e)} className="w-full border border-indigo-200 rounded-xl px-4 py-2 text-sm bg-white text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="">-- Pilih Jadwal / Input Manual --</option>
                {daftarKegiatan.map(keg => (
                  <option key={keg.id} value={keg.id}>
                    Tgl {keg.tanggal} {keg.bulan} | {keg.desa} | {keg.kegiatan}
                  </option>
                ))}
              </select>
              {perjalanan.petugasDijadwalkan && (
                <div className="mt-2 text-[11px] text-indigo-700">
                  Petugas Jadwal: <span className="font-bold">{perjalanan.petugasDijadwalkan}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tujuan (Desa / Sekolah)</label>
                <select value={perjalanan.desaTujuan} onChange={(e) => ubahPerjalanan(index, 'desaTujuan', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">-- Pilih Tujuan --</option>
                  <optgroup label="Desa">
                    {daftarDesa.map(desa => (
                      <option key={desa.id} value={desa.namaDesa}>{desa.namaDesa}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sekolah">
                    {daftarSekolah.map(sekolah => (
                      <option key={sekolah.id} value={sekolah.namaSekolah}>{sekolah.namaSekolah}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal</label>
                <input type="date" value={perjalanan.tanggal} onChange={(e) => ubahPerjalanan(index, 'tanggal', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
