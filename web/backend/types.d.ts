export type { Session as ShopifySession } from '@shopify/shopify-api'

export type GoogleOAuthTokens = {
  id_token: string
  access_token: string
  refresh_token: string
  token_type: string // 'Bearer' | string
  scope: string
  expires_in: number
}

export type GoogleUser = {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

export type ShopifyState = {
  embedded: string //"1",
  shop: string // "husseyexploresdev.myshopify.com",
  host: string // "aHVzc2V5ZXhwbG9yZXNkZXYubXlzaG9waWZ5LmNvbS9hZG1pbg",
  hmac: string // "f597013e855cab11a02dba86c7e4c614562d07598ebf04daf543d320fbf22ffb",
  locale: string // "en-US",
  session: string // "f4ffe9c25b60387dfd827504ce0d60fa34a74a40512ceb388eafcda0dc459159",
  timestamp: number // "1686135390"
}

export async function FirestoreBatchedHelper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'delete',
): Promise<true>

export async function FirestoreBatchedHelper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'update' | 'set',
  update:
    | Record<string, any>
    | ((
        doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      ) => Record<string, any>),
): Promise<true>

export async function FirestoreBatchedHelper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: string,
  update?: any,
): Promise<true>
