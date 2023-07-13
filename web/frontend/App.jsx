import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { I18nContext, I18nManager } from '@shopify/react-i18n'
import { NavigationMenu } from '@shopify/app-bridge-react'

import { routes as pageRoutes } from './router'
import {
  AppBridgeProvider,
  DefaultErrorBoundary,
  PolarisProvider,
  QueryProvider,
} from './components'

const locale = 'en'
const i18nManager = new I18nManager({
  locale,
  onError(error) {
    console.log('i18nManager `onError`', error)
  },
})

const router = createBrowserRouter([
  {
    element: (
      <AppBridgeProvider>
        <I18nContext.Provider value={i18nManager}>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: 'Home',
                  destination: '/',
                },
              ]}
            />
            <Outlet />
          </QueryProvider>
        </I18nContext.Provider>
      </AppBridgeProvider>
    ),
    children: pageRoutes,
    ErrorBoundary: DefaultErrorBoundary,
  },
])

// @ts-ignore
window.pageRoutes = pageRoutes

export default function App() {
  return (
    <PolarisProvider>
      <RouterProvider router={router} />
    </PolarisProvider>
  )
}
