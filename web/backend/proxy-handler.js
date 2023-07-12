// @ts-check
import proxy from 'express-http-proxy'

const DISALLOWED_URLS = [
  '/application_charges',
  '/application_credits',
  '/carrier_services',
  '/fulfillment_services',
  '/recurring_application_charges',
  '/script_tags',
  '/storefront_access_token',
  '/webhooks',
  '/oauth',
]

/** @typedef {import('express').Handler} ExpressHandler */

/**
 *
 * @param {object} options - Proxy Options
 * @param {string} options.version - Api Version
 * @param {string} [options.proxyPath] - Api Version
 * @returns {ExpressHandler}
 */
export function createShopifyApiProxy(options) {
  if (options.proxyPath == null) {
    options.proxyPath = '/shopify-proxy'
  }

  if (options.proxyPath) {
    if (options.proxyPath.endsWith('/*')) {
      options.proxyPath = options.proxyPath.slice(0, -2)
    } else if (options.proxyPath.endsWith('/')) {
      options.proxyPath = options.proxyPath.slice(0, -1)
    }
  }

  return async (req, res, next) => {
    const version = options.version
    const { shop, accessToken } = res.locals.shopify.session

    // turn `/shopify-proxy/products/count.json` into `/products/count.json`
    req.baseUrl = req.baseUrl.slice(options.proxyPath.length)
    req.originalUrl = req.baseUrl

    if (!validRequest(req.baseUrl)) {
      res.status(401).json({
        error: {
          message: 'Unauthorized. Route not allowed',
        },
      })
      return
    }

    // shop === 'handle.myshopify.com'
    if (!shop || !accessToken) {
      return res.status(401).json({
        error: {
          message:
            'Unauthorized. Access Token or Shop is missing from the session',
        },
      })
    }

    try {
      proxy(shop, {
        memoizeHost: false,
        https: true,
        parseReqBody: true,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
          proxyReqOpts.headers = {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          }
          return proxyReqOpts
        },
        proxyReqPathResolver(req) {
          const shopifyPathname = req.baseUrl.startsWith('/api')
            ? req.baseUrl
            : `/admin/api/${version}${req.baseUrl}`
          // console.log({ shopifyPathname })

          return shopifyPathname
        },
      })(req, res, next)
    } catch (error) {
      return next(error)
    }
  }
}
function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0]

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1
  })
}
