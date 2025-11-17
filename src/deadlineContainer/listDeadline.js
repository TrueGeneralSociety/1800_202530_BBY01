import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "./firebase.js"; // adjust path if needed
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
