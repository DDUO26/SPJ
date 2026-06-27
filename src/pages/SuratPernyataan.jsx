import React from 'react';

export default function SuratPernyataan({ printData, pegawaiCetak, nomorSppd }) {
  if (!printData) return null;

  // Fungsi format NIP / NI PPPK
  const formatNip = (nip) => {
    if (!nip) return 'NIP. ........................................';
    const cekNip = String(nip).toUpperCase();
    if (cekNip.includes('NIP') || cekNip.includes('NI ')) return nip;
    
    // Asumsi: jika panjangnya 18 digit dan tidak ada spasi, format sebagai NIP atau NI PPPK.
    // Tapi karena sederhana, tambahkan awalan sesuai kebutuhan (Bisa NIP atau NI PPPK)
    // Di sini kita biarkan 'NIP. ' secara default jika tidak ada, tapi jika user mau
    // deteksi NI PPPK, bisa ditambahkan logika. Untuk amannya, tampilkan apa adanya 
    // jika sudah ada huruf, atau kasih prefix "NIP. "
    return `NIP. ${nip}`;
  };

  const formatTgl = (tgl, bln) => {
    if (!tgl || !bln) return '... ................. 202...';
    const tahun = bln.split(' ')[1] || new Date().getFullYear();
    const namaBulan = bln.split(' ')[0];
    const formatBulan = namaBulan.charAt(0).toUpperCase() + namaBulan.slice(1).toLowerCase();
    return `${String(tgl).padStart(2, '0')} ${formatBulan} ${tahun}`;
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

  return (
    <div 
      className="hidden print:block bg-white w-full mx-auto text-black relative z-[9999]"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '11pt', lineHeight: '1.5' }}
    >
      <style>{`
        @media print {
          body, html, #root, .overflow-hidden, .h-screen { height: auto !important; overflow: visible !important; background-color: white !important; }
          @page { size: A4; margin: 20mm 20mm; }
          table { border-collapse: collapse; }
          .indent-list { padding-left: 20px; }
        }
      `}</style>
      
      <div className="w-full box-border relative pt-4 px-4">
        
        {/* JUDUL */}
        <div className="text-center mb-6">
          <span 
            className="font-bold underline" 
            style={{ fontSize: '12pt' }}
          >
            SURAT PERNYATAAN TANGGUNG JAWAB PERJALANAN DINAS
          </span>
        </div>

        {/* BODY */}
        <div className="text-justify mb-4">
          Yang bertanda tangan dibawah ini :
        </div>

        {/* DATA PEGAWAI */}
        <table className="mb-6 w-full" style={{ fontSize: '11pt' }}>
          <tbody>
            <tr>
              <td className="w-[180px] pb-1">Nama</td>
              <td className="w-4 pb-1">:</td>
              <td className="pb-1">{pegawaiCetak?.nama || '...........................................'}</td>
            </tr>
            <tr>
              <td className="pb-1">NI PPPK / NIP</td>
              <td className="pb-1">:</td>
              <td className="pb-1">{pegawaiCetak?.nip ? formatNip(pegawaiCetak.nip).replace('NIP. ', '') : '...........................................'}</td>
            </tr>
            <tr>
              <td className="pb-1 align-top">Pangkat/Golongan</td>
              <td className="pb-1 align-top">:</td>
              <td className="pb-1">{pegawaiCetak?.golongan || '...........................................'}</td>
            </tr>
            <tr>
              <td className="pb-1 align-top">Jabatan</td>
              <td className="pb-1 align-top">:</td>
              <td className="pb-1">{pegawaiCetak?.jabatanFungsional || '...........................................'}</td>
            </tr>
          </tbody>
        </table>

        {/* PERNYATAAN */}
        <div className="text-justify mb-2">
          Dengan ini menyatakan dengan sesungguhnya bahwa :
        </div>

        <table className="w-full mb-4" style={{ fontSize: '11pt' }}>
          <tbody>
            <tr>
              <td className="align-top w-6">1)</td>
              <td className="text-justify pb-1">
                Sehubungan Dengan Surat Perintah Tugas Nomor : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/SPT/DD/WB/{romawi}-{tahun}
              </td>
            </tr>
            <tr>
              <td className="align-top">2)</td>
              <td className="text-justify pb-1">
                Surat Perjalanan Dinas Nomor : {nomorSppd ? nomorSppd : '          '}/440/DINKES-MT/PKM-SLN/SPPD-DD/{romawi}-{tahun} Tanggal {formatTgl(printData.tanggal, printData.bulan)}, maka saya telah melakukan perjalanan dinas dimaksud.
              </td>
            </tr>
            <tr>
              <td className="align-top">3)</td>
              <td className="text-justify pb-1">
                Saya bertanggung jawab sepenuhnya atas kebenaran seluruh penggunaan biaya perjalanan dinas, maka sehubungan dengan hal tersebut saya menyatakan bahwa saya tidak melakukan :
                <table className="w-full mt-1">
                  <tbody>
                    <tr>
                      <td className="align-top w-6">a)</td>
                      <td className="text-justify pb-1">Pemalsuan Dokumen</td>
                    </tr>
                    <tr>
                      <td className="align-top">b)</td>
                      <td className="text-justify pb-1">Tindakan berupa menaikan dari harga sebenarnya (Mark-up)</td>
                    </tr>
                    <tr>
                      <td className="align-top">c)</td>
                      <td className="text-justify pb-1">Perjalanan dinas rangkap (dua kali atau lebih)</td>
                    </tr>
                    <tr>
                      <td className="align-top">d)</td>
                      <td className="text-justify pb-1">Hal-hal lain yang berakibat kerugian Daerah/Negara sehubungan dengan pelaksanaan perjalanan dinas dimaksud</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-justify mb-8" style={{ textIndent: '40px' }}>
          Demikian pernyataan ini saya buat dengan sesungguhnya, dan apabila dikemudian hari terbukti pernyataan ini tidak benar, saya bersedia menerima sanksi sesuai peraturan perundang-undangan.
        </div>

        {/* TANDA TANGAN */}
        <div className="flex justify-end w-full">
          <div className="w-[300px] text-center">
            <div className="mb-20 font-bold">
              Silian , {formatTgl(printData.tanggal, printData.bulan)}<br/>
              Yang Membuat Pernyataan,
            </div>
            <div>
              <div className="font-bold">{pegawaiCetak?.nama || '...........................................'}</div>
              <div className="font-bold">{pegawaiCetak?.nip ? formatNip(pegawaiCetak.nip).replace('NIP.', 'NI PPPK / NIP.') : 'NI PPPK / NIP. .......................................'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
