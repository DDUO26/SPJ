import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const spjCollection = collection(db, 'spj');
const catatanPegawaiCollection = collection(db, 'catatanPegawai');

// ==========================================
// CRUD SPJ
// ==========================================

export const simpanSpjDb = async (dataSpj) => {
  try {
    const dokumenBaru = await addDoc(spjCollection, {
      ...dataSpj,
      createdAt: new Date().toISOString()
    });
    return { id: dokumenBaru.id, ...dataSpj };
  } catch (error) {
    console.error("Gagal menyimpan SPJ:", error);
    throw error;
  }
};

export const ambilSemuaSpjDb = async () => {
  try {
    const hasil = await getDocs(spjCollection);
    return hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
  } catch (error) {
    console.error("Gagal mengambil data SPJ:", error);
    throw error;
  }
};

export const updateSpjDb = async (idSpj, dataUpdate) => {
  try {
    const referensiDokumen = doc(db, 'spj', idSpj);
    await updateDoc(referensiDokumen, dataUpdate);
    return true;
  } catch (error) {
    console.error("Gagal update SPJ:", error);
    throw error;
  }
};

export const hapusSpjDb = async (idSpj) => {
  try {
    const referensiDokumen = doc(db, 'spj', idSpj);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus SPJ:", error);
    throw error;
  }
};

export const hapusSemuaSpjPegawaiDb = async (pegawaiNama) => {
  try {
    const q = query(spjCollection, where('pegawaiNama', '==', pegawaiNama));
    const hasil = await getDocs(q);
    const batch = writeBatch(db);
    hasil.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Gagal menghapus semua SPJ pegawai:", error);
    throw error;
  }
};

// ==========================================
// CATATAN UMUM PER PEGAWAI
// ==========================================

export const simpanCatatanPegawaiDb = async (pegawaiNama, catatan) => {
  try {
    // Cek apakah sudah ada catatan untuk pegawai ini
    const q = query(catatanPegawaiCollection, where('pegawaiNama', '==', pegawaiNama));
    const hasil = await getDocs(q);
    
    if (hasil.docs.length > 0) {
      // Update existing
      const docRef = doc(db, 'catatanPegawai', hasil.docs[0].id);
      await updateDoc(docRef, { catatan, updatedAt: new Date().toISOString() });
    } else {
      // Create new
      await addDoc(catatanPegawaiCollection, {
        pegawaiNama,
        catatan,
        createdAt: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error("Gagal menyimpan catatan pegawai:", error);
    throw error;
  }
};

export const ambilSemuaCatatanPegawaiDb = async () => {
  try {
    const hasil = await getDocs(catatanPegawaiCollection);
    return hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
  } catch (error) {
    console.error("Gagal mengambil catatan pegawai:", error);
    throw error;
  }
};
