import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, RefreshCw, ChevronDown, Bell, Calendar, Filter, Users, CheckCircle, AlertCircle, FileX, Wallet, XCircle
} from 'lucide-react';

import { ambilSemuaPegawaiDb } from '../services/pegawaiService';
import { ambilSemuaKegiatanDb } from '../services/kegiatanService';
import { ambilSemuaSpjDb, ambilSemuaCatatanPegawaiDb } from '../services/spjService';

const CHECKLIST_ITEMS = [
  { key: 'sppd', label: 'SPPD' },
  { key: 'suratTugas', label: 'Surat Tugas' },
  { key: 'daftarHadir', label: 'Daftar Hadir (Opsional)', optional: true },
  { key: 'dokumentasi', label: 'Dokumentasi' },
  { key: 'riilCost', label: 'Riil Cost' },
  { key: 'kwitansi', label: 'Kwitansi (Opsional)', optional: true },
  { key: 'suratPernyataan', label: 'Surat Pernyataan' },
  { key: 'laporan', label: 'Laporan' },
];

const BULAN_FULL = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

export default function HasilPemeriksaan() {
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBulan, setSelectedBulan] = useState('ALL');
  const [selectedJabatan, setSelectedJabatan] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('Terbanyak Kurang');
  
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('Daftar Kelengkapan');
  const [detailKekurangan, setDetailKekurangan] = useState(null);

  useEffect(() => {
    tarikSemuaData();
  }, []);

  const tarikSemuaData = async () => {
    setLoading(true);
    try {
      const [peg, keg, spj] = await Promise.all([
        ambilSemuaPegawaiDb(),
        ambilSemuaKegiatanDb(),
        ambilSemuaSpjDb(),
      ]);
      setDaftarPegawai(peg);
      setDaftarKegiatan(keg);
      setDaftarSpj(spj);
    } catch (err) {
      console.error('Gagal menarik data:', err);
    }
    setLoading(false);
  };

  // Smart split: find registered pegawai names inside the raw string
  // instead of naive split(',') which breaks credentials like "S.Kep", "Amd,Kep"
  const splitPegawaiNames = (pegawaiStr) => {
    if (!pegawaiStr) return [];
    const str = String(pegawaiStr).trim();
    if (!str) return [];
    
    const results = [];
    let remaining = str.toLowerCase();
    
    // Sort by name length descending so longest match wins first
    const sortedPegawai = [...daftarPegawai].sort((a, b) => b.nama.length - a.nama.length);
    
    for (const peg of sortedPegawai) {
      const pegLower = peg.nama.toLowerCase().trim();
      const idx = remaining.indexOf(pegLower);
      if (idx !== -1) {
        results.push(peg.nama);
        // Blank out matched portion to avoid double-matching
        remaining = remaining.substring(0, idx) + ' '.repeat(pegLower.length) + remaining.substring(idx + pegLower.length);
      }
    }
    
    // Fallback: if no exact match, try matching by significant first name words
    if (results.length === 0) {
      const words = str.split(/[,\s]+/).filter(w => w.length > 3 && !/^(amd|skm|sst|str|kep|keb|s\.kep|ns|m\.p\.h|amkl|amkg|skg|dr|drg)$/i.test(w));
      for (const word of words) {
        const match = daftarPegawai.find(p => {
          const pNameWords = p.nama.toLowerCase().split(/[ \-.,]+/);
          return pNameWords.some(w => w.length > 3 && w === word.toLowerCase());
        });
        if (match && !results.includes(match.nama)) {
          results.push(match.nama);
        }
      }
    }
    
    return results;
  };

  const combinedSpjList = useMemo(() => {
    const list = [];
    
    // Create a pool of Real SPJs grouped by Person_Date
    const realSpjPool = {};
    daftarSpj.forEach(s => {
      const key = `${s.pegawaiNama}_${s.tanggal}`;
      if (!realSpjPool[key]) realSpjPool[key] = [];
      realSpjPool[key].push(s);
    });

    daftarKegiatan.forEach(keg => {
      if (!keg.pegawai) return;
      const pegawaiNames = splitPegawaiNames(keg.pegawai);
      let datesToCreate = [];
      if (keg.bulan && keg.tanggal) {
        const blnSplit = String(keg.bulan).split(' ');
        const namaBulan = blnSplit[0].toUpperCase();
        const thn = blnSplit[1] || new Date().getFullYear();
        const monthIndex = BULAN_FULL.findIndex(b => b === namaBulan) + 1;
        
        if (monthIndex > 0) {
          const m = String(monthIndex).padStart(2, '0');
          // Extract any valid day numbers (1-31) from the text, handling "18 JUNI 2026" or "10 s.d 11"
          const hariArray = (String(keg.tanggal).match(/\d+/g) || []).filter(h => {
             const num = Number(h);
             return num >= 1 && num <= 31;
          });
          hariArray.forEach(hari => {
            const d = String(hari).padStart(2, '0');
            datesToCreate.push(`${thn}-${m}-${d}`);
          });
        }
      }

      datesToCreate.forEach(dateString => {
        pegawaiNames.forEach(namaResmi => {
          if (!namaResmi) return;
          const key = `${namaResmi}_${dateString}`;
          
          if (realSpjPool[key] && realSpjPool[key].length > 0) {
            // Consume one Real SPJ from the pool
            const realSpj = realSpjPool[key].shift();
            list.push({ ...realSpj, isVirtualMerged: true });
          } else {
            // No Real SPJ available, push Virtual SPJ
            list.push({
              id: `virtual_${keg.id}_${namaResmi}_${dateString}`,
              pegawaiNama: namaResmi,
              tanggal: dateString,
              program: keg.program || '(Umum)',
              anggaran: Number(keg.dana) || 0,
              checklist: {},
              catatan: '',
              isVirtual: true
            });
          }
        });
      });
    });

    // Add any remaining Real SPJs that didn't match a Virtual SPJ
    Object.values(realSpjPool).forEach(spjs => {
      spjs.forEach(spj => {
        list.push(spj);
      });
    });

    return list;
  }, [daftarSpj, daftarKegiatan, daftarPegawai]);

  const listBulanOptions = useMemo(() => {
    const setBulan = new Set();
    combinedSpjList.forEach(spj => {
      if (spj.tanggal) {
        const tgl = new Date(spj.tanggal);
        if (!isNaN(tgl.getTime())) {
          setBulan.add(`${BULAN_FULL[tgl.getMonth()]} ${tgl.getFullYear()}`);
        }
      }
    });
    const arr = [...setBulan].sort((a,b) => {
         const [blnA, thnA] = a.split(' ');
         const [blnB, thnB] = b.split(' ');
         if (thnA !== thnB) return Number(thnB) - Number(thnA); 
         return BULAN_FULL.indexOf(blnA) - BULAN_FULL.indexOf(blnB);
    });
    return arr;
  }, [combinedSpjList]);

  const listJabatanOptions = useMemo(() => {
    const setJab = new Set();
    daftarPegawai.forEach(p => {
      if (p.jabatanFungsional) setJab.add(p.jabatanFungsional);
    });
    return [...setJab].sort();
  }, [daftarPegawai]);

  const pegawaiStats = useMemo(() => {
     let filteredSpj = combinedSpjList;
     if (selectedBulan !== 'ALL') {
       filteredSpj = filteredSpj.filter(spj => {
          if (!spj.tanggal) return false;
          const tgl = new Date(spj.tanggal);
          if (isNaN(tgl.getTime())) return false;
          const blnStr = `${BULAN_FULL[tgl.getMonth()]} ${tgl.getFullYear()}`;
          return blnStr === selectedBulan;
       });
     }

     const result = daftarPegawai.map(peg => {
        const mySpj = filteredSpj.filter(s => s.pegawaiNama === peg.nama);
        let totalKegiatan = mySpj.length;
        let totalDana = 0;
        let spjKurang = 0;
        let spjBelum = 0;
        let spjLengkap = 0;
        
        let hasCatatan = false;
         
        mySpj.forEach(spj => {
           totalDana += Number(spj.anggaran) || 0;
           const cl = spj.checklist || {};
           const isLengkap = cl.sppd && cl.suratTugas && cl.dokumentasi && cl.riilCost && cl.suratPernyataan && cl.laporan;
           const filledAny = Object.values(cl).some(v => v);
           
           if (isLengkap) spjLengkap++;
           else if (filledAny) spjKurang++;
           else spjBelum++;

           if (spj.catatan && spj.catatan.trim() !== '') hasCatatan = true;
        });

        let persentase = totalKegiatan === 0 ? 0 : Math.round((spjLengkap / totalKegiatan) * 100);
        
        let status = 'Lengkap';
        if (spjKurang > 0) status = 'Perlu Revisi';
        if (spjBelum > 0 && spjLengkap === 0) status = 'Belum Lengkap';

        if (totalKegiatan === 0) {
           status = 'Tidak Ada Kegiatan';
           spjKurang = 0;
           spjBelum = 0;
           persentase = 0;
        }

        return {
           id: peg.id,
           nama: peg.nama,
           jabatan: peg.jabatanFungsional || peg.golongan || 'Pegawai',
           totalKegiatan,
           totalDana,
           berkasKurang: spjKurang,
           belumInput: spjBelum,
           persentase,
           status,
           hasCatatan
        };
     });

     return result.filter(r => r.totalKegiatan > 0 || selectedBulan === 'ALL');
  }, [combinedSpjList, daftarPegawai, selectedBulan]);

  const filteredPegawaiStats = useMemo(() => {
     let res = pegawaiStats;
     if (selectedJabatan !== 'ALL') {
        res = res.filter(p => p.jabatan === selectedJabatan);
     }
     if (searchQuery) {
        res = res.filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase()));
     }

     if (sortOrder === 'Terbanyak Kurang') {
        res = res.sort((a,b) => (b.berkasKurang + b.belumInput) - (a.berkasKurang + a.belumInput));
     } else if (sortOrder === 'Paling Lengkap') {
        res = res.sort((a,b) => (a.berkasKurang + a.belumInput) - (b.berkasKurang + b.belumInput));
     }

     return res;
  }, [pegawaiStats, selectedJabatan, searchQuery, sortOrder]);

  const summary = useMemo(() => {
      let lengkap = 0;
      let perluRevisi = 0;
      let belumLengkap = 0;
      let totalDana = 0;
      
      const activePegawai = pegawaiStats.filter(p => p.totalKegiatan > 0);

      activePegawai.forEach(p => {
         if (p.status === 'Lengkap') lengkap++;
         else if (p.status === 'Perlu Revisi') perluRevisi++;
         else if (p.status === 'Belum Lengkap') belumLengkap++;
         
         totalDana += p.totalDana;
      });

      const totalPeg = activePegawai.length;

      return {
         totalPegawai: daftarPegawai.length,
         aktifPegawai: totalPeg,
         lengkap,
         pctLengkap: totalPeg ? ((lengkap/totalPeg)*100).toFixed(1) : 0,
         perluRevisi,
         pctPerluRevisi: totalPeg ? ((perluRevisi/totalPeg)*100).toFixed(1) : 0,
         belumLengkap,
         pctBelumLengkap: totalPeg ? ((belumLengkap/totalPeg)*100).toFixed(1) : 0,
         totalDana,
         realisasiPct: 64.7 // Static per mockup reference
      };
  }, [pegawaiStats, daftarPegawai]);

  const getInitials = (name) => {
    if (!name) return 'U';
    let cleanName = name.replace(/^(dr\.|drg\.|ns\.)\s*/i, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500', 'bg-cyan-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const renderModal = () => {
    if (!selectedPegawaiDetail) return null;
    const peg = selectedPegawaiDetail;
    const mySpj = combinedSpjList.filter(s => s.pegawaiNama === peg.nama && (selectedBulan === 'ALL' || (s.tanggal && `${BULAN_FULL[new Date(s.tanggal).getMonth()]} ${new Date(s.tanggal).getFullYear()}` === selectedBulan)));
    
    // Details
    const dbPeg = daftarPegawai.find(p => p.nama === peg.nama) || {};
    
    // Kelengkapan Items
    const kelengkapanList = CHECKLIST_ITEMS.map((item, idx) => {
       const checkedSpjs = mySpj.filter(s => s.checklist && s.checklist[item.key]);
       const missingSpjs = mySpj.filter(s => !(s.checklist && s.checklist[item.key]));
       
       const isLengkap = checkedSpjs.length === peg.totalKegiatan && peg.totalKegiatan > 0;
       return {
         no: idx + 1,
         key: item.key,
         jenis: item.label,
         status: isLengkap ? 'Lengkap' : 'Kurang',
         jumlah: `${checkedSpjs.length} / ${peg.totalKegiatan}`,
         keterangan: isLengkap ? `Semua kegiatan memiliki ${item.label}` : `${missingSpjs.length} kegiatan belum memiliki ${item.label}`,
         missingSpjs: missingSpjs
       };
    });

    const totalRequired = peg.totalKegiatan;
    const totalChecked = totalRequired - peg.berkasKurang - peg.belumInput;
    const overallPct = peg.persentase;
    const overallStatus = overallPct === 100 ? 'Lengkap' : 'Belum Lengkap';
    const statusBg = overallPct === 100 ? 'bg-emerald-500' : 'bg-rose-500';

    // 4 Cards
    let spjLengkap = 0;
    let spjKurang = 0;
    let spjBelum = 0;
    let spjRevisi = 0;
    mySpj.forEach(s => {
       const cl = s.checklist || {};
       const isLengkap = cl.sppd && cl.suratTugas && cl.dokumentasi && cl.riilCost && cl.suratPernyataan && cl.laporan;
       const filledAny = Object.values(cl).some(v => v);
       
       if (isLengkap) spjLengkap++;
       else if (filledAny) spjKurang++;
       else spjBelum++;
       
       if (s.catatan && s.catatan.trim() !== '') spjRevisi++;
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
        <div className="bg-slate-50 rounded-[2rem] w-full max-w-6xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
           {/* Modal Header */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-3 sm:gap-0 bg-white border-b border-slate-100 relative shrink-0">
              <div className="flex items-center gap-3 pr-10">
                 <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center font-bold text-lg sm:text-xl ${getAvatarColor(peg.nama)} shadow-sm shrink-0`}>
                    {getInitials(peg.nama)}
                 </div>
                 <div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-800 leading-tight mb-0.5">{peg.nama}</h3>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-tight">{peg.jabatan} • <span className="font-bold text-indigo-600 uppercase">{selectedBulan === 'ALL' ? 'Semua Bulan' : selectedBulan}</span></p>
                 </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pr-0 sm:pr-14">
                 <button className="flex-1 sm:flex-none justify-center px-3 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm">
                    <AlertCircle size={14} /> Cetak Ringkasan
                 </button>
              </div>
              <button onClick={() => { setSelectedPegawaiDetail(null); setDetailKekurangan(null); }} className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-400 transition-colors shadow-sm">
                 <XCircle size={18}/>
              </button>
           </div>

           {/* Modal Body */}
           <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6 scrollbar-thin">
              {/* Sidebar Kiri */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
                 {/* Status Kelengkapan Merah/Hijau */}
                 <div className={`rounded-3xl p-6 text-white shadow-lg ${statusBg}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className="text-xs font-semibold opacity-90 mb-1">Status Kelengkapan</p>
                          <div className="bg-white/20 px-3 py-1.5 rounded-full inline-block text-sm font-bold backdrop-blur-sm shadow-sm">
                             {overallStatus}
                          </div>
                       </div>
                       <div className="w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center relative">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                             <circle cx="32" cy="32" r="28" fill="transparent" stroke="white" strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * overallPct) / 100} className="transition-all duration-1000" />
                          </svg>
                          <span className="text-sm font-bold relative z-10 leading-none mb-0.5">{overallPct}%</span>
                          <span className="text-[7px] font-medium relative z-10 leading-none">Lengkap</span>
                       </div>
                    </div>
                    <p className="text-xs font-medium mb-5 opacity-90">{totalChecked} dari {totalRequired} SPJ kegiatan lengkap</p>
                    
                    <div className="bg-white rounded-2xl p-4 flex justify-between text-slate-800 shadow-sm">
                       <div className="text-center">
                          <p className="text-lg font-black">{peg.totalKegiatan}</p>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Total Kegiatan</p>
                       </div>
                       <div className="text-center px-4 border-x border-slate-100">
                          <p className="text-sm font-black text-indigo-600 mt-1">Rp {peg.totalDana.toLocaleString('id-ID')}</p>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">Total Dana SPJ</p>
                       </div>
                       <div className="text-center">
                          <p className="text-lg font-black text-rose-500">{peg.berkasKurang + peg.belumInput}</p>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">SPJ Belum Lengkap</p>
                       </div>
                    </div>
                 </div>

                 {/* Informasi Pegawai */}
                 <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                       <Users size={18} className="text-slate-400" /> Informasi Pegawai
                    </h4>
                    <div className="space-y-4 text-sm">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">NIP / NI PPPK</p>
                          <p className="font-semibold text-slate-700">{dbPeg.nip || '-'}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Golongan</p>
                          <p className="font-semibold text-slate-700">{dbPeg.golongan || '-'}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Jabatan</p>
                          <p className="font-semibold text-slate-700">{dbPeg.jabatanFungsional || '-'}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">No. HP</p>
                          <p className="font-semibold text-slate-700">{dbPeg.noHp || '-'}</p>
                       </div>
                    </div>
                    <button className="mt-6 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between px-4 hover:bg-slate-100 transition-colors">
                       Riwayat Verifikasi <ChevronDown size={14} className="-rotate-90" />
                  </button>
                 </div>
              </div>

              {/* Konten Kanan (Dibuat agar bisa di-scroll terpisah di desktop) */}
              <div className="flex-1 flex flex-col gap-4 sm:gap-6 overflow-visible lg:overflow-hidden">
                 {/* Ringkasan Kelengkapan (Top) */}
                 <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-6">
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                          <CheckCircle size={18} className="text-slate-400" /> Ringkasan Kelengkapan
                       </h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                             <div className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm"><CheckCircle size={14}/></div>
                             <p className="text-xl font-black text-slate-800">{spjLengkap}</p>
                             <p className="text-[10px] font-bold text-slate-500 mt-1">Berkas Lengkap</p>
                          </div>
                          <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-100">
                             <div className="bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm"><AlertCircle size={14}/></div>
                             <p className="text-xl font-black text-slate-800">{spjKurang}</p>
                             <p className="text-[10px] font-bold text-slate-500 mt-1">Berkas Kurang</p>
                          </div>
                          <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
                             <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm"><FileX size={14}/></div>
                             <p className="text-xl font-black text-slate-800">{spjBelum}</p>
                             <p className="text-[10px] font-bold text-slate-500 mt-1">Belum Input</p>
                          </div>
                          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                             <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm"><AlertCircle size={14}/></div>
                             <p className="text-xl font-black text-slate-800">{spjRevisi}</p>
                             <p className="text-[10px] font-bold text-slate-500 mt-1">Perlu Revisi</p>
                          </div>
                       </div>
                    </div>
                    {/* Circle Chart */}
                    <div className="w-[180px] shrink-0 xl:border-l border-slate-100 xl:pl-6 flex flex-col items-center justify-center pt-4 xl:pt-0">
                        <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-r-rose-500 flex flex-col items-center justify-center relative mb-4 shadow-sm">
                           <span className="text-xl font-black text-slate-800">{overallPct}%</span>
                           <span className="text-[9px] font-bold text-slate-500">Lengkap</span>
                        </div>
                        <div className="w-full space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Lengkap ({spjLengkap})</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-rose-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Kurang ({spjKurang + spjBelum})</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Tab Navigation & Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px]">
                     <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 border-b border-slate-100 pt-2 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none">
                       {['Daftar Kelengkapan', `Daftar Kegiatan (${peg.totalKegiatan})`, 'Catatan Verifikasi', 'Riwayat Perubahan'].map(tab => (
                          <button 
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             className={`pb-4 pt-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                             {tab}
                             {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                          </button>
                       ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                        {activeTab === 'Daftar Kelengkapan' && (
                           <div className="relative h-full overflow-x-auto pb-4">
                              <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
                                <thead className="bg-slate-50/50 text-[11px] uppercase font-bold text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                                   <tr>
                                      <th className="px-6 py-4 border-b border-slate-100">No.</th>
                                      <th className="px-6 py-4 border-b border-slate-100">Jenis Dokumen</th>
                                      <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                      <th className="px-6 py-4 border-b border-slate-100">Jumlah</th>
                                      <th className="px-6 py-4 border-b border-slate-100">Keterangan</th>
                                      <th className="px-6 py-4 border-b border-slate-100 text-center">Aksi</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {kelengkapanList.map((item) => (
                                      <tr key={item.no} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                         <td className="px-6 py-4 font-medium text-slate-800">{item.no}</td>
                                         <td className="px-6 py-4 font-bold text-slate-800">{item.jenis}</td>
                                         <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${item.status === 'Lengkap' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                               {item.status}
                                            </span>
                                         </td>
                                         <td className="px-6 py-4 font-semibold text-slate-700">{item.jumlah}</td>
                                         <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.keterangan}</td>
                                         <td className="px-6 py-4 text-center">
                                            <button 
                                               onClick={() => setDetailKekurangan({ jenis: item.jenis, missing: item.missingSpjs })}
                                               className="text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 p-1.5 rounded-lg transition-colors"
                                               title="Lihat Detail Kekurangan"
                                            >
                                               <Search size={14} />
                                            </button>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                             
                             {/* Overlay Detail Kekurangan */}
                             {detailKekurangan && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 animate-in fade-in">
                                   <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85%]">
                                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                         <div className="flex items-center gap-2">
                                            <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg"><AlertCircle size={16}/></div>
                                            <h4 className="font-bold text-slate-800 text-sm">Detail Kekurangan: {detailKekurangan.jenis}</h4>
                                         </div>
                                         <button onClick={() => setDetailKekurangan(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"><XCircle size={18}/></button>
                                      </div>
                                      <div className="p-4 overflow-y-auto scrollbar-thin flex-1 bg-slate-50/30">
                                         {detailKekurangan.missing.length === 0 ? (
                                            <div className="text-center py-8">
                                               <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3"/>
                                               <p className="text-sm font-bold text-slate-600">Semua dokumen lengkap!</p>
                                            </div>
                                         ) : (
                                            <ul className="space-y-3">
                                               {detailKekurangan.missing.map((s, i) => (
                                                  <li key={i} className="flex items-start gap-3 text-sm p-3 rounded-xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                                                     <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 font-bold text-xs mt-0.5">
                                                        {i + 1}
                                                     </div>
                                                     <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-slate-700 mb-1">{s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : 'Tanggal Kosong'}</p>
                                                        <div className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 font-medium line-clamp-2" title={s.program}>
                                                           {s.program}
                                                        </div>
                                                     </div>
                                                  </li>
                                               ))}
                                            </ul>
                                         )}
                                      </div>
                                   </div>
                                </div>
                             )}
                          </div>
                       )}
                       {activeTab === 'Catatan Verifikasi' && (
                          <div className="p-4 sm:p-6 overflow-y-auto h-full">
                             {(() => {
                                const spjDenganCatatan = mySpj.filter(s => s.catatan && s.catatan.trim() !== '').sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
                                if (spjDenganCatatan.length === 0) {
                                   return (
                                      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                         <CheckCircle size={32} className="mb-2 opacity-50 text-emerald-500" />
                                         <p className="text-sm font-medium">Tidak ada catatan verifikasi.</p>
                                      </div>
                                   );
                                }
                                return (
                                   <div className="space-y-4">
                                      {spjDenganCatatan.map((s, idx) => (
                                         <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                                               <AlertCircle size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                               <h5 className="font-bold text-slate-800 text-sm mb-0.5">
                                                  {s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : 'Tanpa Tanggal'}
                                               </h5>
                                               <p className="text-xs text-slate-500 font-medium mb-3 truncate" title={s.program}>{s.program}</p>
                                               <div className="bg-white p-3 rounded-xl border border-amber-100 text-sm text-slate-700 shadow-sm whitespace-pre-wrap">
                                                  {s.catatan}
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                );
                             })()}
                          </div>
                       )}
                       {activeTab !== 'Daftar Kelengkapan' && activeTab !== 'Catatan Verifikasi' && (
                          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                             <FileX size={32} className="mb-2 opacity-50" />
                             <p className="text-sm font-medium">Tampilan untuk "{activeTab}" sedang dikembangkan.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
           {/* Footer */}
           <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 flex items-center gap-1.5 text-center sm:text-left"><AlertCircle size={14} className="shrink-0"/> Data diperbarui pada {new Date().toLocaleString('id-ID')}</p>
              <button onClick={() => { setSelectedPegawaiDetail(null); setDetailKekurangan(null); }} className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                 Tutup
              </button>
           </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw size={28} className="animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Memuat Hasil Pemeriksaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 5 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Pegawai */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Users size={20}/></div>
              <span className="text-xs font-bold text-slate-500">Total Pegawai</span>
           </div>
           <div className="text-3xl font-black text-slate-800 mb-1">{summary.totalPegawai} <span className="text-sm font-semibold text-slate-400">Orang</span></div>
           <div className="text-xs font-semibold text-slate-500 mt-2">Aktif <span className="text-slate-800 ml-1">{summary.aktifPegawai}</span></div>
        </div>
        
        {/* SPJ Lengkap */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500"><CheckCircle size={20}/></div>
              <span className="text-xs font-bold text-slate-500">SPJ Lengkap</span>
           </div>
           <div className="text-3xl font-black text-slate-800 mb-1">{summary.lengkap} <span className="text-sm font-semibold text-slate-400">Orang</span></div>
           <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-semibold text-slate-500">Persentase</span>
              <span className="text-xs font-bold text-slate-800">{summary.pctLengkap}%</span>
           </div>
        </div>

        {/* Perlu Revisi */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-50 p-2 rounded-xl text-amber-500"><AlertCircle size={20}/></div>
              <span className="text-xs font-bold text-slate-500">Perlu Revisi</span>
           </div>
           <div className="text-3xl font-black text-slate-800 mb-1">{summary.perluRevisi} <span className="text-sm font-semibold text-slate-400">Orang</span></div>
           <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-semibold text-slate-500">Persentase</span>
              <span className="text-xs font-bold text-slate-800">{summary.pctPerluRevisi}%</span>
           </div>
        </div>

        {/* Belum Lengkap */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-3">
              <div className="bg-rose-50 p-2 rounded-xl text-rose-500"><FileX size={20}/></div>
              <span className="text-xs font-bold text-slate-500">Belum Lengkap</span>
           </div>
           <div className="text-3xl font-black text-slate-800 mb-1">{summary.belumLengkap} <span className="text-sm font-semibold text-slate-400">Orang</span></div>
           <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-semibold text-slate-500">Persentase</span>
              <span className="text-xs font-bold text-slate-800">{summary.pctBelumLengkap}%</span>
           </div>
        </div>

        {/* Total Dana SPJ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Wallet size={20}/></div>
              <span className="text-xs font-bold text-slate-500">Total Dana SPJ</span>
           </div>
           <div className="text-xl font-black text-slate-800 mb-1 mt-1 truncate">Rp {summary.totalDana.toLocaleString('id-ID')}</div>
           <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] font-semibold text-slate-500">Realisasi</span>
                 <span className="text-[10px] font-bold text-slate-800">{summary.realisasiPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 rounded-full" style={{ width: `${summary.realisasiPct}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* FILTER & TITLE */}
      <div className="mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h2 className="text-base font-bold text-slate-800 whitespace-nowrap">Pegawai <span className="text-slate-500 font-medium">(Status Kelengkapan SPJ)</span></h2>
         
         <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
            {/* Bulan */}
            <div className="relative flex-1 md:w-40 min-w-[140px]">
               <Calendar size={16} className="absolute left-3 top-3 text-indigo-500" />
               <select 
                  value={selectedBulan} 
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 appearance-none w-full cursor-pointer shadow-sm"
               >
                  <option value="ALL">Semua Bulan</option>
                  {listBulanOptions.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
               <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Jabatan */}
            <div className="relative flex-1 md:w-44 min-w-[140px]">
               <select 
                  value={selectedJabatan} 
                  onChange={(e) => setSelectedJabatan(e.target.value)}
                  className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 appearance-none w-full cursor-pointer shadow-sm"
               >
                  <option value="ALL">Semua Jabatan</option>
                  {listJabatanOptions.map(j => <option key={j} value={j}>{j}</option>)}
               </select>
               <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-[2] min-w-[200px]">
               <Search size={16} className="absolute left-3 top-3 text-slate-400" />
               <input 
                  type="text"
                  placeholder="Cari pegawai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
               />
            </div>

            {/* Sort */}
            <div className="relative w-full md:w-auto flex items-center gap-2">
               <span className="text-sm font-semibold text-slate-500 whitespace-nowrap hidden lg:block">Urutkan:</span>
               <div className="relative flex-1">
                  <select 
                     value={sortOrder} 
                     onChange={(e) => setSortOrder(e.target.value)}
                     className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 appearance-none w-full md:w-40 cursor-pointer"
                  >
                     <option>Terbanyak Kurang</option>
                     <option>Paling Lengkap</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
               </div>
               <button className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shrink-0">
                  <Filter size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* GRID PEGAWAI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-370px)] overflow-y-auto scrollbar-thin pr-2 pb-2">
         {filteredPegawaiStats.length === 0 ? (
            <div className="col-span-2 py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
               <Users size={32} className="mx-auto text-slate-300 mb-3" />
               <p className="text-slate-500 font-medium text-sm">Tidak ada data pegawai yang sesuai filter.</p>
            </div>
         ) : (
            filteredPegawaiStats.map(peg => {
               const totalKurang = peg.berkasKurang + peg.belumInput;
               const isCritical = totalKurang > 5;
               const isGreen = totalKurang === 0 || peg.status === 'Lengkap';
               const isYellow = totalKurang > 0 && totalKurang <= 5 && !isCritical;
               
               let cardClass = "bg-white border-slate-200";
               let nameClass = "text-slate-800";
               let bellClass = "text-rose-500";
               let barColor = "bg-rose-500";
               let kuranBg = "bg-rose-50";
               
               if (isCritical) {
                  cardClass = "bg-rose-50/20 border-rose-200 shadow-sm";
               }
               
               if (isGreen) {
                  bellClass = "text-emerald-500";
                  barColor = "bg-emerald-500";
                  kuranBg = "bg-emerald-50";
               } else if (isYellow) {
                  bellClass = "text-amber-500";
                  barColor = "bg-amber-500";
                  kuranBg = "bg-amber-50";
               }

               return (
                  <div key={peg.id} onClick={() => setSelectedPegawaiDetail(peg)} className={`p-5 rounded-2xl border ${cardClass} relative flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-shadow bg-white cursor-pointer`}>
                     {/* Bell */}
                     <Bell size={16} className={`absolute top-5 right-5 ${bellClass} ${!isGreen ? 'fill-current' : 'fill-current opacity-20'}`} />
                     
                     <div className="flex items-center gap-3 mb-5">
                        <div className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm ${getAvatarColor(peg.nama)} shadow-sm shrink-0`}>
                          {getInitials(peg.nama)}
                        </div>
                        <div className="pr-8">
                           <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold ${nameClass} leading-tight line-clamp-1`} title={peg.nama}>{peg.nama}</h4>
                              {peg.hasCatatan && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-200 whitespace-nowrap">(Ada Catatan)</span>}
                           </div>
                           <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate w-48 lg:w-64">{peg.jabatan}</p>
                        </div>
                     </div>

                     <div className="flex items-end justify-between">
                        <div className="flex gap-4 lg:gap-6 flex-1 pr-4">
                           {/* Kegiatan */}
                           <div className="text-center">
                              <p className="text-base lg:text-lg font-black text-slate-700 leading-none mb-1">{peg.totalKegiatan}</p>
                              <p className="text-[9px] lg:text-[10px] font-semibold text-slate-400 uppercase">Kegiatan</p>
                           </div>
                           
                           {/* Dana SPJ */}
                           <div className="text-center">
                              <p className="text-sm font-black text-slate-700 leading-none mb-1">Rp {peg.totalDana.toLocaleString('id-ID')}</p>
                              <p className="text-[9px] lg:text-[10px] font-semibold text-slate-400 uppercase">Dana SPJ</p>
                           </div>

                           {/* Progress */}
                           <div className="flex-1 max-w-[100px] flex flex-col justify-end pb-1 ml-auto hidden sm:flex">
                              <div className="text-center font-black text-slate-700 text-sm mb-1">{peg.persentase}%</div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className={`h-full ${barColor} rounded-full`} style={{ width: `${peg.persentase}%` }}></div>
                              </div>
                           </div>
                        </div>

                        {/* Berkas Kurang */}
                        <div className={`flex flex-col items-center justify-center px-2 min-w-[75px] h-[55px] rounded-xl ${kuranBg} ${bellClass}`}>
                           {totalKurang === 0 ? (
                              <span className="text-[11px] font-bold text-center leading-tight">Sudah<br/>Lengkap</span>
                           ) : (
                              <>
                                 <span className="text-xl font-black leading-none">{totalKurang}</span>
                                 <span className="text-[9px] font-bold mt-1 text-center leading-tight">Belum<br/>Lengkap</span>
                              </>
                           )}
                        </div>
                     </div>
                     {/* Mobile Progress Bar */}
                     <div className="mt-4 flex flex-col justify-end pb-1 sm:hidden">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-bold text-slate-500">Kelengkapan</span>
                           <span className="font-black text-slate-700 text-sm">{peg.persentase}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${barColor} rounded-full`} style={{ width: `${peg.persentase}%` }}></div>
                        </div>
                     </div>
                  </div>
               )
            })
         )}
      </div>

      <div className="flex justify-center mt-6">
         <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-blue-600 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
            Lihat Semua Pegawai <ChevronDown size={16} />
         </button>
      </div>

      {renderModal()}
    </div>
  );
}
