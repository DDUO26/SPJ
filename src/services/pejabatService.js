import { collection, doc, setDoc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const pejabatCollection = collection(db, 'pejabat');

// Mengambil semua mapping pejabat
export const ambilSemuaPejabatDb = async () => {
  try {
    const hasil = await getDocs(pejabatCollection);
    const daftarPejabat = hasil.docs.map(dokumen => ({
      id: dokumen.id, // ini adalah slug dari jabatannya (misal: 'kepala_puskesmas')
      ...dokumen.data()
    }));
    return daftarPejabat;
  } catch (error) {
    console.error("Gagal mengambil data pejabat:", error);
    throw error;
  }
};

// Menyimpan atau menugaskan pegawai ke suatu jabatan
// idJabatan akan menjadi ID dokumen, jadi unik per jabatan.
export const tugaskanPegawaiDb = async (idJabatan, idPegawai) => {
  try {
    const referensiDokumen = doc(db, 'pejabat', idJabatan);
    await setDoc(referensiDokumen, {
      idPegawai: idPegawai,
      diupdatePada: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Gagal menugaskan pegawai:", error);
    throw error;
  }
};

// Menghapus tugas/jabatan (mengosongkan slot)
export const kosongkanJabatanDb = async (idJabatan) => {
  try {
    const referensiDokumen = doc(db, 'pejabat', idJabatan);
    await deleteDoc(referensiDokumen);
    return true;
  } catch (error) {
    console.error("Gagal mengosongkan jabatan:", error);
    throw error;
  }
};
