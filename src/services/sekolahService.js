import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

// Membuat map khusus bernama "sekolah" di lemari Firebase
const sekolahCollection = collection(db, 'sekolah');

export const tambahSekolahDb = async (dataBaru) => {
  try {
    const dokumenBaru = await addDoc(sekolahCollection, dataBaru);
    return { id: dokumenBaru.id, ...dataBaru };
  } catch (error) {
    console.error("Gagal menyimpan sekolah:", error);
    throw error;
  }
};

export const ambilSemuaSekolahDb = async () => {
  try {
    const hasil = await getDocs(sekolahCollection);
    const daftarSekolah = hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
    return daftarSekolah;
  } catch (error) {
    console.error("Gagal mengambil data sekolah:", error);
    throw error;
  }
};

export const updateSekolahDb = async (idSekolah, dataUpdate) => {
  try {
    const referensiDokumen = doc(db, 'sekolah', idSekolah);
    await updateDoc(referensiDokumen, dataUpdate);
    return true;
  } catch (error) {
    console.error("Gagal mengubah sekolah:", error);
    throw error;
  }
};

export const hapusSekolahDb = async (idSekolah) => {
  try {
    const referensiDokumen = doc(db, 'sekolah', idSekolah);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus sekolah:", error);
    throw error;
  }
};
