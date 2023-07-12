//@ts-check
import { ZodError } from 'zod'
import { atobJsonParse } from './index.js'
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('express').Handler} ExpressHandler */

/**
 * `state` is passed from the frontend encoded as `bta(JSON.stringiify({ shop: '', host: '', ... }))`
 *  It consists of all the base params which are set by shopify on the first load
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function decodeStateMiddleware(req, res, next) {
  /** @type {import('~/types.js').ShopifyState} */
  const shopify_state = atobJsonParse(req.query.state)

  if (typeof shopify_state.timestamp === 'string') {
    shopify_state.timestamp = parseInt(shopify_state.timestamp, 10)
  }

  res.locals.shopify_state = shopify_state
  next()
}

/**
 *
 * @param {unknown} error
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export function errorHandler(error, _req, res, _next) {
  let msg = null
  if (error instanceof Error) {
    console.error(error.stack)
    msg = error.message
  }
  res.status(500).json({
    ok: false,
    status: 500,
    message: 'Internal server error',
    error: msg || null,
    issues: error instanceof ZodError ? error.issues : undefined,
  })
}
