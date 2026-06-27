import React, { useState, useEffect } from 'react';
import { 
  Briefcase, UserPlus, X, CheckCircle, AlertCircle, Trash2, Shield 
} from 'lucide-react';

// Kurir Firebase
import { ambilSemuaPegawaiDb } from '../../services/pegawaiService';
import { ambilSemuaPejabatDb, tugaskanPegawaiDb, kosongkanJabatanDb } from '../../services/pejabatService';

const DAFTAR_JABATAN = [
  { id: 'kepala_puskesmas', nama: 'Kepala Puskesmas' },
  { id: 'ppk', nama: 'Pejabat Pembuat Komitmen (PPK)' },
  { id: 'bendahara_pengeluaran', nama: 'Bendahara Pengeluaran' },
  { id: 'kpa', nama: 'Kuasa Pengguna Anggaran (KPA)' },
  { id: 'pptk', nama: 'Pejabat Pelaksana Teknis Kegiatan (PPTK)' },
  { id: 'kepala_tata_usaha', nama: 'Kepala Tata Usaha' },
  { id: 'kepala_keperawatan', nama: 'Kepala Keperawatan' },
  { id: 'koordinator_bidan', nama: 'Koordinator Bidan' }
];

export default function Pejabat() {
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [mappingPejabat, setMappingPejabat] = useState({}); // { idJabatan: { idPegawai: ... } }
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState('');

  // State Modal Penugasan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jabatanTerpilih, setJabatanTerpilih] = useState(null);
  const [pegawaiTerpilih, setPegawaiTerpilih] = useState('');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const dataPegawai = await ambilSemuaPegawaiDb();
      const dataPejabat = await ambilSemuaPejabatDb();
      
      setDaftarPegawai(dataPegawai);
      
      // Convert array to map for easy lookup
      const map = {};
      dataPejabat.forEach(p => {
         map[p.id] = p;
      });
      setMappingPejabat(map);
    } catch (error) {
      console.error("Gagal menarik data pejabat", error);
    } finally {
      setLoading(false);
    }
  };

  const bukaModalTugas = (jabatan) => {
    setJabatanTerpilih(jabatan);
    setPegawaiTerpilih(mappingPejabat[jabatan.id]?.idPegawai || '');
    setIsModalOpen(true);
    setPesan('');
  };

  const handleSimpanPenugasan = async (e) => {
    e.preventDefault();
    if (!pegawaiTerpilih) {
      setPesan('Silakan pilih pegawai terlebih dahulu!');
      return;
    }
    
    try {
      setLoading(true);
      await tugaskanPegawaiDb(jabatanTerpilih.id, pegawaiTerpilih);
      await tarikData();
      setIsModalOpen(false);
    } catch (error) {
      setPesan('Gagal menyimpan penugasan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKosongkan = async (idJabatan) => {
    if (window.confirm("Yakin ingin mencopot pegawai dari jabatan ini?")) {
      try {
        setLoading(true);
        await kosongkanJabatanDb(idJabatan);
        await tarikData();
      } catch (error) {
        alert("Gagal mengosongkan jabatan.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getInfoPegawai = (idPegawai) => {
    return daftarPegawai.find(p => p.id === idPegawai);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6 flex gap-4 items-start">
         <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 shrink-0">
            <Shield size={24} />
         </div>
         <div>
            <h3 className="font-bold text-indigo-900 text-lg mb-1">Sistem Penetapan Jabatan</h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
               Pilih pegawai yang menduduki jabatan struktural. Jika terjadi pergantian pejabat, Anda cukup mengubah pilihan di sini tanpa perlu mengetik ulang data diri dari awal. Sistem cetak dokumen akan otomatis mengikuti penugasan ini.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {DAFTAR_JABATAN.map((jabatan) => {
            const assignment = mappingPejabat[jabatan.id];
            const pegawai = assignment ? getInfoPegawai(assignment.idPegawai) : null;

            return (
               <div key={jabatan.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-6">
                     <div className="bg-slate-50 p-3 rounded-2xl text-slate-500 border border-slate-100 shrink-0">
                        <Briefcase size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 leading-tight">{jabatan.nama}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Slot Jabatan</p>
                     </div>
                  </div>

                  <div className="mt-auto">
                     {pegawai ? (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                           <button 
                              onClick={() => handleKosongkan(jabatan.id)}
                              className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                              title="Copot Pejabat"
                           >
                              <Trash2 size={14} />
                           </button>
                           <p className="font-extrabold text-slate-800 text-sm mb-1">{pegawai.nama}</p>
                           <p className="text-xs text-slate-500 mb-1">{pegawai.nip || 'Belum ada NIP'}</p>
                           <p className="text-xs font-semibold text-indigo-600">{pegawai.pangkat || '-'} {pegawai.golongan ? `/ ${pegawai.golongan}` : ''}</p>
                           <button 
                              onClick={() => bukaModalTugas(jabatan)}
                              className="w-full mt-4 text-xs font-bold text-slate-500 border border-slate-200 bg-white py-2 rounded-xl hover:bg-slate-100 transition-colors"
                           >
                              Ganti Pejabat
                           </button>
                        </div>
                     ) : (
                        <button 
                           onClick={() => bukaModalTugas(jabatan)}
                           className="w-full border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                        >
                           <UserPlus size={20} />
                           <span className="font-bold text-sm">Tugaskan Pegawai</span>
                        </button>
                     )}
                  </div>
               </div>
            )
         })}
      </div>

      {/* Modal Penugasan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h2 className="text-lg font-bold text-slate-800">Tugaskan Pejabat</h2>
                 <p className="text-xs text-slate-500 font-medium">{jabatanTerpilih?.nama}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSimpanPenugasan} className="p-6">
              {pesan && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} />
                  <span>{pesan}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Pegawai dari Master Data</label>
                  <select
                    value={pegawaiTerpilih}
                    onChange={(e) => setPegawaiTerpilih(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                    required
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {daftarPegawai.map(peg => (
                      <option key={peg.id} value={peg.id}>
                        {peg.nama} {peg.nip ? `(NIP. ${peg.nip})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
