/**
 * @typedef {import('./types').Pages} Pages
 * @typedef {import('./types').IRoute} IRoute
 * @typedef {import('./types').RouteObject} RouteObject
 * @typedef {import('./types').LoaderFunction} LoaderFunction
 * @typedef {import('./types').ActionFunction} ActionFunction
 *
 */

/**
 * @param {string} segment
 * @param {boolean} [fixIndex=false]
 * @returns {string}
 */
function segmentToRoutePathSegment(segment, fixIndex = false) {
  // remix-style dyamic path
  if (segment.startsWith('$')) {
    return segment.replace('$', ':')
  }

  // nextjs-style dyamic path
  if (segment.startsWith('[') && segment.endsWith(']')) {
    const name = segment.slice(1, -1)?.trim()
    if (segment.length <= 2 || name.length === 0) return null

    return `:${name}`
  }

  if (!fixIndex) return segment

  const lowercased = segment.toLowerCase()
  return lowercased === 'index' ? '' : segment
}

/**
 *
 * @param {string} fullFilepath
 * @returns {string}
 */
function filenameToRoutePath(fullFilepath) {
  const segments = fullFilepath.split('/')
  return segments
    .map((segment, index) => {
      const isLast = index === segments.length - 1
      const path = segmentToRoutePathSegment(segment, isLast)
      if (path == null)
        throw new Error(`Dynamic filename must not be empty: ${fullFilepath}`)
      return path
    })
    .join('/')
}

/** @type {Pages} */
// @ts-ignore
const pages = import.meta.glob('./pages/**/*.(tsx|jsx)', { eager: true })

/** @type {IRoute[]} */
const routeItems = []

for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.(tsx|jsx)$/)?.[1]
  if (!fileName) {
    continue
  }

  const routePath = filenameToRoutePath(fileName)

  /** @type {LoaderFunction | undefined} */
  const loader = pages[path]?.loader

  /** @type {ActionFunction | undefined} */
  const action = pages[path]?.action

  routeItems.push({
    path: fileName === 'index' ? '/' : `/${routePath}`,
    Element: pages[path].default,
    loader,
    action,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  })
}

/** @type {RouteObject[]}} */
export const routes = routeItems.map(({ Element, ErrorBoundary, ...rest }) => ({
  ...rest,
  element: Element ? <Element /> : undefined,
  errorElement: ErrorBoundary ? <ErrorBoundary /> : undefined,
}))
