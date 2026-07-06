import React from 'react';
import SppdHalaman1 from './print/SppdHalaman1';
import SppdHalaman2 from './print/SppdHalaman2';

export default function SppdPrint({
  perjalananList,
  pegawaiTerpilih,
  maksudPerjalanan,
  alatAngkut,
  daftarDesa,
  daftarSekolah
}) {
  return (
    <div className="bg-white w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-lg rounded-lg print:shadow-none print:rounded-none text-black font-serif text-[12px] leading-relaxed relative print:w-[210mm] print:h-[297mm] print:absolute print:top-0 print:left-0 print:z-50 print:bg-white overflow-hidden">
      <SppdHalaman1 
        perjalananList={perjalananList}
        pegawaiTerpilih={pegawaiTerpilih}
        maksudPerjalanan={maksudPerjalanan}
        alatAngkut={alatAngkut}
      />
      
      <SppdHalaman2 
        perjalananList={perjalananList}
        daftarDesa={daftarDesa}
        daftarSekolah={daftarSekolah}
      />
    </div>
  );
}
