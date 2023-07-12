//@ts-check
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { env } from '../env.js'

/** @type {import('firebase-admin/app').App')} */
const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(env.FBASE_SERVICE_ACCOUNT),
      })

if (!app) {
  throw new Error('No firebase app initialized')
}

export const firestore = getFirestore(app)
export const COLLECTION = /** @type {const} */ {
  sessions: 'sessions',
  shops: 'shops',
}

/** Firestore batched operation helpers */

/**
 * @usage batchWrapper(await firestore.collection('users').get(), 'delete')
 * @usage batchWrapper(await firestore.collection('users').get(), 'update', doc => ({ ...doc.data(), age: doc.data().age + 1 }))
 *
 *
 * @type {import('../types').FirestoreBatchedHelper}
 */
// @ts-ignore
export const batchWrapper = async function batchWrapper(
  documentsSnapshot,
  action,
  update,
) {
  /** @type {FirebaseFirestore.WriteBatch[]} */
  const writeBatches = [
    // initialize with firest batch
    firestore.batch(),
  ]

  let operationCounter = 0
  let batchIndex = 0

  documentsSnapshot.forEach(doc => {
    if (action === 'delete') {
      writeBatches[batchIndex].delete(doc.ref)
    } else if (action === 'update') {
      const updatedValue = typeof update === 'function' ? update(doc) : update
      writeBatches[batchIndex].update(doc.ref, updatedValue)
    } else if (action === 'set') {
      const updatedValue = typeof update === 'function' ? update(doc) : update
      writeBatches[batchIndex].set(doc.ref, updatedValue)
    }

    operationCounter++

    /** https://cloud.google.com/firestore/quotas#writes_and_transactions */
    // Max batch size is 500
    if (operationCounter === 499) {
      writeBatches.push(firestore.batch())
      batchIndex++
      operationCounter = 0
    }
  })

  // commit all batches
  await Promise.all(writeBatches.map(batch => batch.commit()))

  return true
}
