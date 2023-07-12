// @ts-check
import { ZodError } from 'zod'

/**
 * Converts an ID to a Global ID (GID) for a given resource.
 *
 * @param {string} resource - The resource type.
 * @param {string | number} id - The ID to be converted.
 * @return {string} The Global ID (GID) for the given resource and ID.
 */
export function idToGid(resource, id) {
  return `gid://shopify/${resource}/${id}`
}

/**
 *
 * @param {unknown} encodedState
 */
export function atobJsonParse(encodedState) {
  if (typeof encodedState === 'string') {
    try {
      const decodedState = Buffer.from(encodedState, 'base64').toString('utf-8')
      const state = JSON.parse(decodedState)
      return state
    } catch (e) {
      throw new Error('Failed to parse `state` query param')
    }
  }

  throw new Error('`state` is missing from query params')
}

/** @typedef {import('zod').ZodSchema} ZodSchema */

/**
 * @template {ZodSchema} T
 * @param {T} schema
 * @param {unknown} input
 * @returns {input is T['_type']}
 */
export function schemaMatches(schema, input) {
  const result = schema.safeParse(input)
  if (result.success) return true
  return false
}

/**
 * @template {Promise<any>} T
 * @param {T} promise
 * @returns {Promise<[Awaited<T>, null] | [null, unknown]>}
 */
export async function to(promise) {
  try {
    let data = await promise

    /** @type {[Awaited<T>, null]} */
    const result = [data, null]
    return result
  } catch (error) {
    /** @type {[null, unknown]} */
    const result = [null, error]
    return result
  }
}
