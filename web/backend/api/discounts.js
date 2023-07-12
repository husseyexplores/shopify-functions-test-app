// @ts-check
import express from 'express'
import { GraphqlQueryError } from '@shopify/shopify-api'
import shopify from '../shopify.js'
import metafields from '../../frontend/metafields.js'
import { idToGid } from '../utils/index.js'

const router = express.Router()

const CREATE_CODE_MUTATION = `
mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
  discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
    userErrors {
      code
      message
      field
    }
  }
}
`

const CREATE_AUTOMATIC_MUTATION = `
mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
  discountCreate: discountAutomaticAppCreate(
    automaticAppDiscount: $discount
  ) {
    userErrors {
      code
      message
      field
    }
  }
}
`

const GET_DISCOUNT_QUERY = `
  query GetDiscount($id: ID!) {
    discountNode(id: $id) {
      id
      configurationField: metafield(
        namespace: "${metafields.volume_discount.namespace}"
        key: "${metafields.volume_discount.key}"
      ) {
        id
        value
      }
      discount {
        __typename
        ... on DiscountAutomaticApp {
          title
          discountClass
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
          startsAt
          endsAt
        }
        ... on DiscountCodeApp {
          title
          discountClass
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
          startsAt
          endsAt
          usageLimit
          appliesOncePerCustomer
          codes(first: 1) {
            nodes {
              code
            }
          }
        }
      }
    }
  }
`

const UPDATE_AUTOMATIC_MUTATION = `
  mutation UpdateDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
    discountUpdate: discountAutomaticAppUpdate(
      id: $id
      automaticAppDiscount: $discount
    ) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

const UPDATE_CODE_MUTATION = `
  mutation UpdateDiscount($id: ID!, $discount: DiscountCodeAppInput!) {
    discountUpdate: discountCodeAppUpdate(id: $id, codeAppDiscount: $discount) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

const DELETE_AUTOMATIC_MUTATION = `
  mutation DeleteDiscount($id: ID!) {
    discountDelete: discountAutomaticDelete(id: $id) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

const DELETE_CODE_MUTATION = `
  mutation DeleteDiscount($id: ID!) {
    discountDelete: discountCodeDelete(id: $id) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

const runDiscountMutation = async (req, res, mutation) => {
  const graphqlClient = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  })

  try {
    const data = await graphqlClient.query({
      data: {
        query: mutation,
        variables: req.body,
      },
    })

    res.send(data.body)
  } catch (error) {
    // Handle errors thrown by the graphql client
    if (!(error instanceof GraphqlQueryError)) {
      throw error
    }
    return res.status(500).send({ error: error.response })
  }
}

router.post('/code', async (req, res) => {
  await runDiscountMutation(req, res, CREATE_CODE_MUTATION)
})

router.post('/automatic', async (req, res) => {
  await runDiscountMutation(req, res, CREATE_AUTOMATIC_MUTATION)
})

router.get('/:discountId', async (req, res) => {
  req.body.id = idToGid('DiscountNode', req.params.discountId)

  await runDiscountMutation(req, res, GET_DISCOUNT_QUERY)
})

router.post('/automatic/:discountId', async (req, res) => {
  req.body.id = idToGid('DiscountAutomaticApp', req.params.discountId)

  await runDiscountMutation(req, res, UPDATE_AUTOMATIC_MUTATION)
})

router.post('/code/:discountId', async (req, res) => {
  req.body.id = idToGid('DiscountCodeApp', req.params.discountId)

  await runDiscountMutation(req, res, UPDATE_CODE_MUTATION)
})

router.delete('/automatic/:discountId', async (req, res) => {
  req.body.id = idToGid('DiscountAutomaticApp', req.params.discountId)

  await runDiscountMutation(req, res, DELETE_AUTOMATIC_MUTATION)
})

router.delete('/code/:discountId', async (req, res) => {
  req.body.id = idToGid('DiscountCodeApp', req.params.discountId)

  await runDiscountMutation(req, res, DELETE_CODE_MUTATION)
})

export default router
