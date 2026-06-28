import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CheckCircle, AlertCircle, X, Save, Search,
  ToggleLeft, ToggleRight, Trash2, Calendar, ChevronDown,
  Grid, List, RefreshCw, User, XCircle, Edit
} from 'lucide-react';

import { ambilSemuaPegawaiDb } from '../services/pegawaiService';
import { ambilSemuaKegiatanDb } from '../services/kegiatanService';
import {
  simpanSpjDb, ambilSemuaSpjDb, hapusSpjDb, hapusSemuaSpjPegawaiDb,
  simpanCatatanPegawaiDb, ambilSemuaCatatanPegawaiDb, updateSpjDb
} from '../services/spjService';

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

const BULAN_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
const BULAN_FULL = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

export default function Verifikasi() {
  // Data
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [daftarCatatan, setDaftarCatatan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Input (Panel Kiri)
  const [modeBorongan, setModeBorongan] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState('');
  const [tanggalInput, setTanggalInput] = useState(new Date().toISOString().split('T')[0]);
  const [programInput, setProgramInput] = useState('');
  const [anggaranInput, setAnggaranInput] = useState('');
  const [checklist, setChecklist] = useState({
    sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
    riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
  });
  const [catatanRevisi, setCatatanRevisi] = useState('');

  // Panel Tengah
  const [viewMode, setViewMode] = useState('matriks');
  const [tahunFilter, setTahunFilter] = useState(String(new Date().getFullYear()));
  const [bulanFilter, setBulanFilter] = useState(String(new Date().getMonth())); // Default current month
  const [searchQuery, setSearchQuery] = useState('');

  // Panel Kanan
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState(null);
  const [catatanUmumInput, setCatatanUmumInput] = useState('');
  const [selectedSpjsForEdit, setSelectedSpjsForEdit] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditChecklist, setBulkEditChecklist] = useState({
    sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
    riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
  });
  const [bulkEditCatatan, setBulkEditCatatan] = useState('');
  const [bulkEditApplyChecklist, setBulkEditApplyChecklist] = useState({});
  const [bulkEditApplyCatatan, setBulkEditApplyCatatan] = useState(false);

  // ==========================================
  // STATE MONTHLY BULK EDIT
  // ==========================================
  const [monthlyBulkEditData, setMonthlyBulkEditData] = useState(null);
  const [monthlyBulkProgram, setMonthlyBulkProgram] = useState('');
  const [monthlyBulkAnggaran, setMonthlyBulkAnggaran] = useState('');
  const [monthlyBulkChecklist, setMonthlyBulkChecklist] = useState({
    sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
    riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
  });
  const [monthlyBulkCatatan, setMonthlyBulkCatatan] = useState('');
  const [monthlyBulkHapusCatatan, setMonthlyBulkHapusCatatan] = useState(false);

  useEffect(() => {
    tarikSemuaData();
  }, []);

  const tarikSemuaData = async () => {
    setLoading(true);
    try {
      const [peg, keg, spj, cat] = await Promise.all([
        ambilSemuaPegawaiDb(),
        ambilSemuaKegiatanDb(),
        ambilSemuaSpjDb(),
        ambilSemuaCatatanPegawaiDb()
      ]);
      setDaftarPegawai(peg);
      setDaftarKegiatan(keg);
      setDaftarSpj(spj);
      setDaftarCatatan(cat);
    } catch (err) {
      console.error('Gagal menarik data:', err);
    }
    setLoading(false);
  };

  // ==========================================
  // Pencocokan Nama Pegawai & Sintesis SPJ
  // ==========================================

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
    
    // Sort descending by createdAt or id so we keep the latest if duplicates exist
    const sortedSpj = [...daftarSpj].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    
    // Normalize SPJ names to match master data if possible
    const normalizedSpj = sortedSpj.map(s => {
      const matchedNames = splitPegawaiNames(s.pegawaiNama);
      if (matchedNames.length > 0 && matchedNames[0] !== s.pegawaiNama) {
        // Use the mapped master name if it differs
        return { ...s, pegawaiNama: matchedNames[0] };
      }
      return s;
    });

    // Create a pool of Real SPJs grouped by Person_Date
    const realSpjPool = {};
    normalizedSpj.forEach(s => {
      const key = `${s.pegawaiNama}_${s.tanggal}`;
      if (!realSpjPool[key]) realSpjPool[key] = [];
      realSpjPool[key].push(s);
    });

    daftarKegiatan.forEach(keg => {
      if (!keg.pegawai) return;
      const pegawaiNames = splitPegawaiNames(keg.pegawai);

      // Build YYYY-MM-DD from keg.tanggal & keg.bulan
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

  // ==========================================
  // Daftar Pegawai Unik (Filtered by Year & Month)
  // ==========================================
  const pegawaiUnik = useMemo(() => {
    const namaSet = new Set();
    combinedSpjList.forEach(s => {
      let d = null;
      if (s.tanggal && s.tanggal.includes('-')) {
        d = new Date(s.tanggal);
      }
      if (d) {
        if (String(d.getFullYear()) === tahunFilter) {
          if (bulanFilter === 'ALL' || String(d.getMonth()) === bulanFilter) {
            if (s.pegawaiNama) namaSet.add(s.pegawaiNama);
          }
        }
      } else {
        // If no valid date, just show if ALL is selected
        if (bulanFilter === 'ALL' && s.pegawaiNama) namaSet.add(s.pegawaiNama);
      }
    });
    return [...namaSet].sort();
  }, [combinedSpjList, tahunFilter, bulanFilter]);

  // ==========================================
  // Daftar Program Unik
  // ==========================================
  const programUnik = useMemo(() => {
    const progSet = new Set();
    combinedSpjList.forEach(s => { if (s.program) progSet.add(s.program); });
    return [...progSet].sort();
  }, [combinedSpjList]);

  // ==========================================
  // Handler Checklist
  // ==========================================
  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSemuaChecklist = () => {
    const semuaCek = Object.values(checklist).every(v => v);
    const newVal = {};
    CHECKLIST_ITEMS.forEach(item => { newVal[item.key] = !semuaCek; });
    setChecklist(newVal);
  };

  // ==========================================
  // SIMPAN SPJ
  // ==========================================
  const handleSimpan = async () => {
    if (!selectedPegawai) return alert('Pilih pegawai terlebih dahulu');
    if (!tanggalInput) return alert('Masukkan tanggal');

    // Mencegah entri data ganda (nama dan tanggal sama)
    const isDuplicate = daftarSpj.some(s => s.pegawaiNama === selectedPegawai && s.tanggal === tanggalInput);
    if (isDuplicate) {
      alert(`Gagal: SPJ untuk ${selectedPegawai} pada tanggal ${tanggalInput} sudah ada! Jika ingin mengubahnya, silakan cari dan edit data tersebut.`);
      return;
    }

    const dataSpj = {
      pegawaiNama: selectedPegawai,
      tanggal: tanggalInput,
      program: programInput || '(Umum)',
      anggaran: Number(anggaranInput) || 0,
      checklist: { ...checklist },
      catatan: catatanRevisi || ''
    };

    try {
      setLoading(true);
      await simpanSpjDb(dataSpj);
      await tarikSemuaData();

      if (!modeBorongan) {
        resetForm();
      } else {
        // Mode borongan: keep pegawai & catatan, reset tanggal & checklist
        setTanggalInput(new Date().toISOString().split('T')[0]);
        setAnggaranInput('');
        setChecklist({
          sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
          riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
        });
      }
    } catch (err) {
      alert('Gagal menyimpan SPJ');
    }
  };

  const resetForm = () => {
    setSelectedPegawai('');
    setTanggalInput(new Date().toISOString().split('T')[0]);
    setProgramInput('');
    setAnggaranInput('');
    setChecklist({
      sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
      riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
    });
    setCatatanRevisi('');
  };

  // ==========================================
  // SIMPAN CATATAN UMUM
  // ==========================================
  const handleSimpanCatatanUmum = async () => {
    if (!selectedPegawaiDetail) return;
    try {
      await simpanCatatanPegawaiDb(selectedPegawaiDetail, catatanUmumInput);
      await tarikSemuaData();
    } catch (err) {
      alert('Gagal menyimpan catatan');
    }
  };

  // ==========================================
  // BULK EDIT SPJ
  // ==========================================
  const handleBulkEdit = async () => {
    try {
      setLoading(true);
      await Promise.all(
        selectedSpjsForEdit.map(async id => {
          let targetSpj;
          let isVirtual = false;

          if (String(id).startsWith('virtual_')) {
            targetSpj = combinedSpjList.find(s => s.id === id);
            isVirtual = true;
          } else {
            targetSpj = daftarSpj.find(s => s.id === id);
          }

          if (!targetSpj) return;

          const currentChecklist = targetSpj.checklist || {};
          const newChecklist = { ...currentChecklist };

          CHECKLIST_ITEMS.forEach(item => {
            if (bulkEditApplyChecklist[item.key]) {
              newChecklist[item.key] = bulkEditChecklist[item.key];
            }
          });

          const newCatatan = bulkEditApplyCatatan ? bulkEditCatatan : (targetSpj.catatan || '');

          if (isVirtual) {
            await simpanSpjDb({
              pegawaiNama: targetSpj.pegawaiNama,
              tanggal: targetSpj.tanggal,
              program: targetSpj.program,
              anggaran: targetSpj.anggaran,
              checklist: newChecklist,
              catatan: newCatatan
            });
          } else {
            await updateSpjDb(id, {
              checklist: newChecklist,
              catatan: newCatatan
            });
          }
        })
      );
      setSelectedSpjsForEdit([]);
      setIsBulkEditModalOpen(false);
      await tarikSemuaData();
    } catch (err) {
      alert('Gagal menyimpan perubahan');
      setLoading(false);
    }
  };

  const openEditModalSingle = (id) => {
    setSelectedSpjsForEdit([id]);
    const spj = combinedSpjList.find(s => s.id === id);
    if (spj) {
      setBulkEditChecklist(spj.checklist || {});
      setBulkEditCatatan(spj.catatan || '');
      const applyAll = {};
      CHECKLIST_ITEMS.forEach(i => applyAll[i.key] = true);
      setBulkEditApplyChecklist(applyAll);
      setBulkEditApplyCatatan(true);
    }
    setIsBulkEditModalOpen(true);
  };

  // ==========================================
  // MONTHLY BULK EDIT SPJ
  // ==========================================
  const openMonthlyBulkEdit = (nama, monthIndex) => {
    const monthName = BULAN_FULL[monthIndex];
    const formattedMonth = monthName.charAt(0) + monthName.slice(1).toLowerCase();
    
    setMonthlyBulkEditData({ nama, monthIndex, monthName: formattedMonth });
    setMonthlyBulkProgram('');
    setMonthlyBulkAnggaran('');
    setMonthlyBulkChecklist({
      sppd: false, suratTugas: false, daftarHadir: false, dokumentasi: false,
      riilCost: false, kwitansi: false, suratPernyataan: false, laporan: false
    });
    setMonthlyBulkCatatan('');
    setMonthlyBulkHapusCatatan(false);
  };

  const handleSimpanMonthlyBulk = async () => {
    if (!monthlyBulkEditData) return;
    const { nama, monthIndex } = monthlyBulkEditData;
    
    try {
      setLoading(true);
      const targetSpjs = combinedSpjList.filter(s => {
        if (s.pegawaiNama !== nama) return false;
        const pt = parseTanggalSPJ(s.tanggal);
        return pt && pt.month === monthIndex;
      });

      if (targetSpjs.length === 0) {
        alert('Tidak ada kegiatan di bulan ini.');
        setLoading(false);
        return;
      }

      await Promise.all(
        targetSpjs.map(async spj => {
          let isVirtual = spj.isVirtual;
          const id = spj.id;
          
          let programToSave = spj.program;
          if (monthlyBulkProgram !== '') programToSave = monthlyBulkProgram;
          
          let anggaranToSave = spj.anggaran;
          if (monthlyBulkAnggaran !== '') anggaranToSave = Number(monthlyBulkAnggaran);

          const checklistToSave = { ...monthlyBulkChecklist };

          let catatanToSave = spj.catatan;
          if (monthlyBulkHapusCatatan) {
            catatanToSave = '';
          } else if (monthlyBulkCatatan.trim() !== '') {
            catatanToSave = monthlyBulkCatatan;
          }

          if (isVirtual) {
            await simpanSpjDb({
              pegawaiNama: spj.pegawaiNama,
              tanggal: spj.tanggal,
              program: programToSave,
              anggaran: anggaranToSave,
              checklist: checklistToSave,
              catatan: catatanToSave
            });
          } else {
            await updateSpjDb(id, {
              program: programToSave,
              anggaran: anggaranToSave,
              checklist: checklistToSave,
              catatan: catatanToSave
            });
          }
        })
      );
      
      setMonthlyBulkEditData(null);
      await tarikSemuaData();
    } catch (err) {
      alert('Gagal menyimpan perubahan masal');
      setLoading(false);
    }
  };

  const toggleSpjSelection = (idSpj) => {
    setSelectedSpjsForEdit(prev => 
      prev.includes(idSpj) ? prev.filter(id => id !== idSpj) : [...prev, idSpj]
    );
  };

  // ==========================================
  // HAPUS SEMUA SPJ PEGAWAI
  // ==========================================
  const handleHapusSemua = async () => {
    if (!selectedPegawaiDetail) return;
    if (!window.confirm(`Hapus SEMUA data SPJ untuk ${selectedPegawaiDetail}?`)) return;
    try {
      await hapusSemuaSpjPegawaiDb(selectedPegawaiDetail);
      setSelectedPegawaiDetail(null);
      await tarikSemuaData();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  // ==========================================
  // HAPUS SPJ INDIVIDUAL
  // ==========================================
  const handleHapusSpj = async (idSpj) => {
    if (String(idSpj).startsWith('virtual_')) {
      alert('Ini adalah jadwal kegiatan yang belum diinput SPJ. Jika ingin menghapusnya, hapus dari menu Kegiatan.');
      return;
    }
    if (!window.confirm('Hapus data SPJ ini?')) return;
    try {
      await hapusSpjDb(idSpj);
      await tarikSemuaData();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  // ==========================================
  // DATA per pegawai
  // ==========================================
  const getSpjPegawai = (nama) => {
    return combinedSpjList.filter(s => {
      if (s.pegawaiNama !== nama) return false;
      const parsed = parseTanggalSPJ(s.tanggal);
      if (!parsed) return bulanFilter === 'ALL';
      if (String(parsed.year) !== tahunFilter) return false;
      if (bulanFilter !== 'ALL' && String(parsed.month) !== bulanFilter) return false;
      return true;
    });
  };
  
  const getCatatanPegawai = (nama) => daftarCatatan.find(c => c.pegawaiNama === nama)?.catatan || '';

  const getStatusTanggal = (spjItem) => {
    if (!spjItem) return 'belum';
    const cl = spjItem.checklist || {};
    const requiredKeys = CHECKLIST_ITEMS.filter(item => !item.optional).map(item => item.key);
    const isLengkap = requiredKeys.every(k => cl[k]);
    const filledAny = Object.values(cl).some(v => v);
    
    if (isLengkap) return 'lengkap';
    if (filledAny) return 'kurang';
    return 'belum';
  };

  const getStatusPegawai = (nama) => {
    const spjList = getSpjPegawai(nama);
    if (spjList.length === 0) return 'belum';
    const statuses = spjList.map(s => getStatusTanggal(s));
    if (statuses.every(s => s === 'lengkap')) return 'lengkap';
    if (statuses.some(s => s === 'kurang' || s === 'belum')) return 'kurang';
    return 'lengkap';
  };

  const getTotalAnggaran = (nama) => {
    return getSpjPegawai(nama).reduce((sum, s) => sum + (Number(s.anggaran) || 0), 0);
  };

  // ==========================================
  // Parse tanggal SPJ ke bulan index
  // ==========================================
  const parseTanggalSPJ = (tgl) => {
    // Format bisa: "2026-06-25" atau "25"
    if (!tgl) return null;
    if (tgl.includes('-')) {
      const d = new Date(tgl);
      return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
    }
    return null;
  };

  // ==========================================
  // Group SPJ by month for calendar view
  // ==========================================
  const getSpjByMonth = (nama) => {
    const spjList = getSpjPegawai(nama);
    const byMonth = {};
    spjList.forEach(s => {
      const parsed = parseTanggalSPJ(s.tanggal);
      if (parsed && String(parsed.year) === tahunFilter) {
        if (!byMonth[parsed.month]) byMonth[parsed.month] = [];
        byMonth[parsed.month].push({ ...s, day: parsed.day });
      }
    });
    return byMonth;
  };

  // ==========================================
  // Filtered pegawai
  // ==========================================
  const filteredPegawai = useMemo(() => {
    if (!searchQuery) return pegawaiUnik;
    return pegawaiUnik.filter(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pegawaiUnik, searchQuery]);

  // ==========================================
  // Panel Kanan: saat pilih pegawai
  // ==========================================
  const selectPegawaiDetail = (nama) => {
    if (selectedPegawaiDetail === nama) {
      setSelectedPegawaiDetail(null);
      setCatatanUmumInput('');
      setSelectedSpjsForEdit([]);
    } else {
      setSelectedPegawaiDetail(nama);
      setCatatanUmumInput(getCatatanPegawai(nama));
      setSelectedSpjsForEdit([]);
    }
  };

  // ==========================================
  // Statistik footer
  // ==========================================
  const totalPegawaiData = filteredPegawai.length;
  const totalAnggaranAll = filteredPegawai.reduce((sum, n) => sum + getTotalAnggaran(n), 0);

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] print:hidden">

      {/* ============================================================ */}
      {/* PANEL KIRI — INPUT SPJ BARU */}
      {/* ============================================================ */}
      <div className="w-[340px] shrink-0 bg-[#0F172A] text-white rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="text-base font-bold flex items-center gap-2">
            <FileText size={18} className="text-blue-400" /> Input SPJ Baru
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {/* Mode Borongan */}
          <div className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-2.5">
            <span className="text-xs font-semibold text-slate-300">Mode Borongan</span>
            <button onClick={() => setModeBorongan(!modeBorongan)} className="text-blue-400">
              {modeBorongan ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-500" />}
            </button>
          </div>

          {/* Nama Pegawai */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Nama Pegawai</label>
            <div className="relative">
              <select
                value={selectedPegawai}
                onChange={(e) => setSelectedPegawai(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Pilih Pegawai...</option>
                {pegawaiUnik.map(nama => (
                  <option key={nama} value={nama}>{nama}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Tanggal & Program */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Tanggal</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="date"
                  value={tanggalInput}
                  onChange={(e) => setTanggalInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Program</label>
              <select
                value={programInput}
                onChange={(e) => setProgramInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">Pilih Program (Umum)</option>
                {programUnik.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Anggaran */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Anggaran (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">Rp</span>
              <input
                type="number"
                value={anggaranInput}
                onChange={(e) => setAnggaranInput(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ceklist Kelengkapan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">Ceklist Kelengkapan</label>
              <button
                onClick={toggleSemuaChecklist}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <CheckCircle size={12} /> PILIH SEMUA
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_ITEMS.map(item => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                    checklist[item.key]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleChecklist(item.key)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    checklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                  }`}>
                    {checklist[item.key] && <CheckCircle size={10} className="text-white" />}
                  </div>
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Catatan Revisi */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Catatan Revisi Saat Input</label>
            <textarea
              value={catatanRevisi}
              onChange={(e) => setCatatanRevisi(e.target.value)}
              placeholder="Ketik jika ada kurang / revisi..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Tombol Bawah */}
        <div className="p-4 border-t border-slate-700/50 flex gap-3">
          <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 transition-colors">
            Reset
          </button>
          <button onClick={handleSimpan} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
            <Save size={16} /> Simpan
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANEL TENGAH — DATABASE REKAP SPJ */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col bg-[#0F172A] text-white rounded-2xl shadow-xl border border-slate-800 overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Database Rekap SPJ</h3>
            <p className="text-xs text-slate-400 mt-0.5">Kelola dan edit seluruh rekap kegiatan.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button onClick={() => setViewMode('matriks')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'matriks' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}>
                <Grid size={14} className="inline mr-1 mb-0.5" /> Matriks
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}>
                <List size={14} className="inline mr-1 mb-0.5" /> List
              </button>
            </div>
            {/* Tahun & Bulan */}
            <div className="flex gap-2">
              <select value={tahunFilter} onChange={(e) => setTahunFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white outline-none">
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <select value={bulanFilter} onChange={(e) => setBulanFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white outline-none">
                <option value="ALL">Semua Bulan</option>
                {BULAN_NAMES.map((bln, idx) => (
                  <option key={idx} value={String(idx)}>{bln}</option>
                ))}
              </select>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none w-32 focus:w-48 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredPegawai.length === 0 ? (
            <div className="text-center text-slate-400 py-20">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada data pegawai.</p>
              <p className="text-xs mt-1">Upload jadwal kegiatan atau input SPJ untuk memulai.</p>
            </div>
          ) : (
            <>
              {viewMode === 'matriks' && (
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">
                  <div className="w-[220px] shrink-0">Info Pegawai</div>
                  <div className="flex-1">Rekapitulasi Per Bulan</div>
                </div>
              )}
              {filteredPegawai.map(nama => {
                const totalAnggaran = getTotalAnggaran(nama);
                const spjByMonth = getSpjByMonth(nama);
                const statusPeg = getStatusPegawai(nama);
                const isSelected = selectedPegawaiDetail === nama;

                return (
                  <div
                    key={nama}
                    onClick={() => selectPegawaiDetail(nama)}
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-500/10 shadow-md' : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    {viewMode === 'matriks' ? (
                      <div className="flex flex-col xl:flex-row gap-6 items-start">
                        {/* Info Pegawai */}
                        <div className="xl:w-[220px] shrink-0 w-full flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm">{nama}</h4>
                            {totalAnggaran > 0 && (
                              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Rp {totalAnggaran.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          <span className={`text-lg hidden xl:block`}>
                            {statusPeg === 'lengkap' ? '🟢' : statusPeg === 'kurang' ? '🟡' : '🔴'}
                          </span>
                        </div>

                        {/* Matriks Kalender 12 Bulan */}
                        {isSelected && (
                          <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-thin animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-2 min-w-max">
                              {BULAN_NAMES.map((bln, idx) => {
                                const monthData = spjByMonth[idx] || [];
                                return (
                                  <div key={idx} className="flex flex-col items-center min-w-[42px]">
                                    <div 
                                      onClick={(e) => { e.stopPropagation(); openMonthlyBulkEdit(nama, idx); }}
                                      title={`Edit Masal ${bln}`}
                                      className="group flex items-center justify-center gap-1.5 mb-2 cursor-pointer w-full py-1 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                      <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-white transition-colors">{bln}</span>
                                      <div className={`w-[20px] h-[20px] rounded flex items-center justify-center transition-all ${
                                        monthData.length > 0 ? 'bg-blue-600 text-white group-hover:bg-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-800 border border-slate-700 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500'
                                      }`}>
                                        <Edit size={10} />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                      {monthData.length > 0 ? (
                                        monthData.sort((a, b) => a.day - b.day).map((spj, si) => {
                                          const st = getStatusTanggal(spj);
                                          return (
                                            <div
                                              key={si}
                                              onClick={(e) => { e.stopPropagation(); openEditModalSingle(spj.id); }}
                                              title={`${spj.day}/${idx + 1} — ${st === 'lengkap' ? 'Lengkap' : st === 'kurang' ? 'Kurang' : 'Belum'}`}
                                              className={`w-full py-1 rounded text-[10px] font-bold flex items-center justify-center text-center px-1 cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${
                                                st === 'lengkap' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' :
                                                st === 'kurang' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' :
                                                'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                                              }`}
                                            >
                                              {String(spj.day).padStart(2, '0')}/{String(idx + 1).padStart(2, '0')}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="w-full h-[26px] rounded border border-dashed border-slate-700 flex items-center justify-center">
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* List View */
                      <>
                        {/* Info Pegawai */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm">{nama}</h4>
                            {totalAnggaran > 0 && (
                              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Rp {totalAnggaran.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          <span className={`text-lg`}>
                            {statusPeg === 'lengkap' ? '🟢' : statusPeg === 'kurang' ? '🟡' : '🔴'}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="space-y-1 mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                            {getSpjPegawai(nama).slice(0, 5).map(spj => {
                              const st = getStatusTanggal(spj);
                              return (
                                <div key={spj.id} className="flex items-center gap-2 text-xs">
                                  <span className={`w-2 h-2 rounded-full ${st === 'lengkap' ? 'bg-emerald-500' : st === 'kurang' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                                  <span className="font-medium text-slate-300">{spj.tanggal}</span>
                                  <span className="text-slate-500">—</span>
                                  <span className="text-slate-400 truncate">{spj.program}</span>
                                  {spj.catatan && <AlertCircle size={12} className="text-amber-500 shrink-0" />}
                                </div>
                              );
                            })}
                            {getSpjPegawai(nama).length > 5 && (
                              <span className="text-[10px] text-blue-400 font-bold">+{getSpjPegawai(nama).length - 5} lainnya...</span>
                            )}
                            {getSpjPegawai(nama).length === 0 && (
                              <span className="text-xs text-slate-500 italic">Belum ada data SPJ</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 flex items-center justify-between bg-slate-800/50 shrink-0">
          <span className="text-xs font-bold text-slate-400">Total: <span className="text-blue-400">{totalPegawaiData}</span> Pegawai</span>
          <span className="text-xs font-bold text-slate-400">
            Total Anggaran: <span className="text-emerald-400">Rp {totalAnggaranAll.toLocaleString('id-ID')}</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANEL KANAN — KEKURANGAN & REVISI */}
      {/* ============================================================ */}
      <div className="w-[300px] shrink-0 bg-[#0F172A] text-white rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="text-base font-bold">Kekurangan & Revisi</h3>
        </div>

        {selectedPegawaiDetail ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Status Badge */}
            {(() => {
              const st = getStatusPegawai(selectedPegawaiDetail);
              const spjList = getSpjPegawai(selectedPegawaiDetail);
              return (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
                  st === 'lengkap' ? 'bg-emerald-500/20 text-emerald-400' :
                  st === 'kurang' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {st === 'lengkap' ? <CheckCircle size={16} /> : st === 'kurang' ? <AlertCircle size={16} /> : <XCircle size={16} />}
                  {st === 'lengkap' ? 'Sempurna' : st === 'kurang' ? 'Kurang Lengkap' : 'Belum Ada Data'}
                  <span className="ml-auto text-xs opacity-70">{spjList.length} entri</span>
                </div>
              );
            })()}

            {/* Catatan Umum Pegawai */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">CATATAN UMUM PEGAWAI</label>
              <textarea
                value={catatanUmumInput}
                onChange={(e) => setCatatanUmumInput(e.target.value)}
                onBlur={handleSimpanCatatanUmum}
                placeholder="Ketik catatan khusus pegawai ini..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Daftar SPJ per tanggal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">DETAIL PER TANGGAL</label>
                {getSpjPegawai(selectedPegawaiDetail).length > 0 && (
                  <button
                    onClick={() => {
                      const allSpjIds = getSpjPegawai(selectedPegawaiDetail).map(s => s.id);
                      if (selectedSpjsForEdit.length === allSpjIds.length) {
                        setSelectedSpjsForEdit([]);
                      } else {
                        setSelectedSpjsForEdit(allSpjIds);
                      }
                    }}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> {selectedSpjsForEdit.length === getSpjPegawai(selectedPegawaiDetail).length ? 'BATAL PILIH SEMUA' : 'PILIH SEMUA'}
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
                {getSpjPegawai(selectedPegawaiDetail).sort((a, b) => (a.tanggal > b.tanggal ? -1 : 1)).map(spj => {
                  const st = getStatusTanggal(spj);
                  const checkedCount = Object.values(spj.checklist || {}).filter(v => v).length;
                  const missing = CHECKLIST_ITEMS.filter(i => !(spj.checklist || {})[i.key]);
                  const isChecked = selectedSpjsForEdit.includes(spj.id);

                  return (
                    <div
                      key={spj.id}
                      onClick={() => openEditModalSingle(spj.id)}
                      className={`rounded-xl p-3 border text-xs cursor-pointer transition-all hover:shadow-md ${
                        isChecked ? 'border-blue-500 bg-blue-500/10' :
                        st === 'lengkap' ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20' :
                        st === 'kurang' && spj.catatan ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/20 hover:to-rose-500/20' :
                        st === 'kurang' ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20' :
                        'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div 
                            onClick={(e) => { e.stopPropagation(); toggleSpjSelection(spj.id); }}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all hover:scale-110 ${
                              isChecked ? 'bg-blue-500 border-blue-500 shadow-sm shadow-blue-500/40' : 'border-slate-400 hover:border-blue-400 bg-slate-800'
                            }`}
                          >
                            {isChecked && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="font-bold text-slate-200">{spj.tanggal}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${st === 'lengkap' ? 'text-emerald-400' : st === 'kurang' ? 'text-amber-400' : 'text-rose-400'}`}>
                            {checkedCount}/{CHECKLIST_ITEMS.length}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); openEditModalSingle(spj.id); }} className="text-slate-500 hover:text-blue-400">
                            <Edit size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleHapusSpj(spj.id); }} className="text-slate-500 hover:text-rose-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {missing.length > 0 && (
                        <div className="text-[10px] text-amber-400 mt-1 pl-5">
                          Kurang: {missing.map(m => m.label).join(', ')}
                        </div>
                      )}
                      {spj.catatan && (
                        <div className="text-[10px] text-rose-400 mt-1 italic pl-5">
                          Catatan: {spj.catatan}
                        </div>
                      )}
                    </div>
                  );
                })}
                {getSpjPegawai(selectedPegawaiDetail).length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data SPJ.</p>
                )}
              </div>
              
              {/* Tombol Bulk Edit */}
              {selectedSpjsForEdit.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <button 
                    onClick={() => {
                      const firstSpj = combinedSpjList.find(s => s.id === selectedSpjsForEdit[0]);
                      if (firstSpj) {
                        setBulkEditChecklist(firstSpj.checklist || {});
                        setBulkEditCatatan(firstSpj.catatan || '');
                      }
                      const applyNone = {};
                      CHECKLIST_ITEMS.forEach(i => applyNone[i.key] = false);
                      setBulkEditApplyChecklist(applyNone);
                      setBulkEditApplyCatatan(false);
                      setIsBulkEditModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Save size={14} /> Edit {selectedSpjsForEdit.length} Terpilih
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-slate-500 text-center">Klik pegawai di panel tengah untuk melihat detail kekurangan & revisi.</p>
          </div>
        )}

        {/* Hapus Semua */}
        {selectedPegawaiDetail && getSpjPegawai(selectedPegawaiDetail).length > 0 && (
          <div className="p-4 border-t border-slate-700/50">
            <button onClick={handleHapusSemua} className="w-full py-2.5 rounded-xl font-bold text-sm bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 transition-colors flex items-center justify-center gap-2">
              <Trash2 size={14} /> Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL BULK EDIT */}
      {/* ============================================================ */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-[#0F172A] w-[850px] max-w-[95vw] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-blue-400" /> Edit {selectedSpjsForEdit.length} Data SPJ
              </h3>
              <button onClick={() => setIsBulkEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Ceklist Kelengkapan</label>
                  <button
                    onClick={() => {
                      const isAllChecked = CHECKLIST_ITEMS.every(i => bulkEditChecklist[i.key]);
                      const newVal = {};
                      const newApply = { ...bulkEditApplyChecklist };
                      CHECKLIST_ITEMS.forEach(i => {
                        newVal[i.key] = !isAllChecked;
                        if (!isAllChecked) newApply[i.key] = true;
                      });
                      setBulkEditChecklist(newVal);
                      if (!isAllChecked) setBulkEditApplyChecklist(newApply);
                    }}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors bg-blue-500/10 px-2 py-1 rounded"
                  >
                    <CheckCircle size={12} /> {CHECKLIST_ITEMS.every(i => bulkEditChecklist[i.key]) ? 'BATAL CEK SEMUA' : 'CEK SEMUA'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CHECKLIST_ITEMS.map(item => (
                    <div key={item.key} className="flex flex-col gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkEditApplyChecklist[item.key] || false}
                          onChange={(e) => setBulkEditApplyChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 w-3.5 h-3.5"
                        />
                        Ubah Status
                      </label>
                      <label
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                          !bulkEditApplyChecklist[item.key] ? 'opacity-40 pointer-events-none bg-slate-800 text-slate-500' :
                          bulkEditChecklist[item.key]
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={bulkEditChecklist[item.key] || false}
                          onChange={() => setBulkEditChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          bulkEditChecklist[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                        }`}>
                          {bulkEditChecklist[item.key] && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditApplyCatatan}
                    onChange={(e) => setBulkEditApplyCatatan(e.target.checked)}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700 w-3.5 h-3.5"
                  />
                  Ubah Catatan Revisi
                </label>
                <textarea
                  disabled={!bulkEditApplyCatatan}
                  value={bulkEditCatatan}
                  onChange={(e) => setBulkEditCatatan(e.target.value)}
                  placeholder="Ketik catatan..."
                  rows={2}
                  className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 text-white resize-none ${!bulkEditApplyCatatan ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex gap-3">
              <button onClick={() => setIsBulkEditModalOpen(false)} className="flex-1 py-2 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                Batal
              </button>
              <button onClick={handleBulkEdit} className="flex-1 py-2 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL MONTHLY BULK EDIT */}
      {/* ============================================================ */}
      {monthlyBulkEditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-[#0F172A] w-[600px] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 overflow-y-auto scrollbar-thin">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Masal {monthlyBulkEditData.monthName}</h2>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-sm text-blue-200">
                Pengaturan ini diterapkan ke <strong>semua kegiatan</strong> {monthlyBulkEditData.nama} di bulan {monthlyBulkEditData.monthName} {tahunFilter}. Kosongkan jika tidak ingin diubah.
              </div>

              <div className="space-y-5">
                {/* Program */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Ubah Semua Program Menjadi:</label>
                  <select 
                    value={monthlyBulkProgram} 
                    onChange={e => setMonthlyBulkProgram(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-white focus:border-blue-500"
                  >
                    <option value="">(Biarkan Sesuai Data Asli)</option>
                    {programUnik.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Anggaran */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Ubah Semua Anggaran Menjadi (Rp):</label>
                  <input
                    type="number"
                    value={monthlyBulkAnggaran}
                    onChange={(e) => setMonthlyBulkAnggaran(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-white focus:border-blue-500"
                  />
                </div>

                {/* Checklist */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Tandai Berkas Berikut Menjadi Lengkap:</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    {CHECKLIST_ITEMS.map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300 hover:text-white">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          monthlyBulkChecklist[item.key] ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-600'
                        }`}>
                          {monthlyBulkChecklist[item.key] && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={monthlyBulkChecklist[item.key] || false}
                          onChange={() => setMonthlyBulkChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Timpa Semua Catatan Menjadi:</label>
                  <textarea
                    disabled={monthlyBulkHapusCatatan}
                    value={monthlyBulkCatatan}
                    onChange={(e) => setMonthlyBulkCatatan(e.target.value)}
                    placeholder="Ketik catatan baru untuk semua..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none text-white focus:border-blue-500 resize-none disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-bold text-rose-400">
                    <input 
                      type="checkbox" 
                      checked={monthlyBulkHapusCatatan}
                      onChange={e => setMonthlyBulkHapusCatatan(e.target.checked)}
                      className="rounded bg-slate-800 border-rose-500/50 text-rose-500 focus:ring-rose-500" 
                    />
                    Hapus Semua Catatan Lama
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-center gap-3">
              <button 
                onClick={handleSimpanMonthlyBulk}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Terapkan Masal
              </button>
              <button 
                onClick={() => setMonthlyBulkEditData(null)}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
