/**
 * @typedef {import('./types').Pages} Pages
 * @typedef {import('./types').IRoute} IRoute
 * @typedef {import('./types').RouteObject} RouteObject
 * @typedef {import('./types').LoaderFunction} LoaderFunction
 * @typedef {import('./types').ActionFunction} ActionFunction
 *
 */

/** @type {Pages} */
const pages = import.meta.glob('./pages/**/*.(tsx|jsx)', { eager: true })

/** @type {IRoute} */
const routeItems = []

for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.(tsx|jsx)$/)?.[1]
  if (!fileName) {
    continue
  }

  const normalizedPathName = fileName.startsWith('$')
    ? fileName.replace('$', ':')
    : fileName.replace(/\/index/, '')

  /** @type {LoaderFunction | undefined} */
  const loader = pages[path]?.loader

  /** @type {ActionFunction | undefined} */
  const action = pages[path]?.action

  routeItems.push({
    path: fileName === 'index' ? '/' : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader,
    action,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  })
}

/** @type {RouteObject[]}} */
export const routes = routeItems.map(
  ({ Element, ErrorBoundary, ...rest }) => ({
    ...rest,
    element: Element ? <Element /> : undefined,
    errorElement: ErrorBoundary ? <ErrorBoundary /> : undefined,
  }),
)
