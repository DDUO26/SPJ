export const diceCoefficient = (str1, str2) => {
  const s1 = String(str1).toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = String(str2).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;
  
  let bigrams1 = new Set();
  for (let i = 0; i < s1.length - 1; i++) {
    bigrams1.add(s1.substring(i, i+2));
  }
  
  let match = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bg = s2.substring(i, i+2);
    if (bigrams1.has(bg)) {
      match++;
    }
  }
  
  return (2.0 * match) / (s1.length - 1 + s2.length - 1);
};

export const cleanNameForMatch = (name) => {
  if (!name) return '';
  // Ambil nama sebelum koma pertama (hilangkan gelar Suffix)
  let n = String(name).split(',')[0];
  // Hilangkan gelar Prefix
  n = n.replace(/^(dr\.|drg\.|ns\.|bd\.|hj\.|h\.)\s*/i, '');
  return n.trim().toLowerCase();
};

export const findPegawaiPintar = (rawName, daftarPegawai) => {
  if (!rawName || !daftarPegawai || !Array.isArray(daftarPegawai)) return { nama: rawName };
  
  const targetClean = cleanNameForMatch(rawName);
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const pegawai of daftarPegawai) {
    const dbClean = cleanNameForMatch(pegawai.nama);
    
    // Exact match on cleaned name
    if (dbClean === targetClean) {
      return pegawai;
    }
    
    // Substring match
    if (dbClean.includes(targetClean) || targetClean.includes(dbClean)) {
      const score = 0.9;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = pegawai;
      }
    }
    
    // Fuzzy match
    const score = diceCoefficient(targetClean, dbClean);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = pegawai;
    }
  }
  
  // Jika kemiripan >= 50%, gunakan data dari Master Data
  if (highestScore >= 0.5) {
    return bestMatch;
  }
  
  // Fallback
  return { nama: rawName };
};
