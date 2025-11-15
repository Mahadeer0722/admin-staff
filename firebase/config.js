import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0xVO8R92ISGry8awfja-O1UUS7LfTWk4",
  authDomain: "staff-admin-1b3bc.firebaseapp.com",
  databaseURL: "https://staff-admin-1b3bc-default-rtdb.firebaseio.com",
  projectId: "staff-admin-1b3bc",
  storageBucket: "staff-admin-1b3bc.appspot.com",
  messagingSenderId: "151156798220",
  appId: "1:151156798220:web:7bf141536afdfadd1c8729"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);
