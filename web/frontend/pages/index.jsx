//@ts-check
import { Page, Layout } from '@shopify/polaris'
import { TitleBar, useNavigate } from '@shopify/app-bridge-react'
import { ProductsCard } from '../components'
// import { useAuthenticatedFetch } from '../hooks'

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
