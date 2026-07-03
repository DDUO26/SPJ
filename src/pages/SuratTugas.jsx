import React from 'react';
import garudaLogo from '../assets/garuda_emas.png';

export default function SuratTugas({ printData, pegawaiCetak, semuaPegawaiCetak, extraActivities, nomorSppd }) {
  if (!printData) return null;

  // Fungsi format NIP / NI PPPK
  const formatNip = (nip) => {
    if (!nip) return '........................................';
    const cekNip = String(nip).toUpperCase();
    if (cekNip.includes('NIP') || cekNip.includes('NI ')) {
      return nip.replace(/NIP\.?\s*/i, '').replace(/NI\s*PPPK\.?\s*/i, '');
    }
    return nip;
  };

  const formatTgl = (tgl, bln) => {
    if (!tgl || !bln) return '... ................. 202...';
    const tahun = bln.split(' ')[1] || new Date().getFullYear();
    const namaBulan = bln.split(' ')[0];
    const formatBulan = namaBulan.charAt(0).toUpperCase() + namaBulan.slice(1).toLowerCase();
    return `${String(tgl)} ${formatBulan} ${tahun}`;
  };

  const getBulanRomawi = (bln) => {
    if (!bln) return '...';
    const namaBulan = bln.split(' ')[0].toUpperCase();
    const mapBulan = {
      JANUARI: 'I', FEBRUARI: 'II', MARET: 'III', APRIL: 'IV',
      MEI: 'V', JUNI: 'VI', JULI: 'VII', AGUSTUS: 'VIII',
      SEPTEMBER: 'IX', OKTOBER: 'X', NOVEMBER: 'XI', DESEMBER: 'XII'
    };
    return mapBulan[namaBulan] || '...';
  };

  const getTahun = (bln) => {
    if (!bln) return new Date().getFullYear();
    return bln.split(' ')[1] || new Date().getFullYear();
  };

  const romawi = getBulanRomawi(printData.bulan);
  const tahun = getTahun(printData.bulan);
  
  // Data kombinasi jika ada kegiatan tambahan (multi-hari)
  const gabungkanTanggal = () => {
    let semuaKegiatan = [printData, ...(extraActivities || [])].sort((a,b) => {
      const dateA = new Date(a.tanggal ? `${getTahun(a.bulan)}-${String(a.bulan).split(' ')[0]}-${a.tanggal}` : 0);
      const dateB = new Date(b.tanggal ? `${getTahun(b.bulan)}-${String(b.bulan).split(' ')[0]}-${b.tanggal}` : 0);
      return dateA - dateB;
    });
    
    const tglArray = semuaKegiatan.map(k => String(k.tanggal).padStart(2, '0'));
    const formatBulan = printData.bulan.split(' ')[0].charAt(0).toUpperCase() + printData.bulan.split(' ')[0].slice(1).toLowerCase();
    
    return `${tglArray.join(', ')} ${formatBulan} ${tahun}`;
  };

  const gabungkanDesa = () => {
    let semuaKegiatan = [printData, ...(extraActivities || [])];
    const uniqueDesa = [...new Set(semuaKegiatan.map(k => k.desa || k.tujuan || '...........................................'))];
    return uniqueDesa.join(', ');
  };

  const kegiatanText = printData.maksudPerjalanan || printData.kegiatan || printData.namaKegiatan || '...........................................';
  const tanggalText = gabungkanTanggal();
  const tujuanText = gabungkanDesa();

  // Daftar pegawai yang akan dicetak
  const daftarPegawai = (semuaPegawaiCetak && semuaPegawaiCetak.length > 0) ? semuaPegawaiCetak : [pegawaiCetak];

  return (
    <div 
      className="hidden print:block bg-white w-full mx-auto text-black relative z-[9999]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt', lineHeight: '1.4' }}
    >
      <style>{`
        @media print {
          body, html, #root, .overflow-hidden, .h-screen { height: auto !important; overflow: visible !important; background-color: white !important; }
          @page { size: A4; margin: 15mm 20mm; }
          table { border-collapse: collapse; }
          .indent-list { padding-left: 20px; }
        }
      `}</style>

      {/* HALAMAN 1: SURAT TUGAS UTAMA */}
      <div className="w-full box-border relative min-h-[267mm]">
        
        {/* LOGO GARUDA */}
        <div className="flex justify-center mb-2 mt-4">
          <img src={garudaLogo} alt="Garuda" className="h-[2.5cm] w-auto object-contain" />
        </div>

        {/* HEADER */}
        <div className="text-center font-bold mb-6">
          <div style={{ fontSize: '13pt', marginBottom: '8px' }}>WAKIL BUPATI MINAHASA TENGGARA</div>
          <div style={{ fontSize: '12pt', marginBottom: '0px' }}>SURAT TUGAS</div>
          <div style={{ fontSize: '11pt', fontWeight: 'normal', position: 'relative', left: '-25px' }}>NOMOR : </div>
        </div>

        {/* KONTEN */}
        <table className="w-full mb-4">
          <tbody>
            <tr>
              <td className="w-28 align-top pb-2 pl-4">Dasar</td>
              <td className="w-4 align-top pb-2 text-center">:</td>
              <td className="text-justify align-top pb-2 pr-4">
                Telaahan Staf tentang Kegiatan Pelayanan Puskesmas di Luar Gedung yang bersumber Dana Alokasi Khusus (DAK) Non Fisik Bantuan Operasional Puskesmas (BOK) Tahun Anggaran {tahun} Nomor : 440/DINKES-MT/PKM-SLN/{tahun}/{romawi}/{nomorSppd ? nomorSppd : '       '}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center font-bold mb-4">
          <div>MEMERINTAHKAN</div>
        </div>

        <table className="w-full mb-4">
          <tbody>
            {daftarPegawai.map((peg, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className={`w-28 align-top pb-1 pl-4 ${index > 0 ? 'pt-2' : ''}`}>{index === 0 ? 'Kepada' : ''}</td>
                  <td className={`w-4 align-top pb-1 text-center ${index > 0 ? 'pt-2' : ''}`}>{index === 0 ? ':' : ''}</td>
                  <td className={`w-6 align-top pb-1 ${index > 0 ? 'pt-2' : ''}`}>{index + 1}.</td>
                  <td className={`w-24 align-top pb-1 ${index > 0 ? 'pt-2' : ''}`}>Nama</td>
                  <td className={`w-4 align-top pb-1 text-center ${index > 0 ? 'pt-2' : ''}`}>:</td>
                  <td className={`pb-1 ${index > 0 ? 'pt-2' : ''}`}>{peg?.nama || '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">NI PPPK</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.nip ? formatNip(peg.nip) : '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">Pangkat/Gol</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.golongan || '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">Jabatan</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.jabatanFungsional || '...........................................'}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <table className="w-full mb-10">
          <tbody>
            <tr>
              <td className="w-28 align-top pb-1 pl-4">Tanggal</td>
              <td className="w-4 align-top pb-1 text-center">:</td>
              <td colSpan="2" className="pb-1">{tanggalText}</td>
            </tr>
            <tr>
              <td className="align-top pb-1 pl-4">Untuk</td>
              <td className="align-top pb-1 text-center">:</td>
              <td className="w-6 align-top pb-1">1.</td>
              <td className="pb-1 text-justify pr-4">Pelaksanaan {kegiatanText};</td>
            </tr>
            <tr>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1">3.</td>
              <td className="pb-1 text-justify pr-4">Pembiayaan kegiatan dibebankan pada DAK Non Fisik BOK Puskesmas Silian T.A {tahun};</td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN (Halaman 1) */}
        <div className="flex justify-end pr-4 mb-4">
          <div className="w-[350px]">
            <p className="mb-0">Ratahan,</p>
            <p className="font-bold mb-24">WAKIL BUPATI MINAHASA TENGGARA</p>
            <p className="font-bold uppercase">FREDY TUDA</p>
          </div>
        </div>

        {/* FOOTER (Halaman 1) */}
        <div className="absolute bottom-4 left-0 right-0 text-center" style={{ fontSize: '9pt', lineHeight: '1.2' }}>
          Alamat: Jl. Soekarno, Kelurahan Lowu Satu, Kecamatan Ratahan<br/>
          Website: www.mitrakab.go.id, Email: minahasatenggara@gmail.com<br/>
          Ratahan 95695
        </div>
      </div>

      {/* PAGE BREAK UNTUK HALAMAN KEDUA (LAMPIRAN PARAF) */}
      <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

      {/* HALAMAN 2: LAMPIRAN KEDUA (DENGAN TABEL PARAF) */}
      <div className="w-full box-border relative min-h-[267mm]">
        
        {/* LOGO GARUDA */}
        <div className="flex justify-center mb-2 mt-4">
          <img src={garudaLogo} alt="Garuda" className="h-[2.5cm] w-auto object-contain" />
        </div>

        {/* HEADER */}
        <div className="text-center font-bold mb-6">
          <div style={{ fontSize: '13pt', marginBottom: '8px' }}>WAKIL BUPATI MINAHASA TENGGARA</div>
          <div style={{ fontSize: '12pt', marginBottom: '0px' }}>SURAT TUGAS</div>
          <div style={{ fontSize: '11pt', fontWeight: 'normal', position: 'relative', left: '-25px' }}>NOMOR : </div>
        </div>

        {/* KONTEN KEMBALI */}
        <table className="w-full mb-4">
          <tbody>
            <tr>
              <td className="w-28 align-top pb-2 pl-4">Dasar</td>
              <td className="w-4 align-top pb-2 text-center">:</td>
              <td className="text-justify align-top pb-2 pr-4">
                Telaahan Staf tentang Kegiatan Pelayanan Puskesmas di Luar Gedung yang bersumber Dana Alokasi Khusus (DAK) Non Fisik Bantuan Operasional Puskesmas (BOK) Tahun Anggaran {tahun} Nomor : 440/DINKES-MT/PKM-SLN/{tahun}/{romawi}/{nomorSppd ? nomorSppd : '       '}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center font-bold mb-4">
          <div>MEMERINTAHKAN</div>
        </div>

        <table className="w-full mb-4">
          <tbody>
            {daftarPegawai.map((peg, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className={`w-28 align-top pb-1 pl-4 ${index > 0 ? 'pt-2' : ''}`}>{index === 0 ? 'Kepada' : ''}</td>
                  <td className={`w-4 align-top pb-1 text-center ${index > 0 ? 'pt-2' : ''}`}>{index === 0 ? ':' : ''}</td>
                  <td className={`w-6 align-top pb-1 ${index > 0 ? 'pt-2' : ''}`}>{index + 1}.</td>
                  <td className={`w-24 align-top pb-1 ${index > 0 ? 'pt-2' : ''}`}>Nama</td>
                  <td className={`w-4 align-top pb-1 text-center ${index > 0 ? 'pt-2' : ''}`}>:</td>
                  <td className={`pb-1 ${index > 0 ? 'pt-2' : ''}`}>{peg?.nama || '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">NI PPPK</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.nip ? formatNip(peg.nip) : '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">Pangkat/Gol</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.golongan || '...........................................'}</td>
                </tr>
                <tr>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1"></td>
                  <td className="align-top pb-1">Jabatan</td>
                  <td className="align-top pb-1 text-center">:</td>
                  <td className="pb-1">{peg?.jabatanFungsional || '...........................................'}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <table className="w-full mb-10">
          <tbody>
            <tr>
              <td className="w-28 align-top pb-1 pl-4">Tanggal</td>
              <td className="w-4 align-top pb-1 text-center">:</td>
              <td colSpan="2" className="pb-1">{tanggalText}</td>
            </tr>
            <tr>
              <td className="align-top pb-1 pl-4">Untuk</td>
              <td className="align-top pb-1 text-center">:</td>
              <td className="w-6 align-top pb-1">1.</td>
              <td className="pb-1 text-justify pr-4">Pelaksanaan {kegiatanText};</td>
            </tr>
            <tr>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1">2.</td>
              <td className="pb-1 text-justify pr-4">Kegiatan dilaksanakan di {tujuanText};</td>
            </tr>
            <tr>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1"></td>
              <td className="align-top pb-1">3.</td>
              <td className="pb-1 text-justify pr-4">Pembiayaan kegiatan dibebankan pada DAK Non Fisik BOK Puskesmas Silian T.A {tahun};</td>
            </tr>
          </tbody>
        </table>

        {/* PARAF DAN TANDA TANGAN BERSAMPINGAN */}
        <div className="flex pr-4 mb-4 pl-4 gap-4">
          {/* TABEL PARAF (Kiri) */}
          <div className="w-[50%]">
            <table className="w-full border-collapse text-[9pt]" style={{ border: '1px solid black' }}>
              <thead>
                <tr>
                  <th className="border border-black p-1 text-center w-8 font-normal">No</th>
                  <th className="border border-black p-1 text-center font-normal">Pejabat Pengelola</th>
                  <th className="border border-black p-1 text-center w-16 font-normal">Paraf</th>
                  <th className="border border-black p-1 text-center w-24 font-normal">Ket.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 text-center">1.</td>
                  <td className="border border-black p-1 leading-tight">Wakil Bupati</td>
                  <td className="border border-black p-1 text-center text-[8pt] leading-tight" colSpan="2">Dengan Hormat<br/>Mohon di<br/>Tanda tangani</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center h-6">2.</td>
                  <td className="border border-black p-1 leading-tight">Sekretaris Daerah</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center h-6">3.</td>
                  <td className="border border-black p-1 leading-tight">Asisten Administrasi Umum</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center h-6">4.</td>
                  <td className="border border-black p-1 leading-tight">Kepala Dinas Kesehatan</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center h-6">5.</td>
                  <td className="border border-black p-1 leading-tight">Sekretaris Dinas Kesehatan</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center h-6">6.</td>
                  <td className="border border-black p-1 leading-tight">Kepala Puskesmas Silian</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
              </tbody>
            </table>
            
            {/* TEMBUSAN */}
            <div className="mt-2 text-[10pt]">
              <p className="mb-0">Tembusan :</p>
              <p className="italic mb-0">Bupati Minahasa Tenggara</p>
            </div>
          </div>

          {/* TANDA TANGAN (Kanan) */}
          <div className="w-[50%] pl-2 pt-1">
            <p className="mb-0">Ratahan,</p>
            <p className="font-bold mb-24">WAKIL BUPATI MINAHASA TENGGARA</p>
            <p className="font-bold uppercase">FREDY TUDA</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-4 left-0 right-0 text-center" style={{ fontSize: '9pt', lineHeight: '1.2' }}>
          Alamat: Jl. Soekarno, Kelurahan Lowu Satu, Kecamatan Ratahan<br/>
          Website: www.mitrakab.go.id, Email: minahasatenggara@gmail.com<br/>
          Ratahan 95695
        </div>
      </div>

    </div>
  );
}
