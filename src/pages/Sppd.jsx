import React, { useState, useEffect } from 'react';
import { Printer, FileText, Calendar, MapPin, User, Car, Zap } from 'lucide-react';
import { ambilSemuaPegawaiDb } from '../services/pegawaiService';
import { ambilSemuaDesaDb } from '../services/desaService';
import { ambilSemuaSekolahDb } from '../services/sekolahService';
import { ambilSemuaKegiatanDb } from '../services/kegiatanService'; // Kurir Kegiatan

// Import logo dari folder assets
import logoMitra from '../assets/logo mitra.png';
import logoPkm from '../assets/logopkm.png';

export default function Sppd() {
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarDesa, setDaftarDesa] = useState([]);
  const [daftarSekolah, setDaftarSekolah] = useState([]);
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);

  // State Form
  const [selectedKegiatanId, setSelectedKegiatanId] = useState('');
  const [pegawaiTerpilih, setPegawaiTerpilih] = useState(null);
  const [desaTujuan, setDesaTujuan] = useState('');
  const [maksudPerjalanan, setMaksudPerjalanan] = useState('');
  const [tanggalBerangkat, setTanggalBerangkat] = useState('');
  const [alatAngkut, setAlatAngkut] = useState('Mobil');
  const [lamaPerjalanan, setLamaPerjalanan] = useState('1 (Satu) Hari');
  
  // State untuk Info Hint Petugas
  const [petugasDijadwalkan, setPetugasDijadwalkan] = useState('');

  useEffect(() => {
    const tarikData = async () => {
      const dataPeg = await ambilSemuaPegawaiDb();
      const dataDes = await ambilSemuaDesaDb();
      const dataSek = await ambilSemuaSekolahDb();
      const dataKeg = await ambilSemuaKegiatanDb(); // Tarik jadwal
      setDaftarPegawai(dataPeg);
      setDaftarDesa(dataDes);
      setDaftarSekolah(dataSek);
      setDaftarKegiatan(dataKeg);
    };
    tarikData();
  }, []);

  // ==========================================
  // FUNGSI SINKRONISASI JADWAL -> FORM
  // ==========================================
  const handlePilihKegiatan = (eOrId) => {
    const idKegiatan = (eOrId && typeof eOrId === 'object' && 'target' in eOrId) ? eOrId.target.value : eOrId;
    setSelectedKegiatanId(idKegiatan || '');
    
    // Jika dropdown dikosongkan (pilih manual)
    if (!idKegiatan) {
      setMaksudPerjalanan('');
      setDesaTujuan('');
      setTanggalBerangkat('');
      setPetugasDijadwalkan('');
      return;
    }

    // Jika pilih jadwal, isi otomatis!
    const keg = daftarKegiatan.find(k => k.id === idKegiatan);
    if (keg) {
      setMaksudPerjalanan(`${keg.program} - ${keg.kegiatan}`);
      setDesaTujuan(keg.desa);
      setPetugasDijadwalkan(keg.pegawai || 'Belum ada nama yang diinput di jadwal');

      // Konversi Format Tanggal dari Excel (Contoh: "3" "JUNI 2026") menjadi format input kalender (2026-06-03)
      if (keg.tanggal && keg.bulan) {
        const bulanMap = {
          'JANUARI': '01', 'FEBRUARI': '02', 'MARET': '03', 'APRIL': '04', 
          'MEI': '05', 'JUNI': '06', 'JULI': '07', 'AGUSTUS': '08', 
          'SEPTEMBER': '09', 'OKTOBER': '10', 'NOVEMBER': '11', 'DESEMBER': '12'
        };
        const parts = keg.bulan.split(' ');
        const namaBulan = parts[0]?.toUpperCase();
        const tahun = parts[1] || new Date().getFullYear();
        const angkaBulan = bulanMap[namaBulan] || '01';
        const angkaTanggal = String(keg.tanggal).padStart(2, '0');
        
        setTanggalBerangkat(`${tahun}-${angkaBulan}-${angkaTanggal}`);
      }
    }
  };

  useEffect(() => {
    const preselected = localStorage.getItem('preselectedActivityId');
    if (preselected && daftarKegiatan.length > 0) {
      handlePilihKegiatan(preselected);
      const keg = daftarKegiatan.find(k => k.id === preselected);
      if (keg && keg.pegawai) {
        const listNama = keg.pegawai.split(',').map(p => p.trim()).filter(Boolean);
        if (listNama.length > 0) {
          const matchingPegawai = daftarPegawai.find(p => p.nama.toLowerCase().includes(listNama[0].toLowerCase()));
          if (matchingPegawai) {
            setPegawaiTerpilih(matchingPegawai);
          }
        }
      }
      localStorage.removeItem('preselectedActivityId');
    }
  }, [daftarKegiatan, daftarPegawai]);

  const handlePilihPegawai = (e) => {
    const id = e.target.value;
    const pegawai = daftarPegawai.find(p => p.id === id);
    setPegawaiTerpilih(pegawai);
  };

  const handleCetak = () => {
    window.print();
  };

  // Format cetak kertas
  const formatTanggalSurat = (tgl) => {
    if (!tgl) return '... ................. 202...';
    const date = new Date(tgl);
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getBulanRomawiDariDate = (tgl) => {
    if (!tgl) return 'VI';
    const date = new Date(tgl);
    const m = date.getMonth();
    const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romawi[m] || 'VI';
  };

  const getTahunDariDate = (tgl) => {
    if (!tgl) return '2026';
    return new Date(tgl).getFullYear();
  };

  const formatNip = (nip) => {
    if (!nip) return 'NIP. ..................................................';
    const cekNip = String(nip).toUpperCase();
    return cekNip.includes('NIP') ? nip : `NIP. ${nip}`;
  };

  const formatDesa = (desa) => {
    if (!desa) return '.......................................';
    const cekDesa = String(desa).toLowerCase();
    if (cekDesa.includes('desa') || cekDesa.includes('kelurahan')) return desa;
    if (cekDesa.includes('sd ') || cekDesa.includes('smp ') || cekDesa.includes('tk ') || cekDesa.includes('sdn ')) return desa;
    return `Desa ${desa}`;
  };

  const normalizeDesaName = (name) => {
    if (!name) return '';
    return String(name).toLowerCase().replace(/desa/g, '').replace(/kelurahan/g, '').trim();
  };

  const getKepalaDesa = (namaDesa) => {
    if (!namaDesa) return '(...................................................)';
    
    const cekDesa = String(namaDesa).toLowerCase();
    const isSekolah = cekDesa.includes('sd ') || cekDesa.includes('smp ') || cekDesa.includes('tk ') || cekDesa.includes('sdn ');
    
    if (isSekolah) {
      const sekolah = daftarSekolah.find(s => s.namaSekolah.toLowerCase() === cekDesa);
      if (sekolah && sekolah.namaKepsek && sekolah.namaKepsek !== '-') {
        return (
          <>
            <span className="font-bold underline uppercase">{sekolah.namaKepsek}</span>
          </>
        );
      }
      return '(...................................................)';
    }

    const normalizedInput = normalizeDesaName(namaDesa);
    const desa = daftarDesa.find(d => normalizeDesaName(d.namaDesa) === normalizedInput);
    if (desa && desa.namaKades) {
      return (
        <>
          <span className="font-bold underline uppercase">{desa.namaKades}</span>
        </>
      );
    }
    return '(...................................................)';
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* BAGIAN 1: FORMULIR PENGISIAN (TIDAK IKUT TER-PRINT) */}
      {/* ========================================================= */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 print:hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Buat Surat Perjalanan Dinas (SPPD)
          </h3>
          <button 
            onClick={handleCetak}
            disabled={!pegawaiTerpilih || !desaTujuan || !tanggalBerangkat}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={18} /> Cetak Dokumen SPPD
          </button>
        </div>

        {/* SEKSI OTOMATISASI JADWAL */}
        <div className="mb-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Zap size={16} className="text-amber-500 fill-amber-500" /> Tarik Data Otomatis dari Jadwal BOK
          </label>
          <select value={selectedKegiatanId} onChange={handlePilihKegiatan} className="w-full border border-indigo-200 rounded-xl px-4 py-3 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <option value="">-- Kosongkan untuk Input Manual / Pilih Jadwal yang Tersinkron --</option>
            {daftarKegiatan.map(keg => (
              <option key={keg.id} value={keg.id}>
                Tgl {keg.tanggal} {keg.bulan} | {keg.desa} | {keg.kegiatan}
              </option>
            ))}
          </select>
          
          {petugasDijadwalkan && (
            <div className="mt-3 text-xs font-medium text-indigo-700 bg-indigo-100/60 p-3 rounded-xl border border-indigo-200 inline-block">
              <span className="font-bold uppercase tracking-wider">Info Petugas Jadwal:</span><br/>
              Berdasarkan jadwal, petugas yang ditugaskan di lokasi ini adalah: <span className="font-extrabold text-indigo-900 bg-white px-2 py-0.5 rounded ml-1">{petugasDijadwalkan}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
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
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Tujuan (Desa / Sekolah)</label>
            <select value={desaTujuan} onChange={(e) => setDesaTujuan(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
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
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><FileText size={14}/> Maksud Perjalanan Dinas</label>
            <input type="text" value={maksudPerjalanan} onChange={(e) => setMaksudPerjalanan(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={14}/> Tanggal Berangkat & Kembali</label>
            <input type="date" value={tanggalBerangkat} onChange={(e) => setTanggalBerangkat(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Car size={14}/> Alat Angkut</label>
            <input type="text" value={alatAngkut} onChange={(e) => setAlatAngkut(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN 2: KANVAS A4 UNTUK DI-PRINT */}
      {/* ========================================================= */}
      
      <div className="bg-white w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-lg rounded-lg print:shadow-none print:rounded-none text-black font-serif text-[12px] leading-relaxed relative print:w-[210mm] print:h-[297mm] print:absolute print:top-0 print:left-0 print:z-50 print:bg-white overflow-hidden">
        
        {/* HALAMAN 1 */}
        <div className="p-8 pb-12 w-full h-[297mm] box-border relative">
          
          <div className="flex items-center border-b-[3px] border-black pb-3 mb-4">
            <div className="w-[2cm] shrink-0 flex justify-center">
              <img src={logoMitra} alt="Logo Mitra" className="h-[2cm] w-[2cm] object-contain grayscale print:grayscale-0" />
            </div>
            <div className="flex-1 text-center pr-[2cm]">
              <h2 className="text-[16px] font-bold uppercase tracking-wide leading-tight">Pemerintah Kabupaten Minahasa Tenggara</h2>
              <h1 className="text-[20px] font-extrabold uppercase tracking-widest leading-tight">Puskesmas Silian Raya</h1>
              <p className="text-[11px] mt-1">Alamat: Desa Silian Satu, Kabupaten Minahasa Tenggara, Kode Pos: 95998</p>
            </div>
          </div>

          <div className="w-full mb-6">
            <div className="flex justify-end mb-4">
              <table className="text-[11px]">
                <tbody>
                  <tr><td className="pr-2">Lembar Ke</td><td>:</td></tr>
                  <tr><td className="pr-2">Kode No</td><td>:</td></tr>
                  <tr><td className="pr-2">Nomor</td><td>: DD/{tanggalBerangkat ? `${getBulanRomawiDariDate(tanggalBerangkat)}-${getTahunDariDate(tanggalBerangkat)}` : 'VI-2026'}/440/DINKES-MT/PKM-SLN/SPPD-</td></tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-center font-bold underline text-[14px] uppercase tracking-wider mb-1">Surat Perjalanan Dinas (SPD)</h3>
          </div>

          <table className="w-full border-collapse border border-black mb-8 text-[11px]">
            <tbody>
              <tr>
                <td className="border border-black p-2 text-center w-8">1</td>
                <td className="border border-black p-2 w-[35%]">Pejabat Pembuat Komitmen</td>
                <td className="border border-black p-2 font-bold uppercase">Kepala Puskesmas Silian Raya<br/>Kabupaten Minahasa Tenggara</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">2</td>
                <td className="border border-black p-2">Nama/NIP Pegawai yang melaksanakan perjalanan dinas</td>
                <td className="border border-black p-2 font-bold">
                  {pegawaiTerpilih ? pegawaiTerpilih.nama.toUpperCase() : '..................................................'}<br/>
                  {formatNip(pegawaiTerpilih?.nip)}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center align-top">3</td>
                <td className="border border-black p-2 align-top">
                  a. Pangkat/Golongan<br/><br/>
                  b. Jabatan / Instansi<br/>
                  c. Tingkat Biaya Perjalanan Dinas
                </td>
                <td className="border border-black p-2 align-top">
                  a. {pegawaiTerpilih ? pegawaiTerpilih.golongan : '......................................'}<br/><br/>
                  b. {pegawaiTerpilih ? pegawaiTerpilih.jabatanFungsional : '......................................'}<br/>
                  c.
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">4</td>
                <td className="border border-black p-2">Maksud Perjalanan Dinas</td>
                <td className="border border-black p-2">{maksudPerjalanan}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">5</td>
                <td className="border border-black p-2">Alat Angkut yang dipergunakan</td>
                <td className="border border-black p-2">{alatAngkut}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center align-top">6</td>
                <td className="border border-black p-2 align-top">
                  a. Tempat Berangkat<br/><br/>
                  b. Tempat Tujuan
                </td>
                <td className="border border-black p-2 align-top">
                  a. Puskesmas Silian Raya<br/><br/>
                  b. {formatDesa(desaTujuan)}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center align-top">7</td>
                <td className="border border-black p-2 align-top">
                  a. Lama Perjalanan Dinas<br/>
                  b. Tanggal Berangkat<br/>
                  c. Tanggal Harus Kembali/Tiba di Tempat Baru *)
                </td>
                <td className="border border-black p-2 align-top">
                  a. {lamaPerjalanan}<br/>
                  b. {formatTanggalSurat(tanggalBerangkat)}<br/>
                  c. {formatTanggalSurat(tanggalBerangkat)}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center align-top">8</td>
                <td className="border border-black p-2 align-top">Pengikut: Nama</td>
                <td className="border border-black p-2 align-top flex justify-between">
                  <span>Tanggal Lahir</span><span>Keterangan</span>
                </td>
              </tr>
              <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2">1. </td><td className="border border-black p-2"></td></tr>
              <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2">2. </td><td className="border border-black p-2"></td></tr>
              <tr>
                <td className="border border-black p-2 text-center align-top">9</td>
                <td className="border border-black p-2 align-top">
                  Pembebanan Anggaran<br/><br/>
                  a. Instansi<br/>
                  b. Akun
                </td>
                <td className="border border-black p-2 align-top">
                  DAK Non Fisik-Dana BOK-BOK Puskesmas<br/><br/>
                  a. PUSKESMAS SILIAN RAYA<br/>
                  b. 
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">10</td>
                <td className="border border-black p-2">Keterangan Lain-lain</td>
                <td className="border border-black p-2"></td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-6 text-[12px]">
            <div className="w-[300px]">
              <table className="mb-4">
                <tbody>
                  <tr><td className="pr-4">Dikeluarkan di</td><td>: Silian</td></tr>
                  <tr><td className="pr-4">Pada Tanggal</td><td>: {formatTanggalSurat(tanggalBerangkat)}</td></tr>
                </tbody>
              </table>
              <p className="font-bold mb-16">PEJABAT PEMBUAT KOMITMEN</p>
              <p className="font-bold underline">dr. Winda Marshella Tanuli</p>
              <p className="font-bold">Pembina Tkt I/ IV b</p>
              <p className="font-bold">NIP. 198312052011022001</p>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 text-xs text-slate-500">1/2</div>
        </div>

        {/* HALAMAN 2 */}
        <div className="p-6 pt-4 w-full h-[297mm] box-border relative print:break-before-page flex flex-col">
          
          {/* Header Halaman 2 dengan Logo */}
          <div className="flex items-center border-b-[3px] border-black pb-2 mb-3">
            <div className="w-[2cm] shrink-0 flex justify-center">
              <img src={logoMitra} alt="Logo Mitra" className="h-[2cm] w-[2cm] object-contain grayscale print:grayscale-0" />
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-[14px] font-bold uppercase tracking-wide leading-tight">Pemerintah Kabupaten Minahasa Tenggara</h2>
              <h1 className="text-[18px] font-extrabold uppercase tracking-widest leading-tight">Puskesmas Silian Raya</h1>
              <p className="text-[10px] mt-0.5">Alamat: Desa Silian Satu, Kabupaten Minahasa Tenggara, Kode Pos: 95998</p>
            </div>
            <div className="w-[2cm] shrink-0 flex justify-center">
              <img src={logoPkm} alt="Logo PKM" className="h-[2cm] w-[2cm] object-contain grayscale print:grayscale-0" />
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[10px] mb-2 flex-shrink-0">
            <tbody>
              <tr>
                <td className="border border-black p-2 px-3 align-top w-1/2">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">I. Tiba di</td><td>: .......................................</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: .......................................</td></tr>
                      <tr><td className="pb-6">Kepala</td><td>: </td></tr>
                      <tr><td colSpan="2" className="text-center pt-4">(...................................................)</td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="border border-black p-2 px-3 align-top w-1/2">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">Berangkat dari</td><td>: Puskesmas Silian Raya</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(tanggalBerangkat)}</td></tr>
                      <tr><td className="pb-6">Kepala</td><td>: Puskesmas Silian Raya</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 px-3 align-top">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">II. Tiba di</td><td>: {formatDesa(desaTujuan)}</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(tanggalBerangkat)}</td></tr>
                      <tr><td className="pb-6">Kepala</td><td>: {formatDesa(desaTujuan)}</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4">{getKepalaDesa(desaTujuan)}</td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="border border-black p-2 px-3 align-top">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">Berangkat dari</td><td>: {formatDesa(desaTujuan)}</td></tr>
                      <tr><td className="pb-0.5">Ke</td><td>: Puskesmas Silian Raya</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(tanggalBerangkat)}</td></tr>
                      <tr><td className="pb-4">Kepala</td><td>: {formatDesa(desaTujuan)}</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4">{getKepalaDesa(desaTujuan)}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td className="border border-black p-2 px-3 align-top">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">III. Tiba di</td><td>: Puskesmas Silian Raya</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(tanggalBerangkat)}</td></tr>
                      <tr><td className="pb-6">Kepala</td><td>: Puskesmas Silian Raya</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="border border-black p-2 px-3 align-top bg-slate-50/50">
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 mb-1 flex-shrink-0">
            <h4 className="font-bold mb-1 text-[11px]">IV. Catatan Lain-lain :</h4>
            <h4 className="font-bold mb-0.5 text-[11px]">V. PERHATIAN</h4>
            <p className="text-[10px] text-justify leading-snug">
              PPK yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan keuangan negara apabila menderita rugi akibat kesalahan, kelalaian dan kealpaannya.
            </p>
          </div>

          <div className="flex justify-end mt-4 text-[11px] flex-shrink-0">
            <div className="w-[280px] text-center">
              <p className="font-bold mb-12">PEJABAT PEMBUAT KOMITMEN</p>
              <p className="font-bold underline">dr. Winda Marshella Tanuli</p>
              <p className="font-bold">Pembina Tkt I/ IV b</p>
              <p className="font-bold">NIP. 198312052011022001</p>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 text-xs text-slate-500">2/2</div>

        </div>
      </div>
    </div>
  );
}