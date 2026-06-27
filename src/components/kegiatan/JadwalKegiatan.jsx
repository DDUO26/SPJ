import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, Trash2, Edit, Activity, 
  Database, AlertCircle, CheckCircle, Printer, 
  ChevronDown, ChevronUp, Calendar, Users, X, Save, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Kurir Firebase
import { simpanBanyakKegiatanDb, ambilSemuaKegiatanDb, hapusKegiatanDb, updateKegiatanDb } from '../../services/kegiatanService';
import { ambilSemuaPegawaiDb } from '../../services/pegawaiService';
import { ambilSemuaDesaDb } from '../../services/desaService';

// Logo untuk Cetak
import logoMitra from '../../assets/logo mitra.png';
import logoPkm from '../../assets/logopkm.png';

// Import Cetak components
import CetakRiil from '../../pages/CetakRiil';
import SuratPernyataan from '../../pages/SuratPernyataan';

export default function JadwalKegiatan({ activeRole = 'Admin' }) {
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarDesa, setDaftarDesa] = useState([]);
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);

  // State File & Confirm
  const fileInputRef = useRef(null);
  const [confirmUploadData, setConfirmUploadData] = useState(null);

  // State Filter Accordion
  const [bulanAktif, setBulanAktif] = useState('');
  const [expandedKegiatan, setExpandedKegiatan] = useState({});

  // State Modal Edit
  const [editData, setEditData] = useState(null);
  const [inputPegawai, setInputPegawai] = useState('');
  const [inputTanggal, setInputTanggal] = useState('');

  // State Modal Cetak
  const [printData, setPrintData] = useState(null);
  const [printPetugas, setPrintPetugas] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('SPPD');
  const [nomorSppd, setNomorSppd] = useState('');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      const dataKeg = await ambilSemuaKegiatanDb();
      const dataPeg = await ambilSemuaPegawaiDb();
      const dataDes = await ambilSemuaDesaDb();
      setDaftarKegiatan(dataKeg);
      setDaftarPegawai(dataPeg);
      setDaftarDesa(dataDes);
      
      const bulanList = [...new Set(dataKeg.map(k => k.bulan || 'UMUM'))].filter(b => b !== 'UMUM');
      if (bulanList.length > 0 && !bulanAktif) setBulanAktif(bulanList[0]);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    }
  };

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setPesan('');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0]; 
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        let bulanJadwal = wsname.toUpperCase();
        if (data[0] && data[0][0]) {
          const match = String(data[0][0]).match(/Bulan\s+(.*)/i);
          if (match) bulanJadwal = match[1].toUpperCase();
        }

        let currentProgram = '';
        let currentKegiatan = '';
        const jadwalBaru = [];

        data.forEach((row, index) => {
          if (index < 2) return;
          const colProgram = row[1], colKegiatanDesa = row[2], colPegawai = row[3], colTanggal = row[4], colDana = row[5];
          if (colProgram && colProgram !== 'Nama Program') {
            currentProgram = colProgram; currentKegiatan = colKegiatanDesa || '';
          } else if (!colProgram && colKegiatanDesa && colTanggal) {
            jadwalBaru.push({
              bulan: bulanJadwal, program: currentProgram, kegiatan: currentKegiatan,
              desa: colKegiatanDesa, pegawai: colPegawai || '', tanggal: String(colTanggal), dana: colDana || 0
            });
          }
        });

        if (jadwalBaru.length > 0) {
          const hasExisting = daftarKegiatan.some(dk => dk.bulan === bulanJadwal);
          setConfirmUploadData({ jadwalBaru, bulanJadwal, hasExisting });
        } else {
          setPesan('Gagal membaca data Excel atau format jadwal kosong.');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (error) { 
        setPesan('Terjadi kesalahan membaca Excel.'); 
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally { 
        setLoading(false); 
      }
    };
    reader.readAsBinaryString(file);
  };

  const batalkanUpload = () => {
    setConfirmUploadData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPesan('Upload dibatalkan.');
    setTimeout(() => setPesan(''), 3000);
  };

  const eksekusiUploadExcel = async () => {
    if (!confirmUploadData) return;
    const { jadwalBaru, bulanJadwal, hasExisting } = confirmUploadData;
    
    setConfirmUploadData(null);
    setLoading(true);
    
    try {
      if (hasExisting) {
          setPesan(`Menghapus data lama bulan ${bulanJadwal}...`);
          const dataBulanLama = daftarKegiatan.filter(dk => dk.bulan === bulanJadwal);
          for (const dk of dataBulanLama) {
              await hapusKegiatanDb(dk.id);
          }
      }

      setPesan('Menyimpan jadwal baru...');
      await simpanBanyakKegiatanDb(jadwalBaru, []);
      
      setPesan(`Sukses! Berhasil ${hasExisting ? 'mengganti' : 'menambahkan'} jadwal bulan ${bulanJadwal} dengan ${jadwalBaru.length} data baru.`);
      setBulanAktif(bulanJadwal);
      await tarikData();
    } catch (error) {
      setPesan('Terjadi kesalahan saat menyimpan jadwal.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setPesan(''), 5000);
    }
  };

  const handleHapus = async (idKegiatan) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) { await hapusKegiatanDb(idKegiatan); await tarikData(); }
  };

  const simpanEditKegiatan = async () => {
    try {
      const isDuplicate = daftarKegiatan.some(dk => 
         dk.id !== editData.id &&
         dk.pegawai === inputPegawai && 
         dk.tanggal === inputTanggal && 
         dk.kegiatan === editData.kegiatan
      );

      if (isDuplicate) {
         alert("Gagal: Data jadwal dengan petugas dan tanggal yang sama untuk kegiatan ini sudah ada!");
         return;
      }

      await updateKegiatanDb(editData.id, { pegawai: inputPegawai, tanggal: inputTanggal });
      setEditData(null); await tarikData();
    } catch (error) { alert("Gagal menyimpan perubahan"); }
  };

  const bukaModalPrint = (keg) => {
    setPrintData(keg);
    const daftarNamaPetugas = keg.pegawai ? keg.pegawai.split(',').map(p => p.trim()).filter(Boolean) : [];
    setPrintPetugas(daftarNamaPetugas.length > 0 ? daftarNamaPetugas[0] : '');
    setJenisDokumen('SPPD');
    setNomorSppd('');
  };

  const eksekusiCetak = () => {
    setPrintData({ ...printData, modalOpen: false }); 
    setTimeout(() => { window.print(); }, 300); 
  };

  // ==========================================
  // LOGIKA PENCARI PEGAWAI & FORMATTING
  // ==========================================
  const getDataPegawai = (nama) => {
    if (!nama) return null;
    return daftarPegawai.find(p => p.nama.toLowerCase().includes(nama.toLowerCase())) || { nama: nama };
  };

  const bendahara = daftarPegawai.find(p => p.peran === 'Bendahara Pengeluaran');
  const kpa = daftarPegawai.find(p => p.peran === 'Kuasa Pengguna Anggaran (KPA)');
  const pptk = daftarPegawai.find(p => p.peran === 'Pejabat Pelaksana Teknis Kegiatan (PPTK)');

  const formatTgl = (tgl, bln) => {
    if (!tgl || !bln) return '... ................. 202...';
    const tahun = bln.split(' ')[1] || new Date().getFullYear();
    const namaBulan = bln.split(' ')[0];
    const formatBulan = namaBulan.charAt(0).toUpperCase() + namaBulan.slice(1).toLowerCase();
    return `${String(tgl).padStart(2, '0')} ${formatBulan} ${tahun}`;
  };

  const formatNip = (nip) => {
    if (!nip) return 'NIP. ........................................';
    const cekNip = String(nip).toUpperCase();
    if (cekNip.includes('NIP') || cekNip.includes('NI ')) return nip;
    return `NIP. ${nip}`;
  };

  const formatDesa = (desa) => desa && (desa.toLowerCase().includes('desa') || desa.toLowerCase().includes('kelurahan')) ? desa : desa ? `Desa ${desa}` : '.......................................';

  const normalizeDesaName = (name) => {
    if (!name) return '';
    return String(name).toLowerCase().replace(/desa/g, '').replace(/kelurahan/g, '').trim();
  };

  const getKepalaDesa = (namaDesa) => {
    if (!namaDesa) return '(...................................................)';
    const normalizedInput = normalizeDesaName(namaDesa);
    const desa = daftarDesa.find(d => normalizeDesaName(d.namaDesa) === normalizedInput);
    if (desa && desa.namaKades) {
      return <span className="font-bold underline uppercase">{desa.namaKades}</span>;
    }
    return '(...................................................)';
  };

  const angkaTerbilang = (angka) => {
    angka = Math.abs(angka);
    const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";
    if (angka < 12) hasil = " " + huruf[angka];
    else if (angka < 20) hasil = angkaTerbilang(angka - 10) + " Belas";
    else if (angka < 100) hasil = angkaTerbilang(Math.floor(angka / 10)) + " Puluh" + angkaTerbilang(angka % 10);
    else if (angka < 200) hasil = " Seratus" + angkaTerbilang(angka - 100);
    else if (angka < 1000) hasil = angkaTerbilang(Math.floor(angka / 100)) + " Ratus" + angkaTerbilang(angka % 100);
    else if (angka < 2000) hasil = " Seribu" + angkaTerbilang(angka - 1000);
    else if (angka < 1000000) hasil = angkaTerbilang(Math.floor(angka / 1000)) + " Ribu" + angkaTerbilang(angka % 1000);
    else if (angka < 1000000000) hasil = angkaTerbilang(Math.floor(angka / 1000000)) + " Juta" + angkaTerbilang(angka % 1000000);
    return hasil.trim();
  };

  const getBulanRomawi = (bln) => {
    if (!bln) return 'VI';
    const namaBulan = bln.split(' ')[0].toUpperCase();
    const mapBulan = {
      JANUARI: 'I', FEBRUARI: 'II', MARET: 'III', APRIL: 'IV',
      MEI: 'V', JUNI: 'VI', JULI: 'VII', AGUSTUS: 'VIII',
      SEPTEMBER: 'IX', OKTOBER: 'X', NOVEMBER: 'XI', DESEMBER: 'XII'
    };
    return mapBulan[namaBulan] || 'VI';
  };
  const getTahun = (bln) => bln ? (bln.split(' ')[1] || new Date().getFullYear()) : new Date().getFullYear();

  const daftarBulanUnik = [...new Set(daftarKegiatan.map(k => k.bulan || 'UMUM'))].filter(b => b !== 'UMUM');
  const dataBulanIni = daftarKegiatan.filter(k => (k.bulan || 'UMUM') === bulanAktif);
  const kegiatanGrouped = dataBulanIni.reduce((acc, curr) => {
    const key = curr.kegiatan || 'Tanpa Kegiatan';
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr); return acc;
  }, {});

  Object.keys(kegiatanGrouped).forEach(key => {
    kegiatanGrouped[key].sort((a, b) => {
      const tglA = parseInt(a.tanggal) || 0;
      const tglB = parseInt(b.tanggal) || 0;
      return tglA - tglB;
    });
  });

  const toggleKegiatan = (keg) => setExpandedKegiatan(prev => ({ ...prev, [keg]: !prev[keg] }));
  const pegawaiCetak = getDataPegawai(printPetugas);

  return (
    <div className="space-y-6 relative">
      
      {/* ====================================================================== */}
      {/* TAMPILAN NORMAL LAYAR KOMPUTER */}
      {/* ====================================================================== */}
      <div className="space-y-6 print:hidden">
        
        {/* Upload Excel Versi Compact Modern (Hanya Admin) */}
        {activeRole === 'Admin' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-left w-full md:w-auto">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 shrink-0"><FileSpreadsheet size={24} /></div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Manajemen Jadwal Kegiatan</h3>
                <p className="text-xs text-slate-500">Upload file excel untuk jadwal bulan berjalan atau sinkronisasi bulan baru.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {pesan && <div className={`px-4 py-2 rounded-xl text-[11px] font-bold ${pesan.includes('Gagal') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{pesan}</div>}
              <label className={`bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm min-w-[140px] ${loading ? 'opacity-50' : ''}`}>
                <Upload size={16} /> {loading ? 'Membaca...' : 'Upload Jadwal'}
                <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleUploadExcel} className="hidden" disabled={loading} />
              </label>
            </div>
          </div>
        )}

        {/* Database & Accordion Tabel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Database className="text-slate-600" size={20} /> Jadwal Berdasarkan Bulan</h3>
          
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-100 scrollbar-thin">
            {daftarBulanUnik.map((bulan) => (
              <button key={bulan} onClick={() => setBulanAktif(bulan)} className={`px-5 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${bulanAktif === bulan ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                <Calendar size={14} className="inline mr-2 mb-0.5" />{bulan}
              </button>
            ))}
            {daftarBulanUnik.length === 0 && (
              <div className="text-xs text-slate-400 font-medium py-2 italic">Belum ada data jadwal bulan apapun yang di-upload.</div>
            )}
          </div>

          <div className="space-y-4">
            {Object.entries(kegiatanGrouped).map(([kegiatanName, daftarKeg]) => (
              <div key={kegiatanName} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button onClick={() => toggleKegiatan(kegiatanName)} className="w-full flex justify-between items-center p-5 bg-slate-50 hover:bg-slate-100">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-600"><Activity size={18} /></div>
                    <div><h4 className="font-bold text-slate-800 text-sm">{kegiatanName}</h4><p className="text-xs text-slate-500 mt-0.5">{daftarKeg.length} titik lokasi desa</p></div>
                  </div>
                  {expandedKegiatan[kegiatanName] ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                
                {expandedKegiatan[kegiatanName] && (
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr><th className="px-6 py-3 font-semibold">Tujuan (Desa)</th><th className="px-6 py-3 font-semibold w-24 text-center">Tanggal</th><th className="px-6 py-3 font-semibold">Petugas Ditugaskan</th><th className="px-6 py-3 font-semibold">Dana</th><th className="px-6 py-3 text-center font-semibold">Aksi</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {daftarKeg.map((keg) => (
                          <tr key={keg.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4"><span className="font-bold text-indigo-700">{keg.desa}</span><div className="text-[10px] text-slate-400 mt-1">{keg.program}</div></td>
                            <td className="px-6 py-4 text-center text-slate-800 font-bold bg-slate-50/50">{keg.tanggal}</td>
                            <td className="px-6 py-4">
                              {keg.pegawai ? (<div className="flex items-start gap-2"><Users size={14} className="text-emerald-500 mt-0.5" /><span className="font-medium text-slate-700">{keg.pegawai}</span></div>) : (<span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded">Belum ada petugas</span>)}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">Rp {Number(keg.dana).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => bukaModalPrint({ ...keg, modalOpen: true })} className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors shadow-sm" title="Cetak Surat"><Printer size={16} /></button>
                                {activeRole === 'Admin' && (
                                  <>
                                    <button onClick={() => { setEditData(keg); setInputPegawai(keg.pegawai || ''); setInputTanggal(keg.tanggal || ''); }} className="bg-amber-50 text-amber-600 p-2 rounded-lg hover:bg-amber-500 hover:text-white transition-colors shadow-sm" title="Edit Petugas"><Edit size={16} /></button>
                                    <button onClick={() => handleHapus(keg.id)} className="bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-colors shadow-sm" title="Hapus Jadwal"><Trash2 size={16} /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI UPLOAD */}
      {confirmUploadData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col">
            {confirmUploadData.hasExisting ? (
               <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                 <AlertCircle size={32} />
               </div>
            ) : (
               <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                 <CheckCircle size={32} />
               </div>
            )}
            
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">
              {confirmUploadData.hasExisting ? 'Konfirmasi Penggantian Jadwal' : 'Tambahkan Jadwal Baru'}
            </h3>
            
            <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
              Ditemukan <span className="font-bold text-indigo-600">{confirmUploadData.jadwalBaru.length} kegiatan</span> untuk bulan <span className="font-bold text-indigo-600">{confirmUploadData.bulanJadwal}</span>.
              <br/><br/>
              {confirmUploadData.hasExisting ? (
                <>Sistem akan <strong className="text-rose-600">MENGHAPUS SEMUA</strong> jadwal lama di bulan <span className="font-bold text-slate-800">{confirmUploadData.bulanJadwal}</span> dan menimpanya dengan data baru ini.</>
              ) : (
                <>Data bulan <span className="font-bold text-slate-800">{confirmUploadData.bulanJadwal}</span> belum ada di database. Jadwal ini akan ditambahkan sebagai bulan baru yang sepenuhnya aman.</>
              )}
            </p>
            
            <div className="flex gap-3 mt-2">
              <button onClick={batalkanUpload} className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={eksekusiUploadExcel} className={`flex-1 px-5 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-colors ${confirmUploadData.hasExisting ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
                {confirmUploadData.hasExisting ? 'Ya, Timpa Data' : 'Ya, Tambahkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PETUGAS */}
      {editData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5"><h3 className="text-lg font-bold text-slate-800">Edit Penugasan</h3><button onClick={() => setEditData(null)}><X size={20} className="text-slate-400"/></button></div>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={14}/> Tanggal Pelaksanaan</label><input type="text" value={inputTanggal} onChange={(e) => setInputTanggal(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Users size={14}/> Nama Petugas (Pisahkan dengan koma jika lebih dari 1)</label><textarea rows="3" value={inputPegawai} onChange={(e) => setInputPegawai(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setEditData(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600">Batal</button><button onClick={simpanEditKegiatan} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700"><Save size={16}/> Simpan</button></div>
          </div>
        </div>
      )}

      {/* MODAL PILIH PRINT */}
      {printData && printData.modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Printer className="text-emerald-600"/> Cetak Dokumen Cepat</h3>
              <button onClick={() => setPrintData(null)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Lokasi Tujuan</p>
                <p className="text-sm font-bold text-slate-800">{printData.desa}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Maksud Perjalanan</p>
                <p className="text-sm font-bold text-slate-800 truncate">{printData.kegiatan}</p>
              </div>
            </div>

            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Pilih Dokumen yang Ingin Dicetak</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setJenisDokumen('SPPD')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'SPPD' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> SPPD
                  </button>
                  <button onClick={() => setJenisDokumen('RIIL')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'RIIL' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> Riil
                  </button>
                  <button onClick={() => setJenisDokumen('PERNYATAAN')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'PERNYATAAN' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> Pernyataan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Pilih Petugas yang Dicetak</label>
                {printData.pegawai ? (
                  <select value={printPetugas} onChange={(e) => setPrintPetugas(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-emerald-50/30">
                    {printData.pegawai.split(',').map((p, i) => (
                      <option key={i} value={p.trim()}>{p.trim()}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-xl font-semibold border border-rose-100">Jadwal ini belum memiliki petugas.</div>
                )}
                
                {/* Peringatan jika data krusial belum diisi di Entri Data */}
                {jenisDokumen === 'RIIL' && (!bendahara || !kpa || !pptk) && (
                   <div className="text-xs font-semibold text-rose-500 mt-2 flex flex-col gap-1">
                     {!bendahara && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: Bendahara Pengeluaran belum diatur.</span>}
                     {!kpa && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: KPA belum diatur di Entri Data.</span>}
                     {!pptk && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: PPTK belum diatur di Entri Data.</span>}
                   </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <label className="block text-sm font-bold text-slate-700 mb-2">3. Nomor Surat Lampiran</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={nomorSppd} onChange={(e) => setNomorSppd(e.target.value)} placeholder="No" className="w-20 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none text-center focus:border-indigo-500 bg-white" />
                  <span className="text-sm font-bold text-slate-600">/440/DINKES-MT/PKM-SLN/SPPD-DD/{printData ? `${getBulanRomawi(printData.bulan)}-${getTahun(printData.bulan)}` : 'VI-2026'}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2">*Bisa dikosongkan jika ingin diisi manual menggunakan pulpen setelah di-print.</p>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={eksekusiCetak} disabled={!printPetugas} className={`w-full text-white py-3.5 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${jenisDokumen === 'RIIL' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : jenisDokumen === 'PERNYATAAN' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'}`}>
                <Printer size={20}/> Cetak Dokumen {jenisDokumen}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: CETAKAN SPPD */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'SPPD' && (
        <div 
          className="hidden print:block bg-white w-full mx-auto text-black relative z-[9999]"
          style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', lineHeight: '1.1' }}
        >
          <style>{`
            @media print {
              body, html, #root, .overflow-hidden, .h-screen { height: auto !important; overflow: visible !important; background-color: white !important; }
              @page { size: A4; margin: 10mm 15mm; }
              .page-break { page-break-before: always; }
              table { border-collapse: collapse; }
              td, th { padding: 3px 5px !important; }
            }
          `}</style>

          {/* HALAMAN 1 SPPD */}
          <div className="w-full box-border relative">
            <div className="flex items-center border-b-[3px] border-black pb-2 mb-3" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'bold' }}>
              <div className="w-24 shrink-0 flex justify-center"><img src={logoMitra} alt="Logo" className="h-[75px] w-auto object-contain" /></div>
              <div className="flex-1 text-center pr-10">
                <div style={{ fontSize: '14pt' }} className="leading-tight">PEMERINTAH KABUPATEN MINAHASA TENGGARA<br/>PUSKESMAS SILIAN RAYA</div>
                <div style={{ fontSize: '8pt' }} className="mt-1">Alamat : Desa Silian Satu</div>
                <div style={{ fontSize: '11pt' }} className="mt-1 tracking-[0.2em]">KABUPATEN MINAHASA TENGGARA</div>
              </div>
            </div>

            <div className="w-full mb-3">
              <div className="flex justify-end mb-2">
                <table style={{ fontSize: '10pt' }}>
                  <tbody>
                    <tr><td className="pr-2">Lembar Ke</td><td>:</td></tr>
                    <tr><td className="pr-2">Kode No</td><td>:</td></tr>
                    <tr><td className="pr-2">Nomor</td><td>: {nomorSppd ? nomorSppd : '         '}/440/DINKES-MT/PKM-SLN/SPPD-DD/{printData ? `${getBulanRomawi(printData.bulan)}-${getTahun(printData.bulan)}` : 'VI-2026'}</td></tr>
                  </tbody>
                </table>
              </div>
              <h3 className="text-center font-bold underline uppercase tracking-wider mb-1" style={{ fontSize: '11pt' }}>Surat Perjalanan Dinas (SPD)</h3>
            </div>

            <table className="w-full border-collapse border border-black mb-3" style={{ fontSize: '10pt' }}>
              <tbody>
                <tr>
                  <td className="border border-black text-center align-top w-[5%]">1</td>
                  <td className="border border-black align-top w-[35%]">Pejabat Pembuat Komitmen</td>
                  <td colSpan="2" className="border border-black align-top font-bold uppercase w-[60%]">KEPALA PUSKESMAS SILIAN RAYA<br/>KABUPATEN MINAHASA TENGGARA</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">2</td>
                  <td className="border border-black align-top">Nama/NIP Pegawai yang melaksanakan perjalanan dinas</td>
                  <td colSpan="2" className="border border-black align-top font-bold">{pegawaiCetak ? pegawaiCetak.nama.toUpperCase() : '.......................................'}<br/>{formatNip(pegawaiCetak?.nip)}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">3</td>
                  <td className="border border-black align-top">a. Pangkat/Golongan<br/><br/>b. Jabatan / Instansi<br/>c. Tingkat Biaya Perjalanan Dinas</td>
                  <td colSpan="2" className="border border-black align-top">a. {pegawaiCetak?.golongan || '......................................'}<br/><br/><span className="font-bold">b. {pegawaiCetak?.jabatanFungsional || '......................................'}</span><br/>c.</td>
                </tr>
                <tr><td className="border border-black text-center align-top">4</td><td className="border border-black align-top">Maksud Perjalanan Dinas</td><td colSpan="2" className="border border-black align-top">{printData.kegiatan}</td></tr>
                <tr><td className="border border-black text-center align-top">5</td><td className="border border-black align-top">Alat Angkut yang di Pergunakan</td><td colSpan="2" className="border border-black align-top">Mobil</td></tr>
                <tr>
                  <td className="border border-black text-center align-top">6</td>
                  <td className="border border-black align-top">a. Tempat Berangkat<br/><br/>b. Tempat Tujuan</td>
                  <td colSpan="2" className="border border-black align-top">a. Puskesmas Silian Raya<br/><br/>b. {formatDesa(printData.desa)}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">7</td>
                  <td className="border border-black align-top">a. Lama Perjalanan Dinas<br/>b. Tanggal Berangkat<br/>c. Tanggal Harus Kembali/Tiba di Tempat Baru *)</td>
                  <td colSpan="2" className="border border-black align-top">a. 1 (Satu) Hari<br/>b. {formatTgl(printData.tanggal, printData.bulan)}<br/>c. {formatTgl(printData.tanggal, printData.bulan)}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top" rowSpan="3">8</td>
                  <td className="border border-black align-top">Pengikut: Nama</td>
                  <td className="border border-black align-top text-center w-[25%]">Tanggal Lahir</td>
                  <td className="border border-black align-top text-center w-[35%]">Keterangan</td>
                </tr>
                <tr><td className="border border-black align-top">1. </td><td className="border border-black align-top"></td><td className="border border-black align-top"></td></tr>
                <tr><td className="border border-black align-top">2. </td><td className="border border-black align-top"></td><td className="border border-black align-top"></td></tr>
                <tr>
                  <td className="border border-black text-center align-top">9</td>
                  <td className="border border-black align-top">Pembebanan Anggaran<br/><br/>a. Instansi<br/>b. Akun</td>
                  <td colSpan="2" className="border border-black align-top">DAK Non Fisik-Dana BOK-BOK Puskesmas<br/><br/>a. PUSKESMAS SILIAN RAYA<br/>b. </td>
                </tr>
                <tr><td className="border border-black text-center align-top">10</td><td className="border border-black align-top">Keterangan Lain-lain</td><td colSpan="2" className="border border-black align-top"></td></tr>
              </tbody>
            </table>

            <div className="flex justify-end mt-2">
              <div className="w-[300px]">
                <table className="mb-2">
                  <tbody><tr><td className="pr-2">Dikeluarkan di</td><td>: Silian</td></tr><tr><td className="pr-2">Pada Tanggal</td><td>: {formatTgl(printData.tanggal, printData.bulan)}</td></tr></tbody>
                </table>
                <p className="font-bold mb-12">PEJABAT PEMBUAT KOMITMEN</p>
                <p className="font-bold underline">dr. Winda Marshella Tanuli</p><p>Pembina Tkt I/ IV b</p><p className="font-bold">NIP. 198312052011022001</p>
              </div>
            </div>
          </div>

          {/* HALAMAN 2 SPPD */}
          <div className="page-break w-full box-border relative pt-6 flex flex-col justify-between" style={{ minHeight: '265mm' }}>
            <div>
              <table className="w-full border-collapse border border-black mb-0" style={{ fontSize: '10pt' }}>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-1/2 h-[160px]"></td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody>
                          <tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top">: Puskesmas Silian Raya</td></tr><tr><td className="align-top">(Tempat Kedudukan)</td><td></td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(printData.tanggal, printData.bulan)}</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: Puskesmas Silian Raya</td></tr>
                        </tbody></table>
                        <div className="text-center w-full mt-auto pt-6"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">II. Tiba di</td><td className="align-top font-bold">: {formatDesa(printData.desa)}</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(printData.tanggal, printData.bulan)}</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: Desa {printData.desa}</td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">{getKepalaDesa(printData.desa)}</div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top font-bold">: {formatDesa(printData.desa)}</td></tr><tr><td className="align-top">Ke</td><td className="align-top">: Puskesmas Silian Raya</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(printData.tanggal, printData.bulan)}</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: Desa {printData.desa}</td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">{getKepalaDesa(printData.desa)}</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">III. Tiba di</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Ke</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">IV. Tiba di</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Ke</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody><tr><td className="w-[135px] align-top">V. Tiba di</td><td className="align-top">: Puskesmas Silian Raya</td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(printData.tanggal, printData.bulan)}</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: Puskesmas Silian Raya</td></tr></tbody></table>
                        <div className="text-center w-full mt-auto pt-6"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="text-justify">Telah diperiksa dengan keterangan bahwa perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam jangka waktu yang sesingkat-singkatnya.</div>
                    </td>
                  </tr>
                  <tr><td colSpan="2" className="border border-black p-2 align-top"><span className="font-bold">VI. Catatan Lain-lain :</span></td></tr>
                  <tr><td colSpan="2" className="border border-black p-2 align-top text-justify"><span className="font-bold">VII. PERHATIAN</span><br/>PPK yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan keuangan negara apabila menderita rugi akibat kesalahan, kelalaian dan kealpaannya.</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6 mb-4">
              <div className="w-[300px] text-center">
                <p className="font-bold mb-20">PEJABAT PEMBUAT KOMITMEN</p>
                <p className="font-bold underline">dr. Winda Marshella Tanuli</p><p className="font-bold">NIP. 198312052011022001</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: CETAKAN RIIL PENGELUARAN */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'RIIL' && (
        <CetakRiil 
          printData={printData}
          pegawaiCetak={pegawaiCetak}
          bendahara={bendahara}
          kpa={kpa}
          pptk={pptk}
          nomorSppd={nomorSppd}
        />
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: SURAT PERNYATAAN */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'PERNYATAAN' && (
        <SuratPernyataan 
          printData={printData}
          pegawaiCetak={pegawaiCetak}
          nomorSppd={nomorSppd}
        />
      )}
    </div>
  );
}