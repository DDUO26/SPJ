import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

// Membuat map khusus bernama "desa" di lemari Firebase
const desaCollection = collection(db, 'desa');

export const tambahDesaDb = async (dataBaru) => {
  try {
    const dokumenBaru = await addDoc(desaCollection, dataBaru);
    return { id: dokumenBaru.id, ...dataBaru };
  } catch (error) {
    console.error("Gagal menyimpan desa:", error);
    throw error;
  }
};

export const ambilSemuaDesaDb = async () => {
  try {
    const hasil = await getDocs(desaCollection);
    const daftarDesa = hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
    return daftarDesa;
  } catch (error) {
    console.error("Gagal mengambil data desa:", error);
    throw error;
  }
};

export const updateDesaDb = async (idDesa, dataUpdate) => {
  try {
    const referensiDokumen = doc(db, 'desa', idDesa);
    await updateDoc(referensiDokumen, dataUpdate);
    return true;
  } catch (error) {
    console.error("Gagal mengubah desa:", error);
    throw error;
  }
};

export const hapusDesaDb = async (idDesa) => {
  try {
    const referensiDokumen = doc(db, 'desa', idDesa);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus desa:", error);
    throw error;
  }
};