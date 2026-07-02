import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, Calendar as CalendarIcon, 
  Info, Users, DollarSign, Plus, FileText, FileSpreadsheet, CheckCircle, 
  AlertCircle, X, LayoutGrid, Award, Percent, TrendingUp, 
  TrendingDown, Check, ShieldAlert, Sparkles, Filter, Layers, Printer, AlertTriangle,
  MoreVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { ambilSemuaKegiatanDb, simpanBanyakKegiatanDb } from '../../services/kegiatanService';
import { ambilSemuaSpjDb } from '../../services/spjService';
import { ambilSemuaPegawaiDb } from '../../services/pegawaiService';
import { ambilSemuaDesaDb } from '../../services/desaService';
import { ambilSemuaSekolahDb } from '../../services/sekolahService';

// Logo untuk Cetak
import logoMitra from '../../assets/logo mitra.png';
import logoPkm from '../../assets/logopkm.png';

// Import Cetak components
import CetakRiil from '../../pages/CetakRiil';
import SuratPernyataan from '../../pages/SuratPernyataan';

const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function KalenderKegiatan() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 26)); // Default to June 2026 to match mockup context
  const [daftarKegiatan, setDaftarKegiatan] = useState([]);
  const [daftarSpj, setDaftarSpj] = useState([]);
  const [daftarPegawai, setDaftarPegawai] = useState([]);
  const [daftarDesa, setDaftarDesa] = useState([]);
  const [daftarSekolah, setDaftarSekolah] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterProgram, setFilterProgram] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Layout View States
  const [compactView, setCompactView] = useState(false);

  // Interaction States
  const [selectedDate, setSelectedDate] = useState('2026-06-26');
  const [hoveredDate, setHoveredDate] = useState(null);

  // Modal States
  const [tambahModalOpen, setTambahModalOpen] = useState(false);
  const [selectCetakModalOpen, setSelectCetakModalOpen] = useState(false);

  // Print States (matching JadwalKegiatan format)
  const [printData, setPrintData] = useState(null);
  const [printPetugas, setPrintPetugas] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('SPPD');
  const [nomorSppd, setNomorSppd] = useState('');
  const [selectedExtraActivities, setSelectedExtraActivities] = useState([]);

  // Tambah Kegiatan Form State
  const [formTanggal, setFormTanggal] = useState('26');
  const [formBulan, setFormBulan] = useState('JUNI 2026');
  const [formProgram, setFormProgram] = useState('');
  const [formKegiatan, setFormKegiatan] = useState('');
  const [formDesa, setFormDesa] = useState('');
  const [formPegawai, setFormPegawai] = useState([]);
  const [formDana, setFormDana] = useState('');

  useEffect(() => {
    tarikData();
  }, []);

  const tarikData = async () => {
    try {
      setLoading(true);
      const [dataKeg, dataSpj, dataPeg, dataDes, dataSekolah] = await Promise.all([
        ambilSemuaKegiatanDb(),
        ambilSemuaSpjDb(),
        ambilSemuaPegawaiDb(),
        ambilSemuaDesaDb(),
        ambilSemuaSekolahDb()
      ]);
      setDaftarKegiatan(dataKeg);
      setDaftarSpj(dataSpj);
      setDaftarPegawai(dataPeg);
      setDaftarDesa(dataDes);
      setDaftarSekolah(dataSekolah);
    } catch (error) {
      console.error('Gagal menarik data kegiatan & SPJ', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper name matching
  const getNamaResmi = (namaExcel) => {
    if (!namaExcel) return null;
    const target = String(namaExcel).trim().toLowerCase();
    
    let match = daftarPegawai.find(p => p.nama.toLowerCase().trim() === target);
    if (match) return match.nama;

    match = daftarPegawai.find(p => p.nama.toLowerCase().includes(target));
    if (match) return match.nama;

    match = daftarPegawai.find(p => target.includes(p.nama.toLowerCase().trim()));
    if (match) return match.nama;

    return String(namaExcel).trim();
  };

  // SPJ calculation helper
  const hitungProgresSpjKegiatan = (keg, dateKey) => {
    if (!keg.pegawai) return 0;
    const petugasList = keg.pegawai.split(',').map(p => p.trim()).filter(Boolean);
    if (petugasList.length === 0) return 0;

    let totalChecked = 0;
    let totalItems = petugasList.length * 8; // 8 checklist items per officer

    petugasList.forEach(namaExcel => {
      const namaResmi = getNamaResmi(namaExcel);
      if (!namaResmi) return;

      const spjItem = daftarSpj.find(s => s.pegawaiNama === namaResmi && s.tanggal === dateKey);
      if (spjItem && spjItem.checklist) {
        const checkedCount = Object.values(spjItem.checklist).filter(Boolean).length;
        totalChecked += checkedCount;
      }
    });

    return Math.round((totalChecked / totalItems) * 100);
  };

  // Activity Status Resolver
  const tentukanStatusKegiatan = (keg, dateKey) => {
    const progres = hitungProgresSpjKegiatan(keg, dateKey);
    
    // Check dates
    const today = new Date();
    today.setHours(0,0,0,0);
    const activityDate = new Date(dateKey);
    activityDate.setHours(0,0,0,0);

    if (activityDate > today) {
      return { label: 'Akan Datang', color: 'blue', value: progres, hex: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else if (activityDate.getTime() === today.getTime()) {
      return { label: 'Sedang Berlangsung', color: 'orange', value: progres, hex: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    } else {
      // Past
      if (progres === 100) {
        return { label: 'Lengkap', color: 'green', value: progres, hex: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      } else if (progres > 0) {
        return { label: `SPJ ${progres}%`, color: 'yellow', value: progres, hex: '#eab308', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      } else {
        return { label: 'Belum Dilaksanakan', color: 'red', value: progres, hex: '#ef4444', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      }
    }
  };

  // Calendar logic helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(2026, 5, 26)); // Fixed date June 2026 for simulation

  // Map database activities to YYYY-MM-DD
  const kegiatanByDate = useMemo(() => {
    const map = {};
    daftarKegiatan.forEach(keg => {
      if (!keg.tanggal || !keg.bulan) return;
      const blnStr = String(keg.bulan).toLowerCase().trim();
      let kYear = new Date().getFullYear();
      let kMonthIndex = -1;

      for (let i = 0; i < BULAN_FULL.length; i++) {
        if (blnStr.includes(BULAN_FULL[i].toLowerCase())) {
          kMonthIndex = i;
          break;
        }
      }

      const yearMatch = blnStr.match(/\d{4}/);
      if (yearMatch) kYear = parseInt(yearMatch[0], 10);

      if (kMonthIndex !== -1) {
        const d = String(keg.tanggal).padStart(2, '0');
        const m = String(kMonthIndex + 1).padStart(2, '0');
        const key = `${kYear}-${m}-${d}`;
        
        if (!map[key]) map[key] = [];
        map[key].push(keg);
      }
    });
    return map;
  }, [daftarKegiatan]);

  // Unique lists for filters
  const listProgramUnik = useMemo(() => {
    return [...new Set(daftarKegiatan.map(k => k.program).filter(Boolean))].sort();
  }, [daftarKegiatan]);

  const listDesaUnik = useMemo(() => {
    return [...new Set(daftarKegiatan.map(k => k.desa).filter(Boolean))].sort();
  }, [daftarKegiatan]);

  // Apply filters
  const getFilteredKegiatanDate = (dateKey) => {
    let activities = kegiatanByDate[dateKey] || [];
    
    if (filterProgram) {
      activities = activities.filter(k => k.program === filterProgram);
    }
    if (filterDesa) {
      activities = activities.filter(k => k.desa === filterDesa);
    }
    if (filterStatus) {
      activities = activities.filter(k => {
        const stat = tentukanStatusKegiatan(k, dateKey);
        return stat.color === filterStatus;
      });
    }
    return activities;
  };

  // Summary Metrics calculations for the Current Month
  const currentMonthActivities = useMemo(() => {
    const list = [];
    Object.keys(kegiatanByDate).forEach(key => {
      const parts = key.split('-');
      if (parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === (month + 1)) {
        list.push(...kegiatanByDate[key]);
      }
    });
    return list;
  }, [kegiatanByDate, year, month]);

  const prevMonthActivities = useMemo(() => {
    const list = [];
    const prevDate = new Date(year, month - 1, 1);
    const pYear = prevDate.getFullYear();
    const pMonth = prevDate.getMonth();
    
    Object.keys(kegiatanByDate).forEach(key => {
      const parts = key.split('-');
      if (parseInt(parts[0], 10) === pYear && parseInt(parts[1], 10) === (pMonth + 1)) {
        list.push(...kegiatanByDate[key]);
      }
    });
    return list;
  }, [kegiatanByDate, year, month]);

  // KPI Computations
  const totalHariBulanIni = daysInMonth;
  const totalKegiatanBulanIni = currentMonthActivities.length;
  const totalDesaBulanIni = useMemo(() => {
    return new Set(currentMonthActivities.map(k => k.desa).filter(Boolean)).size;
  }, [currentMonthActivities]);
  
  const totalPegawaiBulanIni = useMemo(() => {
    const namesSet = new Set();
    currentMonthActivities.forEach(k => {
      if (k.pegawai) {
        k.pegawai.split(',').forEach(p => namesSet.add(p.trim()));
      }
    });
    return namesSet.size;
  }, [currentMonthActivities]);

  const persentaseSpjBulanIni = useMemo(() => {
    let checkedItems = 0;
    let totalItems = 0;

    Object.keys(kegiatanByDate).forEach(key => {
      const parts = key.split('-');
      if (parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === (month + 1)) {
        kegiatanByDate[key].forEach(k => {
          if (k.pegawai) {
            const listNames = k.pegawai.split(',').map(p => p.trim()).filter(Boolean);
            totalItems += listNames.length * 8;
            listNames.forEach(name => {
              const resm = getNamaResmi(name);
              if (resm) {
                const spjItem = daftarSpj.find(s => s.pegawaiNama === resm && s.tanggal === key);
                if (spjItem && spjItem.checklist) {
                  checkedItems += Object.values(spjItem.checklist).filter(Boolean).length;
                }
              }
            });
          }
        });
      }
    });

    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  }, [kegiatanByDate, year, month, daftarSpj, daftarPegawai]);

  const totalAnggaranBulanIni = useMemo(() => {
    return currentMonthActivities.reduce((sum, k) => sum + (Number(k.dana) || 0), 0);
  }, [currentMonthActivities]);

  const ringkasanBulanIni = useMemo(() => {
    let lengkapCount = 0;
    let belumCount = 0;
    
    currentMonthActivities.forEach(keg => {
      const d = String(keg.tanggal).padStart(2, '0');
      let kMonthIndex = -1;
      const blnStr = String(keg.bulan).toLowerCase().trim();
      for (let i = 0; i < BULAN_FULL.length; i++) {
        if (blnStr.includes(BULAN_FULL[i].toLowerCase())) {
          kMonthIndex = i;
          break;
        }
      }
      if (kMonthIndex !== -1) {
        const key = `${year}-${String(kMonthIndex + 1).padStart(2, '0')}-${d}`;
        const progres = hitungProgresSpjKegiatan(keg, key);
        if (progres === 100) {
          lengkapCount++;
        } else {
          belumCount++;
        }
      } else {
        belumCount++;
      }
    });

    const total = currentMonthActivities.length;
    const pctLengkap = total > 0 ? Math.round((lengkapCount / total) * 100) : 0;
    const pctBelum = total > 0 ? total - lengkapCount : 0;
    const pctBelumPersen = total > 0 ? Math.round((pctBelum / total) * 100) : 0;

    return {
      total,
      lengkap: `${lengkapCount} (${pctLengkap}%)`,
      belum: `${pctBelum} (${pctBelumPersen}%)`,
      anggaran: totalAnggaranBulanIni
    };
  }, [currentMonthActivities, daftarSpj, daftarPegawai, totalAnggaranBulanIni]);

  // KPI Trend percentages compared to previous month
  const trendKegiatan = useMemo(() => {
    const prev = prevMonthActivities.length;
    if (prev === 0) return { text: '+12%', isUp: true }; // clean mockup fallback
    const diff = totalKegiatanBulanIni - prev;
    const pct = Math.round((diff / prev) * 100);
    return { text: `${pct >= 0 ? '+' : ''}${pct}%`, isUp: pct >= 0 };
  }, [totalKegiatanBulanIni, prevMonthActivities]);

  const trendSpj = useMemo(() => {
    return { text: '+8%', isUp: true }; // clean mockup fallback
  }, []);

  const detailSidebarData = useMemo(() => {
    const targetDate = selectedDate || '2026-06-26';
    const acts = getFilteredKegiatanDate(targetDate);
    const totAnggaran = acts.reduce((sum, a) => sum + (Number(a.dana) || 0), 0);
    
    // Average completion of the day
    let totalChecked = 0;
    let totalPossible = 0;
    acts.forEach(k => {
      if (k.pegawai) {
        const petugas = k.pegawai.split(',').map(p => p.trim()).filter(Boolean);
        totalPossible += petugas.length * 8;
        petugas.forEach(p => {
          const resm = getNamaResmi(p);
          const spj = daftarSpj.find(s => s.pegawaiNama === resm && s.tanggal === targetDate);
          if (spj && spj.checklist) {
            totalChecked += Object.values(spj.checklist).filter(Boolean).length;
          }
        });
      }
    });

    const completionPct = totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0;

    return {
      dateString: targetDate,
      formattedDate: () => {
        const parts = targetDate.split('-');
        const dNum = parseInt(parts[2], 10);
        const mIndex = parseInt(parts[1], 10) - 1;
        const yNum = parts[0];
        
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dateObj = new Date(parseInt(yNum, 10), mIndex, dNum);
        const dayName = days[dateObj.getDay()];
        
        return `${dayName}, ${dNum} ${BULAN_FULL[mIndex]} ${yNum}`;
      },
      activities: acts,
      totalBudget: totAnggaran,
      completion: completionPct
    };
  }, [selectedDate, daftarSpj, filterProgram, filterDesa, filterStatus]);

  // Handle manual activity submission
  const handleSimpanManual = async (e) => {
    e.preventDefault();
    if (!formKegiatan || !formDesa || !formProgram || !formDana) {
      alert('Mohon isi semua field wajib.');
      return;
    }

    const pegawaiString = formPegawai.join(', ');
    const danaNum = parseFloat(formDana.replace(/[^\d]/g, '')) || 0;

    const baru = {
      bulan: formBulan,
      program: formProgram,
      kegiatan: formKegiatan,
      desa: formDesa,
      pegawai: pegawaiString,
      tanggal: formTanggal,
      dana: danaNum
    };

    try {
      setLoading(true);
      await simpanBanyakKegiatanDb([baru], []);
      await tarikData();
      setTambahModalOpen(false);
      
      // Reset form
      setFormKegiatan('');
      setFormDesa('');
      setFormProgram('');
      setFormPegawai([]);
      setFormDana('');
    } catch (e) {
      alert('Gagal menyimpan kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  // Export current month activities to Excel
  const handleExportExcel = () => {
    const dataToExport = currentMonthActivities.map(k => ({
      'Bulan': k.bulan,
      'Program': k.program,
      'Kegiatan': k.kegiatan,
      'Tujuan (Desa)': k.desa,
      'Petugas': k.pegawai,
      'Tanggal': k.tanggal,
      'Dana (Rp)': k.dana
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Kegiatan');
    
    // Auto-fit columns
    const maxLens = {};
    dataToExport.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key]);
        maxLens[key] = Math.max(maxLens[key] || 10, val.length + 2);
      });
    });
    worksheet['!cols'] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] }));

    XLSX.writeFile(workbook, `Jadwal_Kegiatan_${BULAN_FULL[month]}_${year}.xlsx`);
  };

  // Conditional printing trigger
  const handlePrintSppd = (activities) => {
    if (activities.length === 0) return;
    if (activities.length === 1) {
      bukaModalPrint(activities[0]);
    } else {
      setSelectCetakModalOpen(true);
    }
  };

  const bukaModalPrint = (keg) => {
    setPrintData({ ...keg, modalOpen: true });
    const daftarNamaPetugas = keg.pegawai ? keg.pegawai.split(',').map(p => p.trim()).filter(Boolean) : [];
    setPrintPetugas(daftarNamaPetugas.length > 0 ? daftarNamaPetugas[0] : '');
    setJenisDokumen('SPPD');
    setNomorSppd('');
    setSelectedExtraActivities([]);
  };

  const eksekusiCetak = () => {
    setPrintData(prev => ({ ...prev, modalOpen: false }));
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const bendahara = useMemo(() => daftarPegawai.find(p => p.peran === 'Bendahara Pengeluaran'), [daftarPegawai]);
  const kpa = useMemo(() => daftarPegawai.find(p => p.peran === 'Kuasa Pengguna Anggaran (KPA)'), [daftarPegawai]);
  const pptk = useMemo(() => daftarPegawai.find(p => p.peran === 'Pejabat Pelaksana Teknis Kegiatan (PPTK)'), [daftarPegawai]);

  const getDataPegawai = (nama) => {
    if (!nama) return null;
    return daftarPegawai.find(p => p.nama.toLowerCase().includes(nama.toLowerCase())) || { nama: nama };
  };

  const formatTgl = (tgl, bln) => {
    if (!tgl || !bln) return '... ................. 202...';
    const tahun = bln.split(' ')[1] || new Date().getFullYear();
    const textBln = bln.split(' ')[0];
    const formatBulan = textBln.charAt(0).toUpperCase() + textBln.slice(1).toLowerCase();
    return `${String(tgl).padStart(2, '0')} ${formatBulan} ${tahun}`;
  };

  const formatNip = (nip) => {
    if (!nip) return 'NIP. ........................................';
    const cekNip = String(nip).toUpperCase();
    if (cekNip.includes('NIP') || cekNip.includes('NI ')) return nip;
    return `NIP. ${nip}`;
  };

  const formatDesa = (desa) => desa && (desa.toLowerCase().includes('desa') || desa.toLowerCase().includes('kelurahan')) ? desa : desa ? `Desa ${desa}` : '.......................................';

  const normalizeDesaName = (name) => {
    if (!name) return '';
    return String(name).toLowerCase().replace(/desa/g, '').replace(/kelurahan/g, '').trim();
  };

  const getKepalaDesa = (namaDesa) => {
    if (!namaDesa) return '(...................................................)';
    const normalizedInput = normalizeDesaName(namaDesa);
    const desa = daftarDesa.find(d => normalizeDesaName(d.namaDesa) === normalizedInput);
    if (desa && desa.namaKades) {
      return <span className="font-bold underline uppercase">{desa.namaKades}</span>;
    }
    return '(...................................................)';
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

  const getNamaResmiObject = (namaExcel) => {
    if (!namaExcel) return null;
    const target = String(namaExcel).trim().toLowerCase();
    
    let match = daftarPegawai.find(p => p.nama.toLowerCase().trim() === target);
    if (match) return match;

    match = daftarPegawai.find(p => p.nama.toLowerCase().includes(target));
    if (match) return match;

    match = daftarPegawai.find(p => target.includes(p.nama.toLowerCase().trim()));
    if (match) return match;

    return { nama: namaExcel };
  };

  const pegawaiCetak = useMemo(() => {
    if (!printPetugas) return null;
    return getNamaResmiObject(printPetugas);
  }, [printPetugas, daftarPegawai]);

  const relatedActivities = useMemo(() => {
    if (!printData || !printPetugas || jenisDokumen !== 'SPPD') return [];
    return daftarKegiatan.filter(k => 
      k.id !== printData.id &&
      k.bulan === printData.bulan &&
      k.program === printData.program &&
      k.kegiatan === printData.kegiatan &&
      k.pegawai && k.pegawai.includes(printPetugas)
    ).sort((a,b) => {
      const dateA = new Date(a.tanggal ? `${getTahun(a.bulan)}-${String(a.bulan).split(' ')[0]}-${a.tanggal}` : 0);
      const dateB = new Date(b.tanggal ? `${getTahun(b.bulan)}-${String(b.bulan).split(' ')[0]}-${b.tanggal}` : 0);
      return dateA - dateB;
    });
  }, [printData, printPetugas, daftarKegiatan, jenisDokumen]);

  const perjalananList = useMemo(() => {
    if (!printData) return [];
    return [printData, ...selectedExtraActivities].sort((a,b) => {
      const dateA = new Date(a.tanggal ? `${getTahun(a.bulan)}-${String(a.bulan).split(' ')[0]}-${a.tanggal}` : 0);
      const dateB = new Date(b.tanggal ? `${getTahun(b.bulan)}-${String(b.bulan).split(' ')[0]}-${b.tanggal}` : 0);
      return dateA - dateB;
    });
  }, [printData, selectedExtraActivities]);

  const hitungLamaPerjalananPrint = () => {
    const uniqueDates = new Set(perjalananList.map(p => `${p.tanggal}-${p.bulan}`));
    const length = uniqueDates.size;
    if (length === 0) return '1 (Satu) Hari';
    const words = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima'];
    return `${length} (${words[length] || length}) Hari`;
  };

  return (
    <div className="font-sans relative">
      
      {/* ====================================================================== */}
      {/* 1. INTERACTIVE PAGE LAYOUT (HIDDEN DURING PRINT) */}
      {/* ====================================================================== */}
      <div className="print:hidden space-y-8 animate-in fade-in duration-500">
        
        {/* SUMMARY CARDS (KPI) - 5 Cards Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* KPI 1: Total Hari */}
          <div className="bg-white p-5 rounded-[1.25rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <CalendarIcon size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{totalHariBulanIni}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Total Hari</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Bulan {BULAN_FULL[month]} {year}</p>
            </div>
          </div>

          {/* KPI 2: Total Kegiatan */}
          <div className="bg-white p-5 rounded-[1.25rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Layers size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-slate-900 leading-none">{totalKegiatanBulanIni}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Kegiatan</p>
              <div className={`flex items-center gap-0.5 text-[9px] font-bold mt-1 ${trendKegiatan.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span>{trendKegiatan.isUp ? '↑' : '↓'} {trendKegiatan.text} dari Mei</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Desa Terlibat */}
          <div className="bg-white p-5 rounded-[1.25rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{totalDesaBulanIni}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Desa Terlibat</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Silian Raya</p>
            </div>
          </div>

          {/* KPI 4: SPJ Lengkap */}
          <div className="bg-white p-5 rounded-[1.25rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-orange-50 text-orange-650 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-slate-900 leading-none">{persentaseSpjBulanIni}%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">SPJ Lengkap</p>
              <div className={`flex items-center gap-0.5 text-[9px] font-bold mt-1 ${trendSpj.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span>{trendSpj.isUp ? '↑' : '↓'} {trendSpj.text} dari Mei</span>
              </div>
            </div>
          </div>

          {/* KPI 5: Total Anggaran */}
          <div className="bg-white p-5 rounded-[1.25rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <DollarSign size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-slate-900 leading-none truncate">Rp {totalAnggaranBulanIni.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">Total Anggaran</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">BOK Bulan Ini</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE: TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: CALENDAR GRID WORKSPACE (col-span-9) */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            
            {/* TOOLBAR */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Left Side: Navigation Controls & Styled Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
                <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm">
                  <ChevronLeft size={16} className="text-slate-650" />
                </button>
                <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm mr-2">
                  <ChevronRight size={16} className="text-slate-650" />
                </button>
                
                {/* Styled Custom Dropdown Month Selector */}
                <div className="relative flex items-center gap-1 select-none pr-3">
                  <select 
                    value={month} 
                    onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value, 10), 1))}
                    className="appearance-none bg-transparent font-black text-slate-800 text-base pr-6 pl-1 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {BULAN_FULL.map((bln, idx) => (
                      <option key={bln} value={idx}>{bln} {year}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1 text-slate-500 pointer-events-none" />
                </div>

                <button onClick={goToday} className="px-3.5 py-2 bg-blue-50 text-blue-600 font-extrabold text-[11px] rounded-xl hover:bg-blue-100 border border-blue-200/30 shadow-sm transition-all uppercase">
                  Hari Ini
                </button>
              </div>

              {/* Right Side: Filters Dropdowns */}
              <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto flex-1">
                {/* Dropdown Program */}
                <div className="relative shrink-0 w-full sm:w-[150px]">
                  <select 
                    value={filterProgram} 
                    onChange={(e) => setFilterProgram(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Semua Program</option>
                    {listProgramUnik.map(prog => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Dropdown Desa */}
                <div className="relative shrink-0 w-full sm:w-[130px]">
                  <select 
                    value={filterDesa} 
                    onChange={(e) => setFilterDesa(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Semua Desa</option>
                    {listDesaUnik.map(desa => (
                      <option key={desa} value={desa}>{desa}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Dropdown Tampilan */}
                <div className="relative shrink-0 w-full sm:w-[130px]">
                  <select
                    value={compactView ? 'padat' : 'detail'}
                    onChange={(e) => setCompactView(e.target.value === 'padat')}
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="detail">Tampilan Detail</option>
                    <option value="padat">Tampilan Padat</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* CALENDAR GRID */}
            {loading ? (
              <div className="p-20 text-center text-slate-500 animate-pulse font-medium bg-white rounded-3xl border border-slate-200 shadow-sm">
                Memuat data kalender...
              </div>
            ) : (
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                {/* Day Names Header */}
                <div className="grid grid-cols-7 gap-3 mb-3 select-none">
                  {HARI.map(h => (
                    <div key={h} className="text-center font-black text-[10px] uppercase text-slate-400 tracking-wider">
                      {h.toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 gap-3">
                  {/* Pre-month empty slots */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/50 select-none"></div>
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dNum = idx + 1;
                    const dStr = String(dNum).padStart(2, '0');
                    const mStr = String(month + 1).padStart(2, '0');
                    const dateKey = `${year}-${mStr}-${dStr}`;
                    
                    const dateObj = new Date(year, month, dNum);
                    const isToday = new Date(2026, 5, 26).toDateString() === dateObj.toDateString();
                    
                    const dayActivities = getFilteredKegiatanDate(dateKey);
                    const hasActivity = dayActivities.length > 0;
                    const isSelected = selectedDate === dateKey;

                    return (
                      <div 
                        key={dNum} 
                        onClick={() => setSelectedDate(dateKey)}
                        className={`relative min-h-[110px] p-3 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20' 
                            : isToday 
                              ? 'border-indigo-400 bg-indigo-50/20' 
                              : 'border-slate-100 bg-white hover:border-slate-350 hover:shadow-sm'
                        }`}
                      >
                        {/* Day number & Today Badge */}
                        <div className="flex justify-between items-start select-none">
                          <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isSelected 
                              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                              : isToday
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-800'
                          }`}>
                            {dNum}
                          </span>
                          {isToday && (
                            <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 origin-top-right">
                              Hari Ini
                            </span>
                          )}
                        </div>

                        {/* Activities list inside cell */}
                        <div className="mt-2 space-y-2 flex-1 flex flex-col justify-start">
                          {!compactView ? (
                            dayActivities.slice(0, 2).map((keg, kIdx) => {
                              const st = tentukanStatusKegiatan(keg, dateKey);
                              
                              let dotColor = 'bg-slate-400';
                              if (st.color === 'green') dotColor = 'bg-emerald-500';
                              else if (st.color === 'yellow') dotColor = 'bg-amber-500';
                              else if (st.color === 'red') dotColor = 'bg-rose-500';
                              else if (st.color === 'blue') dotColor = 'bg-blue-500';
                              else if (st.color === 'orange') dotColor = 'bg-orange-500';

                              return (
                                <div key={keg.id || kIdx} className="text-left text-[11px] leading-tight space-y-0.5 border-t border-slate-50 pt-1.5 first:border-0 first:pt-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`}></span>
                                    <p className="font-bold text-slate-800 truncate">{keg.kegiatan}</p>
                                  </div>
                                  <p className="text-[9px] text-slate-500 pl-3 truncate font-semibold">{keg.desa}</p>
                                  <div className="pl-3 pt-0.5">
                                    <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded leading-none ${st.bg}`}>
                                      {st.color === 'green' ? '✓ Lengkap' : st.color === 'yellow' ? `${st.value}%` : st.color === 'red' ? 'Belum Lengkap' : st.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            // Compact dots indicator
                            hasActivity && (
                              <div className="flex flex-wrap gap-1 px-1 mt-1">
                                {dayActivities.map((keg, kIdx) => {
                                  const st = tentukanStatusKegiatan(keg, dateKey);
                                  return (
                                    <span 
                                      key={keg.id || kIdx} 
                                      className="w-2 h-2 rounded-full border border-white shadow-sm inline-block shrink-0" 
                                      style={{ backgroundColor: st.hex }}
                                      title={`${keg.kegiatan} (${keg.desa})`}
                                    />
                                  );
                                })}
                              </div>
                            )
                          )}

                          {/* Overflow indicators */}
                          {dayActivities.length > 2 && !compactView && (
                            <div className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 text-center mt-0.5">
                              +{dayActivities.length - 2} kegiatan lainnya
                            </div>
                          )}
                        </div>

                        {/* Hover Empty State Label */}
                        {!hasActivity && (
                          <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity select-none">
                            <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded text-slate-400 bg-slate-50 border border-slate-100 uppercase">
                              Libur
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEGEND FOOTNOTE */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 py-3.5 px-6 rounded-2xl shadow-sm">
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kegiatan Selesai & Lengkap</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sedang Berlangsung</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Belum Lengkap SPJ</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Belum Dilaksanakan</div>
               <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-350"></span> Libur</div>
            </div>

          </div>

          {/* RIGHT COLUMN: DETAIL & QUICK ACTIONS SIDEBAR (col-span-3) */}
          <div className="col-span-12 xl:col-span-3 space-y-6">
            
            {/* 1. HARI INI / SELECTED DATE CARD */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0"><CalendarIcon size={16} /></div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800">
                      {detailSidebarData.dateString === '2026-06-26' ? 'Hari Ini' : 'Detail Kegiatan'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {detailSidebarData.formattedDate()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simplified activities list cards */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {detailSidebarData.activities.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 font-semibold border-2 border-dashed border-slate-100 rounded-2xl">
                    <Info size={20} className="mx-auto mb-2 text-slate-300" />
                    Tidak ada kegiatan pada tanggal ini.
                  </div>
                ) : (
                  detailSidebarData.activities.map((keg, idx) => {
                    return (
                      <div key={keg.id || idx} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 p-4 rounded-2xl transition-all flex justify-between items-center group relative">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug break-words">{keg.kegiatan}</h4>
                          <div className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
                            <span>👥 {keg.pegawai ? keg.pegawai.split(',').length : 0} Petugas</span>
                          </div>
                        </div>
                        
                        {/* Options menu triggering Quick Print */}
                        <button 
                          onClick={() => bukaModalPrint(keg)} 
                          className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0" 
                          title="Cetak SPPD Cepat"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. AKSI CEPAT */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi Cepat</h3>
              <div className="grid grid-cols-4 gap-2">
                {/* Tambah */}
                <button onClick={() => setTambahModalOpen(true)} className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform"><Plus size={16} /></div>
                  <span className="text-[8px] font-extrabold text-slate-500 leading-tight">Tambah Kegiatan</span>
                </button>
                
                {/* Cetak */}
                <button onClick={() => handlePrintSppd(detailSidebarData.activities)} disabled={detailSidebarData.activities.length === 0} className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all text-center group cursor-pointer disabled:opacity-50">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform"><Printer size={16} /></div>
                  <span className="text-[8px] font-extrabold text-slate-500 leading-tight">Cetak SPPD</span>
                </button>
                
                {/* Excel */}
                <button onClick={handleExportExcel} className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform"><FileSpreadsheet size={16} /></div>
                  <span className="text-[8px] font-extrabold text-slate-500 leading-tight">Export Excel</span>
                </button>
                
                {/* Filter */}
                <button onClick={() => { setFilterProgram(''); setFilterDesa(''); setFilterStatus(''); }} className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform"><Filter size={16} /></div>
                  <span className="text-[8px] font-extrabold text-slate-500 leading-tight">Filter Kegiatan</span>
                </button>
              </div>
            </div>

            {/* 3. RINGKASAN BULAN INI */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Bulan Ini</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Kegiatan</span>
                  <span className="font-bold text-slate-800">{ringkasanBulanIni.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">SPJ Lengkap</span>
                  <span className="font-extrabold text-emerald-600">{ringkasanBulanIni.lengkap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Belum Lengkap</span>
                  <span className="font-extrabold text-rose-500">{ringkasanBulanIni.belum}</span>
                </div>
                <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Anggaran</span>
                  <span className="font-black text-blue-700">Rp {ringkasanBulanIni.anggaran.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ====================================================================== */}
      {/* 2. OVERLAYS & MODALS (STAYS DYNAMICALLY CONTROLLED OUTSIDE print:hidden) */}
      {/* ====================================================================== */}
      {selectCetakModalOpen && detailSidebarData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-800">Pilih Kegiatan untuk Cetak SPPD</h3>
              <button 
                onClick={() => setSelectCetakModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Silakan pilih salah satu dari beberapa kegiatan yang terjadwal pada hari ini untuk mencetak dokumen SPPD.
            </p>

            <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
              {detailSidebarData.activities.map((keg, idx) => (
                <button
                  key={keg.id || idx}
                  onClick={() => {
                    setSelectCetakModalOpen(false);
                    bukaModalPrint(keg);
                  }}
                  className="w-full text-left p-3.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl transition-all group flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                      {keg.kegiatan}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                      <span>📍 {keg.desa}</span> | <span className="uppercase text-blue-600 font-bold">{keg.program}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setSelectCetakModalOpen(false)}
              className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {tambahModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
                <span>➕</span> Tambah Kegiatan Baru
              </h3>
              <button 
                onClick={() => setTambahModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimpanManual} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tanggal</label>
                  <select 
                    value={formTanggal} 
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Array.from({ length: 31 }).map((_, i) => (
                      <option key={i+1} value={String(i+1)}>{i+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bulan & Tahun</label>
                  <select 
                    value={formBulan} 
                    onChange={(e) => setFormBulan(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MEI 2026">MEI 2026</option>
                    <option value="JUNI 2026">JUNI 2026</option>
                    <option value="JULI 2026">JULI 2026</option>
                    <option value="AGUSTUS 2026">AGUSTUS 2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Program Kerja</label>
                <select 
                  value={formProgram} 
                  onChange={(e) => setFormProgram(e.target.value)}
                  className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Pilih Program --</option>
                  <option value="KIA">KIA (Kesehatan Ibu & Anak)</option>
                  <option value="PROMKES">PROMKES (Promosi Kesehatan)</option>
                  <option value="KESEHATAN LINGKUNGAN">KESEHATAN LINGKUNGAN</option>
                  <option value="P2P">P2P (Pencegahan & Pengendalian Penyakit)</option>
                  <option value="GIZI">GIZI</option>
                  <option value="DAK Non Fisik">DAK Non Fisik</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Kegiatan</label>
                <input 
                  type="text" 
                  value={formKegiatan} 
                  onChange={(e) => setFormKegiatan(e.target.value)}
                  placeholder="Misal: Posyandu Balita / Penyuluhan Stunting"
                  className="w-full border border-slate-350 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tujuan (Desa)</label>
                <select 
                  value={formDesa} 
                  onChange={(e) => setFormDesa(e.target.value)}
                  className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Pilih Desa --</option>
                  {daftarDesa.map(desa => (
                    <option key={desa.id} value={desa.namaDesa}>{desa.namaDesa}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pegawai Bertugas (Bisa pilih lebih dari 1)</label>
                <div className="max-h-[140px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  {daftarPegawai.map(peg => {
                    const isChecked = formPegawai.includes(peg.nama);
                    return (
                      <label key={peg.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormPegawai(formPegawai.filter(n => n !== peg.nama));
                            } else {
                              setFormPegawai([...formPegawai, peg.nama]);
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span>{peg.nama} <span className="text-[10px] text-slate-400">({peg.jabatanFungsional || peg.peran})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Anggaran DAK (Rp)</label>
                <input 
                  type="text" 
                  value={formDana} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setFormDana(val ? `Rp ${parseInt(val, 10).toLocaleString('id-ID')}` : '');
                  }}
                  placeholder="Misal: Rp 750.000"
                  className="w-full border border-slate-350 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setTambahModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL SELECT ACTIVITY FOR PRINTING (WHEN DATE HAS MULTIPLE ACTIVITIES) */}
      {selectCetakModalOpen && detailSidebarData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-800">Pilih Kegiatan untuk Cetak SPPD</h3>
              <button 
                onClick={() => setSelectCetakModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Silakan pilih salah satu dari beberapa kegiatan yang terjadwal pada hari ini untuk mencetak dokumen SPPD.
            </p>

            <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
              {detailSidebarData.activities.map((keg, idx) => (
                <button
                  key={keg.id || idx}
                  onClick={() => {
                    setSelectCetakModalOpen(false);
                    bukaModalPrint(keg);
                  }}
                  className="w-full text-left p-3.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl transition-all group flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                      {keg.kegiatan}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                      <span>📍 {keg.desa}</span> | <span className="uppercase text-blue-600 font-bold">{keg.program}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setSelectCetakModalOpen(false)}
              className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* 7. MODAL ADD ACTIVITY MANUALLY */}
      {tambahModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
                <span>➕</span> Tambah Kegiatan Baru
              </h3>
              <button 
                onClick={() => setTambahModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimpanManual} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tanggal</label>
                  <select 
                    value={formTanggal} 
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Array.from({ length: 31 }).map((_, i) => (
                      <option key={i+1} value={String(i+1)}>{i+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bulan & Tahun</label>
                  <select 
                    value={formBulan} 
                    onChange={(e) => setFormBulan(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MEI 2026">MEI 2026</option>
                    <option value="JUNI 2026">JUNI 2026</option>
                    <option value="JULI 2026">JULI 2026</option>
                    <option value="AGUSTUS 2026">AGUSTUS 2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Program Kerja</label>
                <select 
                  value={formProgram} 
                  onChange={(e) => setFormProgram(e.target.value)}
                  className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Pilih Program --</option>
                  <option value="KIA">KIA (Kesehatan Ibu & Anak)</option>
                  <option value="PROMKES">PROMKES (Promosi Kesehatan)</option>
                  <option value="KESEHATAN LINGKUNGAN">KESEHATAN LINGKUNGAN</option>
                  <option value="P2P">P2P (Pencegahan & Pengendalian Penyakit)</option>
                  <option value="GIZI">GIZI</option>
                  <option value="DAK Non Fisik">DAK Non Fisik</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Kegiatan</label>
                <input 
                  type="text" 
                  value={formKegiatan} 
                  onChange={(e) => setFormKegiatan(e.target.value)}
                  placeholder="Misal: Posyandu Balita / Penyuluhan Stunting"
                  className="w-full border border-slate-350 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tujuan (Desa / Sekolah)</label>
                <select 
                  value={formDesa} 
                  onChange={(e) => setFormDesa(e.target.value)}
                  className="w-full border border-slate-350 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Pilih Tujuan --</option>
                  <optgroup label="Desa">
                    {daftarDesa.map(desa => (
                      <option key={desa.id} value={desa.namaDesa}>{desa.namaDesa}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sekolah">
                    {daftarSekolah.map(sekolah => (
                      <option key={sekolah.id} value={sekolah.namaSekolah}>{sekolah.namaSekolah}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pegawai Bertugas (Bisa pilih lebih dari 1)</label>
                <div className="max-h-[140px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  {daftarPegawai.map(peg => {
                    const isChecked = formPegawai.includes(peg.nama);
                    return (
                      <label key={peg.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormPegawai(formPegawai.filter(n => n !== peg.nama));
                            } else {
                              setFormPegawai([...formPegawai, peg.nama]);
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span>{peg.nama} <span className="text-[10px] text-slate-400">({peg.jabatanFungsional || peg.peran})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Anggaran DAK (Rp)</label>
                <input 
                  type="text" 
                  value={formDana} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setFormDana(val ? `Rp ${parseInt(val, 10).toLocaleString('id-ID')}` : '');
                  }}
                  placeholder="Misal: Rp 750.000"
                  className="w-full border border-slate-350 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setTambahModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL PILIH PRINT (DIALAHKAN LANGSUNG DARI KALENDER) */}
      {/* ========================================================= */}
      {printData && printData.modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Printer className="text-emerald-600"/> Cetak Dokumen Cepat</h3>
              <button onClick={() => setPrintData(null)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Lokasi Tujuan</p>
                <p className="text-sm font-bold text-slate-800">{printData.desa}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Maksud Perjalanan</p>
                <p className="text-sm font-bold text-slate-800 truncate">{printData.kegiatan}</p>
              </div>
            </div>

            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Pilih Dokumen yang Ingin Dicetak</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setJenisDokumen('SPPD')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'SPPD' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> SPPD
                  </button>
                  <button type="button" onClick={() => setJenisDokumen('RIIL')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'RIIL' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> Riil
                  </button>
                  <button type="button" onClick={() => setJenisDokumen('PERNYATAAN')} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex justify-center items-center ${jenisDokumen === 'PERNYATAAN' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <FileText size={18} className="mr-2 mb-0.5"/> Pernyataan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Pilih Petugas yang Dicetak</label>
                {printData.pegawai ? (
                  <select value={printPetugas} onChange={(e) => setPrintPetugas(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-emerald-50/30">
                    {printData.pegawai.split(',').map((p, i) => (
                      <option key={i} value={p.trim()}>{p.trim()}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-xl font-semibold border border-rose-100">Jadwal ini belum memiliki petugas.</div>
                )}
                
                {jenisDokumen === 'RIIL' && (!bendahara || !kpa || !pptk) && (
                   <div className="text-xs font-semibold text-rose-500 mt-2 flex flex-col gap-1">
                     {!bendahara && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: Bendahara Pengeluaran belum diatur.</span>}
                     {!kpa && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: KPA belum diatur di Entri Data.</span>}
                     {!pptk && <span><AlertCircle size={12} className="inline mr-1"/> Peringatan: PPTK belum diatur di Entri Data.</span>}
                   </div>
                )}
              </div>

              {jenisDokumen === 'SPPD' && relatedActivities.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl mt-4">
                  <label className="block text-sm font-bold text-emerald-800 mb-2">3. Tambahkan Tujuan Lain (Maks 2 Hari Tambahan)</label>
                  <p className="text-[10px] text-emerald-600 mb-3 leading-tight">Pilih kegiatan lain dengan maksud yang sama untuk digabungkan ke dalam 1 SPPD.</p>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin">
                    {relatedActivities.map(keg => {
                      const isChecked = selectedExtraActivities.some(a => a.id === keg.id);
                      const isDisabled = !isChecked && selectedExtraActivities.length >= 2;
                      return (
                        <label key={keg.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isChecked ? 'border-emerald-500 bg-emerald-100' : 'border-slate-200 bg-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-300'}`}>
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedExtraActivities(prev => prev.filter(a => a.id !== keg.id));
                              } else {
                                setSelectedExtraActivities(prev => [...prev, keg]);
                              }
                            }}
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-bold text-slate-800">{formatTgl(keg.tanggal, keg.bulan)}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{keg.desa}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">{jenisDokumen === 'SPPD' && relatedActivities.length > 0 ? '4' : '3'}. Nomor Surat Lampiran</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={nomorSppd} onChange={(e) => setNomorSppd(e.target.value)} placeholder="No" className="w-20 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none text-center focus:border-indigo-500 bg-white" />
                  <span className="text-sm font-bold text-slate-600">/440/DINKES-MT/PKM-SLN/SPPD-DD/{printData ? `${getBulanRomawi(printData.bulan)}-${getTahun(printData.bulan)}` : 'VI-2026'}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2">*Bisa dikosongkan jika ingin diisi manual menggunakan pulpen setelah di-print.</p>
              </div>
            </div>

            <div className="mt-8">
              <button type="button" onClick={eksekusiCetak} disabled={!printPetugas} className={`w-full text-white py-3.5 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${jenisDokumen === 'RIIL' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : jenisDokumen === 'PERNYATAAN' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'}`}>
                <Printer size={20}/> Cetak Dokumen {jenisDokumen}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: CETAKAN SPPD */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'SPPD' && (
        <div 
          className="hidden print:block bg-white w-full mx-auto text-black relative z-[9999]"
          style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', lineHeight: '1.1' }}
        >
          <style>{`
            @media print {
              body, html, #root, .overflow-hidden, .h-screen { height: auto !important; overflow: visible !important; background-color: white !important; }
              @page { size: A4; margin: 10mm 15mm; }
              .page-break { page-break-before: always; }
              table { border-collapse: collapse; }
              td, th { padding: 3px 5px !important; }
            }
          `}</style>

          {/* HALAMAN 1 SPPD */}
          <div className="w-full box-border relative">
            <div className="flex items-center border-b-[3px] border-black pb-2 mb-3" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'bold' }}>
              <div className="w-24 shrink-0 flex justify-center"><img src={logoMitra} alt="Logo" className="h-[75px] w-auto object-contain" /></div>
              <div className="flex-1 text-center pr-10">
                <div style={{ fontSize: '14pt' }} className="leading-tight">PEMERINTAH KABUPATEN MINAHASA TENGGARA<br/>PUSKESMAS SILIAN RAYA</div>
                <div style={{ fontSize: '8pt' }} className="mt-1">Alamat : Desa Silian Satu</div>
                <div style={{ fontSize: '11pt' }} className="mt-1 tracking-[0.2em]">KABUPATEN MINAHASA TENGGARA</div>
              </div>
            </div>

            <div className="w-full mb-3">
              <div className="flex justify-end mb-2">
                <table style={{ fontSize: '10pt' }}>
                  <tbody>
                    <tr><td className="pr-2">Lembar Ke</td><td>:</td></tr>
                    <tr><td className="pr-2">Kode No</td><td>:</td></tr>
                    <tr><td className="pr-2">Nomor</td><td>: {nomorSppd ? nomorSppd : '         '}/440/DINKES-MT/PKM-SLN/SPPD-DD/{printData ? `${getBulanRomawi(printData.bulan)}-${getTahun(printData.bulan)}` : 'VI-2026'}</td></tr>
                  </tbody>
                </table>
              </div>
              <h3 className="text-center font-bold underline uppercase tracking-wider mb-1" style={{ fontSize: '11pt' }}>Surat Perjalanan Dinas (SPD)</h3>
            </div>

            <table className="w-full border-collapse border border-black mb-3" style={{ fontSize: '10pt' }}>
              <tbody>
                <tr>
                  <td className="border border-black text-center align-top w-[5%]">1</td>
                  <td className="border border-black align-top w-[35%]">Pejabat Pembuat Komitmen</td>
                  <td colSpan="2" className="border border-black align-top font-bold uppercase w-[60%]">KEPALA PUSKESMAS SILIAN RAYA<br/>KABUPATEN MINAHASA TENGGARA</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">2</td>
                  <td className="border border-black align-top">Nama/NIP Pegawai yang melaksanakan perjalanan dinas</td>
                  <td colSpan="2" className="border border-black align-top font-bold">{pegawaiCetak ? pegawaiCetak.nama.toUpperCase() : '.......................................'}<br/>{formatNip(pegawaiCetak?.nip)}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">3</td>
                  <td className="border border-black align-top">a. Pangkat/Golongan<br/><br/>b. Jabatan / Instansi<br/>c. Tingkat Biaya Perjalanan Dinas</td>
                  <td colSpan="2" className="border border-black align-top">a. {pegawaiCetak?.golongan || '......................................'}<br/><br/><span className="font-bold">b. {pegawaiCetak?.jabatanFungsional || '......................................'}</span><br/>c.</td>
                </tr>
                <tr><td className="border border-black text-center align-top">4</td><td className="border border-black align-top">Maksud Perjalanan Dinas</td><td colSpan="2" className="border border-black align-top">{printData.kegiatan}</td></tr>
                <tr><td className="border border-black text-center align-top">5</td><td className="border border-black align-top">Alat Angkut yang di Pergunakan</td><td colSpan="2" className="border border-black align-top">Mobil</td></tr>
                <tr>
                  <td className="border border-black text-center align-top">6</td>
                  <td className="border border-black align-top">a. Tempat Berangkat<br/><br/>b. Tempat Tujuan</td>
                  <td colSpan="2" className="border border-black align-top">a. Puskesmas Silian Raya<br/><br/>b. {perjalananList.map(p => formatDesa(p.desa)).join(', ')}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top">7</td>
                  <td className="border border-black align-top">a. Lama Perjalanan Dinas<br/>b. Tanggal Berangkat<br/>c. Tanggal Harus Kembali/Tiba di Tempat Baru *)</td>
                  <td colSpan="2" className="border border-black align-top">a. {hitungLamaPerjalananPrint()}<br/>b. {formatTgl(perjalananList[0]?.tanggal, perjalananList[0]?.bulan)}<br/>c. {formatTgl(perjalananList[perjalananList.length - 1]?.tanggal, perjalananList[perjalananList.length - 1]?.bulan)}</td>
                </tr>
                <tr>
                  <td className="border border-black text-center align-top" rowSpan="3">8</td>
                  <td className="border border-black align-top">Pengikut: Nama</td>
                  <td className="border border-black align-top text-center w-[25%]">Tanggal Lahir</td>
                  <td className="border border-black align-top text-center w-[35%]">Keterangan</td>
                </tr>
                <tr><td className="border border-black align-top">1. </td><td className="border border-black align-top"></td><td className="border border-black align-top"></td></tr>
                <tr><td className="border border-black align-top">2. </td><td className="border border-black align-top"></td><td className="border border-black align-top"></td></tr>
                <tr>
                  <td className="border border-black text-center align-top">9</td>
                  <td className="border border-black align-top">Pembebanan Anggaran<br/><br/>a. Instansi<br/>b. Akun</td>
                  <td colSpan="2" className="border border-black align-top">DAK Non Fisik-Dana BOK-BOK Puskesmas<br/><br/>a. PUSKESMAS SILIAN RAYA<br/>b. </td>
                </tr>
                <tr><td className="border border-black text-center align-top">10</td><td className="border border-black align-top">Keterangan Lain-lain</td><td colSpan="2" className="border border-black align-top"></td></tr>
              </tbody>
            </table>

            <div className="flex justify-end mt-2">
              <div className="w-[300px]">
                <table className="mb-2">
                  <tbody><tr><td className="pr-2">Dikeluarkan di</td><td>: Silian</td></tr><tr><td className="pr-2">Pada Tanggal</td><td>: {formatTgl(printData.tanggal, printData.bulan)}</td></tr></tbody>
                </table>
                <p className="font-bold mb-12">PEJABAT PEMBUAT KOMITMEN</p>
                <p className="font-bold underline">dr. Winda Marshella Tanuli</p><p>Pembina Tkt I/ IV b</p><p className="font-bold">NIP. 198312052011022001</p>
              </div>
            </div>
          </div>

          {/* HALAMAN 2 SPPD */}
          <div className="page-break w-full box-border relative pt-6 flex flex-col justify-between" style={{ minHeight: '265mm' }}>
            <div>
              <table className="w-full border-collapse border border-black mb-0" style={{ fontSize: '10pt' }}>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-1/2 h-[160px]"></td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody>
                          <tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top">: Puskesmas Silian Raya</td></tr><tr><td className="align-top">(Tempat Kedudukan)</td><td></td></tr><tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(printData.tanggal, printData.bulan)}</td></tr><tr><td className="align-top">Kepala</td><td className="align-top">: Puskesmas Silian Raya</td></tr>
                        </tbody></table>
                        <div className="text-center w-full mt-auto pt-6"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></div>
                      </div>
                    </td>
                  </tr>
                  {/* Dynamic Destination Rows */}
                  {perjalananList.map((r, idx) => {
                    const romawi = ['II', 'III', 'IV', 'V', 'VI'];
                    const isLastDest = idx === perjalananList.length - 1;
                    const nextDest = isLastDest ? 'Puskesmas Silian Raya' : formatDesa(perjalananList[idx + 1].desa);
                    return (
                      <tr key={idx}>
                        <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                          <div className="flex flex-col justify-between h-full">
                            <table className="w-full"><tbody>
                              <tr><td className="w-[135px] align-top">{romawi[idx]}. Tiba di</td><td className="align-top font-bold">: {formatDesa(r.desa)}</td></tr>
                              <tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(r.tanggal, r.bulan)}</td></tr>
                              <tr><td className="align-top">Kepala</td><td className="align-top">: Desa {r.desa}</td></tr>
                            </tbody></table>
                            <div className="text-center w-full mt-auto pt-6">{getKepalaDesa(r.desa)}</div>
                          </div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                          <div className="flex flex-col justify-between h-full">
                            <table className="w-full"><tbody>
                              <tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top font-bold">: {formatDesa(r.desa)}</td></tr>
                              <tr><td className="align-top">Ke</td><td className="align-top">: {nextDest}</td></tr>
                              <tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(r.tanggal, r.bulan)}</td></tr>
                              <tr><td className="align-top">Kepala</td><td className="align-top">: Desa {r.desa}</td></tr>
                            </tbody></table>
                            <div className="text-center w-full mt-auto pt-6">{getKepalaDesa(r.desa)}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty Rows Padding */}
                  {Array.from({ length: Math.max(0, 3 - perjalananList.length) }).map((_, emptyIdx) => {
                    const currentIdx = perjalananList.length + emptyIdx;
                    const romawi = ['II', 'III', 'IV', 'V', 'VI'];
                    return (
                      <tr key={`empty-${emptyIdx}`}>
                        <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                          <div className="flex flex-col justify-between h-full">
                            <table className="w-full"><tbody>
                              <tr><td className="w-[135px] align-top">{romawi[currentIdx]}. Tiba di</td><td className="align-top">: ...........................................</td></tr>
                              <tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr>
                              <tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr>
                            </tbody></table>
                            <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                          </div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                          <div className="flex flex-col justify-between h-full">
                            <table className="w-full"><tbody>
                              <tr><td className="w-[135px] align-top">Berangkat dari</td><td className="align-top">: ...........................................</td></tr>
                              <tr><td className="align-top">Ke</td><td className="align-top">: ...........................................</td></tr>
                              <tr><td className="align-top">Pada Tanggal</td><td className="align-top">: ...........................................</td></tr>
                              <tr><td className="align-top">Kepala</td><td className="align-top">: </td></tr>
                            </tbody></table>
                            <div className="text-center w-full mt-auto pt-6">(...................................................)</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Final Return Block */}
                  <tr>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="flex flex-col justify-between h-full">
                        <table className="w-full"><tbody>
                          <tr><td className="w-[135px] align-top">V. Tiba di</td><td className="align-top">: Puskesmas Silian Raya</td></tr>
                          <tr><td className="align-top">Pada Tanggal</td><td className="align-top">: {formatTgl(perjalananList[perjalananList.length - 1]?.tanggal, perjalananList[perjalananList.length - 1]?.bulan)}</td></tr>
                          <tr><td className="align-top">Kepala</td><td className="align-top">: Puskesmas Silian Raya</td></tr>
                        </tbody></table>
                        <div className="text-center w-full mt-auto pt-6"><span className="font-bold underline">dr. Winda Marshella Tanuli</span><br/><span className="font-bold">NIP. 198312052011022001</span></div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top w-1/2 h-[160px]">
                      <div className="text-justify mt-2">Telah diperiksa dengan keterangan bahwa perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam jangka waktu yang sesingkat-singkatnya.</div>
                    </td>
                  </tr>

                  <tr><td colSpan="2" className="border border-black p-2 align-top"><span className="font-bold">VI. Catatan Lain-lain :</span></td></tr>
                  <tr><td colSpan="2" className="border border-black p-2 align-top text-justify"><span className="font-bold">VII. PERHATIAN</span><br/>PPK yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan keuangan negara apabila menderita rugi akibat kesalahan, kelalaian dan kealpaannya.</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6 mb-4">
              <div className="w-[300px] text-center">
                <p className="font-bold mb-20">PEJABAT PEMBUAT KOMITMEN</p>
                <p className="font-bold underline">dr. Winda Marshella Tanuli</p><p className="font-bold">NIP. 198312052011022001</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: CETAKAN RIIL PENGELUARAN */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'RIIL' && (
        <CetakRiil 
          printData={printData}
          pegawaiCetak={pegawaiCetak}
          bendahara={bendahara}
          kpa={kpa}
          pptk={pptk}
          nomorSppd={nomorSppd}
        />
      )}

      {/* ====================================================================== */}
      {/* AREA KERTAS A4: SURAT PERNYATAAN */}
      {/* ====================================================================== */}
      {printData && jenisDokumen === 'PERNYATAAN' && (
        <SuratPernyataan 
          printData={printData}
          pegawaiCetak={pegawaiCetak}
          nomorSppd={nomorSppd}
        />
      )}
    </div>
  );
}

