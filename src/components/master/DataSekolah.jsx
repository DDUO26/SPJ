import React, { useState, useEffect } from 'react';
import { Folder, CheckCircle, Edit, Save, X, Database, Trash2, AlertCircle } from 'lucide-react';

import { 
  tambahSekolahDb, 
  ambilSemuaSekolahDb, 
  updateSekolahDb, 
  hapusSekolahDb 
} from '../../services/sekolahService';

const INITIAL_SEKOLAH = [
  "SD Inpres Silian Satu",
  "SDN Silian",
  "SD GMIM 1",
  "SD GMIM 2",
  "TK Pertiwi Silian Tiga",
  "TK GMIM SION Silian",
  "SMP 4 Touluaan",
  "SMP Krispa",
  "TK Kartini",
  "TK GMIM Getsemani Silian Dua"
];

export default function DataSekolah() {
  const [namaSekolah, setNamaSekolah] = useState('');
  const [namaKepsek, setNamaKepsek] = useState('');
  const [daftarSekolah, setDaftarSekolah] = useState([]);
  
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    tarikDataSekolah();
  }, []);

  const tarikDataSekolah = async () => {
    try {
      const data = await ambilSemuaSekolahDb();
      if (data.length === 0) {
        // Auto-initialize
        setLoading(true);
        for (const sekolah of INITIAL_SEKOLAH) {
          await tambahSekolahDb({ namaSekolah: sekolah, namaKepsek: '-' });
        }
        const dataBaru = await ambilSemuaSekolahDb();
        setDaftarSekolah(dataBaru);
        setLoading(false);
      } else {
        setDaftarSekolah(data);
      }
    } catch (error) {
      console.error("Gagal menarik data sekolah:", error);
      setLoading(false);
    }
  };

  const handleSimpanSekolah = async (e) => {
    e.preventDefault();
    if (!namaSekolah || !namaKepsek) {
      setPesan('Nama Sekolah dan Nama Kepala Sekolah wajib diisi!');
      return;
    }

    setLoading(true);
    setPesan('');

    try {
      const dataBaru = { namaSekolah, namaKepsek };

      if (editId) {
        await updateSekolahDb(editId, dataBaru);
        setPesan('Data Sekolah berhasil diperbarui di Firebase!');
        setEditId(null);
      } else {
        await tambahSekolahDb(dataBaru);
        setPesan('Data Sekolah berhasil ditambahkan ke Firebase!');
      }

      setNamaSekolah(''); setNamaKepsek('');
      await tarikDataSekolah(); 

    } catch (error) {
      setPesan('Gagal menyimpan ke database.');
    } finally {
      setLoading(false);
      setTimeout(() => setPesan(''), 4000); 
    }
  };

  const handleEdit = (sekolah) => {
    setNamaSekolah(sekolah.namaSekolah);
    setNamaKepsek(sekolah.namaKepsek || '-');
    setEditId(sekolah.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalkanEdit = () => {
    setNamaSekolah(''); setNamaKepsek('');
    setEditId(null);
    setPesan('');
  };

  const handleHapus = async (idSekolah) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus data sekolah ini?");
    if (konfirmasi) {
      await hapusSekolahDb(idSekolah);
      await tarikDataSekolah();
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl shadow-sm border ${editId ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Folder size={20} className={editId ? "text-amber-600" : "text-emerald-600"} />
          {editId ? 'Edit Data Sekolah' : 'Form Input Sekolah'}
        </h3>
        
        {pesan && (
          <div className={`p-3 mb-6 rounded-xl text-sm font-semibold flex items-center gap-2 ${pesan.includes('wajib') || pesan.includes('Gagal') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {pesan.includes('wajib') ? <AlertCircle size={16} /> : <CheckCircle size={16} />} 
            {pesan}
          </div>
        )}

        <form onSubmit={handleSimpanSekolah} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Sekolah</label>
            <input type="text" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} placeholder="Contoh: SDN 1 Silian" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Kepala Sekolah</label>
            <input type="text" value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} placeholder="Contoh: H. Ahmad, S.Pd." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            {editId && (
              <button type="button" onClick={batalkanEdit} className="bg-white border border-slate-300 text-slate-600 px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
                <X size={16} /> Batal
              </button>
            )}
            <button type="submit" disabled={loading} className={`${editId ? 'bg-amber-500' : 'bg-emerald-600'} text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50`}>
              {editId ? <Edit size={16} /> : <Save size={16} />}
              {loading ? 'Menyimpan...' : (editId ? 'Update Data Sekolah' : 'Simpan Data Sekolah')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database className="text-slate-600" size={20} /> Database Sekolah Wilayah Kerja
        </h3>
        <table className="w-full text-left text-sm mt-4">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-16">No</th>
              <th className="px-4 py-3">Nama Sekolah</th>
              <th className="px-4 py-3">Kepala Sekolah</th>
              <th className="px-4 py-3 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {daftarSekolah.length === 0 ? (
               <tr>
                 <td colSpan="4" className="px-4 py-10 text-center text-slate-400 font-medium">Belum ada data sekolah yang ditambahkan.</td>
               </tr>
            ) : (
              daftarSekolah.map((sekolah, idx) => (
                <tr key={sekolah.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{sekolah.namaSekolah}</td>
                  <td className="px-4 py-3 text-slate-600">{sekolah.namaKepsek || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(sekolah)} className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleHapus(sekolah.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
