//@ts-check
import GDPRWebhookHandlers from './gdpr.js'

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  ...GDPRWebhookHandlers,
}
