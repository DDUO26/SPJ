import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDahzdP9gaepvv2px20Of4qvzyYbPvIk28",
  authDomain: "spjdinas-b3bdc.firebaseapp.com",
  projectId: "spjdinas-b3bdc",
  storageBucket: "spjdinas-b3bdc.firebasestorage.app",
  messagingSenderId: "674745162050",
  appId: "1:674745162050:web:f9debca3cd0794c6de10db",
  measurementId: "G-SG5HY2FNZ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);