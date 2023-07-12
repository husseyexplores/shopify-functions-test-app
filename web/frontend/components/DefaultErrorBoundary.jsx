import {
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  useRouteError,
} from 'react-router-dom'
import { Banner, Layout, Page, Text } from '@shopify/polaris'

export function DefaultErrorBoundary() {
  const navigate = useNavigate()
  const location = useLocation()

  let displayMsg = 'An unexpected error occured.'

  /** @type {Error | undefined} */
  const error = useRouteError()

  console.error('Error in default error boundary.', error)

  let title = 'Oops! Something went wrong.'

  /** @type {string | undefined | null} */
  const errorMsg = error?.message

  /** @type {string | undefined} */
  let json

  if (isRouteErrorResponse(error)) {
    json = JSON.stringify(error, null, 2)
    title += ` (${error.status})`
    errorMsg = undefined

    if (error.status === 404) {
      displayMsg = 'Oops! The page you are looking for could not be found.'
    } else if (error.status === 500) {
      displayMsg = 'Oops! Something went wrong.'
    }
  }

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: '100px' }}>
            <Banner
              action={{
                content: 'Back to home',
                onAction() {
                  navigate(`/${location.search}`)
                },
              }}
              title={title}
              status="critical"
            >
              <Text as="p" variant="bodyMd">
                {displayMsg}
              </Text>

              {errorMsg && typeof errorMsg === 'string' && (
                <Text as="p" variant="bodySm" color="critical">
                  {errorMsg}
                </Text>
              )}

              {json && <pre>{json}</pre>}
            </Banner>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
