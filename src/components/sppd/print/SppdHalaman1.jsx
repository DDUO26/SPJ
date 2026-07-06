import React from 'react';
import logoMitra from '../../../assets/logo mitra.png';
import logoPkm from '../../../assets/logopkm.png';
import { getBulanRomawiDariDate, getTahunDariDate, formatDesa, formatTanggalSurat, hitungLamaPerjalanan } from '../sppdUtils';

export default function SppdHalaman1({
  perjalananList,
  pegawaiTerpilih,
  maksudPerjalanan,
  alatAngkut
}) {
  return (
    <div className="p-8 pb-12 w-full h-[297mm] box-border relative">
      <div className="flex items-center border-b-[3px] border-black pb-2 mb-3">
        <div className="w-[2.25cm] shrink-0 flex justify-center">
          <img src={logoMitra} alt="Logo Mitra" className="h-[2.25cm] w-[2.25cm] object-contain grayscale print:grayscale-0" />
        </div>
        <div className="flex-1 text-center font-serif">
          <h2 className="font-bold uppercase tracking-wide leading-tight" style={{ fontSize: '14pt' }}>PEMERINTAH KABUPATEN MINAHASA TENGGARA</h2>
          <h2 className="font-bold uppercase tracking-wide leading-tight mt-0.5" style={{ fontSize: '20pt' }}>DINAS KESEHATAN</h2>
          <h1 className="font-bold uppercase tracking-wide leading-tight mt-0.5" style={{ fontSize: '20pt' }}>UPTD PUSKESMAS SILIAN</h1>
          <p className="font-bold mt-1" style={{ fontSize: '10pt' }}>Jl. Puskesmas, Desa Silian Satu Kecamatan. Silian Raya</p>
          <p className="font-normal" style={{ fontSize: '10pt' }}>Telp : 081524737716 &nbsp;&nbsp;Email : uptdpuskesmassilian@gmail.com &nbsp;&nbsp;Kode Pos : 95696</p>
        </div>
        <div className="w-[2.25cm] shrink-0 flex justify-center">
          <img src={logoPkm} alt="Logo PKM" className="h-[2.25cm] w-[2.25cm] object-contain grayscale print:grayscale-0" />
        </div>
      </div>

      <div className="w-full mb-6">
        <div className="flex justify-end mb-4">
          <table className="text-[11px]">
            <tbody>
              <tr><td className="pr-2">Lembar Ke</td><td>:</td></tr>
              <tr><td className="pr-2">Kode No</td><td>:</td></tr>
              <tr><td className="pr-2">Nomor</td><td>: DD/{perjalananList[0]?.tanggal ? `${getBulanRomawiDariDate(perjalananList[0].tanggal)}-${getTahunDariDate(perjalananList[0].tanggal)}` : 'VI-2026'}/440/DINKES-MT/PKM-SLN/SPPD-</td></tr>
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
            <td className="border border-black p-2 uppercase">Kepala Puskesmas Silian Raya<br/>Kabupaten Minahasa Tenggara</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">2</td>
            <td className="border border-black p-2">Nama/NIP Pegawai yang melaksanakan perjalanan dinas</td>
            <td className="border border-black p-2">
              {pegawaiTerpilih ? (pegawaiTerpilih.nama.includes(',') ? pegawaiTerpilih.nama.split(',')[0].toUpperCase() + ',' + pegawaiTerpilih.nama.substring(pegawaiTerpilih.nama.indexOf(',') + 1) : pegawaiTerpilih.nama.toUpperCase()) : '..................................................'}<br/>
              {pegawaiTerpilih?.nip || ''}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center align-top">3</td>
            <td className="border border-black p-2 align-top">
              a. Pangkat/Golongan<br/>
              b. Jabatan / Instansi<br/>
              c. Tingkat Biaya Perjalanan Dinas
            </td>
            <td className="border border-black p-2 align-top">
              a. {pegawaiTerpilih ? pegawaiTerpilih.golongan?.toUpperCase() : '......................................'}<br/>
              b. {pegawaiTerpilih ? pegawaiTerpilih.jabatanFungsional?.toUpperCase() : '......................................'}<br/>
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
              a. Tempat Berangkat<br/>
              b. Tempat Tujuan
            </td>
            <td className="border border-black p-2 align-top">
              a. Puskesmas Silian Raya<br/>
              b. {perjalananList.map(p => formatDesa(p.desaTujuan)).filter(Boolean).join(', ')}
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
              a. {hitungLamaPerjalanan(perjalananList)}<br/>
              b. {formatTanggalSurat(perjalananList[0]?.tanggal)}<br/>
              c. {formatTanggalSurat(perjalananList[perjalananList.length - 1]?.tanggal)}
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
              Pembebanan Anggaran<br/>
              a. Instansi<br/>
              b. Akun
            </td>
            <td className="border border-black p-2 align-top">
              DAK Non Fisik-Dana BOK-BOK Puskesmas<br/>
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
              <tr><td className="pr-4">Pada Tanggal</td><td>: {formatTanggalSurat(perjalananList[0]?.tanggal)}</td></tr>
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
  );
}
