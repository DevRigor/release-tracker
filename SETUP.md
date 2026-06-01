# Release Tracker - Setup & Estructura del Proyecto

## 📂 Estructura de Carpetas

```
release-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── api/
│   │   │   ├── components/     # API routes para components
│   │   │   │   ├── route.ts    # GET/POST /api/components
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET/PUT/DELETE /api/components/[id]
│   │   │   ├── releases/       # API routes para releases
│   │   │   └── ...
│   │   └── ...
│   ├── components/             # Componentes React reutilizables
│   │   ├── ComponentsList.tsx
│   │   ├── ComponentForm.tsx
│   │   ├── ReleaseHistory.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── firebase.ts         # Inicialización Firebase
│   │   ├── db.ts               # Funciones Firestore
│   │   └── types.ts            # TypeScript types/interfaces
│   ├── hooks/                  # Custom hooks
│   └── styles/                 # Tailwind CSS (si necesario)
├── public/                     # Archivos estáticos
│   ├── favicon.ico
│   └── ...
├── docs/                       # Documentación
├── .env.local                  # Variables de entorno (Firebase keys)
├── .gitignore
├── next.config.ts              # Configuración Next.js
├── tailwind.config.ts          # Configuración Tailwind
├── tsconfig.json               # Configuración TypeScript
├── package.json
├── pnpm-lock.yaml              # Lock file de pnpm
├── PLAN.md                     # Plan de desarrollo
├── SETUP.md                    # Este archivo
└── README.md                   # Documentación del proyecto
```

---

## 🚀 Setup Inicial

### **1. Inicializar proyecto Next.js**

```bash
cd D:\dev\LATAM\release-tracker
pnpm create next-app@latest . --typescript --tailwind --app
```

**Respuestas recomendadas:**
- Use TypeScript? **Yes**
- Use ESLint? **Yes**
- Use Tailwind CSS? **Yes**
- Use `src/` directory? **Yes**
- Use App Router? **Yes**
- Import alias? **Yes** (default @/*)

### **2. Instalar dependencias Firebase**

```bash
pnpm add firebase
```

### **3. Configurar variables de entorno**

Crear `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ No commitear `.env.local` — agregar a `.gitignore`

### **4. Crear archivo Firebase**

**src/lib/firebase.ts:**
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### **5. Crear tipos TypeScript**

**src/lib/types.ts:**
```typescript
export interface Component {
  id: string;
  name: string;
  branch: string;
  ticket: string;
  devStatus: 'pending' | 'completed';
  masterStatus: 'pending' | 'in-qa' | 'completed';
  prodStatus: 'pending' | 'completed';
  lastTicketProd?: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Release {
  id: string;
  componentId: string;
  ticket: string;
  deployedAt: Date;
  deployedBy: string;
}
```

### **6. Crear funciones Firestore**

**src/lib/db.ts:**
```typescript
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Component, Release } from './types';

// Componentes
export const getComponents = async () => {
  const q = query(collection(db, 'components'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Component[];
};

export const addComponent = async (data: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>) => {
  return await addDoc(collection(db, 'components'), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateComponent = async (id: string, data: Partial<Component>) => {
  const ref = doc(db, 'components', id);
  return await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteComponent = async (id: string) => {
  return await deleteDoc(doc(db, 'components', id));
};

// Releases
export const getReleases = async () => {
  const q = query(collection(db, 'releases'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Release[];
};

export const addRelease = async (data: Omit<Release, 'id'>) => {
  return await addDoc(collection(db, 'releases'), data);
};
```

---

## 📦 Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔒 Firestore Security Rules

Crear en Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /components/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /releases/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ Checklist Pre-Desarrollo

- [ ] Crear proyecto Firebase (firebaseapp.com)
- [ ] Obtener credenciales Firebase
- [ ] Crear `.env.local` con variables
- [ ] Correr `pnpm create next-app`
- [ ] Instalar `firebase`
- [ ] Crear `src/lib/firebase.ts`
- [ ] Crear `src/lib/types.ts`
- [ ] Crear `src/lib/db.ts`
- [ ] Crear collections en Firestore
- [ ] Agregar security rules en Firebase
- [ ] Correr `pnpm dev` y verificar que todo funciona

---

## 🚀 Próximos pasos

1. Completar setup Firebase
2. Crear página principal (Dashboard)
3. Crear API routes
4. Crear componentes React
5. Agregar funcionalidad de CRUD
6. Deploy en Vercel

---

**Estado**: 📋 Ready for setup  
**Última actualización**: 2026-06-01
