import { doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// PENGATURAN UMUM (Profil, Parameter, Dokumen)
// ==========================================
export const simpanPengaturanDb = async (kategori, data) => {
  try {
    const referensiDokumen = doc(db, 'pengaturan', kategori);
    await setDoc(referensiDokumen, {
      ...data,
      diupdatePada: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan pengaturan ${kategori}:`, error);
    throw error;
  }
};

export const ambilPengaturanDb = async (kategori) => {
  try {
    const referensiDokumen = doc(db, 'pengaturan', kategori);
    const hasil = await getDoc(referensiDokumen);
    if (hasil.exists()) {
      return hasil.data();
    }
    return null;
  } catch (error) {
    console.error(`Gagal mengambil pengaturan ${kategori}:`, error);
    throw error;
  }
};

// ==========================================
// PENGGUNA (Lokal)
// ==========================================
const penggunaCollection = collection(db, 'pengguna');

export const ambilSemuaPenggunaDb = async () => {
  try {
    const hasil = await getDocs(penggunaCollection);
    return hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);
    throw error;
  }
};

export const simpanPenggunaDb = async (pengguna) => {
  try {
    const id = pengguna.id || `user_${Date.now()}`;
    const referensiDokumen = doc(db, 'pengguna', id);
    await setDoc(referensiDokumen, {
      ...pengguna,
      diupdatePada: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Gagal menyimpan pengguna:", error);
    throw error;
  }
};

export const hapusPenggunaDb = async (idPengguna) => {
  try {
    const referensiDokumen = doc(db, 'pengguna', idPengguna);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus pengguna:", error);
    throw error;
  }
};

// ==========================================
// AUDIT LOG
// ==========================================
const auditCollection = collection(db, 'audit');

export const catatAuditDb = async (aksi, entitas, deskripsi) => {
  try {
    const id = `audit_${Date.now()}`;
    const referensiDokumen = doc(db, 'audit', id);
    await setDoc(referensiDokumen, {
      aksi,
      entitas,
      deskripsi,
      tanggal: new Date().toISOString(),
      user: 'Sistem' // Default for now
    });
  } catch (error) {
    console.error("Gagal mencatat audit:", error);
  }
};

export const ambilAuditDb = async () => {
  try {
    const hasil = await getDocs(auditCollection);
    const logs = hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
    // Sort descending by date
    return logs.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  } catch (error) {
    console.error("Gagal mengambil audit:", error);
    return [];
  }
};

// ==========================================
// BACKUP & RESTORE DATABASE
// ==========================================
const KOLEKSI_BACKUP = ['pegawai', 'desa', 'kegiatan', 'spj', 'pejabat', 'catatanPegawai', 'pengaturan', 'pengguna'];

export const backupSeluruhDataDb = async () => {
  try {
    const seluruhData = {};
    for (const namaKoleksi of KOLEKSI_BACKUP) {
      const colRef = collection(db, namaKoleksi);
      const hasil = await getDocs(colRef);
      seluruhData[namaKoleksi] = hasil.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    catatAuditDb('BACKUP', 'DATABASE', 'Melakukan pencadangan (backup) seluruh data sistem.');
    return seluruhData;
  } catch (error) {
    console.error("Gagal melakukan backup data:", error);
    throw error;
  }
};

export const restoreSeluruhDataDb = async (dataBackup) => {
  try {
    const batch = writeBatch(db);
    
    // We only restore collections that exist in the backup data
    for (const namaKoleksi of KOLEKSI_BACKUP) {
      if (dataBackup[namaKoleksi] && Array.isArray(dataBackup[namaKoleksi])) {
        // Warning: This does not delete existing data, it overwrites/merges docs with same IDs
        // and adds new ones. For a full restore that deletes old data, we would need to 
        // fetch and delete all existing docs first, which can be dangerous if the backup is incomplete.
        // For safety, we just merge.
        for (const item of dataBackup[namaKoleksi]) {
          if (item.id) {
            const docRef = doc(db, namaKoleksi, item.id);
            const { id, ...dataTanpaId } = item;
            batch.set(docRef, dataTanpaId, { merge: true });
          }
        }
      }
    }
    
    await batch.commit();
    catatAuditDb('RESTORE', 'DATABASE', 'Melakukan pemulihan (restore) data sistem dari berkas cadangan.');
    return true;
  } catch (error) {
    console.error("Gagal melakukan restore data:", error);
    throw error;
  }
};
