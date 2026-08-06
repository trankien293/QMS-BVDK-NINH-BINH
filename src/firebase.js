import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaRIpOe1wIgGSe_Wd-8uFbNBifBnU0xfw",
  authDomain: "qms-bvdk-ninh.firebaseapp.com",
  projectId: "qms-bvdk-ninh",
  storageBucket: "qms-bvdk-ninh.firebasestorage.app",
  messagingSenderId: "760698304672",
  appId: "1:760698304672:web:4cc6dfa5c7b7ae966ff1c5"
};

export const getStoredFirebaseConfig = () => {
  try {
    const stored = localStorage.getItem('FIREBASE_CONFIG_5S');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Lỗi đọc Firebase Config từ localStorage:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfigToStorage = (configObj) => {
  if (!configObj) {
    localStorage.removeItem('FIREBASE_CONFIG_5S');
  } else {
    localStorage.setItem('FIREBASE_CONFIG_5S', JSON.stringify(configObj));
  }
};

let appInstance = null;
let dbInstance = null;

export const initFirebase = (config) => {
  if (!config || !config.apiKey || !config.projectId) {
    dbInstance = null;
    appInstance = null;
    return null;
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      // Re-init if needed
      deleteApp(apps[0]);
    }
    appInstance = initializeApp(config);
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.error("Lỗi khởi tạo Firebase App:", err);
    dbInstance = null;
    appInstance = null;
    return null;
  }
};

// Khởi tạo ban đầu nếu có config
const initialConfig = getStoredFirebaseConfig();
if (initialConfig) {
  initFirebase(initialConfig);
}

export const getDb = () => dbInstance;

/**
 * Lắng nghe dữ liệu đánh giá 5S thời gian thực (Real-time listener)
 */
export const subscribeEvaluations = (onDataChange, onError) => {
  const db = getDb();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'evaluations_5s');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const dataList = [];
      snapshot.forEach((docSnap) => {
        dataList.push({ id: docSnap.id, ...docSnap.data() });
      });
      onDataChange(dataList);
    }, (err) => {
      console.error("Lỗi Firebase Real-time Subscription:", err);
      if (onError) onError(err);
    });
  } catch (err) {
    console.error("Không thể đăng ký listener Firebase:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Lưu hoặc cập nhật kết quả đánh giá lên Cloud Firestore
 */
export const saveEvaluationToFirestore = async (evalData) => {
  const db = getDb();
  if (!db) {
    throw new Error("Chưa kết nối Firebase Cloud. Vui lòng mở Cài đặt API để nhập Firebase Config!");
  }

  const docId = evalData.id || `eval-${Date.now()}`;
  const docRef = doc(db, 'evaluations_5s', docId);
  
  const payload = {
    ...evalData,
    id: docId,
    createdAt: evalData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return docId;
};

/**
 * Xóa đánh giá khỏi Firestore
 */
export const deleteEvaluationFromFirestore = async (docId) => {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, 'evaluations_5s', docId);
  await deleteDoc(docRef);
};
