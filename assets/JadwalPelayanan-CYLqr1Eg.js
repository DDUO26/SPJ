import { i as interopRequire } from "./chunk-aKtaBQYM.js";
import { t as PlusIcon } from "./plus-DF5vJfUE.js";
import { t as PrinterIcon } from "./printer-Cvr0qDNN.js";
import { t as SaveIcon } from "./save-BTj0KLWS.js";
import {
  A as runTransaction,
  D as getDoc,
  F as collection,
  I as doc,
  O as getDocs,
  V as getReact,
  h as getJsxRuntime,
  s as CalendarIcon,
  w as db
} from "./index-CLfOyomA.js";
import { t as fetchMasterPegawai } from "./pegawaiService-MafhuZKS.js";

const React = interopRequire(getReact(), 1);
const jsxRuntime = getJsxRuntime();
const el = React.createElement;

const LOGO_MITRA = "/SPJ/assets/logo%20mitra-CHi9XxS1.png";
const LOGO_PKM = "/SPJ/assets/logopkm-e14ashPJ.png";

const SHIFT_LABELS = {
  P: "Dinas Pagi",
  S: "Dinas Sore",
  M: "Dinas Malam",
  L: "Libur / Lepas Dinas"
};

const CYCLE_5 = ["P", "S", "M", "L", "L"];

const INDONESIAN_MONTHS = [
  "JANUARI",
  "FEBRUARI",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULI",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER"
];

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

// Built-in National Holidays (Tanggal Merah Nasional)
const NATIONAL_HOLIDAYS = {
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Mikraj Nabi Muhammad SAW",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-19": "Hari Suci Nyepi",
  "2026-03-20": "Hari Raya Idul Fitri 1447 H",
  "2026-03-21": "Hari Raya Idul Fitri 1447 H",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Kebangkitan Yesus Kristus (Paskah)",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Idul Adha 1447 H",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Hari Kemerdekaan RI",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",
  "2027-01-01": "Tahun Baru 2027 Masehi"
};

// Base Schedule from Lampiran Oktober 2026 (15 Perawat)
// Every rotasi5 nurse follows continuous 5-day cycle ['P', 'S', 'M', 'L', 'L']
// Reguler nurses follow Senin-Jumat = P, Sabtu-Minggu = L
const OCTOBER_2026_BASE_NURSES = [
  {
    sourceName: "Siti Mokodongan, A.Md.Kep",
    pdfNo: 1,
    patternMode: "rotasi5",
    oct1Phase: 3 // Oct 1 = L, Oct 2 = L, Oct 3 = P, Oct 4 = S, Oct 5 = M
  },
  {
    sourceName: "Jeril Katulung, A.Md.Kep",
    pdfNo: 2,
    patternMode: "rotasi5",
    oct1Phase: 3
  },
  {
    sourceName: "Exel Tumelap, A.Md.Kep",
    pdfNo: 3,
    patternMode: "rotasi5",
    oct1Phase: 4 // Oct 1 = L, Oct 2 = P, Oct 3 = S, Oct 4 = M, Oct 5 = L
  },
  {
    sourceName: "Glenny Maki, A.Md.Kep",
    pdfNo: 4,
    patternMode: "rotasi5",
    oct1Phase: 4
  },
  {
    sourceName: "Julieta Wetik, A.Md.Kep",
    pdfNo: 5,
    patternMode: "rotasi5",
    oct1Phase: 4
  },
  {
    sourceName: "Johnson Munaiseche, Amd.Kep",
    pdfNo: 6,
    patternMode: "rotasi5",
    oct1Phase: 0 // Oct 1 = P, Oct 2 = S, Oct 3 = M, Oct 4 = L, Oct 5 = L
  },
  {
    sourceName: "Ireine Gilberheitmin, A.Md.Kep",
    pdfNo: 8,
    patternMode: "rotasi5",
    oct1Phase: 0
  },
  {
    sourceName: "Fio Bahihi, A.Md.Kep",
    pdfNo: 9,
    patternMode: "rotasi5",
    oct1Phase: 2 // Oct 1 = M, Oct 2 = L, Oct 3 = L, Oct 4 = P, Oct 5 = S
  },
  {
    sourceName: "Elvira Subroto, A.Md.Kep",
    pdfNo: 10,
    patternMode: "rotasi5",
    oct1Phase: 2
  },
  {
    sourceName: "Mariam Malingkas, Amd.Kep",
    pdfNo: 12,
    patternMode: "rotasi5",
    oct1Phase: 1 // Oct 1 = S, Oct 2 = M, Oct 3 = L, Oct 4 = L, Oct 5 = P
  },
  {
    sourceName: "Afrini Watak, S.Kep.Ns",
    pdfNo: 13,
    patternMode: "rotasi5",
    oct1Phase: 1
  },
  {
    sourceName: "Irene Kindangen, S.kep, Ns",
    pdfNo: 14,
    patternMode: "reguler",
    oct1Phase: null // Senin-Jumat = P, Sabtu-Minggu = L
  },
  {
    sourceName: "Irene Rondonuwu, Amd.Kep",
    pdfNo: 11,
    patternMode: "reguler",
    oct1Phase: null
  },
  {
    sourceName: "Britney Wowor",
    pdfNo: 15,
    patternMode: "reguler",
    oct1Phase: null
  },
  {
    sourceName: "Tirsa Pondaag, S.kep, Ns",
    pdfNo: 16,
    patternMode: "reguler",
    oct1Phase: null
  }
];

const DEFAULT_SIGNATORIES = {
  leftRole: "KEPALA DINAS KESEHATAN",
  leftName: "dr. Tommy A. Soleman, M.Kes",
  leftNip: "Nip. 196908172000121004",
  rightRole: "KEPALA PUSKESMAS",
  rightName: "dr. Winda Marshella Tanuli",
  rightNip: "NIP : 198312052011022001",
  numberStyle: "pdf" // "pdf" matches exact No. in attachment (1..6, 8..10, 12..14, 11, 15, 16) or "sequential" (1..15)
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(monthStr) {
  const [y, m] = String(monthStr).split("-").map(Number);
  if (!y || !m) return 30;
  return new Date(y, m, 0).getDate();
}

function getDayOfWeekUTC(monthStr, day) {
  const [y, m] = String(monthStr).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).getUTCDay();
}

function getDayNameId(monthStr, day) {
  return INDONESIAN_DAYS[getDayOfWeekUTC(monthStr, day)];
}

function diffDaysUTC(dateStrA, dateStrB) {
  const [yA, mA, dA] = dateStrA.split("-").map(Number);
  const [yB, mB, dB] = dateStrB.split("-").map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcB - utcA) / 86400000);
}

function addMonths(monthStr, delta) {
  const [y, m] = String(monthStr).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

function formatMonthYearUpper(monthStr) {
  const [y, m] = String(monthStr).split("-").map(Number);
  return `BULAN ${INDONESIAN_MONTHS[(m || 1) - 1] || "OKTOBER"} TAHUN ${y || 2026}`;
}

function formatMonthYearReadable(monthStr) {
  const [y, m] = String(monthStr).split("-").map(Number);
  const name = INDONESIAN_MONTHS[(m || 1) - 1] || "OKTOBER";
  return `${name.charAt(0) + name.slice(1).toLowerCase()} ${y || 2026}`;
}

function getDefaultHolidaysForMonth(monthStr) {
  const days = getDaysInMonth(monthStr);
  const map = {};
  for (let d = 1; d <= days; d++) {
    const key = `${monthStr}-${pad2(d)}`;
    if (NATIONAL_HOLIDAYS[key]) {
      map[d] = NATIONAL_HOLIDAYS[key];
    }
  }
  return map;
}

// Fuzzy match nurse name to Master Pegawai
function normalizePersonName(str) {
  return String(str || "")
    .toLowerCase()
    .split(",")[0]
    .replace(/\b(dr|drg|ns|s\.kep|a\.md\.kep|amd\.kep|a\.md|amd|kep|keb|skm|sst)\b/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatchingPegawaiId(sourceName, peopleList) {
  if (!sourceName || !Array.isArray(peopleList) || !peopleList.length) return "";
  const exact = peopleList.find(
    (p) => String(p.nama || "").trim().toLowerCase() === String(sourceName).trim().toLowerCase()
  );
  if (exact) return exact.id;
  const targetCore = normalizePersonName(sourceName);
  if (!targetCore) return "";
  const coreMatches = peopleList.filter((p) => normalizePersonName(p.nama) === targetCore);
  if (coreMatches.length === 1) return coreMatches[0].id;
  const partialMatches = peopleList.filter((p) => {
    const c = normalizePersonName(p.nama);
    return c && (c.includes(targetCore) || targetCore.includes(c));
  });
  return partialMatches.length === 1 ? partialMatches[0].id : "";
}

// Detect pattern mode from existing shifts if not explicitly stored
function detectPatternFromShifts(shifts, monthStr) {
  const values = Object.values(shifts || {}).filter(Boolean);
  if (!values.length) return { patternMode: "rotasi5", oct1Phase: 0 };
  const hasSorM = values.some((v) => v === "S" || v === "M");
  if (!hasSorM) {
    return { patternMode: "reguler", oct1Phase: null };
  }
  const days = getDaysInMonth(monthStr);
  const sLast = shifts[days];
  const sPrev = shifts[days - 1];
  let endPhase = 0;
  if (sLast === "P") endPhase = 0;
  else if (sLast === "S") endPhase = 1;
  else if (sLast === "M") endPhase = 2;
  else if (sLast === "L") {
    endPhase = sPrev === "L" ? 4 : 3;
  }
  const diffFromOct1 = diffDaysUTC("2026-10-01", `${monthStr}-${pad2(days)}`);
  const oct1Phase = (((endPhase - diffFromOct1) % 5) + 5) % 5;
  return { patternMode: "rotasi5", oct1Phase };
}

// Generate shifts for a single row in a target month
function buildShiftsForRow(rowConfig, monthStr, holidaysMap = {}, liburRegulerOnHoliday = false) {
  const days = getDaysInMonth(monthStr);
  const shifts = {};
  const mode = rowConfig.patternMode || "rotasi5";

  if (mode === "reguler") {
    for (let d = 1; d <= days; d++) {
      const dow = getDayOfWeekUTC(monthStr, d);
      const isWeekend = dow === 0 || dow === 6;
      const isHoliday = Boolean(holidaysMap && holidaysMap[d]);
      shifts[d] = isWeekend || (liburRegulerOnHoliday && isHoliday) ? "L" : "P";
    }
    return shifts;
  }

  // Default 5-day continuous cycle: P -> S -> M -> L -> L
  const basePhase = Number.isInteger(rowConfig.oct1Phase) ? rowConfig.oct1Phase : 0;
  for (let d = 1; d <= days; d++) {
    const diff = diffDaysUTC("2026-10-01", `${monthStr}-${pad2(d)}`);
    const cycleIdx = (((basePhase + diff) % 5) + 5) % 5;
    shifts[d] = CYCLE_5[cycleIdx];
  }
  return shifts;
}

// Continue a row from a previous month's roster into targetMonth
function continueRowFromPreviousRoster(prevRow, prevMonthStr, targetMonthStr, holidaysMap = {}, liburRegulerOnHoliday = false) {
  const detected = detectPatternFromShifts(prevRow.shifts, prevMonthStr);
  const patternMode = prevRow.patternMode && prevRow.patternMode !== "custom" ? prevRow.patternMode : detected.patternMode;

  if (patternMode === "reguler") {
    return {
      ...prevRow,
      patternMode: "reguler",
      oct1Phase: null,
      shifts: buildShiftsForRow({ patternMode: "reguler" }, targetMonthStr, holidaysMap, liburRegulerOnHoliday)
    };
  }

  // Determine exact phase at the end of prevMonthStr so any manual shift changes at the end of prevMonth carry forward seamlessly
  const prevDays = getDaysInMonth(prevMonthStr);
  const sLast = prevRow.shifts?.[prevDays];
  const sPrev = prevRow.shifts?.[prevDays - 1];
  let endPhase = null;
  if (sLast === "P") endPhase = 0;
  else if (sLast === "S") endPhase = 1;
  else if (sLast === "M") endPhase = 2;
  else if (sLast === "L") {
    endPhase = sPrev === "L" ? 4 : 3;
  }

  let oct1Phase = Number.isInteger(prevRow.oct1Phase) ? prevRow.oct1Phase : detected.oct1Phase;
  if (endPhase !== null) {
    const diffLastDayFromOct1 = diffDaysUTC("2026-10-01", `${prevMonthStr}-${pad2(prevDays)}`);
    oct1Phase = (((endPhase - diffLastDayFromOct1) % 5) + 5) % 5;
  }

  const targetDays = getDaysInMonth(targetMonthStr);
  const shifts = {};
  for (let d = 1; d <= targetDays; d++) {
    if (endPhase !== null) {
      const delta = diffDaysUTC(`${prevMonthStr}-${pad2(prevDays)}`, `${targetMonthStr}-${pad2(d)}`);
      const idx = (((endPhase + delta) % 5) + 5) % 5;
      shifts[d] = CYCLE_5[idx];
    } else {
      const diff = diffDaysUTC("2026-10-01", `${targetMonthStr}-${pad2(d)}`);
      const idx = (((oct1Phase + diff) % 5) + 5) % 5;
      shifts[d] = CYCLE_5[idx];
    }
  }

  return {
    ...prevRow,
    patternMode: "rotasi5",
    oct1Phase,
    shifts
  };
}

// Build complete automatic roster from October 2026 baseline for any month
function generateStandardRosterForMonth(monthStr, team, peopleList = [], customHolidays = null, liburRegulerOnHoliday = false) {
  const holidays = customHolidays || getDefaultHolidaysForMonth(monthStr);
  const rows =
    team === "Perawat"
      ? OCTOBER_2026_BASE_NURSES.map((base, idx) => ({
          sourceName: base.sourceName,
          pegawaiId: findMatchingPegawaiId(base.sourceName, peopleList),
          pdfNo: base.pdfNo || idx + 1,
          patternMode: base.patternMode,
          oct1Phase: base.oct1Phase,
          shifts: buildShiftsForRow(base, monthStr, holidays, liburRegulerOnHoliday)
        }))
      : [];

  return {
    id: `${team}_${monthStr}`,
    month: monthStr,
    team,
    rows,
    holidays,
    liburRegulerOnHoliday: Boolean(liburRegulerOnHoliday),
    signatories: { ...DEFAULT_SIGNATORIES },
    revision: 0,
    note: "",
    autoGeneratedFrom: "Alur Standar Oktober 2026"
  };
}

// LocalStorage cache helpers so schedules persist locally and load fast
const LOCAL_CACHE_PREFIX = "pkm_silian_roster_v2_";

function saveRosterToLocalCache(roster) {
  if (!roster || !roster.id) return;
  try {
    localStorage.setItem(LOCAL_CACHE_PREFIX + roster.id, JSON.stringify(roster));
  } catch {}
}

function getRosterFromLocalCache(id) {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchRosterDoc(rosterId) {
  try {
    const snap = await getDoc(doc(db, "serviceRosters", rosterId));
    if (snap.exists()) {
      const data = snap.data();
      saveRosterToLocalCache(data);
      return data;
    }
  } catch (err) {
    console.warn("Firestore read fallback to cache:", err);
  }
  return getRosterFromLocalCache(rosterId);
}

async function saveRosterDoc(roster) {
  const nextRoster = {
    ...roster,
    revision: (roster.revision || 0) + 1,
    updatedAt: new Date().toISOString()
  };
  saveRosterToLocalCache(nextRoster);
  try {
    const saved = await runTransaction(db, async (tx) => {
      const ref = doc(db, "serviceRosters", roster.id);
      const snap = await tx.get(ref);
      const currentRev = snap.exists() ? snap.data().revision || 0 : 0;
      const payload = {
        ...roster,
        revision: currentRev + 1,
        updatedAt: new Date().toISOString()
      };
      tx.set(ref, payload);
      return payload;
    });
    saveRosterToLocalCache(saved);
    return saved;
  } catch (err) {
    console.warn("Saved to local storage fallback:", err);
    return nextRoster;
  }
}

// Find nearest saved preceding month (up to 6 months back) to continue from
async function findPrecedingSavedRoster(team, targetMonthStr) {
  for (let step = 1; step <= 6; step++) {
    const prevM = addMonths(targetMonthStr, -step);
    const data = await fetchRosterDoc(`${team}_${prevM}`);
    if (data && Array.isArray(data.rows) && data.rows.length > 0) {
      return data;
    }
  }
  return null;
}

function getPatternBadgeLabel(row) {
  if (row.patternMode === "reguler") return "Reguler (Sen-Jum P)";
  if (row.patternMode === "custom") return "Manual / Kustom";
  const p = Number.isInteger(row.oct1Phase) ? row.oct1Phase : 0;
  const reguMap = {
    3: "Regu 1 (P-S-M-L-L)",
    4: "Regu 2 (P-S-M-L-L)",
    0: "Regu 3 (P-S-M-L-L)",
    2: "Regu 4 (P-S-M-L-L)",
    1: "Regu 5 (P-S-M-L-L)"
  };
  return reguMap[p] || "Shift 5 Hari (P-S-M-L-L)";
}

function getPatternSelectValue(row) {
  if (row.patternMode === "reguler") return "reguler";
  if (row.patternMode === "custom") return "custom";
  const p = Number.isInteger(row.oct1Phase) ? row.oct1Phase : 0;
  return `rotasi5_${p}`;
}

// Official Printable Schedule Sheet Component (Exact match to jadwal_apk_35e80462.pdf)
function OfficialPrintSchedule({ roster, monthStr, team, resolveName }) {
  if (!roster) return null;
  const daysInMonth = getDaysInMonth(monthStr);
  const holidays = roster.holidays || {};
  const sig = { ...DEFAULT_SIGNATORIES, ...(roster.signatories || {}) };
  const usePdfNumbers = sig.numberStyle === "pdf";

  const isRedDate = (day) => {
    const dow = getDayOfWeekUTC(monthStr, day);
    return dow === 0 || Boolean(holidays[day]);
  };

  return el(
    "div",
    { className: "official-print-sheet" },
    // Kop Surat Resmi
    el(
      "div",
      { className: "official-kop" },
      el("img", {
        src: LOGO_MITRA,
        alt: "Lambang Kabupaten Minahasa Tenggara",
        className: "kop-logo",
        referrerPolicy: "no-referrer"
      }),
      el(
        "div",
        { className: "official-kop-text" },
        el("div", { className: "kop-line-1" }, "PEMERINTAH KABUPATEN MINAHASA TENGGARA"),
        el("div", { className: "kop-line-2" }, "DINAS KESEHATAN"),
        el("div", { className: "kop-line-3" }, "UPTD PUSKESMAS SILIAN"),
        el("div", { className: "kop-addr" }, "Jl. Puskesmas, Desa Silian Satu Kecamatan. Silian Raya"),
        el(
          "div",
          { className: "kop-contact" },
          "Telp : 081524737716   Email : uptdpuskesmassilian@gmail.com   Kode Pos : 95696"
        )
      ),
      el("img", {
        src: LOGO_PKM,
        alt: "Lambang Puskesmas",
        className: "kop-logo",
        referrerPolicy: "no-referrer"
      })
    ),

    // Judul Jadwal
    el(
      "div",
      { className: "official-doc-title" },
      el("div", null, `JADWAL DINAS ${String(team || "PERAWAT").toUpperCase()}`),
      el("div", null, formatMonthYearUpper(monthStr))
    ),

    // Tabel Jadwal Dinas
    el(
      "table",
      { className: "official-roster-table" },
      el(
        "thead",
        null,
        el(
          "tr",
          null,
          el("th", { rowSpan: 3, className: "col-no" }, "No."),
          el("th", { rowSpan: 3, className: "col-nama" }, `NAMA ${String(team || "PERAWAT").toUpperCase()}`),
          el("th", { colSpan: daysInMonth }, "HARI / TANGGAL")
        ),
        el(
          "tr",
          null,
          Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const red = isRedDate(d);
            return el(
              "th",
              {
                key: `dayname-${d}`,
                className: `day-name-cell ${red ? "red-col" : ""}`
              },
              getDayNameId(monthStr, d)
            );
          })
        ),
        el(
          "tr",
          null,
          Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const red = isRedDate(d);
            return el(
              "th",
              {
                key: `daynum-${d}`,
                className: `day-num-cell ${red ? "red-col" : ""}`
              },
              d
            );
          })
        )
      ),
      el(
        "tbody",
        null,
        (roster.rows || []).map((row, idx) => {
          const displayNo = usePdfNumbers && row.pdfNo ? row.pdfNo : idx + 1;
          return el(
            "tr",
            { key: `print-row-${idx}` },
            el("td", { className: "col-no" }, displayNo),
            el("td", { className: "col-nama" }, resolveName(row)),
            Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const red = isRedDate(d);
              const val = row.shifts?.[d] || "";
              return el(
                "td",
                {
                  key: `cell-${idx}-${d}`,
                  className: `shift-cell ${red ? "red-col" : ""}`
                },
                val
              );
            })
          );
        })
      )
    ),

    // Bagian Bawah: Keterangan & Mengetahui
    el(
      "div",
      { className: "official-footer-wrap" },
      // Kiri Bawah: KETERANGAN
      el(
        "div",
        { className: "official-keterangan" },
        el("div", { className: "official-keterangan-title" }, "KETERANGAN   :"),
        el(
          "table",
          { className: "official-keterangan-table" },
          el(
            "tbody",
            null,
            el(
              "tr",
              null,
              el("td", { className: "ket-box ket-red" }, "\u00A0"),
              el("td", null, ": Hari Minggu / Tanggal Merah")
            ),
            el(
              "tr",
              null,
              el("td", { className: "ket-box" }, "P"),
              el("td", null, ": Dinas Pagi")
            ),
            el(
              "tr",
              null,
              el("td", { className: "ket-box" }, "S"),
              el("td", null, ": Dinas Sore")
            ),
            el(
              "tr",
              null,
              el("td", { className: "ket-box" }, "M"),
              el("td", null, ": Dinas Malam")
            ),
            el(
              "tr",
              null,
              el("td", { className: "ket-box" }, "L"),
              el("td", null, ": Libur / Lepas Dinas")
            )
          )
        )
      ),

      // Kanan: MENGETAHUI Kepala Dinas Kesehatan & Kepala Puskesmas
      el(
        "div",
        { className: "official-signatures" },
        el(
          "div",
          { className: "official-sig-box" },
          el("div", null, "MENGETAHUI"),
          el("div", null, sig.leftRole),
          el("div", { className: "official-sig-space" }),
          el("div", null, sig.leftName),
          el("div", null, sig.leftNip)
        ),
        el(
          "div",
          { className: "official-sig-box" },
          el("div", null, "MENGETAHUI"),
          el("div", null, sig.rightRole),
          el("div", { className: "official-sig-space" }),
          el("div", null, sig.rightName),
          el("div", null, sig.rightNip)
        )
      )
    )
  );
}

// Main Jadwal Pelayanan Component
function JadwalPelayananPage({ activeRole }) {
  const isAdmin = activeRole === "Admin";

  // Default to 2026-10 (or current YYYY-MM)
  const [month, setMonth] = React.useState(() => {
    const nowIso = new Date().toISOString().slice(0, 7);
    return nowIso >= "2026-10" ? nowIso : "2026-10";
  });
  const [team, setTeam] = React.useState("Perawat");
  const [roster, setRoster] = React.useState(null);
  const [people, setPeople] = React.useState([]);
  const [dirty, setDirty] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [statusMsg, setStatusMsg] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDayInspect, setSelectedDayInspect] = React.useState(1);

  // Fast editing & preview states
  const [activeBrush, setActiveBrush] = React.useState(""); // "" (dropdown) or "P", "S", "M", "L"
  const [showPrintPreview, setShowPrintPreview] = React.useState(true);
  const [showSignatoryModal, setShowSignatoryModal] = React.useState(false);
  const [showBatchModal, setShowBatchModal] = React.useState(false);
  const [batchMonthsCount, setBatchMonthsCount] = React.useState(3);
  const [batchProcessing, setBatchProcessing] = React.useState(false);
  const [exportingType, setExportingType] = React.useState("");

  // Keep memory of current session's latest roster per team+month so switching to next month continues even before Firestore roundtrip
  const sessionRostersRef = React.useRef({});

  const daysInMonth = getDaysInMonth(month);

  const resolveName = React.useCallback(
    (row) => {
      if (!row) return "Pilih pegawai";
      if (row.sourceName && row.sourceName.trim()) return row.sourceName.trim();
      const found = people.find((p) => p.id === row.pegawaiId);
      return found?.nama || "Pilih pegawai";
    },
    [people]
  );

  const canViewAll = ["Admin", "Pimpinan", "Bendahara"].includes(activeRole);
  const isPersonalOnly = !canViewAll;
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("simbok_user") || "null");
    } catch {
      return null;
    }
  }, [activeRole]);

  const matchesCurrentUser = React.useCallback(
    (row) => {
      if (!isPersonalOnly) return true;
      if (!currentUser) return false;
      if (currentUser.pegawaiId && row?.pegawaiId && row.pegawaiId === currentUser.pegawaiId) {
        return true;
      }
      const rName = normalizeName(resolveName(row));
      const uName = normalizeName(currentUser.nama || "");
      return Boolean(rName && uName && (rName === uName || rName.includes(uName) || uName.includes(rName)));
    },
    [isPersonalOnly, currentUser, resolveName]
  );

  const visibleRoster = React.useMemo(() => {
    if (!roster) return null;
    if (!isPersonalOnly) return roster;
    return {
      ...roster,
      rows: (roster.rows || []).filter(matchesCurrentUser)
    };
  }, [roster, isPersonalOnly, matchesCurrentUser]);

  // Load or Auto-Generate Roster whenever month or team changes
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg("");

    Promise.all([fetchMasterPegawai().catch(() => []), fetchRosterDoc(`${team}_${month}`)])
      .then(async ([pegawaiList, existingRoster]) => {
        if (!active) return;
        setPeople(pegawaiList);

        // 1. If already saved with non-empty rows, use it (and hydrate missing fields)
        if (existingRoster && Array.isArray(existingRoster.rows) && existingRoster.rows.length > 0) {
          const defaultHolidays = getDefaultHolidaysForMonth(month);
          const hydrated = {
            ...existingRoster,
            holidays: { ...defaultHolidays, ...(existingRoster.holidays || {}) },
            signatories: { ...DEFAULT_SIGNATORIES, ...(existingRoster.signatories || {}) },
            rows: existingRoster.rows.map((r, idx) => {
              const detected = detectPatternFromShifts(r.shifts, month);
              const matchedId = r.pegawaiId || findMatchingPegawaiId(r.sourceName, pegawaiList);
              const matchedPerson = pegawaiList.find((p) => p.id === matchedId);
              return {
                ...r,
                pegawaiId: matchedId,
                sourceName: r.sourceName || matchedPerson?.nama || "",
                pdfNo: r.pdfNo || OCTOBER_2026_BASE_NURSES[idx]?.pdfNo || idx + 1,
                patternMode: r.patternMode || detected.patternMode,
                oct1Phase: Number.isInteger(r.oct1Phase) ? r.oct1Phase : detected.oct1Phase
              };
            })
          };
          sessionRostersRef.current[`${team}_${month}`] = hydrated;
          setRoster(hydrated);
          setDirty(false);
          return;
        }

        // 2. Otherwise, check if there is a previous month's roster (in session or saved) to continue automatically!
        const prevMonthStr = addMonths(month, -1);
        const prevFromSession = sessionRostersRef.current[`${team}_${prevMonthStr}`];
        const prevSaved = prevFromSession || (await findPrecedingSavedRoster(team, month));

        if (!active) return;

        const defaultHolidays = getDefaultHolidaysForMonth(month);

        if (prevSaved && Array.isArray(prevSaved.rows) && prevSaved.rows.length > 0) {
          const continuedRows = prevSaved.rows.map((r) =>
            continueRowFromPreviousRoster(
              r,
              prevSaved.month,
              month,
              defaultHolidays,
              Boolean(prevSaved.liburRegulerOnHoliday)
            )
          );
          const autoRoster = {
            id: `${team}_${month}`,
            month,
            team,
            rows: continuedRows,
            holidays: defaultHolidays,
            liburRegulerOnHoliday: Boolean(prevSaved.liburRegulerOnHoliday),
            signatories: { ...DEFAULT_SIGNATORIES, ...(prevSaved.signatories || {}) },
            revision: existingRoster?.revision || 0,
            note: existingRoster?.note || "",
            autoGeneratedFrom: `Kelanjutan Otomatis dari ${formatMonthYearReadable(prevSaved.month)}`
          };
          sessionRostersRef.current[`${team}_${month}`] = autoRoster;
          saveRosterToLocalCache(autoRoster);
          setRoster(autoRoster);
          setDirty(false);
          setStatusMsg(
            `Jadwal ${formatMonthYearReadable(month)} otomatis disusun melanjutkan alur jadwal ${formatMonthYearReadable(prevSaved.month)}.`
          );
          return;
        }

        // 3. Fallback to October 2026 Standard Base Schedule
        const standardRoster = generateStandardRosterForMonth(month, team, pegawaiList, defaultHolidays, false);
        if (existingRoster?.revision) {
          standardRoster.revision = existingRoster.revision;
        }
        sessionRostersRef.current[`${team}_${month}`] = standardRoster;
        saveRosterToLocalCache(standardRoster);
        setRoster(standardRoster);
        setDirty(false);
        if (team === "Perawat") {
          setStatusMsg(
            month === "2026-10"
              ? "Jadwal Oktober 2026 dimuat otomatis sesuai format lampiran."
              : `Jadwal ${formatMonthYearReadable(month)} otomatis disusun melanjutkan alur format Oktober 2026.`
          );
        }
      })
      .catch((err) => {
        if (active) setErrorMsg("Gagal memuat jadwal: " + err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, team]);

  // Update helper that keeps sessionRostersRef and local cache in sync
  const updateRoster = React.useCallback(
    (patch) => {
      setRoster((prev) => {
        if (!prev) return prev;
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        sessionRostersRef.current[`${next.team}_${next.month}`] = next;
        saveRosterToLocalCache(next);
        return next;
      });
      setDirty(true);
    },
    []
  );

  const updateRow = (rowIndex, rowPatch) => {
    updateRoster((prev) => ({
      ...prev,
      rows: prev.rows.map((r, i) => (i === rowIndex ? { ...r, ...rowPatch } : r))
    }));
  };

  // Switch month or team seamlessly (auto-saves current state to local cache so continuation works immediately)
  const handleSwitchPeriodOrTeam = (nextValue, kind) => {
    setStatusMsg("");
    setErrorMsg("");
    setSelectedDayInspect(1);
    if (kind === "month") {
      setMonth(nextValue);
    } else {
      setTeam(nextValue);
    }
  };

  // Continue explicitly from previous month (1-click action)
  const handleContinueFromPreviousMonth = async () => {
    setErrorMsg("");
    const prevMonthStr = addMonths(month, -1);
    let prevRoster =
      sessionRostersRef.current[`${team}_${prevMonthStr}`] ||
      (await fetchRosterDoc(`${team}_${prevMonthStr}`));

    if (!prevRoster || !Array.isArray(prevRoster.rows) || !prevRoster.rows.length) {
      prevRoster = generateStandardRosterForMonth(prevMonthStr, team, people);
    }

    const currentHolidays = roster?.holidays || getDefaultHolidaysForMonth(month);
    const liburReg = Boolean(roster?.liburRegulerOnHoliday);
    const continuedRows = prevRoster.rows.map((r) =>
      continueRowFromPreviousRoster(r, prevMonthStr, month, currentHolidays, liburReg)
    );

    updateRoster({
      rows: continuedRows,
      autoGeneratedFrom: `Kelanjutan Otomatis dari ${formatMonthYearReadable(prevMonthStr)}`
    });
    setStatusMsg(
      `Berhasil melanjutkan susunan pegawai & rotasi shift dari ${formatMonthYearReadable(prevMonthStr)} ke ${formatMonthYearReadable(month)}.`
    );
  };

  // Reset/generate from October 2026 standard template for current month
  const handleResetToStandardFormat = () => {
    const currentHolidays = roster?.holidays || getDefaultHolidaysForMonth(month);
    const liburReg = Boolean(roster?.liburRegulerOnHoliday);
    const std = generateStandardRosterForMonth(month, team, people, currentHolidays, liburReg);
    updateRoster({
      rows: std.rows,
      autoGeneratedFrom: "Alur Standar Oktober 2026"
    });
    setStatusMsg(
      `Jadwal ${formatMonthYearReadable(month)} telah disusun ulang mengikuti alur standar Oktober 2026.`
    );
  };

  // Advance to next month and carry forward current schedule automatically
  const handleAdvanceToNextMonth = () => {
    if (roster) {
      sessionRostersRef.current[`${team}_${month}`] = roster;
      saveRosterToLocalCache(roster);
    }
    const nextM = addMonths(month, 1);
    setMonth(nextM);
  };

  // Batch generate multiple consecutive months
  const handleBatchGenerateMonths = async () => {
    if (!roster || batchProcessing) return;
    setBatchProcessing(true);
    setErrorMsg("");
    try {
      let currentSource = roster;
      await saveRosterDoc(currentSource);
      const generatedNames = [];
      for (let i = 1; i <= batchMonthsCount; i++) {
        const targetM = addMonths(month, i);
        const targetHolidays = getDefaultHolidaysForMonth(targetM);
        const nextRows = currentSource.rows.map((r) =>
          continueRowFromPreviousRoster(
            r,
            currentSource.month,
            targetM,
            targetHolidays,
            Boolean(currentSource.liburRegulerOnHoliday)
          )
        );
        const nextRosterObj = {
          id: `${team}_${targetM}`,
          month: targetM,
          team,
          rows: nextRows,
          holidays: targetHolidays,
          liburRegulerOnHoliday: Boolean(currentSource.liburRegulerOnHoliday),
          signatories: { ...DEFAULT_SIGNATORIES, ...(currentSource.signatories || {}) },
          revision: 0,
          note: currentSource.note || "",
          autoGeneratedFrom: `Batch Otomatis dari ${formatMonthYearReadable(currentSource.month)}`
        };
        const savedNext = await saveRosterDoc(nextRosterObj);
        sessionRostersRef.current[`${team}_${targetM}`] = savedNext;
        currentSource = savedNext;
        generatedNames.push(formatMonthYearReadable(targetM));
      }
      setShowBatchModal(false);
      setDirty(false);
      setStatusMsg(
        `Berhasil membuat & menyimpan jadwal otomatis untuk ${batchMonthsCount} bulan ke depan: ${generatedNames.join(", ")}.`
      );
    } catch (err) {
      setErrorMsg("Gagal membuat jadwal beruntun: " + err.message);
    } finally {
      setBatchProcessing(false);
    }
  };

  // Save current month's schedule
  const handleSaveRoster = async () => {
    if (!roster) return;
    setErrorMsg("");
    const emptyName = roster.rows.some((r) => !resolveName(r) || resolveName(r) === "Pilih pegawai");
    if (emptyName) {
      setErrorMsg("Pastikan setiap baris memiliki nama pegawai sebelum menyimpan.");
      return;
    }
    setLoading(true);
    try {
      const saved = await saveRosterDoc(roster);
      setRoster(saved);
      setDirty(false);
      setStatusMsg(`Jadwal ${team} bulan ${formatMonthYearReadable(month)} berhasil disimpan.`);
    } catch (err) {
      setErrorMsg("Gagal menyimpan jadwal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Tanggal Merah on any date column
  const handleToggleHolidayDate = (day) => {
    if (!isAdmin || !roster) return;
    const dow = getDayOfWeekUTC(month, day);
    if (dow === 0) {
      setStatusMsg(`Tanggal ${day} adalah Hari Minggu (otomatis ditandai warna merah).`);
      return;
    }
    const currentHolidays = { ...(roster.holidays || {}) };
    if (currentHolidays[day]) {
      delete currentHolidays[day];
    } else {
      currentHolidays[day] = "Tanggal Merah / Libur";
    }

    // If liburRegulerOnHoliday is active, update reguler rows automatically
    const updatedRows = roster.liburRegulerOnHoliday
      ? roster.rows.map((r) =>
          r.patternMode === "reguler"
            ? { ...r, shifts: buildShiftsForRow(r, month, currentHolidays, true) }
            : r
        )
      : roster.rows;

    updateRoster({
      holidays: currentHolidays,
      rows: updatedRows
    });
  };

  // Change a row's pattern/regu in 1 click
  const handleRowPatternChange = (rowIndex, value) => {
    if (!roster) return;
    const row = roster.rows[rowIndex];
    const currentHolidays = roster.holidays || {};
    const liburReg = Boolean(roster.liburRegulerOnHoliday);

    if (value === "reguler") {
      updateRow(rowIndex, {
        patternMode: "reguler",
        oct1Phase: null,
        shifts: buildShiftsForRow({ patternMode: "reguler" }, month, currentHolidays, liburReg)
      });
    } else if (value.startsWith("rotasi5_")) {
      const oct1Phase = Number(value.split("_")[1]) || 0;
      updateRow(rowIndex, {
        patternMode: "rotasi5",
        oct1Phase,
        shifts: buildShiftsForRow({ patternMode: "rotasi5", oct1Phase }, month, currentHolidays, liburReg)
      });
    } else {
      updateRow(rowIndex, { patternMode: "custom" });
    }
  };

  // Shift a row's rotation by +1 or -1 day
  const handleNudgeRowCycle = (rowIndex, deltaStep) => {
    if (!roster) return;
    const row = roster.rows[rowIndex];
    const currentHolidays = roster.holidays || {};
    const liburReg = Boolean(roster.liburRegulerOnHoliday);
    const nextPhase = ((( (row.oct1Phase ?? 0) + deltaStep ) % 5) + 5) % 5;
    updateRow(rowIndex, {
      patternMode: "rotasi5",
      oct1Phase: nextPhase,
      shifts: buildShiftsForRow({ patternMode: "rotasi5", oct1Phase: nextPhase }, month, currentHolidays, liburReg)
    });
  };

  // Move row up or down (mengubah susunan pegawai)
  const handleMoveRow = (rowIndex, direction) => {
    if (!roster) return;
    const targetIndex = rowIndex + direction;
    if (targetIndex < 0 || targetIndex >= roster.rows.length) return;
    const nextRows = [...roster.rows];
    const [moved] = nextRows.splice(rowIndex, 1);
    nextRows.splice(targetIndex, 0, moved);
    updateRoster({ rows: nextRows });
  };

  // Add new staff row with automatic pattern fill
  const handleAddPegawaiRow = () => {
    if (!roster) return;
    const currentHolidays = roster.holidays || {};
    const liburReg = Boolean(roster.liburRegulerOnHoliday);
    const newRow = {
      sourceName: "Pegawai Baru",
      pegawaiId: "",
      pdfNo: roster.rows.length + 1,
      patternMode: "rotasi5",
      oct1Phase: 0,
      shifts: buildShiftsForRow({ patternMode: "rotasi5", oct1Phase: 0 }, month, currentHolidays, liburReg)
    };
    updateRoster({ rows: [...roster.rows, newRow] });
  };

  // Direct Excel (.xlsx) File Download matching Official Format
  const handleDownloadExcel = async () => {
    if (!roster || exportingType) return;
    setExportingType("excel");
    setErrorMsg("");
    try {
      const mod = await import("./exceljs.min-BEz_Ja81.js");
      const ExcelJS = mod.default?.Workbook ? mod.default : mod;
      const wb = new ExcelJS.Workbook();
      wb.creator = "UPTD Puskesmas Silian";
      wb.created = new Date();

      const totalDays = getDaysInMonth(month);
      const totalCols = 2 + totalDays;
      const sig = { ...DEFAULT_SIGNATORIES, ...(roster.signatories || {}) };
      const usePdfNo = sig.numberStyle !== "sequential";
      const teamUpper = (team || "PERAWAT").toUpperCase();
      const [yrNum, moNum] = String(month).split("-").map(Number);
      const monthNameUpper = INDONESIAN_MONTHS[(moNum || 1) - 1] || "OKTOBER";

      const ws = wb.addWorksheet(`JADWAL ${teamUpper}`, {
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 1,
          margins: { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1 }
        }
      });

      const cols = [
        { key: "no", width: 5.5 },
        { key: "nama", width: 32 }
      ];
      for (let d = 1; d <= totalDays; d++) {
        cols.push({ key: `d_${d}`, width: 3.6 });
      }
      ws.columns = cols;

      // Embed Logos if available
      const fetchImgBuffer = async (url) => {
        try {
          const r = await fetch(url);
          if (!r.ok) return null;
          return await r.arrayBuffer();
        } catch {
          return null;
        }
      };
      const [bufMitra, bufPkm] = await Promise.all([
        fetchImgBuffer(LOGO_MITRA),
        fetchImgBuffer(LOGO_PKM)
      ]);
      if (bufMitra) {
        const imgId1 = wb.addImage({ buffer: bufMitra, extension: "png" });
        ws.addImage(imgId1, { tl: { col: 0.2, row: 0.15 }, ext: { width: 64, height: 64 } });
      }
      if (bufPkm) {
        const imgId2 = wb.addImage({ buffer: bufPkm, extension: "png" });
        ws.addImage(imgId2, { tl: { col: totalCols - 2.3, row: 0.15 }, ext: { width: 64, height: 64 } });
      }

      // Kop Surat Rows (1-4)
      const kopLines = [
        { text: "PEMERINTAH KABUPATEN MINAHASA TENGGARA", size: 12, bold: true },
        { text: "DINAS KESEHATAN", size: 13, bold: true },
        { text: "UPTD PUSKESMAS SILIAN", size: 14, bold: true },
        { text: "Alamat Desa Silian Satu Kecamatan Silian Raya Email:puskesmassilian@yahoo.com", size: 9, italic: true }
      ];
      kopLines.forEach((line, idx) => {
        const rNum = idx + 1;
        ws.mergeCells(rNum, 1, rNum, totalCols);
        const cell = ws.getCell(rNum, 1);
        cell.value = line.text;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = {
          name: "Times New Roman",
          size: line.size,
          bold: Boolean(line.bold),
          italic: Boolean(line.italic)
        };
        ws.getRow(rNum).height = idx === 3 ? 18 : 17;
      });
      for (let c = 1; c <= totalCols; c++) {
        ws.getCell(4, c).border = { bottom: { style: "double", color: { argb: "FF000000" } } };
      }

      // Title Row (6)
      ws.mergeCells(6, 1, 6, totalCols);
      const titleCell = ws.getCell(6, 1);
      titleCell.value = `JADWAL DINAS ${teamUpper} PUSKESMAS SILIAN ${formatMonthYearUpper(month)}`;
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { name: "Arial", size: 11, bold: true };
      ws.getRow(6).height = 20;

      // Table Header Rows (8, 9, 10)
      const hStart = 8;
      ws.mergeCells(hStart, 1, hStart + 2, 1);
      ws.mergeCells(hStart, 2, hStart + 2, 2);
      ws.mergeCells(hStart, 3, hStart, totalCols);
      ws.mergeCells(hStart + 1, 3, hStart + 1, totalCols);

      ws.getCell(hStart, 1).value = "No.";
      ws.getCell(hStart, 2).value = `NAMA ${teamUpper}`;
      ws.getCell(hStart, 3).value = "BULAN";
      ws.getCell(hStart + 1, 3).value = monthNameUpper;

      for (let d = 1; d <= totalDays; d++) {
        ws.getCell(hStart + 2, 2 + d).value = d;
      }

      const thinBorder = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } }
      };

      for (let r = hStart; r <= hStart + 2; r++) {
        ws.getRow(r).height = 15;
        for (let c = 1; c <= totalCols; c++) {
          const cell = ws.getCell(r, c);
          const d = c - 2;
          const isRedDate =
            r === hStart + 2 &&
            d >= 1 &&
            (getDayOfWeekUTC(month, d) === 0 || Boolean(roster.holidays?.[d]));
          cell.border = thinBorder;
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF000000" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isRedDate ? "FFFF0000" : "FFD9E1F2" }
          };
        }
      }

      // Data Rows
      let currRow = hStart + 3;
      ((visibleRoster || roster).rows || []).forEach((row, idx) => {
        const displayNo = usePdfNo && row.pdfNo ? row.pdfNo : idx + 1;
        const rObj = ws.getRow(currRow);
        rObj.height = 16;

        const cNo = ws.getCell(currRow, 1);
        cNo.value = displayNo;
        cNo.alignment = { horizontal: "center", vertical: "middle" };
        cNo.font = { name: "Arial", size: 9 };
        cNo.border = thinBorder;

        const cName = ws.getCell(currRow, 2);
        cName.value = resolveName(row);
        cName.alignment = { horizontal: "left", vertical: "middle" };
        cName.font = { name: "Arial", size: 9 };
        cName.border = thinBorder;

        for (let d = 1; d <= totalDays; d++) {
          const colIdx = 2 + d;
          const cell = ws.getCell(currRow, colIdx);
          const isRed = getDayOfWeekUTC(month, d) === 0 || Boolean(roster.holidays?.[d]);
          cell.value = row.shifts?.[d] || "";
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF000000" } };
          cell.border = thinBorder;
          if (isRed) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFF0000" }
            };
          }
        }
        currRow++;
      });

      // Keterangan Box
      const ketRow = currRow + 1;
      const ketItems = [
        ["KETERANGAN :", ""],
        ["P : DINAS PAGI", ""],
        ["S : DINAS SORE", ""],
        ["M : DINAS MALAM", ""],
        ["L : LIBUR / LEPAS DINAS", ""],
        ["", "WARNA MERAH : TANGGAL MERAH / HARI MINGGU"]
      ];
      ketItems.forEach((item, idx) => {
        const r = ketRow + idx;
        ws.getRow(r).height = 14;
        const c1 = ws.getCell(r, 2);
        c1.value = item[0] + item[1];
        c1.font = { name: "Arial", size: 8, bold: true };
        if (idx === 5) {
          const cRed = ws.getCell(r, 1);
          cRed.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
          cRed.border = thinBorder;
        }
      });

      // Mengetahui Signatures
      const sigStart = ketRow + 7;
      const rightStartCol = Math.max(4, totalCols - 10);

      ws.mergeCells(sigStart, 1, sigStart, totalCols);
      const mCell = ws.getCell(sigStart, 1);
      mCell.value = "MENGETAHUI";
      mCell.alignment = { horizontal: "center", vertical: "middle" };
      mCell.font = { name: "Arial", size: 9, bold: true };

      ws.mergeCells(sigStart + 1, 2, sigStart + 1, 10);
      ws.getCell(sigStart + 1, 2).value = sig.leftTitle;
      ws.getCell(sigStart + 1, 2).alignment = { horizontal: "center" };
      ws.getCell(sigStart + 1, 2).font = { name: "Arial", size: 9, bold: true };

      ws.mergeCells(sigStart + 1, rightStartCol, sigStart + 1, totalCols - 1);
      ws.getCell(sigStart + 1, rightStartCol).value = sig.rightTitle;
      ws.getCell(sigStart + 1, rightStartCol).alignment = { horizontal: "center" };
      ws.getCell(sigStart + 1, rightStartCol).font = { name: "Arial", size: 9, bold: true };

      const nameRow = sigStart + 5;
      ws.mergeCells(nameRow, 2, nameRow, 10);
      ws.getCell(nameRow, 2).value = sig.leftName;
      ws.getCell(nameRow, 2).alignment = { horizontal: "center" };
      ws.getCell(nameRow, 2).font = { name: "Arial", size: 9, bold: true, underline: true };

      ws.mergeCells(nameRow, rightStartCol, nameRow, totalCols - 1);
      ws.getCell(nameRow, rightStartCol).value = sig.rightName;
      ws.getCell(nameRow, rightStartCol).alignment = { horizontal: "center" };
      ws.getCell(nameRow, rightStartCol).font = { name: "Arial", size: 9, bold: true, underline: true };

      ws.mergeCells(nameRow + 1, 2, nameRow + 1, 10);
      ws.getCell(nameRow + 1, 2).value = sig.leftNip;
      ws.getCell(nameRow + 1, 2).alignment = { horizontal: "center" };
      ws.getCell(nameRow + 1, 2).font = { name: "Arial", size: 9, bold: true };

      ws.mergeCells(nameRow + 1, rightStartCol, nameRow + 1, totalCols - 1);
      ws.getCell(nameRow + 1, rightStartCol).value = sig.rightNip;
      ws.getCell(nameRow + 1, rightStartCol).alignment = { horizontal: "center" };
      ws.getCell(nameRow + 1, rightStartCol).font = { name: "Arial", size: 9, bold: true };

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Jadwal_Dinas_${team}_${month}_Puskesmas_Silian.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatusMsg(`File Excel (.xlsx) Jadwal ${team} ${formatMonthYearReadable(month)} berhasil diunduh.`);
    } catch (err) {
      setErrorMsg("Gagal mengunduh file Excel: " + err.message);
    } finally {
      setExportingType("");
    }
  };

  // Direct PDF (.pdf) File Download matching Official Lampiran Format
  const handleDownloadPdf = async () => {
    if (!roster || exportingType) return;
    setExportingType("pdf");
    setErrorMsg("");
    try {
      const totalDays = getDaysInMonth(month);
      const rows = (visibleRoster || roster).rows || [];
      const sig = { ...DEFAULT_SIGNATORIES, ...(roster.signatories || {}) };
      const usePdfNo = sig.numberStyle !== "sequential";
      const teamUpper = (team || "PERAWAT").toUpperCase();
      const [yrNum, moNum] = String(month).split("-").map(Number);
      const monthNameUpper = INDONESIAN_MONTHS[(moNum || 1) - 1] || "OKTOBER";

      // Load Logo Images
      const loadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      const [imgMitra, imgPkm] = await Promise.all([loadImage(LOGO_MITRA), loadImage(LOGO_PKM)]);

      // High-DPI A4 Landscape Canvas (2480 x 1754 px)
      const W = 2480;
      const H = Math.max(1754, 980 + rows.length * 42);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      const marginX = 95;
      const contentW = W - marginX * 2;

      // Draw Logos & Kop Surat
      if (imgMitra) {
        ctx.drawImage(imgMitra, marginX + 15, 55, 138, 138);
      }
      if (imgPkm) {
        ctx.drawImage(imgPkm, W - marginX - 153, 55, 138, 138);
      }

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 32px 'Times New Roman', Times, serif";
      ctx.fillText("PEMERINTAH KABUPATEN MINAHASA TENGGARA", W / 2, 76);

      ctx.font = "bold 36px 'Times New Roman', Times, serif";
      ctx.fillText("DINAS KESEHATAN", W / 2, 118);

      ctx.font = "bold 40px 'Times New Roman', Times, serif";
      ctx.fillText("UPTD PUSKESMAS SILIAN", W / 2, 162);

      ctx.font = "italic 22px 'Times New Roman', Times, serif";
      ctx.fillText(
        "Alamat Desa Silian Satu Kecamatan Silian Raya Email:puskesmassilian@yahoo.com",
        W / 2,
        198
      );

      // Double horizontal line under Kop Surat
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(marginX, 222);
      ctx.lineTo(W - marginX, 222);
      ctx.stroke();

      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(marginX, 230);
      ctx.lineTo(W - marginX, 230);
      ctx.stroke();

      // Title
      ctx.font = "bold 27px Arial, Helvetica, sans-serif";
      ctx.fillText(
        `JADWAL DINAS ${teamUpper} PUSKESMAS SILIAN ${formatMonthYearUpper(month)}`,
        W / 2,
        274
      );

      // Table Geometry
      const tableTop = 310;
      const colNoW = 86;
      const colNameW = 490;
      const daysAreaW = contentW - colNoW - colNameW;
      const dayColW = daysAreaW / totalDays;
      const hRowH = 34;
      const headerTotalH = hRowH * 3;
      const rowH = Math.min(38, Math.max(28, Math.floor((H - 830) / Math.max(rows.length, 15))));

      // Header Fills
      ctx.fillStyle = "#d9e1f2";
      ctx.fillRect(marginX, tableTop, contentW, headerTotalH);

      for (let d = 1; d <= totalDays; d++) {
        const isRed = getDayOfWeekUTC(month, d) === 0 || Boolean(roster.holidays?.[d]);
        if (isRed) {
          const dx = marginX + colNoW + colNameW + (d - 1) * dayColW;
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(dx, tableTop + hRowH * 2, dayColW, hRowH);
        }
      }

      // Header Borders & Text
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.8;
      ctx.strokeRect(marginX, tableTop, colNoW, headerTotalH);
      ctx.strokeRect(marginX + colNoW, tableTop, colNameW, headerTotalH);
      ctx.strokeRect(marginX + colNoW + colNameW, tableTop, daysAreaW, hRowH);
      ctx.strokeRect(marginX + colNoW + colNameW, tableTop + hRowH, daysAreaW, hRowH);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No.", marginX + colNoW / 2, tableTop + headerTotalH / 2);
      ctx.fillText(`NAMA ${teamUpper}`, marginX + colNoW + colNameW / 2, tableTop + headerTotalH / 2);
      ctx.fillText("BULAN", marginX + colNoW + colNameW + daysAreaW / 2, tableTop + hRowH / 2);
      ctx.fillText(monthNameUpper, marginX + colNoW + colNameW + daysAreaW / 2, tableTop + hRowH * 1.5);

      ctx.font = "bold 18px Arial, Helvetica, sans-serif";
      for (let d = 1; d <= totalDays; d++) {
        const dx = marginX + colNoW + colNameW + (d - 1) * dayColW;
        ctx.strokeRect(dx, tableTop + hRowH * 2, dayColW, hRowH);
        ctx.fillText(String(d), dx + dayColW / 2, tableTop + hRowH * 2.5);
      }

      // Data Rows
      let yCursor = tableTop + headerTotalH;
      rows.forEach((row, idx) => {
        const displayNo = usePdfNo && row.pdfNo ? row.pdfNo : idx + 1;

        for (let d = 1; d <= totalDays; d++) {
          const isRed = getDayOfWeekUTC(month, d) === 0 || Boolean(roster.holidays?.[d]);
          if (isRed) {
            const dx = marginX + colNoW + colNameW + (d - 1) * dayColW;
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(dx, yCursor, dayColW, rowH);
          }
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(marginX, yCursor, colNoW, rowH);
        ctx.strokeRect(marginX + colNoW, yCursor, colNameW, rowH);

        ctx.fillStyle = "#000000";
        ctx.font = "19px Arial, Helvetica, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(displayNo), marginX + colNoW / 2, yCursor + rowH / 2);

        ctx.textAlign = "left";
        ctx.fillText(resolveName(row), marginX + colNoW + 14, yCursor + rowH / 2);

        ctx.textAlign = "center";
        ctx.font = "bold 19px Arial, Helvetica, sans-serif";
        for (let d = 1; d <= totalDays; d++) {
          const dx = marginX + colNoW + colNameW + (d - 1) * dayColW;
          ctx.strokeRect(dx, yCursor, dayColW, rowH);
          const shiftCode = row.shifts?.[d] || "";
          if (shiftCode) {
            ctx.fillText(shiftCode, dx + dayColW / 2, yCursor + rowH / 2);
          }
        }

        yCursor += rowH;
      });

      // Keterangan Box
      const ketTop = yCursor + 24;
      const ketW = 490;
      const ketH = 175;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(marginX, ketTop, ketW, ketH);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.font = "bold 17px Arial, Helvetica, sans-serif";
      ctx.fillText("KETERANGAN :", marginX + 14, ketTop + 24);
      ctx.fillText("P    : DINAS PAGI", marginX + 14, ketTop + 50);
      ctx.fillText("S    : DINAS SORE", marginX + 14, ketTop + 76);
      ctx.fillText("M    : DINAS MALAM", marginX + 14, ketTop + 102);
      ctx.fillText("L    : LIBUR", marginX + 14, ketTop + 128);

      ctx.fillStyle = "#ff0000";
      ctx.fillRect(marginX + 14, ketTop + 142, 42, 20);
      ctx.strokeRect(marginX + 14, ketTop + 142, 42, 20);
      ctx.fillStyle = "#000000";
      ctx.fillText(": TANGGAL MERAH / HARI MINGGU", marginX + 66, ketTop + 152);

      // Mengetahui Signatures
      const sigTop = ketTop + ketH + 26;
      const leftCenterX = marginX + 360;
      const rightCenterX = W - marginX - 360;

      ctx.textAlign = "center";
      ctx.font = "bold 20px Arial, Helvetica, sans-serif";
      ctx.fillText("MENGETAHUI", W / 2, sigTop);

      ctx.fillText(sig.leftTitle, leftCenterX, sigTop + 34);
      ctx.fillText(sig.rightTitle, rightCenterX, sigTop + 34);

      const sigNameY = sigTop + 150;
      ctx.fillText(sig.leftName, leftCenterX, sigNameY);
      ctx.fillText(sig.rightName, rightCenterX, sigNameY);

      // Underlines for signatory names
      const leftNameW = ctx.measureText(sig.leftName).width;
      const rightNameW = ctx.measureText(sig.rightName).width;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftCenterX - leftNameW / 2, sigNameY + 12);
      ctx.lineTo(leftCenterX + leftNameW / 2, sigNameY + 12);
      ctx.moveTo(rightCenterX - rightNameW / 2, sigNameY + 12);
      ctx.lineTo(rightCenterX + rightNameW / 2, sigNameY + 12);
      ctx.stroke();

      ctx.fillText(sig.leftNip, leftCenterX, sigNameY + 34);
      ctx.fillText(sig.rightNip, rightCenterX, sigNameY + 34);

      // Convert high-DPI canvas JPEG to a standard A4 Landscape PDF (%PDF-1.4) binary file
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const base64 = dataUrl.split(",")[1];
      const binStr = atob(base64);
      const imgBytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        imgBytes[i] = binStr.charCodeAt(i);
      }

      const pdfW = 841.89;
      const pdfH = 595.28;
      const enc = new TextEncoder();
      const chunks = [];
      const offsets = [0];
      let byteLength = 0;

      const pushStr = (s) => {
        const b = enc.encode(s);
        chunks.push(b);
        byteLength += b.length;
      };
      const pushBytes = (b) => {
        chunks.push(b);
        byteLength += b.length;
      };
      const startObj = (id) => {
        offsets[id] = byteLength;
        pushStr(`${id} 0 obj\n`);
      };
      const endObj = () => {
        pushStr("\nendobj\n");
      };

      pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
      startObj(1);
      pushStr("<< /Type /Catalog /Pages 2 0 R >>");
      endObj();

      startObj(2);
      pushStr("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
      endObj();

      startObj(3);
      pushStr(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW} ${pdfH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`
      );
      endObj();

      startObj(4);
      pushStr(
        `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
      );
      pushBytes(imgBytes);
      pushStr("\nendstream");
      endObj();

      const contentStream = `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im0 Do\nQ\n`;
      const contentBytes = enc.encode(contentStream);
      startObj(5);
      pushStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
      pushBytes(contentBytes);
      pushStr("endstream");
      endObj();

      const xrefOffset = byteLength;
      pushStr("xref\n0 6\n0000000000 65535 f \n");
      for (let i = 1; i <= 5; i++) {
        pushStr(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
      }
      pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

      const pdfBlob = new Blob(chunks, { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Jadwal_Dinas_${team}_${month}_Puskesmas_Silian.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatusMsg(`File PDF (.pdf) Jadwal ${team} ${formatMonthYearReadable(month)} berhasil diunduh.`);
    } catch (err) {
      setErrorMsg("Gagal mengunduh file PDF: " + err.message);
    } finally {
      setExportingType("");
    }
  };

  return el(
    "section",
    { className: "roster-page" },
    // Hero Banner (Screen only)
    el(
      "div",
      { className: "roster-hero no-roster-print" },
      el(
        "div",
        null,
        el("span", { className: "hero-kicker" }, "UPTD PUSKESMAS SILIAN · SISTEM JADWAL OTOMATIS"),
        el("h1", null, "Pembuat Jadwal Pelayanan Otomatis"),
        el(
          "p",
          null,
          "Otomatis melanjutkan siklus rotasi dinas dari Oktober ke bulan-bulan berikutnya, menandai Hari Minggu & Tanggal Merah, bebas diedit Admin, dan siap diunduh ke PDF / Excel."
        )
      ),
      el(CalendarIcon, { size: 42 })
    ),

    // Top Navigation Bar: Team Tabs + Month Navigator + Print & Save
    el(
      "div",
      { className: "roster-top-bar no-roster-print" },
      el(
        "div",
        { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" } },
        el(
          "div",
          { className: "roster-tabs" },
          ["Perawat", "Bidan", "Dokter"].map((t) =>
            el(
              "button",
              {
                key: t,
                type: "button",
                "aria-pressed": team === t,
                disabled: loading,
                onClick: () => handleSwitchPeriodOrTeam(t, "team")
              },
              t
            )
          )
        ),
        el(
          "div",
          { className: "roster-month-nav" },
          el(
            "button",
            {
              type: "button",
              disabled: loading,
              title: "Ke Bulan Sebelumnya",
              onClick: () => handleSwitchPeriodOrTeam(addMonths(month, -1), "month")
            },
            "◀ Bulan Lalu"
          ),
          el("input", {
            type: "month",
            "aria-label": "Bulan jadwal pelayanan",
            value: month,
            disabled: loading,
            onChange: (e) => e.target.value && handleSwitchPeriodOrTeam(e.target.value, "month")
          }),
          el(
            "button",
            {
              type: "button",
              disabled: loading,
              title: "Otomatis Lanjut ke Bulan Berikutnya",
              onClick: handleAdvanceToNextMonth
            },
            "Bulan Depan (Lanjut Otomatis) ▶"
          )
        )
      ),

      el(
        "div",
        { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" } },
        isAdmin &&
          el(
            "button",
            {
              type: "button",
              className: "roster-btn primary",
              disabled: loading || !roster,
              onClick: handleSaveRoster
            },
            el(SaveIcon, { size: 16 }),
            dirty ? "Simpan Jadwal *" : "Simpan Jadwal"
          ),
        el(
          "button",
          {
            type: "button",
            className: "roster-btn accent",
            disabled: !roster || Boolean(exportingType),
            onClick: handleDownloadPdf
          },
          el(PrinterIcon, { size: 16 }),
          exportingType === "pdf" ? "Menyiapkan PDF..." : "Unduh PDF (.pdf)"
        ),
        el(
          "button",
          {
            type: "button",
            className: "roster-btn",
            style: { background: "#107c41", color: "#ffffff", borderColor: "#0c5e31" },
            disabled: !roster || Boolean(exportingType),
            onClick: handleDownloadExcel
          },
          exportingType === "excel" ? "Menyiapkan Excel..." : "Unduh Excel (.xlsx)"
        ),
        el(
          "button",
          {
            type: "button",
            className: "roster-btn",
            disabled: !roster,
            onClick: () => window.print()
          },
          el(PrinterIcon, { size: 16 }),
          "Cetak Langsung"
        )
      )
    ),

    // Smart Auto-Generator Panel for Admin
    isAdmin &&
      roster &&
      el(
        "div",
        { className: "roster-autogen-panel no-roster-print" },
        el(
          "div",
          { className: "roster-autogen-header" },
          el(
            "div",
            null,
            el(
              "h3",
              null,
              `Otomatisasi Jadwal ${team} — ${formatMonthYearReadable(month)}`
            ),
            el(
              "p",
              null,
              "Alur rotasi 5 hari (P → S → M → L → L) dan jadwal Reguler (Senin–Jumat Pagi, Sabtu–Minggu Libur) berjalan otomatis lintas bulan tanpa perlu klik satu per satu."
            )
          ),
          el(
            "div",
            { className: "roster-autogen-actions" },
            el(
              "button",
              {
                type: "button",
                className: "roster-btn",
                onClick: handleContinueFromPreviousMonth
              },
              `⚡ Lanjutkan dari ${formatMonthYearReadable(addMonths(month, -1))}`
            ),
            el(
              "button",
              {
                type: "button",
                className: "roster-btn",
                onClick: handleResetToStandardFormat
              },
              "🔄 Susun Ulang sesuai Alur Oktober 2026"
            ),
            el(
              "button",
              {
                type: "button",
                className: "roster-btn",
                onClick: () => setShowBatchModal(true)
              },
              "📅 Buat Otomatis Beberapa Bulan"
            ),
            el(
              "button",
              {
                type: "button",
                className: "roster-btn",
                onClick: () => setShowSignatoryModal((v) => !v)
              },
              "⚙️ Kop & Penandatangan"
            )
          )
        ),

        // Optional Signatory & Kop Settings Collapsible
        showSignatoryModal &&
          el(
            "div",
            {
              style: {
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #dce7eb",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "10px"
              }
            },
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "Jabatan Mengetahui Kiri"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.leftRole ?? DEFAULT_SIGNATORIES.leftRole,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), leftRole: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "Nama Kepala Dinas Kesehatan"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.leftName ?? DEFAULT_SIGNATORIES.leftName,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), leftName: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "NIP Kepala Dinas Kesehatan"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.leftNip ?? DEFAULT_SIGNATORIES.leftNip,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), leftNip: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "Jabatan Mengetahui Kanan"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.rightRole ?? DEFAULT_SIGNATORIES.rightRole,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), rightRole: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "Nama Kepala Puskesmas"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.rightName ?? DEFAULT_SIGNATORIES.rightName,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), rightName: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "NIP Kepala Puskesmas"),
              el("input", {
                className: "roster-name-input",
                value: roster.signatories?.rightNip ?? DEFAULT_SIGNATORIES.rightNip,
                onChange: (e) =>
                  updateRoster({
                    signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), rightNip: e.target.value }
                  })
              })
            ),
            el(
              "label",
              null,
              el("small", { style: { fontWeight: 700, display: "block", marginBottom: 4 } }, "Format Kolom Nomor (No.) Cetak"),
              el(
                "select",
                {
                  className: "roster-name-input",
                  value: roster.signatories?.numberStyle || "pdf",
                  onChange: (e) =>
                    updateRoster({
                      signatories: { ...(roster.signatories || DEFAULT_SIGNATORIES), numberStyle: e.target.value }
                    })
                },
                el("option", { value: "pdf" }, "Sesuai Lampiran PDF (1..6, 8..10, 12..14, 11, 15, 16)"),
                el("option", { value: "sequential" }, "Urut Berurutan (1, 2, 3 ... 15)")
              )
            )
          )
      ),

    // Batch Generate Modal
    showBatchModal &&
      el(
        "div",
        {
          className: "no-roster-print",
          style: {
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }
        },
        el(
          "div",
          null,
          el(
            "strong",
            { style: { display: "block", fontSize: "14px", color: "#0c4a6e" } },
            `Generate & Simpan Otomatis Beberapa Bulan ke Depan (Mulai setelah ${formatMonthYearReadable(month)})`
          ),
          el(
            "span",
            { style: { fontSize: "12.5px", color: "#0369a1" } },
            "Susunan pegawai dan kelanjutan rotasi shift akan dihitung dan disimpan otomatis untuk seluruh bulan berikutnya."
          )
        ),
        el(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "8px" } },
          el(
            "select",
            {
              className: "roster-name-input",
              style: { width: "auto" },
              value: batchMonthsCount,
              onChange: (e) => setBatchMonthsCount(Number(e.target.value))
            },
            el("option", { value: 2 }, "2 Bulan ke Depan"),
            el("option", { value: 3 }, "3 Bulan ke Depan"),
            el("option", { value: 6 }, "6 Bulan ke Depan"),
            el("option", { value: 12 }, "12 Bulan (1 Tahun Penuh)")
          ),
          el(
            "button",
            {
              type: "button",
              className: "roster-btn primary",
              disabled: batchProcessing,
              onClick: handleBatchGenerateMonths
            },
            batchProcessing ? "Memproses..." : "Buat & Simpan Sekarang"
          ),
          el(
            "button",
            {
              type: "button",
              className: "roster-btn",
              onClick: () => setShowBatchModal(false)
            },
            "Tutup"
          )
        )
      ),

    // Notifications
    errorMsg && el("div", { role: "alert", className: "roster-error no-roster-print" }, errorMsg),
    statusMsg &&
      el(
        "div",
        { role: "status", className: "roster-banner-info no-roster-print" },
        el("span", null, statusMsg),
        el(
          "button",
          {
            type: "button",
            className: "roster-mini-btn",
            onClick: () => setStatusMsg("")
          },
          "Tutup"
        )
      ),

    loading && el("p", { className: "no-roster-print" }, "Memuat jadwal pelayanan…"),

    isPersonalOnly &&
      el(
        "div",
        {
          className: "no-roster-print",
          style: {
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "11px 16px",
            marginBottom: "12px",
            fontSize: "12.5px",
            color: "#166534",
            fontWeight: 600
          }
        },
        `🔒 Mode Privasi Pegawai Aktif — Menampilkan jadwal dinas pribadi untuk ${
          currentUser?.nama || "Akun Anda"
        }. Data jadwal pegawai lain disembunyikan (hanya Admin, Pimpinan, dan Bendahara yang dapat melihat seluruh pegawai).`
      ),

    roster &&
      el(
        React.Fragment,
        null,
        // Quick Brush & Tanggal Merah Sub-toolbar (Screen only)
        el(
          "div",
          { className: "roster-subtoolbar no-roster-print" },
          el(
            "div",
            { className: "roster-brush-group" },
            el(
              "span",
              { style: { fontSize: "12px", fontWeight: 700, color: "#335c67", marginRight: 4 } },
              "Mode Edit Jadwal:"
            ),
            el(
              "button",
              {
                type: "button",
                className: "roster-brush-btn",
                "aria-pressed": activeBrush === "",
                onClick: () => setActiveBrush("")
              },
              "Pilih Dropdown"
            ),
            Object.entries(SHIFT_LABELS).map(([code, label]) =>
              el(
                "button",
                {
                  key: code,
                  type: "button",
                  className: `roster-brush-btn brush-${code}`,
                  "aria-pressed": activeBrush === code,
                  onClick: () => setActiveBrush(activeBrush === code ? "" : code),
                  title: `Klik sel tanggal di tabel untuk langsung mengisi ${code} (${label})`
                },
                `Kuas Cepat: ${code} (${label.replace("Dinas ", "").replace(" / Lepas Dinas", "")})`
              )
            )
          ),

          el(
            "div",
            { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" } },
            el("input", {
              type: "search",
              "aria-label": "Cari nama pegawai",
              placeholder: "Cari nama pegawai…",
              className: "roster-name-input",
              style: { width: "190px" },
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            }),
            isAdmin &&
              el(
                "button",
                {
                  type: "button",
                  className: "roster-btn",
                  onClick: handleAddPegawaiRow
                },
                el(PlusIcon, { size: 15 }),
                "Tambah Pegawai"
              ),
            el(
              "button",
              {
                type: "button",
                className: "roster-btn",
                onClick: () => setShowPrintPreview((v) => !v)
              },
              showPrintPreview ? "Sembunyikan Pratinjau Cetak" : "Tampilkan Pratinjau Cetak"
            )
          )
        ),

        // Interactive Hint about Tanggal Merah & Row Editing
        isAdmin &&
          el(
            "div",
            {
              className: "no-roster-print",
              style: {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                fontSize: "12px",
                color: "#486572",
                marginBottom: "10px",
                padding: "0 4px"
              }
            },
            el(
              "span",
              null,
              "💡 Tips: Klik angka tanggal pada header tabel untuk menandai/membatalkan ",
              el("strong", { style: { color: "#dc2626" } }, "Tanggal Merah / Hari Libur"),
              ". Gunakan kolom ",
              el("strong", null, "Pola / Regu"),
              " untuk mengubah pola 1 bulan penuh atau tombol ",
              el("strong", null, "↑ ↓"),
              " untuk mengubah susunan pegawai."
            ),
            el(
              "label",
              { style: { display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600 } },
              el("input", {
                type: "checkbox",
                checked: Boolean(roster.liburRegulerOnHoliday),
                onChange: (e) => {
                  const checked = e.target.checked;
                  const currentHolidays = roster.holidays || {};
                  updateRoster({
                    liburRegulerOnHoliday: checked,
                    rows: roster.rows.map((r) =>
                      r.patternMode === "reguler"
                        ? { ...r, shifts: buildShiftsForRow(r, month, currentHolidays, checked) }
                        : r
                    )
                  });
                }
              }),
              "Otomatis set L (Libur) bagi pegawai Reguler pada Tanggal Merah"
            )
          ),

        // Interactive Editable Table (Screen only)
        el(
          "div",
          { className: "roster-grid no-roster-print" },
          el(
            "table",
            null,
            el(
              "thead",
              null,
              el(
                "tr",
                null,
                el("th", { rowSpan: 3, className: "sticky-no" }, "No."),
                el("th", { rowSpan: 3, className: "sticky-name" }, `NAMA ${team.toUpperCase()} & SUSUNAN`),
                isAdmin && el("th", { rowSpan: 3, style: { minWidth: "155px" } }, "POLA / REGU OTOMATIS"),
                el("th", { colSpan: daysInMonth }, `HARI / TANGGAL — ${formatMonthYearUpper(month)}`),
                el("th", { rowSpan: 3 }, "Total Dinas"),
                isAdmin && el("th", { rowSpan: 3 }, "Aksi")
              ),
              el(
                "tr",
                null,
                Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dow = getDayOfWeekUTC(month, d);
                  const isRed = dow === 0 || Boolean(roster.holidays?.[d]);
                  return el(
                    "th",
                    {
                      key: `head-day-${d}`,
                      className: isRed ? "holiday-col-header" : "",
                      onClick: () => handleToggleHolidayDate(d),
                      title:
                        dow === 0
                          ? "Hari Minggu (Libur)"
                          : roster.holidays?.[d]
                          ? `${roster.holidays[d]} — Klik untuk batalkan Tanggal Merah`
                          : "Klik untuk tandai sebagai Tanggal Merah / Libur"
                    },
                    getDayNameId(month, d)
                  );
                })
              ),
              el(
                "tr",
                null,
                Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dow = getDayOfWeekUTC(month, d);
                  const isRed = dow === 0 || Boolean(roster.holidays?.[d]);
                  return el(
                    "th",
                    {
                      key: `head-num-${d}`,
                      className: isRed ? "holiday-col-header" : "",
                      onClick: () => handleToggleHolidayDate(d),
                      title: "Klik untuk toggle Tanggal Merah"
                    },
                    d
                  );
                })
              )
            ),
            el(
              "tbody",
              null,
              roster.rows.map((row, rIdx) => {
                if (!matchesCurrentUser(row)) return null;
                const nameStr = resolveName(row);
                const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return null;

                const usePdfNo = (roster.signatories?.numberStyle || "pdf") === "pdf";
                const rowNoDisplay = usePdfNo && row.pdfNo ? row.pdfNo : rIdx + 1;

                return el(
                  "tr",
                  { key: `edit-row-${rIdx}` },
                  // No. & Reorder arrows
                  el(
                    "td",
                    { className: "sticky-no" },
                    el("div", { style: { fontWeight: 800 } }, rowNoDisplay),
                    isAdmin &&
                      el(
                        "div",
                        { className: "roster-row-tools", style: { marginTop: 3 } },
                        el(
                          "button",
                          {
                            type: "button",
                            className: "roster-mini-btn",
                            disabled: rIdx === 0,
                            title: "Geser Naik Urutan Pegawai",
                            onClick: () => handleMoveRow(rIdx, -1)
                          },
                          "↑"
                        ),
                        el(
                          "button",
                          {
                            type: "button",
                            className: "roster-mini-btn",
                            disabled: rIdx === roster.rows.length - 1,
                            title: "Geser Turun Urutan Pegawai",
                            onClick: () => handleMoveRow(rIdx, 1)
                          },
                          "↓"
                        )
                      )
                  ),

                  // Nama Perawat (Editable Text + Optional Link to Master Pegawai)
                  el(
                    "td",
                    { className: "sticky-name" },
                    isAdmin
                      ? el(
                          "div",
                          { className: "roster-name-cell-wrap" },
                          el("input", {
                            type: "text",
                            className: "roster-name-input",
                            "aria-label": `Nama pegawai baris ${rIdx + 1}`,
                            value: row.sourceName ?? nameStr,
                            placeholder: "Ketik nama lengkap & gelar…",
                            onChange: (e) => updateRow(rIdx, { sourceName: e.target.value })
                          }),
                          people.length > 0 &&
                            el(
                              "select",
                              {
                                className: "roster-master-select",
                                "aria-label": `Pilih dari Master Pegawai baris ${rIdx + 1}`,
                                value: row.pegawaiId || "",
                                onChange: (e) => {
                                  const pid = e.target.value;
                                  const found = people.find((p) => p.id === pid);
                                  updateRow(rIdx, {
                                    pegawaiId: pid,
                                    sourceName: found ? found.nama : row.sourceName
                                  });
                                }
                              },
                              el("option", { value: "" }, "— Sinkron Master Pegawai (Opsional) —"),
                              people.map((p) =>
                                el("option", { key: p.id, value: p.id }, p.nama)
                              )
                            )
                        )
                      : el("strong", null, nameStr)
                  ),

                  // Pola / Regu Selector
                  isAdmin &&
                    el(
                      "td",
                      null,
                      el(
                        "div",
                        { style: { display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" } },
                        el(
                          "select",
                          {
                            className: "roster-regu-select",
                            value: getPatternSelectValue(row),
                            onChange: (e) => handleRowPatternChange(rIdx, e.target.value)
                          },
                          el("option", { value: "rotasi5_3" }, "Regu 1 (P-S-M-L-L)"),
                          el("option", { value: "rotasi5_4" }, "Regu 2 (P-S-M-L-L)"),
                          el("option", { value: "rotasi5_0" }, "Regu 3 (P-S-M-L-L)"),
                          el("option", { value: "rotasi5_2" }, "Regu 4 (P-S-M-L-L)"),
                          el("option", { value: "rotasi5_1" }, "Regu 5 (P-S-M-L-L)"),
                          el("option", { value: "reguler" }, "Reguler (Sen–Jum P)"),
                          el("option", { value: "custom" }, "Manual / Kustom")
                        ),
                        row.patternMode !== "reguler" &&
                          el(
                            "div",
                            { className: "roster-row-tools" },
                            el(
                              "button",
                              {
                                type: "button",
                                className: "roster-mini-btn",
                                title: "Geser siklus mundur 1 hari",
                                onClick: () => handleNudgeRowCycle(rIdx, -1)
                              },
                              "⟲ -1 Hr"
                            ),
                            el(
                              "button",
                              {
                                type: "button",
                                className: "roster-mini-btn",
                                title: "Geser siklus maju 1 hari",
                                onClick: () => handleNudgeRowCycle(rIdx, 1)
                              },
                              "+1 Hr ⟳"
                            )
                          )
                      )
                    ),

                  // 1..31 Shift Cells
                  Array.from({ length: daysInMonth }, (_, i) => {
                    const d = i + 1;
                    const dow = getDayOfWeekUTC(month, d);
                    const isRed = dow === 0 || Boolean(roster.holidays?.[d]);
                    const val = row.shifts?.[d] || "";

                    return el(
                      "td",
                      {
                        key: `shift-${rIdx}-${d}`,
                        className: `${isRed ? "holiday-col-cell" : `shift-${val || "empty"}`}`,
                        style: activeBrush && isAdmin ? { cursor: "cell" } : undefined,
                        onClick: () => {
                          if (isAdmin && activeBrush) {
                            updateRow(rIdx, {
                              patternMode: "custom",
                              shifts: { ...row.shifts, [d]: activeBrush }
                            });
                          }
                        }
                      },
                      isAdmin && !activeBrush
                        ? el(
                            "select",
                            {
                              className: "shift-select",
                              "aria-label": `Shift ${nameStr} tanggal ${d}`,
                              value: val,
                              onChange: (e) =>
                                updateRow(rIdx, {
                                  shifts: { ...row.shifts, [d]: e.target.value }
                                })
                            },
                            el("option", { value: "" }, "—"),
                            Object.entries(SHIFT_LABELS).map(([k, lbl]) =>
                              el("option", { key: k, value: k, title: lbl }, k)
                            )
                          )
                        : el("span", { style: { fontWeight: 800 } }, val || "—")
                    );
                  }),

                  // Total Active Shifts (P/S/M)
                  el(
                    "td",
                    { style: { fontWeight: 800 } },
                    Object.values(row.shifts || {}).filter((v) => ["P", "S", "M"].includes(v)).length
                  ),

                  // Delete Row Action
                  isAdmin &&
                    el(
                      "td",
                      null,
                      el(
                        "button",
                        {
                          type: "button",
                          className: "roster-mini-btn",
                          style: { color: "#b91c1c", borderColor: "#fecaca" },
                          onClick: () =>
                            updateRoster({
                              rows: roster.rows.filter((_, idx) => idx !== rIdx)
                            })
                        },
                        "Hapus"
                      )
                    )
                );
              })
            )
          )
        ),

        // Daily Shift Breakdown Inspector (Screen only)
        el(
          "div",
          { className: "roster-day no-roster-print" },
          el(
            "div",
            { style: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" } },
            el(
              "label",
              { style: { fontWeight: 700, fontSize: "13.5px" } },
              "Ringkasan Petugas Jaga Tanggal: ",
              el(
                "select",
                {
                  className: "roster-name-input",
                  style: { width: "auto", marginLeft: "6px" },
                  value: selectedDayInspect,
                  onChange: (e) => setSelectedDayInspect(Number(e.target.value))
                },
                Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  return el(
                    "option",
                    { key: d, value: d },
                    `${d} ${formatMonthYearReadable(month)} (${getDayNameId(month, d)})`
                  );
                })
              )
            ),
            el(
              "span",
              { style: { fontSize: "12px", color: "#52707c" } },
              `${roster.rows.length} pegawai terjadwal · ${dirty ? "Ada perubahan belum disimpan" : "Siap cetak"}`
            )
          ),
          el(
            "div",
            { className: "roster-cards" },
            Object.entries(SHIFT_LABELS).map(([code, label]) => {
              const assigned = roster.rows.filter(
                (r) => matchesCurrentUser(r) && r.shifts?.[selectedDayInspect] === code
              );
              return el(
                "article",
                { key: code, className: `shift-${code}` },
                el("span", { style: { fontWeight: 700, fontSize: "12.5px" } }, `${code} — ${label}`),
                el("strong", null, assigned.length),
                el("p", null, assigned.map(resolveName).join(", ") || "Tidak ada petugas")
              );
            })
          )
        ),

        // Official Printable Sheet (Visible on Print AND in Live Print Preview on Screen)
        el(
          "div",
          {
            className: `roster-print-preview-card ${showPrintPreview ? "" : "hidden print:block"}`
          },
          el(
            "div",
            {
              className: "no-roster-print",
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px dashed #cbdce2"
              }
            },
            el(
              "div",
              null,
              el(
                "strong",
                { style: { fontSize: "14px", color: "#0f3944", display: "block" } },
                "Pratinjau Dokumen Cetak Resmi (Format Lampiran UPTD Puskesmas Silian)"
              ),
              el(
                "span",
                { style: { fontSize: "12px", color: "#587480" } },
                "Tampilan di bawah ini sesuai format resmi lampiran dan dapat langsung diunduh ke PDF (.pdf), Excel (.xlsx), atau dicetak langsung."
              )
            ),
            el(
              "div",
              { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
              el(
                "button",
                {
                  type: "button",
                  className: "roster-btn accent",
                  disabled: Boolean(exportingType),
                  onClick: handleDownloadPdf
                },
                el(PrinterIcon, { size: 15 }),
                exportingType === "pdf" ? "Menyiapkan PDF..." : "Unduh PDF (.pdf)"
              ),
              el(
                "button",
                {
                  type: "button",
                  className: "roster-btn",
                  style: { background: "#107c41", color: "#ffffff", borderColor: "#0c5e31" },
                  disabled: Boolean(exportingType),
                  onClick: handleDownloadExcel
                },
                exportingType === "excel" ? "Menyiapkan Excel..." : "Unduh Excel (.xlsx)"
              ),
              el(
                "button",
                {
                  type: "button",
                  className: "roster-btn",
                  onClick: () => window.print()
                },
                el(PrinterIcon, { size: 15 }),
                "Cetak Dokumen Ini"
              )
            )
          ),
          el(OfficialPrintSchedule, {
            roster: visibleRoster || roster,
            monthStr: month,
            team,
            resolveName
          })
        )
      )
  );
}

export { JadwalPelayananPage as default };