import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Provider } from '@shopify/app-bridge-react'
import { Banner, Layout, Page } from '@shopify/polaris'

window._APP_CONSTS = {
  url: new URL(window.location.href),
  // send as `state` query string to the backend like this:
  // `?state=${window._APP_CONSTS.shopify_state}`
  // and use `decodeStateMiddleware` in the request handler
  shopify_state: btoa(
    JSON.stringify(
      Object.fromEntries(new URLSearchParams(window.location.search).entries()),
    ),
  ),
}

// initial url query params looks like this: (saved into `shopify_state`)
/*
  {
    "embedded": "1",
    "shop": "husseyexploresdev.myshopify.com",
    "host": "aHVzc2V5ZXhwbG9yZXNkZXYubXlzaG9waWZ5LmNvbS9hZG1pbg",
    "hmac": "f597013e855cab11a02dba86c7e4c614562d07598ebf04daf543d320fbf22ffb",
    "locale": "en-US",
    "session": "f4ffe9c25b60387dfd827504ce0d60fa34a74a40512ceb388eafcda0dc459159",
    "timestamp": "1686135390"
  }
*/

/**
 *
 * @param {string} input Input string
 * @param {string} char Character to split the string at
 * @returns
 */
function splitAtFirstOccurence(input, char) {
  const index = input.indexOf(char)
  return [input.slice(0, index), input.slice(index + 1)]
}

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridgeProvider that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge Provider, which unlocks functionality provided by the host.
 *
 * See: https://shopify.dev/apps/tools/app-bridge/getting-started/using-react
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const history = useMemo(
    () => ({
      replace: path => {
        if (typeof path === 'string') {
          if (path.startsWith('http://') || path.startsWith('https://')) {
            throw new Error('Use HTML `a` element for external links')
          }
          // const [pathname, query] = splitAtFirstOccurence(path, '?')
          navigate(path, { replace: true })
        }
      },
    }),
    [navigate, location],
  )

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location],
  )

  // The host may be present initially, but later removed by navigation.
  // By caching this in state, we ensure that the host is never lost.
  // During the lifecycle of an app, these values should never be updated anyway.
  // Using state in this way is preferable to useMemo.
  // See: https://stackoverflow.com/questions/60482318/version-of-usememo-for-caching-a-value-that-will-never-change
  const [appBridgeConfig] = useState(() => {
    const host =
      new URLSearchParams(location.search).get('host') ||
      window.__SHOPIFY_DEV_HOST

    window.__SHOPIFY_DEV_HOST = host

    return {
      host,
      apiKey: process.env.SHOPIFY_API_KEY,
      forceRedirect: true,
    }
  })

  if (!process.env.SHOPIFY_API_KEY || !appBridgeConfig.host) {
    const bannerProps = !process.env.SHOPIFY_API_KEY
      ? {
          title: 'Missing Shopify API Key',
          children: (
            <>
              Your app is running without the SHOPIFY_API_KEY environment
              variable. Please ensure that it is set when running or building
              your React app.
            </>
          ),
        }
      : {
          title: 'Missing host query argument',
          children: (
            <>
              Your app can only load if the URL has a <b>host</b> argument.
              Please ensure that it is set, or access your app using the
              Partners Dashboard <b>Test your app</b> feature
            </>
          ),
        }

    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <div style={{ marginTop: '100px' }}>
              <Banner {...bannerProps} status="critical" />
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  )
}
