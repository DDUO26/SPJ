import React from 'react';
import logoMitra from '../../../assets/logo mitra.png';
import logoPkm from '../../../assets/logopkm.png';
import { formatDesa, formatTanggalSurat, getKepalaDesa } from '../sppdUtils';

export default function SppdHalaman2({
  perjalananList,
  daftarDesa,
  daftarSekolah
}) {
  return (
    <div className="p-6 pt-4 w-full h-[297mm] box-border relative print:break-before-page flex flex-col">
      <div className="flex items-center border-b-[3px] border-black pb-2 mb-2">
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

      <table className="w-full border-collapse border border-black text-[10px] mb-2 flex-shrink-0">
        <tbody>
          <tr>
            <td className="border border-black p-2 px-3 align-top w-1/2">
              <table className="w-full">
                <tbody>
                  <tr><td className="w-24 pb-0.5 font-bold">I. Tiba di</td><td>: .......................................</td></tr>
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
                  <tr><td className="pb-0.5">Ke</td><td>: {formatDesa(perjalananList[0]?.desaTujuan)}</td></tr>
                  <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(perjalananList[0]?.tanggal)}</td></tr>
                  <tr><td className="pb-4">Kepala</td><td>: Puskesmas Silian Raya</td></tr>
                  <tr><td colSpan="2" className="text-center pt-4"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></td></tr>
                </tbody>
              </table>
            </td>
          </tr>

          {perjalananList.map((p, idx) => {
            const isLast = idx === perjalananList.length - 1;
            const nextP = perjalananList[idx + 1];
            const romawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
            return (
              <tr key={p.id}>
                <td className="border border-black p-2 px-3 align-top w-1/2">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5 font-bold">{romawi[idx + 2]}. Tiba di</td><td>: {formatDesa(p.desaTujuan)}</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(p.tanggal)}</td></tr>
                      <tr><td className="pb-6">Kepala</td><td>: {formatDesa(p.desaTujuan)}</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4">{getKepalaDesa(p.desaTujuan, daftarDesa, daftarSekolah)}</td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="border border-black p-2 px-3 align-top w-1/2">
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-24 pb-0.5">Berangkat dari</td><td>: {formatDesa(p.desaTujuan)}</td></tr>
                      <tr><td className="pb-0.5">Ke</td><td>: {isLast ? 'Puskesmas Silian Raya' : formatDesa(nextP?.desaTujuan)}</td></tr>
                      <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(isLast ? p.tanggal : nextP?.tanggal)}</td></tr>
                      <tr><td className="pb-4">Kepala</td><td>: {formatDesa(p.desaTujuan)}</td></tr>
                      <tr><td colSpan="2" className="text-center pt-4">{getKepalaDesa(p.desaTujuan, daftarDesa, daftarSekolah)}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            );
          })}

          <tr>
            <td className="border border-black p-2 px-3 align-top w-1/2">
              <table className="w-full">
                <tbody>
                  <tr><td className="w-24 pb-0.5 font-bold">{['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][perjalananList.length + 2]}. Tiba di</td><td>: Puskesmas Silian Raya</td></tr>
                  <tr><td className="pb-0.5">Pada Tanggal</td><td>: {formatTanggalSurat(perjalananList[perjalananList.length - 1]?.tanggal)}</td></tr>
                  <tr><td className="pb-6">Kepala</td><td>: Puskesmas Silian Raya</td></tr>
                  <tr><td colSpan="2" className="text-center pt-4"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></td></tr>
                </tbody>
              </table>
            </td>
            <td className="border border-black p-2 px-3 align-top w-1/2 bg-slate-50">
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2 mb-1 flex-shrink-0">
        <h4 className="font-bold mb-1 text-[11px]">{['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][perjalananList.length + 2]}. Catatan Lain-lain :</h4>
        <h4 className="font-bold mb-0.5 text-[11px]">{['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][perjalananList.length + 3]}. PERHATIAN</h4>
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
  );
}
