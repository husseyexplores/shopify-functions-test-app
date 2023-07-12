// @ts-check
import { z } from 'zod'

// regex to test this string "2023-07"
// const API_REGEX = /^\d{4}-\d{2}$/

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default('<unknown>'),

    SHOPIFY_API_KEY: z.string(),
    SHOPIFY_API_SECRET: z.string(),
    SCOPES: z.string().optional().nullable(),
    PORT: z.coerce.number().default(3000),
    HOST: z
      .string()
      .url()
      .transform(x => {
        // no trailing slash
        return x.endsWith('/') ? x.slice(0, -1) : x
      })
      .optional(),

    // GOOGLE_CLIENT_ID: z.string(),
    // GOOGLE_CLIENT_SECRET: z.string(),
    // GOOGLE_OAUTH_REDIRECT_URI: z.string(),

    ENCRYPTION_SALT: z.string().min(8),
    FBASE_SERVICE_ACCOUNT: z.string().transform(v => {
      return JSON.parse(v, (k, v) => {
        if (k === 'private_key') {
          return v.replace(/\\n/gm, '\n')
        }
        return v
      })
    }),
  })
  .transform(x => {
    const HOST = x.HOST ?? `http://localhost:${x.PORT}`

    // const GOOGLE_OAUTH_REDIRECT_URI = withLeadingSlash(
    //   x.GOOGLE_OAUTH_REDIRECT_URI ?? `/api/exoauth/google`,
    // )

    return {
      ...x,
      HOST,
      // GOOGLE_OAUTH_REDIRECT_URI: {
      //   pathname: GOOGLE_OAUTH_REDIRECT_URI,
      //   fullUri: `${HOST}${GOOGLE_OAUTH_REDIRECT_URI}`,
      // },
    }
  })

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,

  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES,
  PORT: process.env.BACKEND_PORT || process.env.PORT,
  HOST: process.env.HOST ?? 'http://localhost:3000',

  // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  // GOOGLE_OAUTH_REDIRECT_URI: '/api/exoauth/google',

  ENCRYPTION_SALT: process.env.ENCRYPTION_SALT,
  FBASE_SERVICE_ACCOUNT: process.env.FBASE_SERVICE_ACCOUNT,
})

/**
 *
 * @param {string} input
 * @returns {string}
 */
function withLeadingSlash(input) {
  return input.startsWith('/') ? input : `/${input}`
}
