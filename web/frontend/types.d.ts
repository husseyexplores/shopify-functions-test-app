import type {
  LoaderFunction,
  ActionFunction,
  RouteObject,
} from 'react-router-dom'

export type {
  LoaderFunction,
  ActionFunction,
  RouteObject,
} from 'react-router-dom'

export interface RouteCommon {
  loader?: LoaderFunction
  action?: ActionFunction
  ErrorBoundary?: React.ComponentType<any>
}

export interface IRoute extends RouteCommon {
  path: string
  Element: React.ComponentType<any>
}

export interface Pages {
  [key: string]: {
    default: React.ComponentType<any>
  } & RouteCommon
}

declare global {
  var _APP_CONSTS = {
    url: URL,
    shopify_state: string,
  };
}