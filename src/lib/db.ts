import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { Component, Release } from './types'

const toDate = (val: unknown): Date =>
  val instanceof Timestamp ? val.toDate() : (val as Date)

const mapComponent = (id: string, data: Record<string, unknown>): Component => ({
  id,
  name: data.name as string,
  gitlabProjectId: data.gitlabProjectId as number | undefined,
  gitlabProjectName: data.gitlabProjectName as string | undefined,
  gitlabProjectPath: data.gitlabProjectPath as string | undefined,
  lastTicketProd: data.lastTicketProd as string | undefined,
  comments: data.comments as string | undefined,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
})

// Components
export const getComponents = async (): Promise<Component[]> => {
  const snap = await getDocs(query(collection(db, 'components'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => mapComponent(d.id, d.data() as Record<string, unknown>))
}

export const componentExists = async (name: string): Promise<boolean> => {
  const snap = await getDocs(query(collection(db, 'components'), where('name', '==', name)))
  return !snap.empty
}

export const addComponent = async (
  data: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, 'components'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export const updateComponent = async (id: string, data: Partial<Component>): Promise<void> => {
  await updateDoc(doc(db, 'components', id), {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export const deleteComponent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'components', id))
  // Borrar releases huérfanas del componente
  const snap = await getDocs(query(collection(db, 'releases'), where('componentId', '==', id)))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

// Releases
export const getReleases = async (): Promise<Release[]> => {
  const snap = await getDocs(query(collection(db, 'releases'), orderBy('deployedAt', 'desc')))
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      id: d.id,
      componentId: data.componentId as string,
      componentName: data.componentName as string,
      ticket: data.ticket as string,
      deployedAt: toDate(data.deployedAt),
    }
  })
}

export const addRelease = async (data: Omit<Release, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'releases'), {
    ...data,
    deployedAt: Timestamp.now(),
  })
}
