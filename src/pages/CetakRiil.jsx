import React from 'react';
import logoMitra from '../assets/logo mitra.png';
import logoPkm from '../assets/logopkm.png';

export default function CetakRiil({ printData, pegawaiCetak, bendahara, kpa, pptk, nomorSppd }) {
  if (!printData) return null;

  // Fungsi Format Tanggal
  const formatTgl = (tgl, bln) => {
    if (!tgl || !bln) return '... ................. 202...';
    const tahun = bln.split(' ')[1] || new Date().getFullYear();
    const namaBulan = bln.split(' ')[0];
    const formatBulan = namaBulan.charAt(0).toUpperCase() + namaBulan.slice(1).toLowerCase();
    return `${String(tgl).padStart(2, '0')} ${formatBulan} ${tahun}`;
  };

  // Fungsi Format NIP
  const formatNip = (nip) => {
    if (!nip) return 'NIP. ........................................';
    const cekNip = String(nip).toUpperCase();
    if (cekNip.includes('NIP') || cekNip.includes('NI ')) return nip;
    return `NIP. ${nip}`;
  };

  // Fungsi Format Desa
  const formatDesa = (desa) => {
    if (!desa) return '.......................................';
    const cekDesa = String(desa).toLowerCase();
    if (cekDesa.includes('desa') || cekDesa.includes('kelurahan')) return desa;
    if (cekDesa.includes('sd ') || cekDesa.includes('smp ') || cekDesa.includes('tk ') || cekDesa.includes('sdn ')) return desa;
    return `Desa ${desa}`;
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

  // Fungsi Terbilang
  const angkaTerbilang = (angka) => {
    let a = Math.abs(angka);
    const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";
    if (a < 12) hasil = " " + huruf[a];
    else if (a < 20) hasil = angkaTerbilang(a - 10) + " Belas";
    else if (a < 100) hasil = angkaTerbilang(Math.floor(a / 10)) + " Puluh" + angkaTerbilang(a % 10);
    else if (a < 200) hasil = " Seratus" + angkaTerbilang(a - 100);
    else if (a < 1000) hasil = angkaTerbilang(Math.floor(a / 100)) + " Ratus" + angkaTerbilang(a % 100);
    else if (a < 2000) hasil = " Seribu" + angkaTerbilang(a - 1000);
    else if (a < 1000000) hasil = angkaTerbilang(Math.floor(a / 1000)) + " Ribu" + angkaTerbilang(a % 1000);
    else if (a < 1000000000) hasil = angkaTerbilang(Math.floor(a / 1000000)) + " Juta" + angkaTerbilang(a % 1000000);
    return hasil.trim();
  };

  return (
    <div 
      className="hidden print:block bg-white w-full mx-auto text-black relative z-[9999] leading-tight"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', lineHeight: '1.1' }}
    >
      <style>{`
        @media print {
          body, html, #root, .overflow-hidden, .h-screen { height: auto !important; overflow: visible !important; background-color: white !important; }
          @page { size: A4; margin: 5mm 15mm; }
          table { border-collapse: collapse; }
          td, th { padding: 2px 4px !important; }
          img.logo-kop-riil {
            width: 1.8cm !important;
            height: 1.8cm !important;
            min-width: 1.8cm !important;
            min-height: 1.8cm !important;
            max-width: 1.8cm !important;
            max-height: 1.8cm !important;
            object-fit: contain !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
          }
        }
        img.logo-kop-riil {
          width: 1.8cm !important;
          height: 1.8cm !important;
          min-width: 1.8cm !important;
          min-height: 1.8cm !important;
          max-width: 1.8cm !important;
          max-height: 1.8cm !important;
          object-fit: contain !important;
          flex-shrink: 0 !important;
          display: inline-block !important;
        }
      `}</style>
      
      <div className="w-full box-border relative pt-2">
        
        {/* KOP SURAT RIIL: ARIAL, LOGO DIKUNCI 2.5cm */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-1 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <img src={logoMitra} alt="Mitra" className="logo-kop-riil" style={{ width: '1.8cm', height: '1.8cm', minWidth: '1.8cm', minHeight: '1.8cm', maxWidth: '1.8cm', maxHeight: '1.8cm', objectFit: 'contain', flexShrink: 0 }} />
          
          <div className="text-center flex-1">
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>PEMERINTAH KABUPATEN MINAHASA TENGGARA</div>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>DINAS KESEHATAN</div>
            <div style={{ fontSize: '11pt', fontWeight: 'normal' }}>UPTD PUSKESMAS SILIAN</div>
          </div>
          
          <img src={logoPkm} alt="PKM" className="logo-kop-riil" style={{ width: '1.8cm', height: '1.8cm', minWidth: '1.8cm', minHeight: '1.8cm', maxWidth: '1.8cm', maxHeight: '1.8cm', objectFit: 'contain', flexShrink: 0 }} />
        </div>

        {/* JUDUL SURAT: 16pt, Tidak Bold, Times New Roman */}
        <div className="text-center mb-1" style={{ fontSize: '14pt', fontWeight: 'normal' }}>
          DAFTAR PENGELUARAN RIIL BIAYA PERJALANAN DINAS
        </div>

        {/* INFO METADATA */}
        <table className="mb-4 w-full" style={{ fontSize: '10pt' }}>
          <tbody>
            <tr><td className="w-[170px]">Lampiran SPPD Nomor</td><td className="w-4">:</td><td>{nomorSppd ? nomorSppd : '         '}/440/DINKES-MT/PKM-SLN/SPPD-DD/{printData ? `${getBulanRomawi(printData.bulan)}-${getTahun(printData.bulan)}` : 'VI-2026'}</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>{formatTgl(printData.tanggal, printData.bulan)}</td></tr>
            <tr><td>Program</td><td>:</td><td>{printData.program}</td></tr>
            <tr><td>Kegiatan</td><td>:</td><td>{printData.kegiatan}</td></tr>
            <tr><td>Tujuan</td><td>:</td><td>{formatDesa(printData.desa)}</td></tr>
          </tbody>
        </table>

        {/* TABEL KOMPONEN BIAYA */}
        <table className="w-full border-collapse border border-black mb-4" style={{ fontSize: '10pt' }}>
          <thead>
            <tr>
              <th className="border border-black p-1 text-center w-[5%] font-normal"></th>
              <th className="border border-black p-1 text-center w-[45%] font-bold">KOMPONEN BIAYA</th>
              <th className="border border-black p-1 text-center w-[25%] font-normal">Jumlah</th>
              <th className="border border-black p-1 text-center w-[25%] font-bold">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 text-center">1</td>
              <td className="border border-black p-1">Biaya Transport</td>
              <td className="border border-black p-1 font-bold">
                <div className="flex justify-between px-1"><span>Rp</span><span>{Number(printData.dana).toLocaleString('id-ID')}</span></div>
              </td>
              <td className="border border-black p-1 text-center">ada</td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center">2</td>
              <td className="border border-black p-1">Biaya Penginapan</td>
              <td className="border border-black p-1">
                <div className="flex justify-between px-1"><span>Rp</span><span>-</span></div>
              </td>
              <td className="border border-black p-1 text-center italic">Tidak</td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center">3</td>
              <td className="border border-black p-1">Uang representasi</td>
              <td className="border border-black p-1">
                <div className="flex justify-between px-1"><span>Rp.</span><span>-</span></div>
              </td>
              <td className="border border-black p-1 text-center italic">Tidak</td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center">4</td>
              <td className="border border-black p-1">Sewa kendaraan dalam kota</td>
              <td className="border border-black p-1">
                <div className="flex justify-between px-1"><span>Rp.</span><span>-</span></div>
              </td>
              <td className="border border-black p-1 text-center italic">Tidak</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-1 font-bold pl-4">JUMLAH</td>
              <td className="border border-black p-1 font-bold">
                <div className="flex justify-between px-1"><span>Rp</span><span>{Number(printData.dana).toLocaleString('id-ID')}</span></div>
              </td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td colSpan="4" className="border border-black p-1 pl-2">
                Terbilang : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; # <span className="capitalize">{angkaTerbilang(printData.dana)} Rupiah</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN BENDAHARA & PENERIMA */}
        <div className="flex w-full mb-4" style={{ fontSize: '10pt' }}>
          <div className="w-1/2 pr-4 flex flex-col justify-between">
            <div>
              Biaya Riil sejumlah<br/>
              <span className="font-bold">Rp. {Number(printData.dana).toLocaleString('id-ID')}</span><br/>
              Bendahara Pengeluaran
            </div>
            <div className="mt-16">
              <div className="font-bold underline">{bendahara?.nama || 'Ns. Regina Tamboto, S.Kep'}</div>
              <div className="font-bold">{bendahara?.nip ? formatNip(bendahara.nip) : 'NIP. 19870925 2010012 005'}</div>
            </div>
          </div>
          
          <div className="w-1/2 pl-4 flex flex-col justify-between">
            <div>
              Silian, {formatTgl(printData.tanggal, printData.bulan)}<br/>
              Telah Menerima Uang Panjar<br/>
              Rp<br/>
              Yang Menerima,
            </div>
            <div className="mt-16">
              <div className="font-bold underline">{pegawaiCetak?.nama || '...........................................'}</div>
              <div className="font-bold">{pegawaiCetak?.nip ? formatNip(pegawaiCetak.nip) : 'NIP. .......................................'}</div>
            </div>
          </div>
        </div>

        {/* GARIS TEBAL & SPPD RAMPUNG */}
        <div className="border-t-[3px] border-black my-4"></div>
        <div className="text-center font-bold mb-4" style={{ fontSize: '10pt' }}>PERHITUNGAN SPPD RAMPUNG</div>

        <table className="mb-4 w-[60%]" style={{ fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td className="w-[220px]">Ditetapkan Sejumlah</td>
              <td className="w-4">:</td>
              <td className="w-8 font-bold">Rp</td>
              <td className="font-bold text-right">{Number(printData.dana).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Yang Telah Dibayar Semula</td>
              <td>:</td>
              <td className="font-bold">Rp</td>
              <td></td>
            </tr>
            <tr>
              <td>Sisa Kurang/Lebih</td>
              <td>:</td>
              <td className="font-bold">Rp.-</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN KPA & PPTK */}
        <div className="flex w-full text-center" style={{ fontSize: '10pt' }}>
          <div className="w-1/2 px-4 flex flex-col justify-between">
            <div>
              Mengetahui<br/>
              Kuasa Pengguna Anggaran
            </div>
            <div className="mt-16">
              <div className="font-bold">{kpa?.nama || 'dr. Winda Marshella Tanuli'}</div>
              <div className="font-bold">{kpa?.nip ? formatNip(kpa.nip) : 'NIP.198312052011022001'}</div>
            </div>
          </div>

          <div className="w-1/2 px-4 flex flex-col justify-between">
            <div>
              Menyetujui;<br/>
              PPTK
            </div>
            <div className="mt-16">
              <div className="font-bold">{pptk?.nama || 'Johnson Munaiscehe, Amd. Kep'}</div>
              <div className="font-bold">{pptk?.nip ? formatNip(pptk.nip) : 'NIP : 198907212010011001'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}