import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAU44jmaACpO3LPaWMNZ-DiARrHsYsg-_Y",
  authDomain: "rental-9d45b.firebaseapp.com",
  projectId: "rental-9d45b",
  storageBucket: "rental-9d45b.appspot.com",
  messagingSenderId: "224600185584",
  appId: "1:224600185584:web:6e56d6530fd19efb7f0035"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
