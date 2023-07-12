import { useAuthenticatedFetch } from './useAuthenticatedFetch'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'

/**
 * A hook for querying your custom app data.
 * @desc A thin wrapper around useAuthenticatedFetch and react-query's useQuery.
 *
 * @param {string} url - The URL to query.
 * @param {import('@tanstack/react-query').UseQueryOptions & { fetchInit?: RequestInit }} options - The options for your query. Accepts 3 keys:
 *
 * 1. url: The URL to query. E.g: /api/widgets/1`
 * 2. fetchInit: The init options for fetch.  See: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 * 3. reactQueryOptions: The options for `useQuery`. See: https://react-query.tanstack.com/reference/useQuery
 *
 * @returns Return value of useQuery.  See: https://react-query.tanstack.com/reference/useQuery.
 */
export const useAppQuery = (url, { fetchInit, ...reactQueryOptions }) => {
  const authenticatedFetch = useAuthenticatedFetch()
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit)
      return response.json()
    }
  }, [url, JSON.stringify(fetchInit)])

  return useQuery({
    queryKey: [url],
    queryFn: fetch,
    retry: 0,
    ...reactQueryOptions,
    refetchOnWindowFocus: false,
  })
}

/**
 * @param {string} query - The URL to query.
 * @param {import('@tanstack/react-query').UseQueryOptions & { variables?: Record<string, any> }} options - The options for your query. Accepts 3 keys:
 *
 * 1. url: The URL to query. E.g: /api/widgets/1`
 * 2. fetchInit: The init options for fetch.  See: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 * 3. reactQueryOptions: The options for `useQuery`. See: https://react-query.tanstack.com/reference/useQuery
 *
 * @returns Return value of useQuery.  See: https://react-query.tanstack.com/reference/useQuery.
 */
export const useAppGqlQuery = (query, { variables, ...reactQueryOptions }) => {
  const authenticatedFetch = useAuthenticatedFetch()
  const fetch = useMemo(() => {
    return async () => {
      const graphQLClient = new GraphQLClient('/shopify-proxy/graphql.json', {
        fetch: authenticatedFetch,
        method: 'POST',
      })

      const data = await graphQLClient.rawRequest(query, variables)

      return data
    }
  }, [query, JSON.stringify(variables)])

  return useQuery({
    queryKey: [query, variables],
    queryFn: fetch,
    retry: 0,
    ...reactQueryOptions,
    refetchOnWindowFocus: false,
  })
}
