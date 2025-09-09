import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!admin.apps.length) {
    if(process.env.NODE_ENV === 'production') {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID, });
    } else {
        const serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env,
        });
    }
}

export const db = getFirestore();
export const auth = getAuth();
export {admin}


export const COLLECTIONS = {
    USERS: 'users',
    ESCALAS: 'escalas',
    PARISHES: 'parishes',
} as const