import React, { useState, useEffect } from 'react';
import {
  User, CheckCircle, Edit, Save, X, Database, Trash2, AlertCircle, ChevronDown, Upload, Search, XCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Kurir Firebase
import {
  tambahPegawaiDb,
  ambilSemuaPegawaiDb,
  updatePegawaiDb,
  hapusPegawaiDb
} from '../../services/pegawaiService';

const DAFTAR_PERAN = [
  'Pelaksana Kegiatan',
  'Bendahara Pengeluaran',
  'Kuasa Pengguna Anggaran (KPA)',
  'Pejabat Pelaksana Teknis Kegiatan (PPTK)',
  'Kepala Puskesmas',
];

export default function Pegawai({ activeRole = 'Admin' }) {
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [golongan, setGolongan] = useState('');
  const [jabatanFungsional, setJabatanFungsional] = useState('');
  const [peran, setPeran] = useState('Pelaksana Kegiatan');
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  useEffect(() => {
    tarikDataPegawai();
  }, []);

  const tarikDataPegawai = async () => {
    try {
      const data = await ambilSemuaPegawaiDb();
      setDaftarPegawai(data);
      if (data.length > 0 && !selectedPegawai) {
        setSelectedPegawai(data[0]);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
    }
  };

  const getBaseName = (name) => {
    if (!name) return "";
    let base = name.split(',')[0];
    base = base.replace(/^(dr\.|drg\.|ns\.)\s*/i, '');
    return base.replace(/[^a-zA-Z]/g, '').toLowerCase();
  };

  const handleSimpanPegawai = async (e) => {
    e.preventDefault();
    if (!nama) {
      setPesan('Nama pegawai wajib diisi!');
      return;
    }

    const baseInput = getBaseName(nama);
    const isDuplicate = daftarPegawai.some(p => {
       if (editId && p.id === editId) return false;
       return getBaseName(p.nama) === baseInput;
    });

    if (isDuplicate) {
       setPesan('Gagal: Pegawai dengan nama tersebut sudah terdaftar (walau beda gelar).');
       setTimeout(() => setPesan(''), 5000);
       return;
    }

    setLoading(true);
    setPesan('');

    try {
      const dataBaru = { nama, nip, golongan, jabatanFungsional, peran };

      if (editId) {
        await updatePegawaiDb(editId, dataBaru);
        setPesan('Data Pegawai berhasil diperbarui!');
        setEditId(null);
      } else {
        await tambahPegawaiDb(dataBaru);
        setPesan('Data Pegawai berhasil ditambahkan!');
      }

      setNama(''); setNip(''); setGolongan(''); setJabatanFungsional(''); setPeran('Pelaksana Kegiatan');
      setIsModalOpen(false);
      await tarikDataPegawai();
    } catch (error) {
      setPesan('Gagal menyimpan ke database.');
    } finally {
      setLoading(false);
      setTimeout(() => setPesan(''), 4000);
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setPesan('Memproses file Excel...');
    
    try {
      const dataBuffer = await file.arrayBuffer();
      const wb = XLSX.read(dataBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let newPegawai = [];
      let namaIdx = -1, nipIdx = -1, golIdx = -1, jabIdx = -1;
      let startRow = 1;

      // Cari baris header dan indeks kolomnya
      for (let i = 0; i < Math.min(10, data.length); i++) {
        let row = data[i] || [];
        for (let j = 0; j < row.length; j++) {
            let cell = String(row[j] || '').toUpperCase();
            if (cell.includes('NAMA')) namaIdx = j;
            else if (cell === 'NIP' || cell.includes('NI PPPK')) nipIdx = j;
            else if (cell.includes('PANGKAT') || cell.includes('GOL')) golIdx = j;
            else if (cell.includes('JABATAN')) jabIdx = j;
        }
        if (namaIdx !== -1) {
            startRow = i + 1;
            break;
        }
      }

      // Default jika tidak ada header
      if (namaIdx === -1) namaIdx = 1;
      if (nipIdx === -1) nipIdx = 2;
      if (golIdx === -1) golIdx = 3;
      if (jabIdx === -1) jabIdx = 4;

      for (let i = startRow; i < data.length; i++) {
        let row = data[i] || [];
        if (row.length === 0) continue;
        
        let nama = String(row[namaIdx] || '').trim();
        let nip = String(row[nipIdx] || '').trim();
        let golongan = String(row[golIdx] || '').trim();
        let jabatan = String(row[jabIdx] || '').trim();

        // Jika nama kosong tapi ada string di kolom sebelahnya
        if (!nama && typeof row[namaIdx+1] === 'string' && row[namaIdx+1].length > 3 && !/^\d+$/.test(row[namaIdx+1])) {
             nama = String(row[namaIdx+1] || '').trim();
             nip = String(row[nipIdx+1] || '').trim();
             golongan = String(row[golIdx+1] || '').trim();
             jabatan = String(row[jabIdx+1] || '').trim();
        }

        if (nip === '-' || /NIP/i.test(nip)) nip = nip.replace(/[^\d]/g, '');
        if (golongan === '-') golongan = '';
        if (jabatan === '-') jabatan = '';
        
        if (nama && nama.length > 3 && !/nama|pegawai|daftar/i.test(nama)) {
             let cleanNama = nama.replace(/^Nama\s*:\s*/i, '');
             if (/NIP/i.test(cleanNama)) {
                 cleanNama = cleanNama.split(/NIP/i)[0];
             }
             cleanNama = cleanNama.replace(/\b\d{8}\s*\d{6}\s*\d\s*\d{3}\b/g, '');
             cleanNama = cleanNama.replace(/\d{15,}/g, '');
             cleanNama = cleanNama.replace(/[\n\r]/g, ' ');
             cleanNama = cleanNama.replace(/[-\s]+$/, '');
             cleanNama = cleanNama.trim();

             const isAlreadyAdded = newPegawai.some(p => p.nama.toLowerCase() === cleanNama.toLowerCase());
             if (!isAlreadyAdded && cleanNama.length > 3) {
                 newPegawai.push({
                     nama: cleanNama,
                     nip: nip || '',
                     golongan: golongan || '',
                     jabatanFungsional: jabatan || '',
                     peran: 'Pelaksana Kegiatan'
                 });
             }
        }
      }
      
      if (newPegawai.length > 0) {
          const isConfirmed = window.confirm(`Ditemukan ${newPegawai.length} pegawai di file Excel.\n\nPERINGATAN: Sesuai permintaan Anda, tindakan ini akan MENGHAPUS SEMUA data pegawai lama dan MENGGANTINYA dengan data baru dari file ini.\n\nApakah Anda yakin ingin melanjutkan?`);
          
          if (!isConfirmed) {
              setLoading(false);
              if (e.target) e.target.value = null;
              setPesan('Upload dibatalkan.');
              setTimeout(() => setPesan(''), 3000);
              return;
          }

          setPesan('Menghapus data pegawai lama...');
          for (const peg of daftarPegawai) {
              await hapusPegawaiDb(peg.id);
          }

          setPesan('Menyimpan data pegawai baru...');
          let added = 0;
          for (const peg of newPegawai) {
              await tambahPegawaiDb(peg);
              added++;
          }
          
          setPesan(`Berhasil mengganti database dengan ${added} pegawai baru dari file Excel.`);
      } else {
          setPesan(`Gagal menemukan data pegawai di file. Pastikan format kolom sesuai.`);
      }
      
      await tarikDataPegawai();
      
    } catch (error) {
      console.error(error);
      setPesan('Gagal membaca file Excel. Pastikan formatnya benar.');
    } finally {
      setLoading(false);
      if (e.target) e.target.value = null;
      setTimeout(() => setPesan(''), 5000);
    }
  };

  const handleEdit = (peg, e) => {
    if (e) e.stopPropagation();
    setNama(peg.nama || '');
    setNip(peg.nip || '');
    setGolongan(peg.golongan || '');
    setJabatanFungsional(peg.jabatanFungsional || '');
    setPeran(peg.peran || 'Pelaksana Kegiatan');
    setEditId(peg.id);
    setIsModalOpen(true);
  };

  const batalkanEdit = () => {
    setNama(''); setNip(''); setGolongan(''); setJabatanFungsional(''); setPeran('Pelaksana Kegiatan');
    setEditId(null);
    setPesan('');
    setIsModalOpen(false);
  };

  const handleTambahBaru = () => {
    batalkanEdit();
    setIsModalOpen(true);
  };

  const handleHapus = async (idPegawai) => {
    if (window.confirm("Yakin ingin menghapus data pegawai ini?")) {
      await hapusPegawaiDb(idPegawai);
      await tarikDataPegawai();
    }
  };

  const getPeranBadge = (peranText) => {
    if (!peranText || peranText === 'Pelaksana Kegiatan') return null;
    const colors = {
      'Bendahara Pengeluaran': 'bg-emerald-100 text-emerald-700',
      'Kuasa Pengguna Anggaran (KPA)': 'bg-blue-100 text-blue-700',
      'Pejabat Pelaksana Teknis Kegiatan (PPTK)': 'bg-purple-100 text-purple-700',
      'Kepala Puskesmas': 'bg-amber-100 text-amber-700',
    };
    const short = {
      'Bendahara Pengeluaran': 'Bendahara',
      'Kuasa Pengguna Anggaran (KPA)': 'KPA',
      'Pejabat Pelaksana Teknis Kegiatan (PPTK)': 'PPTK',
      'Kepala Puskesmas': 'Ka. Puskesmas',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${colors[peranText] || 'bg-slate-100 text-slate-600'}`}>
        {short[peranText] || peranText}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    let cleanName = name.replace(/^(dr\.|drg\.|ns\.)\s*/i, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500', 'bg-cyan-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredPegawai = daftarPegawai.filter(peg =>
    peg.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (peg.nip && peg.nip.includes(searchQuery))
  );

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      
      {/* KIRI: TABEL PEGAWAI */}
      <div className="flex-1 w-full bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        
        {/* TABS & TOOLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-6">
            <button className="text-blue-600 font-bold text-sm border-b-2 border-blue-600 pb-1 flex items-center gap-2">
              <Database size={16} /> Daftar Pegawai
            </button>
            <button className="text-slate-400 font-bold text-sm pb-1 flex items-center gap-2 hover:text-slate-600">
              <XCircle size={16} /> Non Aktif
            </button>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama atau NIP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {!editId && activeRole === 'Admin' && (
              <>
                <input type="file" id="upload-excel" accept=".xlsx, .xls" className="hidden" onChange={handleUploadExcel} />
                <label htmlFor="upload-excel" className={`bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload size={16} /> Excel
                </label>
              </>
            )}
            {activeRole === 'Admin' && (
              <button onClick={handleTambahBaru} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
                <span className="text-lg leading-none">+</span> Tambah Pegawai
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] scrollbar-thin rounded-xl border border-slate-100">
          <table className="w-full text-left text-[13px] relative">
            <thead className="bg-white text-slate-500 font-bold sticky top-0 z-10 border-b border-slate-100 shadow-sm">
              <tr>
                <th className="px-4 py-3 border-b border-slate-100 w-12 text-center">No</th>
                <th className="px-4 py-3 border-b border-slate-100">Nama Pegawai</th>
                <th className="px-4 py-3 border-b border-slate-100">NIP / NI PPPK</th>
                <th className="px-4 py-3 border-b border-slate-100">Golongan</th>
                <th className="px-4 py-3 border-b border-slate-100">Jabatan</th>
                <th className="px-4 py-3 border-b border-slate-100 text-center">Peran</th>
                <th className="px-4 py-3 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400 font-medium">Tidak ada data pegawai yang ditemukan.</td>
                </tr>
              ) : (
                filteredPegawai.map((peg, idx) => (
                  <tr 
                    key={peg.id} 
                    onClick={() => setSelectedPegawai(peg)}
                    className={`transition-colors group border-b border-slate-50 last:border-none cursor-pointer ${selectedPegawai?.id === peg.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-4 py-4 text-slate-400 text-center font-medium">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs ${getAvatarColor(peg.nama)} shadow-sm shrink-0`}>
                          {getInitials(peg.nama)}
                        </div>
                        <span className={`font-bold transition-colors ${selectedPegawai?.id === peg.id ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>{peg.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-xs">{peg.nip || '-'}</td>
                    <td className="px-4 py-4 text-slate-500 font-medium">{peg.golongan || '-'}</td>
                    <td className="px-4 py-4 text-slate-500">{peg.jabatanFungsional || '-'}</td>
                    <td className="px-4 py-4 text-center">{getPeranBadge(peg.peran) || <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">Pelaksana</span>}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEdit(peg, e)} className="text-slate-400 hover:text-blue-600 p-1.5 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit size={14} />
                        </button>
                        {activeRole === 'Admin' && (
                          <button onClick={(e) => { e.stopPropagation(); handleHapus(peg.id); }} className="text-slate-400 hover:text-rose-600 p-1.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER INFO */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Menampilkan 1 - {filteredPegawai.length} dari {daftarPegawai.length} data</span>
        </div>
      </div>

      {/* KANAN: DETAIL PEGAWAI */}
      <div className="w-full lg:w-[350px] shrink-0 bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Detail Pegawai</h3>
          <button onClick={() => setSelectedPegawai(null)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {selectedPegawai ? (
          <div>
            <div className="flex items-start gap-4 mb-8">
              <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-xl ${getAvatarColor(selectedPegawai.nama)} shadow-md shrink-0`}>
                {getInitials(selectedPegawai.nama)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 leading-tight mb-1">{selectedPegawai.nama}</h4>
                <p className="text-sm text-slate-500 font-medium mb-2">{selectedPegawai.jabatanFungsional || 'Pegawai Puskesmas'}</p>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">Aktif</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User size={12}/> NIP / NI PPPK</span>
                <span className="text-sm font-semibold text-slate-800">{selectedPegawai.nip || '-'}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Database size={12}/> Golongan</span>
                <span className="text-sm font-semibold text-slate-800">{selectedPegawai.golongan || '-'}</span>
              </div>
              <div className="flex flex-col border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle size={12}/> Peran</span>
                <span className="text-sm font-semibold text-slate-800">{selectedPegawai.peran || 'Pelaksana Kegiatan'}</span>
              </div>
            </div>

            <button className="w-full mt-8 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Database size={16} /> Lihat Riwayat Perubahan
            </button>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <User size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Pilih pegawai pada tabel untuk melihat detail.</p>
          </div>
        )}
      </div>

      {/* MODAL FORM PEGAWAI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={batalkanEdit}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editId ? 'Edit Data Pegawai' : 'Tambah Pegawai'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{editId ? 'Perbarui informasi pegawai' : 'Masukkan data pegawai baru'}</p>
              </div>
              <button onClick={batalkanEdit} className="text-slate-400 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {pesan && (
              <div className={`p-3 mb-5 rounded-xl text-xs font-semibold flex items-start gap-2 ${pesan.includes('wajib') || pesan.includes('Gagal') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {pesan.includes('wajib') || pesan.includes('Gagal') ? <AlertCircle size={14} className="mt-0.5 shrink-0" /> : <CheckCircle size={14} className="mt-0.5 shrink-0" />}
                {pesan}
              </div>
            )}

            <form onSubmit={handleSimpanPegawai} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Pegawai</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mis. Afrini A. Watak, S.Kep Ns" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIP / NI PPPK</label>
                  <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="19910412202..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Golongan</label>
                  <input type="text" value={golongan} onChange={(e) => setGolongan(e.target.value)} placeholder="Mis. III / B" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jabatan Fungsional</label>
                <input type="text" value={jabatanFungsional} onChange={(e) => setJabatanFungsional(e.target.value)} placeholder="Mis. Perawat Ahli Pertama" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Peran Sistem</label>
                <div className="relative">
                  <select value={peran} onChange={(e) => setPeran(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer">
                    {DAFTAR_PERAN.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={batalkanEdit} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold text-sm transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className={`w-2/3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm`}>
                  {loading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Simpan Pegawai')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}