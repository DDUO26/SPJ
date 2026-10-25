import { i as interopRequire } from './chunk-aKtaBQYM.js';
import {
  V as getReact,
  h as getJsxRuntime,
  O as getDocs,
  F as collection,
  w as db,
  S as savePengaturan,
  _ as getPengaturan,
  M as updateDoc,
  I as doc,
  T as addDoc,
  d as resolveSpjStatus
} from './index-CLfOyomA.js';

const React = interopRequire(getReact(), 1);
const jsxRuntime = getJsxRuntime();
const { useState, useEffect, useMemo, useRef } = React;
const { jsx, jsxs, Fragment } = jsxRuntime;

export function getActiveUserName(userOrName) {
  if (!userOrName) return '';
  if (typeof userOrName === 'string') return userOrName;
  if (typeof userOrName === 'object') {
    return String(userOrName.nama || userOrName.username || '');
  }
  return '';
}

// Helper to normalize names for personal data privacy matching
export function isSameEmployeeName(nameA, nameB) {
  const rawA = getActiveUserName(nameA);
  const rawB = getActiveUserName(nameB);
  if (!rawA || !rawB) return false;
  const clean = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[.,]/g, ' ')
      .replace(
        /\b(dr|drg|ns|ners|ny|tn|hj|h|s\.kep|s\.tr\.keb|s\.tr\.kes|s\.km|skm|amd\.keb|a\.md\.keb|amd\.kep|a\.md\.kep|amd\.ak|a\.md\.ak|amd\.gz|amd\.kl|s\.farm|apt|m\.kes|m\.km)\b/g,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim();
  const a = clean(rawA);
  const b = clean(rawB);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export function canRoleViewAllData(role) {
  return ['Admin', 'Pimpinan', 'Bendahara'].includes(role);
}

// Compute Smart Audit & Conflict Detection across Kegiatan, SPJ, Pegawai, and Jadwal Pelayanan
export function runSmartSystemAudit({
  kegiatanList = [],
  spjList = [],
  pegawaiList = [],
  jadwalStore = {},
  activeRole = 'Pegawai',
  activeUser = ''
}) {
  const canSeeAll = canRoleViewAllData(activeRole);
  const activeUserName = getActiveUserName(activeUser);
  const activePegawaiId = typeof activeUser === 'object' && activeUser ? activeUser.pegawaiId : '';

  const visibleKegiatan = canSeeAll
    ? kegiatanList
    : (kegiatanList || []).filter((k) => {
        if (!activeUserName && !activePegawaiId) return false;
        if (activePegawaiId && k.pegawaiId && k.pegawaiId === activePegawaiId) return true;
        if (k.pegawai && isSameEmployeeName(k.pegawai, activeUserName)) return true;
        if (Array.isArray(k.pelaksana)) {
          return k.pelaksana.some((p) => isSameEmployeeName(p.nama || p, activeUserName));
        }
        return false;
      });

  const visibleSpj = canSeeAll
    ? spjList
    : (spjList || []).filter((s) => {
        if (!activeUserName && !activePegawaiId) return false;
        if (activePegawaiId && s.pegawaiId && s.pegawaiId === activePegawaiId) return true;
        return isSameEmployeeName(s.pegawaiNama, activeUserName);
      });

  const conflicts = [];
  const pendingByEmployee = {};
  const readyForBatchVerify = [];
  const pendingSpj = [];
  const uncreatedPoa = [];
  let totalPendingCount = 0;
  let totalLengkapCount = 0;
  let totalRevisiCount = 0;

  const dateEmployeeActivityMap = {};
  const spjByKegiatanId = new Set();

  (visibleSpj || []).forEach((s) => {
    if (s.kegiatanId) spjByKegiatanId.add(s.kegiatanId);
    const status =
      typeof resolveSpjStatus === 'function'
        ? resolveSpjStatus(s)
        : s.statusVerifikasi || s.status || 'Belum Lengkap';
    const isLengkap = status === 'Lengkap';
    if (isLengkap) {
      totalLengkapCount++;
    } else {
      totalPendingCount++;
      pendingSpj.push(s);
      if (s.mintaRevisi || status === 'Perlu Revisi' || status === 'Revisi') {
        totalRevisiCount++;
      }
      const pName = s.pegawaiNama || 'Pegawai';
      if (!pendingByEmployee[pName]) {
        const empObj = (pegawaiList || []).find((e) => isSameEmployeeName(e.nama, pName));
        pendingByEmployee[pName] = {
          nama: pName,
          noHp: empObj?.noHp || empObj?.telepon || empObj?.wa || '',
          items: []
        };
      }
      pendingByEmployee[pName].items.push({
        id: s.id,
        uraian: s.kegiatan || s.program || 'Kegiatan BOK',
        tanggal: s.tanggal || '-',
        status,
        catatanRevisi: s.catatan || s.catatanRevisi || ''
      });

      if (s.checklist && Object.values(s.checklist).filter(Boolean).length >= 5) {
        readyForBatchVerify.push({ kegiatan: null, spj: s });
      }
    }

    const tanggalStr = String(s.tanggal || '').trim();
    const pName = s.pegawaiNama || '';
    if (pName && /^\d{4}-\d{2}-\d{2}$/.test(tanggalStr)) {
      const key = `${tanggalStr}__${pName}`;
      if (!dateEmployeeActivityMap[key]) dateEmployeeActivityMap[key] = [];
      dateEmployeeActivityMap[key].push(s.kegiatan || s.program || 'Penugasan SPJ');

      const dt = new Date(tanggalStr + 'T12:00:00');
      if (!Number.isNaN(dt.getTime()) && dt.getDay() === 0) {
        conflicts.push({
          type: 'MINGGU',
          severity: 'warning',
          tanggal: tanggalStr,
          pegawai: pName,
          kegiatan: s.kegiatan || s.program || 'Kegiatan BOK',
          message: `${pName} tercatat pada kegiatan "${s.kegiatan || s.program || 'BOK'}" di hari Minggu (${tanggalStr}).`
        });
      }

      const monthKey = tanggalStr.slice(0, 7);
      const dayNum = parseInt(tanggalStr.slice(8, 10), 10);
      const monthSched = jadwalStore?.months?.[monthKey];
      if (monthSched && Array.isArray(monthSched.rows)) {
        const empRow = monthSched.rows.find((r) => isSameEmployeeName(r.nama, pName));
        const shiftCode = empRow?.shifts?.[dayNum] || empRow?.days?.[dayNum];
        if (shiftCode && ['J', 'P', 'C', 'M'].includes(String(shiftCode).toUpperCase())) {
          conflicts.push({
            type: 'SHIFT_BENTROK',
            severity: 'high',
            tanggal: tanggalStr,
            pegawai: pName,
            shift: shiftCode,
            kegiatan: s.kegiatan || s.program,
            message: `${pName} memiliki penugasan SPJ "${s.kegiatan || s.program}" pada ${tanggalStr} bersamaan dengan jadwal dinas "${shiftCode}" di Jadwal Pelayanan.`
          });
        }
      }
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  (visibleKegiatan || []).forEach((k) => {
    if (!spjByKegiatanId.has(k.id)) {
      const tgl = String(k.tanggal || '');
      if (/^\d{4}-\d{2}-\d{2}$/.test(tgl)) {
        const dt = new Date(tgl + 'T12:00:00');
        if (!Number.isNaN(dt.getTime()) && dt < today) {
          uncreatedPoa.push(k);
        }
      }
    }
  });

  Object.entries(dateEmployeeActivityMap).forEach(([key, list]) => {
    if (list.length > 1) {
      const [tanggal, pName] = key.split('__');
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        severity: 'high',
        tanggal,
        pegawai: pName,
        kegiatan: list.join(' & '),
        message: `${pName} tercatat di ${list.length} penugasan SPJ pada tanggal yang sama (${tanggal}): ${list.join(', ')}.`
      });
    }
  });

  return {
    canSeeAll,
    totalKegiatan: visibleKegiatan.length,
    totalLengkapCount,
    totalPendingCount,
    totalRevisiCount,
    pendingSpj,
    uncreatedPoa,
    conflicts,
    pendingByEmployee: Object.values(pendingByEmployee).sort((a, b) => b.items.length - a.items.length),
    readyForBatchVerify
  };
}

export function buildWhatsAppReminderUrl(empReminder) {
  const lines = [
    `Halo *${empReminder.nama}*,`,
    `Berikut pengingat ramah dari *Sistem So Lengkap UPTD Puskesmas Silian* terkait berkas SPJ BOK yang masih perlu dilengkapi/diverifikasi (${empReminder.items.length} kegiatan):`,
    ''
  ];
  empReminder.items.slice(0, 8).forEach((it, idx) => {
    lines.push(
      `${idx + 1}. *${it.uraian}* (${it.tanggal}) — Status: _${it.status}_${
        it.catatanRevisi ? ` | Catatan: ${it.catatanRevisi}` : ''
      }`
    );
  });
  if (empReminder.items.length > 8) {
    lines.push(`...dan ${empReminder.items.length - 8} kegiatan lainnya.`);
  }
  lines.push('');
  lines.push('Mohon segera dilengkapi berkasnya. Terima kasih atas kerja samanya!');
  const text = encodeURIComponent(lines.join('\n'));
  const cleanPhone = String(empReminder.noHp || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone;
  return formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

// Local deterministic AI Agent fallback & hybrid responder (100% Free, Zero Quota)
function generateLocalAgentResponse(prompt, audit, contextData) {
  const q = String(prompt || '').toLowerCase();
  const { activeRole, activeUser, pegawaiList = [], spjList = [], kegiatanList = [] } = contextData;
  const activeUserName = getActiveUserName(activeUser) || 'Pegawai';
  const canSeeAll = canRoleViewAllData(activeRole);

  // 1. Check if user is asking about a specific employee by name
  if (canSeeAll && pegawaiList.length > 0 && q !== 'ringkasan') {
    const matchedEmp = pegawaiList.find((p) => {
      if (!p.nama) return false;
      const parts = String(p.nama)
        .toLowerCase()
        .replace(/[.,]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['ners', 'skep', 'skm', 'amdkeb', 'amdkep'].includes(w));
      return parts.some((part) => q.includes(part));
    });

    if (matchedEmp) {
      const empSpj = (spjList || []).filter((s) => isSameEmployeeName(s.pegawaiNama, matchedEmp.nama));
      const empLengkap = empSpj.filter((s) => (s.statusVerifikasi || s.status) === 'Lengkap');
      const empPending = empSpj.filter((s) => (s.statusVerifikasi || s.status) !== 'Lengkap');
      const empConflicts = audit.conflicts.filter((c) => isSameEmployeeName(c.pegawai, matchedEmp.nama));
      const pendingLines = empPending
        .slice(0, 5)
        .map((s, idx) => `  ${idx + 1}. ${s.kegiatan || s.program || 'Kegiatan BOK'} (${s.tanggal || '-'}) — ${s.statusVerifikasi || s.status || 'Belum Lengkap'}`)
        .join('\n');

      return {
        reply: `📋 Profil & Audit Pegawai: ${matchedEmp.nama}\n• NIP/Jabatan: ${matchedEmp.nip || '-'} / ${matchedEmp.jabatan || '-'}\n• Total Penugasan SPJ: ${empSpj.length} kegiatan (${empLengkap.length} Lengkap, ${empPending.length} Belum Lengkap)\n• Konflik/Bentrok Jadwal: ${empConflicts.length} temuan${
          empPending.length > 0 ? `\n\nBerkas Belum Lengkap:\n${pendingLines}` : '\n\nSeluruh berkas SPJ pegawai ini sudah Lengkap!'
        }`,
        actionType: empPending.length > 0 ? 'GENERATE_WA_REMINDERS' : 'NAVIGATE_TAB',
        actionLabel: empPending.length > 0 ? 'Kirim Pengingat WA' : 'Lihat Hasil Verifikasi',
        targetTab: 'hasil-verifikasi'
      };
    }
  }

  // 2. Conflict / Bentrok / Minggu audit
  if (q.includes('bentrok') || q.includes('konflik') || q.includes('audit') || q.includes('minggu')) {
    if (audit.conflicts.length === 0) {
      return {
        reply: `✅ Hasil Audit Pintar: Tidak ditemukan bentrok jadwal ganda atau pelanggaran hari Minggu pada ${audit.totalKegiatan} kegiatan dan berkas SPJ yang diperiksa. Semua jadwal tampak aman!`,
        actionType: 'NONE'
      };
    }
    const top = audit.conflicts
      .slice(0, 6)
      .map((c, i) => `${i + 1}. [${c.type}] ${c.message}`)
      .join('\n');
    return {
      reply: `⚠️ Ditemukan ${audit.conflicts.length} potensi bentrok/peringatan jadwal:\n\n${top}${
        audit.conflicts.length > 6 ? `\n...dan ${audit.conflicts.length - 6} temuan lainnya.` : ''
      }`,
      actionType: 'NAVIGATE_TAB',
      actionLabel: 'Buka Jadwal Pelayanan',
      targetTab: 'jadwal-pelayanan'
    };
  }

  // 3. Batch verification check
  if (q.includes('verifikasi cepat') || q.includes('batch') || q.includes('siap verifikasi')) {
    if (!canSeeAll) {
      return {
        reply: `Fitur verifikasi massal hanya dapat dijalankan oleh Admin. Anda memiliki ${audit.totalLengkapCount} SPJ Lengkap dan ${audit.totalPendingCount} SPJ yang masih diproses.`,
        actionType: 'NAVIGATE_TAB',
        actionLabel: 'Lihat Hasil Verifikasi',
        targetTab: 'hasil-verifikasi'
      };
    }
    return {
      reply:
        audit.readyForBatchVerify.length > 0
          ? `Terdapat ${audit.readyForBatchVerify.length} berkas SPJ yang sudah memenuhi minimal 5 checklist kelengkapan dan siap disahkan menjadi "Lengkap" secara otomatis.`
          : `Saat ini terdapat ${audit.totalPendingCount} berkas SPJ yang belum lengkap. Silakan buka halaman Verifikasi SPJ untuk memeriksa kelengkapan berkas.`,
      actionType: audit.readyForBatchVerify.length > 0 ? 'BATCH_VERIFY_SPJ' : 'NAVIGATE_TAB',
      actionLabel:
        audit.readyForBatchVerify.length > 0
          ? `Verifikasi Otomatis (${audit.readyForBatchVerify.length} SPJ)`
          : 'Buka Verifikasi SPJ',
      targetTab: 'verifikasi-spj'
    };
  }

  // 4. WhatsApp / Pending SPJ check
  if (q.includes('wa') || q.includes('whatsapp') || q.includes('ingatkan') || q.includes('belum') || q.includes('spj') || q.includes('revisi')) {
    if (audit.pendingByEmployee.length === 0) {
      return {
        reply: '🎉 Luar biasa! Seluruh berkas SPJ yang tercatat sudah berstatus Lengkap.',
        actionType: 'NONE'
      };
    }
    const topEmp = audit.pendingByEmployee
      .slice(0, 6)
      .map((e, i) => `${i + 1}. ${e.nama}: ${e.items.length} berkas belum lengkap`)
      .join('\n');
    return {
      reply: `Saat ini terdapat ${audit.totalPendingCount} berkas SPJ yang belum Lengkap (${audit.totalRevisiCount} perlu revisi).\n\nDaftar rincian:\n${topEmp}\n\nAnda dapat langsung mengirim pengingat WhatsApp otomatis atau menuju halaman Hasil Verifikasi.`,
      actionType: canSeeAll ? 'GENERATE_WA_REMINDERS' : 'NAVIGATE_TAB',
      actionLabel: canSeeAll ? 'Tampilkan Daftar Kirim WhatsApp' : 'Lihat Hasil Verifikasi Saya',
      targetTab: 'hasil-verifikasi'
    };
  }

  // 5. Schedule / Jadwal Pelayanan check
  if (q.includes('jadwal') || q.includes('bulan depan') || q.includes('otomatis') || q.includes('shift')) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const ym = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    return {
      reply: canSeeAll
        ? `Siap! Saya dapat membuka menu Jadwal Pelayanan untuk mengatur rotasi shift periode ${ym} beserta deteksi hari Minggu & libur nasional, serta ekspor PDF/Excel.`
        : `Anda dapat melihat jadwal dinas pribadi Anda (${activeUserName}) beserta opsi unduh PDF/Excel pada menu Jadwal Pelayanan.`,
      actionType: 'NAVIGATE_TAB',
      actionLabel: 'Buka Jadwal Pelayanan',
      targetTab: 'jadwal-pelayanan'
    };
  }

  // 6. Default Executive Summary
  return {
    reply: canSeeAll
      ? `Ringkasan Eksekutif UPTD Puskesmas Silian:\n• Total Pegawai Terdaftar: ${pegawaiList.length} orang\n• Total Kegiatan POA: ${audit.totalKegiatan} kegiatan\n• SPJ Lengkap: ${audit.totalLengkapCount} berkas\n• SPJ Belum Lengkap: ${audit.totalPendingCount} berkas (${audit.totalRevisiCount} butuh revisi)\n• Deteksi Bentrok Jadwal: ${audit.conflicts.length} temuan\n\n💡 Tips: Anda bisa mengetik nama pegawai (contoh: "Cek SPJ [Nama Pegawai]"), "Cek jadwal bentrok", atau "Siapa yang belum kumpul SPJ?".`
      : `Halo ${activeUserName}! Berikut ringkasan data pribadi Anda:\n• Kegiatan POA Anda: ${audit.totalKegiatan} kegiatan\n• SPJ Lengkap: ${audit.totalLengkapCount} berkas\n• SPJ Perlu Dilengkapi: ${audit.totalPendingCount} berkas\n• Catatan Jadwal: ${audit.conflicts.length} informasi\n\n🔒 Demi privasi, akun Pegawai hanya menampilkan data milik Anda sendiri.`,
    actionType: 'NAVIGATE_TAB',
    actionLabel: 'Lihat Hasil Verifikasi',
    targetTab: 'hasil-verifikasi'
  };
}

// Top Bar Offline/Online + PWA Install + AI Agent Trigger Component
export function TopSmartBarWidgets({ activeRole, activeUser, onNavigateTab }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      try {
        const q = JSON.parse(localStorage.getItem('simbok_offline_q_v1') || '[]');
        setPendingSyncCount(Array.isArray(q) ? q.length : 0);
      } catch {
        setPendingSyncCount(0);
      }
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('simbok-offline-queue-changed', updateStatus);

    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAgentOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleOpenAgent = () => setIsAgentOpen(true);
    window.addEventListener('open-solengkap-agent', handleOpenAgent);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('simbok-offline-queue-changed', updateStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-solengkap-agent', handleOpenAgent);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleSyncNow = async () => {
    if (typeof window.__simbokFlushOfflineQueue === 'function') {
      await window.__simbokFlushOfflineQueue();
    }
  };

  return jsxs(Fragment, {
    children: [
      jsxs('div', {
        className: 'flex items-center gap-2 flex-wrap',
        children: [
          jsxs('button', {
            type: 'button',
            onClick: handleSyncNow,
            title: isOnline
              ? pendingSyncCount > 0
                ? `Klik untuk sinkronkan ${pendingSyncCount} data offline`
                : 'Terhubung & Tersimpan Lokal (Siap Offline)'
              : 'Mode Offline Aktif — Semua perubahan disimpan di perangkat dan otomatis sinkron saat internet kembali',
            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            }`,
            children: [
              jsx('span', {
                className: `w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`
              }),
              jsx('span', {
                className: 'hidden sm:inline',
                children: isOnline
                  ? pendingSyncCount > 0
                    ? `Online (${pendingSyncCount} Antrean Sinkron)`
                    : 'Online & Siap Offline'
                  : `Mode Offline Aktif${pendingSyncCount > 0 ? ` (${pendingSyncCount} Tersimpan)` : ''}`
              }),
              jsx('span', {
                className: 'sm:hidden',
                children: isOnline ? 'Online' : 'Offline'
              })
            ]
          }),

          !isInstalled &&
            jsxs('button', {
              type: 'button',
              onClick: handleInstallClick,
              className:
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all',
              title: 'Pasang aplikasi agar bisa dibuka langsung dari layar utama tanpa internet',
              children: [
                jsx('span', { children: '📲' }),
                jsx('span', { className: 'hidden md:inline', children: 'Install App' })
              ]
            }),

          jsxs('button', {
            type: 'button',
            onClick: () => setIsAgentOpen(true),
            className:
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all cursor-pointer',
            children: [
              jsx('span', { children: '✨' }),
              jsx('span', { children: 'AI Agent' }),
              jsx('kbd', {
                className:
                  'hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white/20 rounded text-white font-mono',
                children: 'Ctrl+K'
              })
            ]
          })
        ]
      }),

      showInstallHelp &&
        jsx('div', {
          className: 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4',
          onClick: () => setShowInstallHelp(false),
          children: jsxs('div', {
            className: 'bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100',
            onClick: (e) => e.stopPropagation(),
            children: [
              jsxs('div', {
                className: 'flex items-center justify-between mb-3',
                children: [
                  jsx('h3', {
                    className: 'text-base font-bold text-slate-800',
                    children: '📲 Pasang Aplikasi So Lengkap (Mode Offline & Online)'
                  }),
                  jsx('button', {
                    onClick: () => setShowInstallHelp(false),
                    className: 'text-slate-400 hover:text-slate-600 text-sm font-bold',
                    children: '✕'
                  })
                ]
              }),
              jsx('p', {
                className: 'text-xs text-slate-600 leading-relaxed mb-4',
                children:
                  'Aplikasi ini sudah dilengkapi Service Worker & Penyimpanan Offline Otomatis. Seluruh data SPJ, Kegiatan, dan Jadwal tetap bisa dibuka dan diedit meskipun tidak ada sinyal internet.'
              }),
              jsxs('div', {
                className: 'bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 space-y-2 border border-slate-200 mb-4',
                children: [
                  jsx('div', {
                    className: 'font-semibold text-slate-900',
                    children: 'Cara Pasang di Laptop / HP:'
                  }),
                  jsx('div', {
                    children: '1. Buka link aplikasi di tab penuh Chrome / Edge / Safari.'
                  }),
                  jsx('div', {
                    children:
                      '2. Klik ikon "Install / Pasang" di sebelah kanan kolom alamat browser, atau pilih menu Titik Tiga (⋮) → "Tambahkan ke Layar Utama / Install App".'
                  })
                ]
              }),
              jsx('div', {
                className: 'flex justify-end',
                children: jsx('button', {
                  onClick: () => setShowInstallHelp(false),
                  className: 'px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700',
                  children: 'Mengerti'
                })
              })
            ]
          })
        }),

      isAgentOpen &&
        jsx(AiAgentModal, {
          activeRole,
          activeUser,
          onClose: () => setIsAgentOpen(false),
          onNavigateTab: (tab) => {
            setIsAgentOpen(false);
            if (onNavigateTab) onNavigateTab(tab);
          }
        })
    ]
  });
}

function AiAgentModal({ activeRole, activeUser, onClose, onNavigateTab }) {
  const [loadingData, setLoadingData] = useState(true);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [spjList, setSpjList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [jadwalStore, setJadwalStore] = useState({});
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showWaPanel, setShowWaPanel] = useState(false);

  const canSeeAll = canRoleViewAllData(activeRole);
  const activeUserName = getActiveUserName(activeUser) || 'Pegawai';

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoadingData(true);
      try {
        const [kSnap, sSnap, pSnap, jData] = await Promise.all([
          getDocs(collection(db, 'kegiatan')),
          getDocs(collection(db, 'spj')),
          getDocs(collection(db, 'pegawai')),
          getPengaturan('jadwal_pelayanan_v1').catch(() => ({}))
        ]);
        if (!mounted) return;
        const kArr = kSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const sArr = sSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const pArr = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setKegiatanList(kArr);
        setSpjList(sArr);
        setPegawaiList(pArr);
        setJadwalStore(jData || {});

        const initialAudit = runSmartSystemAudit({
          kegiatanList: kArr,
          spjList: sArr,
          pegawaiList: pArr,
          jadwalStore: jData || {},
          activeRole,
          activeUser
        });

        const welcome = generateLocalAgentResponse('ringkasan', initialAudit, {
          activeRole,
          activeUser,
          pegawaiList: pArr,
          spjList: sArr,
          kegiatanList: kArr
        });
        setMessages([
          {
            role: 'assistant',
            text: welcome.reply,
            actionType: welcome.actionType,
            actionLabel: welcome.actionLabel,
            targetTab: welcome.targetTab,
            source: 'Audit Pintar (Aktif & Gratis)'
          }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingData(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
  }, [activeRole, activeUserName]);

  const audit = useMemo(
    () =>
      runSmartSystemAudit({
        kegiatanList,
        spjList,
        pegawaiList,
        jadwalStore,
        activeRole,
        activeUser
      }),
    [kegiatanList, spjList, pegawaiList, jadwalStore, activeRole, activeUserName]
  );

  const handleBatchVerify = async () => {
    if (!canSeeAll || audit.readyForBatchVerify.length === 0) {
      onNavigateTab('verifikasi-spj');
      return;
    }
    setIsThinking(true);
    try {
      let count = 0;
      for (const item of audit.readyForBatchVerify) {
        if (item.spj && item.spj.id) {
          await updateDoc(doc(db, 'spj', item.spj.id), {
            status: 'Lengkap',
            statusVerifikasi: 'Lengkap',
            mintaRevisi: false,
            updatedAt: new Date().toISOString()
          });
          count++;
        }
      }
      setSpjList((prev) =>
        prev.map((s) =>
          audit.readyForBatchVerify.some((r) => r.spj?.id === s.id)
            ? { ...s, status: 'Lengkap', statusVerifikasi: 'Lengkap', mintaRevisi: false }
            : s
        )
      );
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `✅ Berhasil memverifikasi otomatis ${count} berkas SPJ yang telah memenuhi seluruh daftar periksa menjadi berstatus "Lengkap"!`,
          actionType: 'NAVIGATE_TAB',
          actionLabel: 'Lihat Hasil Verifikasi',
          targetTab: 'hasil-verifikasi',
          source: 'Aksi Otomatis AI Agent'
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAsk = async (customPrompt) => {
    const queryText = (customPrompt ?? prompt).trim();
    if (!queryText) return;
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: queryText }]);
    setIsThinking(true);

    try {
      const contextSummary = {
        penggunaAktif: activeUserName,
        peran: activeRole,
        aksesSemuaData: canSeeAll,
        totalKegiatanDilihat: audit.totalKegiatan,
        spjLengkap: audit.totalLengkapCount,
        spjBelumLengkap: audit.totalPendingCount,
        spjRevisi: audit.totalRevisiCount,
        jumlahBentrokJadwal: audit.conflicts.length,
        daftarBentrok: audit.conflicts.slice(0, 10),
        pegawaiBelumLengkapSPJ: audit.pendingByEmployee.slice(0, 15).map((e) => ({
          nama: e.nama,
          jumlahBelumLengkap: e.items.length,
          rincian: e.items.slice(0, 4)
        }))
      };

      let replyObj = null;
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: queryText,
              contextSummary,
              role: activeRole,
              activeUser: activeUserName
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.ok && data.reply) {
              replyObj = {
                reply: data.reply,
                actionType: data.actionType || 'NONE',
                actionLabel: data.actionLabel || 'Jalankan Aksi',
                targetTab: data.targetTab || 'dashboard',
                source: 'AI Agent Cloud (Gemini Gratis)'
              };
            }
          }
        } catch {
          // Offline or static fallback
        }
      }

      if (!replyObj) {
        const local = generateLocalAgentResponse(queryText, audit, {
          activeRole,
          activeUser,
          pegawaiList,
          spjList,
          kegiatanList
        });
        replyObj = {
          ...local,
          source: navigator.onLine ? 'AI Agent Pintar (Lokal Gratis)' : 'AI Agent Offline (Gratis)'
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: replyObj.reply,
          actionType: replyObj.actionType,
          actionLabel: replyObj.actionLabel,
          targetTab: replyObj.targetTab,
          source: replyObj.source
        }
      ]);

      if (replyObj.actionType === 'GENERATE_WA_REMINDERS' && canSeeAll) {
        setShowWaPanel(true);
      }
    } finally {
      setIsThinking(false);
    }
  };

  return jsx('div', {
    className: 'fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6',
    onClick: onClose,
    children: jsxs('div', {
      className:
        'bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden',
      onClick: (e) => e.stopPropagation(),
      children: [
        jsxs('div', {
          className:
            'px-5 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between',
          children: [
            jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                jsx('div', {
                  className:
                    'w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg',
                  children: '🤖'
                }),
                jsxs('div', {
                  children: [
                    jsxs('div', {
                      className: 'flex items-center gap-2 flex-wrap',
                      children: [
                        jsx('h2', {
                          className: 'text-base font-bold tracking-tight',
                          children: 'Asisten Pintar So Lengkap'
                        }),
                        jsx('span', {
                          className:
                            'px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/30 text-emerald-200 border border-emerald-400/40',
                          children: '🟢 Aktif · 100% Gratis'
                        }),
                        jsx('span', {
                          className:
                            'px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/10 text-slate-200 border border-white/20',
                          children: canSeeAll ? `Akses Penuh (${activeRole})` : `Privasi Pribadi (${activeUserName})`
                        })
                      ]
                    }),
                    jsx('p', {
                      className: 'text-xs text-slate-300',
                      children:
                        'Audit konflik jadwal, pengingat WA SPJ otomatis, dan asisten operasional Puskesmas Silian (Online & Offline)'
                    })
                  ]
                })
              ]
            }),
            jsx('button', {
              onClick: onClose,
              className:
                'w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold',
              children: '✕'
            })
          ]
        }),

        jsxs('div', {
          className: 'px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto',
          children: [
            jsx('button', {
              type: 'button',
              onClick: () => handleAsk('Cek apakah ada jadwal kegiatan BOK yang bentrok atau jatuh di hari Minggu'),
              className:
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition-colors',
              children: `🔍 Audit Bentrok Jadwal (${audit.conflicts.length})`
            }),
            jsx('button', {
              type: 'button',
              onClick: () => {
                if (canSeeAll) {
                  setShowWaPanel((v) => !v);
                } else {
                  handleAsk('Tampilkan status SPJ kegiatan saya yang belum lengkap');
                }
              },
              className:
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition-colors',
              children: canSeeAll
                ? `📲 Pengingat WA SPJ (${audit.pendingByEmployee.length} Pegawai)`
                : `📋 Cek SPJ Saya (${audit.totalPendingCount} Belum Lengkap)`
            }),
            canSeeAll &&
              jsx('button', {
                type: 'button',
                onClick: () => handleAsk('Cek berkas SPJ yang siap verifikasi cepat'),
                className:
                  'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition-colors',
                children: `⚡ Verifikasi Cepat (${audit.readyForBatchVerify.length})`
              }),
            jsx('button', {
              type: 'button',
              onClick: () => onNavigateTab('jadwal-pelayanan'),
              className:
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition-colors',
              children: '📅 Buka Jadwal Pelayanan'
            }),
            jsx('button', {
              type: 'button',
              onClick: () => onNavigateTab('hasil-verifikasi'),
              className:
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition-colors',
              children: '✅ Buka Hasil Verifikasi'
            })
          ]
        }),

        showWaPanel &&
          canSeeAll &&
          jsxs('div', {
            className: 'px-5 py-3 bg-emerald-50/70 border-b border-emerald-200 max-h-48 overflow-y-auto',
            children: [
              jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  jsx('span', {
                    className: 'text-xs font-bold text-emerald-900',
                    children: 'Daftar Pengingat WhatsApp 1-Klik (Pegawai dengan SPJ Belum Lengkap):'
                  }),
                  jsx('button', {
                    onClick: () => setShowWaPanel(false),
                    className: 'text-xs text-emerald-700 hover:underline',
                    children: 'Tutup Daftar'
                  })
                ]
              }),
              audit.pendingByEmployee.length === 0
                ? jsx('p', {
                    className: 'text-xs text-emerald-800',
                    children: 'Semua pegawai sudah menyelesaikan berkas SPJ.'
                  })
                : jsx('div', {
                    className: 'grid grid-cols-1 sm:grid-cols-2 gap-2',
                    children: audit.pendingByEmployee.map((emp) =>
                      jsxs(
                        'div',
                        {
                          className:
                            'bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between gap-2',
                          children: [
                            jsxs('div', {
                              className: 'min-w-0',
                              children: [
                                jsx('div', {
                                  className: 'text-xs font-bold text-slate-800 truncate',
                                  children: emp.nama
                                }),
                                jsx('div', {
                                  className: 'text-[11px] text-slate-500',
                                  children: `${emp.items.length} berkas belum lengkap`
                                })
                              ]
                            }),
                            jsx('a', {
                              href: buildWhatsAppReminderUrl(emp),
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              className:
                                'shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold',
                              children: 'Kirim WA'
                            })
                          ]
                        },
                        emp.nama
                      )
                    )
                  })
            ]
          }),

        jsxs('div', {
          className: 'flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40',
          children: [
            loadingData
              ? jsx('div', {
                  className: 'text-center py-8 text-xs text-slate-500',
                  children: 'Memuat dan mengaudit data Puskesmas Silian...'
                })
              : messages.map((m, idx) =>
                  jsxs(
                    'div',
                    {
                      className: `flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`,
                      children: [
                        jsxs('div', {
                          className: `max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                            m.role === 'user'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                          }`,
                          children: [
                            m.source &&
                              jsx('div', {
                                className: 'text-[10px] font-semibold text-emerald-600 mb-1',
                                children: `✨ ${m.source}`
                              }),
                            m.text,
                            m.actionType &&
                              m.actionType !== 'NONE' &&
                              jsx('div', {
                                className: 'mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2',
                                children: jsx('button', {
                                  type: 'button',
                                  onClick: () => {
                                    if (m.actionType === 'GENERATE_WA_REMINDERS') {
                                      setShowWaPanel(true);
                                    } else if (m.actionType === 'BATCH_VERIFY_SPJ') {
                                      handleBatchVerify();
                                    } else if (m.targetTab) {
                                      onNavigateTab(m.targetTab);
                                    }
                                  },
                                  className:
                                    'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors',
                                  children: m.actionLabel || 'Buka Halaman Terkait →'
                                })
                              })
                          ]
                        })
                      ]
                    },
                    idx
                  )
                ),
            isThinking &&
              jsx('div', {
                className: 'text-xs text-slate-500 italic',
                children: 'Asisten Pintar sedang menganalisis data...'
              })
          ]
        }),

        jsxs('form', {
          onSubmit: (e) => {
            e.preventDefault();
            handleAsk();
          },
          className: 'p-4 bg-white border-t border-slate-200 flex items-center gap-2',
          children: [
            jsx('input', {
              type: 'text',
              value: prompt,
              onChange: (e) => setPrompt(e.target.value),
              placeholder: canSeeAll
                ? 'Tanyakan ke AI Agent (misal: Cek jadwal bentrok, Siapa yang belum kumpul SPJ?)...'
                : 'Tanyakan ke AI Agent tentang jadwal atau status SPJ pribadi Anda...',
              className:
                'flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
            }),
            jsx('button', {
              type: 'submit',
              disabled: isThinking,
              className:
                'px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors',
              children: 'Kirim'
            })
          ]
        })
      ]
    })
  });
}
