import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// To store auth and data base info,
// edit firebaseConfig based on your own firebase account's apiKey, etc.

// This is SC2006 SCSB Team 5's firebase account config
const firebaseConfig = {
  apiKey: "AIzaSyAa1VOJnjUT0-VjRUgggWw5UUFw5En3nPg",
  authDomain: "pathfinder-1b4fe.firebaseapp.com",
  projectId: "pathfinder-1b4fe",
  storageBucket: "pathfinder-1b4fe.appspot.com",
  messagingSenderId: "404163187122",
  appId: "1:404163187122:web:f04d82c01c8499af7c94ab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db};
