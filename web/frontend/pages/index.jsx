//@ts-check
import React from 'react'
import {
  LegacyCard,
  Page,
  Layout,
  Image,
  LegacyStack as Stack,
  VerticalStack,
  Link,
  Text,
  Button,
} from '@shopify/polaris'
import { TitleBar, useNavigate } from '@shopify/app-bridge-react'
import { ProductsCard } from '../components'
import { useAuthenticatedFetch } from '../hooks'

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="Discounts (Custom App)" primaryAction={undefined} />
      <Layout>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
