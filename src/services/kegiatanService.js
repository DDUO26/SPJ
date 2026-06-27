import { collection, getDocs, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const kegiatanCollection = collection(db, 'kegiatan');

export const simpanBanyakKegiatanDb = async (daftarKegiatanBaru, daftarKegiatanUpdate = []) => {
  try {
    const batch = writeBatch(db);
    
    // Insert data baru
    if (daftarKegiatanBaru && daftarKegiatanBaru.length > 0) {
      daftarKegiatanBaru.forEach((kegiatan) => {
        const docRef = doc(kegiatanCollection);
        batch.set(docRef, kegiatan);
      });
    }

    // Update data yang sudah ada (overwrite manual edit)
    if (daftarKegiatanUpdate && daftarKegiatanUpdate.length > 0) {
      daftarKegiatanUpdate.forEach((kegiatan) => {
        const docRef = doc(db, 'kegiatan', kegiatan.id);
        const { id, ...dataUpdate } = kegiatan;
        batch.update(docRef, dataUpdate);
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Gagal mengupload/sync jadwal:", error);
    throw error;
  }
};

export const ambilSemuaKegiatanDb = async () => {
  try {
    const hasil = await getDocs(kegiatanCollection);
    return hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    throw error;
  }
};

// FUNGSI BARU: Untuk menyimpan hasil editan nama pegawai dll
export const updateKegiatanDb = async (idKegiatan, dataUpdate) => {
  try {
    const referensiDokumen = doc(db, 'kegiatan', idKegiatan);
    await updateDoc(referensiDokumen, dataUpdate);
    return true;
  } catch (error) {
    console.error("Gagal update kegiatan:", error);
    throw error;
  }
};

export const hapusKegiatanDb = async (idKegiatan) => {
  try {
    const referensiDokumen = doc(db, 'kegiatan', idKegiatan);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus kegiatan:", error);
    throw error;
  }
};