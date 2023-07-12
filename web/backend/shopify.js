// @ts-check
import {
  BillingInterval,
  LATEST_API_VERSION,
  ApiVersion,
} from '@shopify/shopify-api'
import { shopifyApp } from '@shopify/shopify-app-express'
import { restResources } from '@shopify/shopify-api/rest/admin/2023-04'
import { FirestoreSessionStorage } from '@husseyexplores/shopify-app-session-storage-firestore'
import { firestore } from './db/firebase-admin.js'

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  'My Shopify One-Time Charge': {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: 'USD',
    interval: BillingInterval.OneTime,
  },
}

const shopify = shopifyApp({
  exitIframePath: '/exit-iframe',
  api: {
    apiVersion: ApiVersion.Unstable,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  // This should be replaced with your preferred storage strategy
  // sessionStorage: new SQLiteSessionStorage(DB_PATH),
  sessionStorage: new FirestoreSessionStorage({ firestore }),
})

export default shopify
