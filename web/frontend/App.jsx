import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { NavigationMenu } from '@shopify/app-bridge-react'

import { routes as pageRoutes } from './router'
import {
  AppBridgeProvider,
  DefaultErrorBoundary,
  PolarisProvider,
  QueryProvider,
} from './components'

const router = createBrowserRouter([
  {
    element: (

      <AppBridgeProvider>
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
      </AppBridgeProvider>
    ),
    children: pageRoutes,
    ErrorBoundary: DefaultErrorBoundary,
  },
])

window.pageRoutes = pageRoutes

export default function App() {
  return (
    <PolarisProvider>
      <RouterProvider router={router} />
    </PolarisProvider>
  )
}
