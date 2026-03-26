import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// La config de Firebase es pública por diseño; la seguridad real
// se gestiona mediante las Firestore Security Rules.
const firebaseConfig = {
  apiKey:            "AIzaSyCD8pl8PP5KaeDLKLdFs5d-xmYRCeGUP_4",
  authDomain:        "misterporra2026.firebaseapp.com",
  projectId:         "misterporra2026",
  storageBucket:     "misterporra2026.firebasestorage.app",
  messagingSenderId: "972956450910",
  appId:             "1:972956450910:web:26cf36dce90539f27274cf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
