import React, { useState, useEffect } from 'react';
import { Folder, CheckCircle, Edit, Save, X, Database, Trash2, AlertCircle } from 'lucide-react';

// Memanggil Kurir Desa
import { 
  tambahDesaDb, 
  ambilSemuaDesaDb, 
  updateDesaDb, 
  hapusDesaDb 
} from '../../services/desaService';

export default function DataDesa() {
  const [namaDesa, setNamaDesa] = useState('');
  const [namaKades, setNamaKades] = useState('');
  const [daftarDesa, setDaftarDesa] = useState([]);
  
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // Otomatis mengambil data dari Firebase saat tab dibuka
  useEffect(() => {
    tarikDataDesa();
  }, []);

  const tarikDataDesa = async () => {
    try {
      const data = await ambilSemuaDesaDb();
      setDaftarDesa(data);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    }
  };

  const handleSimpanDesa = async (e) => {
    e.preventDefault();
    if (!namaDesa || !namaKades) {
      setPesan('Nama Desa dan Nama Kepala Desa wajib diisi!');
      return;
    }

    setLoading(true);
    setPesan('');

    try {
      const dataBaru = { namaDesa, namaKades };

      if (editId) {
        await updateDesaDb(editId, dataBaru);
        setPesan('Data Desa berhasil diperbarui di Firebase!');
        setEditId(null);
      } else {
        await tambahDesaDb(dataBaru);
        setPesan('Data Desa berhasil ditambahkan ke Firebase!');
      }

      setNamaDesa(''); setNamaKades('');
      await tarikDataDesa(); // Refresh tabel

    } catch (error) {
      setPesan('Gagal menyimpan ke database.');
    } finally {
      setLoading(false);
      setTimeout(() => setPesan(''), 4000); // Hilangkan pesan setelah 4 detik
    }
  };

  const handleEdit = (desa) => {
    setNamaDesa(desa.namaDesa);
    setNamaKades(desa.namaKades);
    setEditId(desa.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalkanEdit = () => {
    setNamaDesa(''); setNamaKades('');
    setEditId(null);
    setPesan('');
  };

  const handleHapus = async (idDesa) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus data desa ini?");
    if (konfirmasi) {
      await hapusDesaDb(idDesa);
      await tarikDataDesa();
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl shadow-sm border ${editId ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          {/* BAGIAN KODE YANG RUSAK SUDAH DIPERBAIKI DI BAWAH INI */}
          <Folder size={20} className={editId ? "text-amber-600" : "text-emerald-600"} />
          {editId ? 'Edit Data Wilayah & Kades' : 'Form Input Wilayah & Kepala Desa'}
        </h3>
        
        {pesan && (
          <div className={`p-3 mb-6 rounded-xl text-sm font-semibold flex items-center gap-2 ${pesan.includes('wajib') || pesan.includes('Gagal') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {pesan.includes('wajib') ? <AlertCircle size={16} /> : <CheckCircle size={16} />} 
            {pesan}
          </div>
        )}

        <form onSubmit={handleSimpanDesa} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Desa / Kelurahan</label>
            <input type="text" value={namaDesa} onChange={(e) => setNamaDesa(e.target.value)} placeholder="Contoh: Desa Suka Maju" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Kepala Desa / Lurah</label>
            <input type="text" value={namaKades} onChange={(e) => setNamaKades(e.target.value)} placeholder="Contoh: H. Ahmad, S.E." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            {editId && (
              <button type="button" onClick={batalkanEdit} className="bg-white border border-slate-300 text-slate-600 px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
                <X size={16} /> Batal
              </button>
            )}
            <button type="submit" disabled={loading} className={`${editId ? 'bg-amber-500' : 'bg-emerald-600'} text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50`}>
              {editId ? <Edit size={16} /> : <Save size={16} />}
              {loading ? 'Menyimpan...' : (editId ? 'Update Data Desa' : 'Simpan Data Desa')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database className="text-slate-600" size={20} /> Database Desa Wilayah Kerja
        </h3>
        <table className="w-full text-left text-sm mt-4">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-16">No</th>
              <th className="px-4 py-3">Nama Desa / Kelurahan</th>
              <th className="px-4 py-3">Kepala Desa</th>
              <th className="px-4 py-3 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {daftarDesa.length === 0 ? (
               <tr>
                 <td colSpan="4" className="px-4 py-10 text-center text-slate-400 font-medium">Belum ada data desa yang ditambahkan.</td>
               </tr>
            ) : (
              daftarDesa.map((desa, idx) => (
                <tr key={desa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{desa.namaDesa}</td>
                  <td className="px-4 py-3 text-slate-600">{desa.namaKades}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(desa)} className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleHapus(desa.id)} className="bg-rose-50 text-rose-600 p-2 rounded-lg">
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