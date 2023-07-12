// @ts-check
import { z } from 'zod'
import { firestore, COLLECTION } from './firebase-admin.js'
import { to, schemaMatches } from '../utils/index.js'

const Model = z
  .object({
    shop: z.string(),
    active: z.boolean(),
    googleAuthInfo: z.any(),
  })
  .passthrough()

/**
 * @typedef {z.infer<typeof Model>} Model
 */

export const ActiveStoreModel = Model

/**
 * @param {string} shop
 * @param {boolean} [ensureActive=false]
 * @returns {Promise<(Model) | null>}
 */
export async function findByShop(shop, ensureActive = false) {
  if (typeof shop !== 'string') return null

  const [doc, error] = await to(
    firestore.collection(COLLECTION.shops).doc(shop).get(),
  )
  if (!doc) return null

  const stored = doc.data()
  if (schemaMatches(Model, stored)) {
    if (!ensureActive) {
      return stored
    }

    return stored.active ? stored : null
  } else {
    await to(deleteShop(shop))
    return null
  }
}

/**
 *
 * @param {string} shop
 * @returns {Promise<boolean>}
 */
export async function deleteShop(shop) {
  if (!shop) return

  const [, error] = await to(
    firestore.collection(COLLECTION.shops).doc(shop).delete(),
  )

  return !error
}

/**
 *
 * @param {string} shop
 * @param {boolean} isActive
 * @returns {Promise<boolean>}
 */
export async function setActive(shop, isActive) {
  return update(shop, { active: isActive })
}

/**
 *
 * @param {string} shop
 * @param {Partial<Model>} input
 * @param {FirebaseFirestore.SetOptions} [opts]
 * @returns {Promise<boolean>}
 */
export async function update(shop, input, opts) {
  if (!shop) return false
  if (!opts) opts = { merge: true }

  const [, error] = await to(
    firestore.collection(COLLECTION.shops).doc(shop).set(input, opts),
  )

  return !error
}
