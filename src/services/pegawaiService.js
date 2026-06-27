import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const pegawaiCollection = collection(db, 'pegawai');

export const tambahPegawaiDb = async (dataBaru) => {
  try {
    const dokumenBaru = await addDoc(pegawaiCollection, dataBaru);
    return { id: dokumenBaru.id, ...dataBaru };
  } catch (error) {
    console.error("Gagal menyimpan pegawai:", error);
    throw error;
  }
};

export const ambilSemuaPegawaiDb = async () => {
  try {
    const hasil = await getDocs(pegawaiCollection);
    const daftarPegawai = hasil.docs.map(dokumen => ({
      id: dokumen.id,
      ...dokumen.data()
    }));
    return daftarPegawai;
  } catch (error) {
    console.error("Gagal mengambil data pegawai:", error);
    throw error;
  }
};

export const updatePegawaiDb = async (idPegawai, dataUpdate) => {
  try {
    const referensiDokumen = doc(db, 'pegawai', idPegawai);
    await updateDoc(referensiDokumen, dataUpdate);
    return true;
  } catch (error) {
    console.error("Gagal mengubah pegawai:", error);
    throw error;
  }
};

export const hapusPegawaiDb = async (idPegawai) => {
  try {
    const referensiDokumen = doc(db, 'pegawai', idPegawai);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal menghapus pegawai:", error);
    throw error;
  }
};