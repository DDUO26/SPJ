import React from 'react';

export const formatTanggalSurat = (tgl) => {
  if (!tgl) return '... ................. 202...';
  const date = new Date(tgl);
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

export const getBulanRomawiDariDate = (tgl) => {
  if (!tgl) return 'VI';
  const date = new Date(tgl);
  const m = date.getMonth();
  const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romawi[m] || 'VI';
};

export const getTahunDariDate = (tgl) => {
  if (!tgl) return '2026';
  return new Date(tgl).getFullYear();
};

export const formatNip = (nip) => {
  if (!nip) return 'NIP. ..................................................';
  const cekNip = String(nip).toUpperCase();
  return cekNip.includes('NIP') ? nip : `NIP. ${nip}`;
};

export const formatDesa = (desa) => {
  if (!desa) return '.......................................';
  const cekDesa = String(desa).toLowerCase();
  if (cekDesa.includes('desa') || cekDesa.includes('kelurahan')) return desa;
  if (cekDesa.includes('sd ') || cekDesa.includes('smp ') || cekDesa.includes('tk ') || cekDesa.includes('sdn ')) return desa;
  return `Desa ${desa}`;
};

export const normalizeDesaName = (name) => {
  if (!name) return '';
  return String(name).toLowerCase().replace(/desa/g, '').replace(/kelurahan/g, '').trim();
};

export const hitungLamaPerjalanan = (perjalananList) => {
  const uniqueDates = new Set(perjalananList.map(p => p.tanggal).filter(Boolean));
  const length = uniqueDates.size;
  if (length === 0) return '1 (Satu) Hari';
  const words = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima'];
  return `${length} (${words[length] || length}) Hari`;
};
export const getKepalaDesa = (namaDesa, daftarDesa, daftarSekolah) => {
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

