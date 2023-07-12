import { useEffect, useState } from 'react'
import { LegacyCard as Card, VerticalStack, Text } from '@shopify/polaris'
import { Toast } from '@shopify/app-bridge-react'
import { useAppQuery, useAuthenticatedFetch } from '../hooks'

export function ProductsCard() {
  const emptyToastProps = { content: null }
  const [isLoading, setIsLoading] = useState(true)
  const [toastProps, setToastProps] = useState(emptyToastProps)
  const fetch = useAuthenticatedFetch()
  const productsCount = 5

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery('/api/products/count', {
    onSuccess: () => {
      setIsLoading(false)
    },
  })

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  )

  const handlePopulate = async () => {
    setIsLoading(true)
    const response = await fetch('/api/products/create')

    if (response.ok) {
      await refetchProductCount()
      setToastProps({
        content: `${productsCount} products created!}`,
      })
    } else {
      setIsLoading(false)
      setToastProps({
        content: 'There was an error creating products',
        error: true,
      })
    }
  }

  const [testingProxy, setTestingProxy] = useState(false)
  const proxyTest = useAppQuery('/shopify-proxy/products/count.json', {
    enabled: testingProxy,
    onSettled: data => {
      console.log('Proxy settled', data)
      setTestingProxy(false)
    },
  })

  return (
    <>
      {toastMarkup}
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: `Populate ${productsCount} products`,
          onAction: handlePopulate,
          loading: isLoading,
        }}
        secondaryFooterActions={[
          {
            content: 'Shopify proxy test',
            onAction: () => {
              setTestingProxy(true)
            },
            loading: proxyTest.fetchStatus === 'fetching',
            disabled: proxyTest.fetchStatus === 'fetching',
          },
        ]}
      >
        <VerticalStack gap="4">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>

          <Text as="h4" variant="headingMd">
            TOTAL PRODUCTS
          </Text>

          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {isLoadingCount ? '-' : data.count}
          </Text>
        </VerticalStack>
      </Card>
    </>
  )
}
