import { useCallback, useMemo } from 'react'
import { AppProvider } from '@shopify/polaris'
import { useNavigate } from '@shopify/app-bridge-react'
import translations from '@shopify/polaris/locales/en.json'
import '@shopify/polaris/build/esm/styles.css'

export function PolarisProvider({ children }) {
  return (
    <AppProvider i18n={translations} linkComponent={AppBridgeLink}>
      {children}
    </AppProvider>
  )
}

const EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/
function AppBridgeLink({ url, children, external, ...rest }) {
  const navigate = useNavigate()
  const handleClick = useCallback(
    e => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      navigate(url)
    },
    [url, navigate],
  )

  const isExternalLink = useMemo(() => EXTERNAL_LINK_REGEX.test(url), [url])

  if (external || isExternalLink) {
    return (
      <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  )
}
