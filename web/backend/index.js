// @ts-check
import { env } from './env.js'

import { join } from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import serveStatic from 'serve-static'

import { errorHandler, decodeStateMiddleware } from './utils/middlewares.js'
import shopify from './shopify.js'
import productCreator from './product-creator.js'
import webhookHandlers from './webhooks/index.js'
import * as db from './db/index.js'
import { createShopifyApiProxy } from './proxy-handler.js'
import discountApiRoutes from './api/discounts.js'

const STATIC_PATH =
  env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`

const app = express()

app.get('/api/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    env,
  })
})

/**
 * Accepts a `to` query param
 * `to` - can be any url or a constant "google"
 */
app.get('/api/redirect', decodeStateMiddleware, (req, res) => {
  const { to } = req.query
  const { shop } = res.locals.shopify_state

  try {
    console.log('Redirect handler ->', { to, shop })

    if (!to || typeof to !== 'string') throw new Error('Missing "to" parameter')
    if (!shop || typeof shop !== 'string')
      throw new Error('Missing "shop" parameter')

    const url = new URL(to)
    res.redirect(url.toString())
  } catch (e) {
    return res.status(400).json({
      ok: false,
      error: e.message,
      invalid_params: {
        to,
      },
    })
  }
})

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
)
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers }),
)

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// `shopify.validateAuthenticatedSession` provides session as
// `const session = res.locals.shopify.session;`
app.use(
  '/shopify-proxy/*',
  shopify.validateAuthenticatedSession(),
  createShopifyApiProxy({
    proxyPath: '/shopify-proxy',
    version: shopify.api.config.apiVersion,
  }),
)

app.use('/api/*', shopify.validateAuthenticatedSession())

app.use(express.json())

// discounts
app.use('/api/discounts', discountApiRoutes)

// Proxy endpoint for REST requests
app.get('/api/products/count', async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  })
  res.status(200).send(countData)
})

app.get('/api/products/create', async (_req, res) => {
  let status = 200
  let error = null

  try {
    await productCreator(res.locals.shopify.session)
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`)
    status = 500
    error = e.message
  }
  res.status(status).send({ success: status === 200, error })
})

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  const { shop } = _req.query
  if (!shop || typeof shop !== 'string') throw new Error('Missing "shop" param')

  // @TODO: Set active=false when app is uninstalled
  await db.shops.setActive(shop, true)

  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')))
})

app.use(errorHandler)

app.listen(env.PORT)
