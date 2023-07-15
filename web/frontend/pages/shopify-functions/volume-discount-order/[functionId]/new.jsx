import { useParams } from 'react-router-dom'
import { useForm, useField } from '@shopify/react-form'
import { CurrencyCode } from '@shopify/react-i18n'
import { Redirect } from '@shopify/app-bridge/actions'
import { useAppBridge } from '@shopify/app-bridge-react'

import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  DiscountMethod,
  MethodCard,
  DiscountStatus,
  RequirementType,
  SummaryCard,
  UsageLimitsCard,
  onBreadcrumbAction,
} from '@shopify/discount-app-components'
import {
  Banner,
  Card,
  Layout,
  Page,
  TextField,
  LegacyStack,
  LegacyCard,
  Breadcrumbs,
  PageActions,
} from '@shopify/polaris'

import { DiscountProvider } from '../../../../components'
import metafields from '../../../../metafields'
import { useAuthenticatedFetch } from '../../../../hooks'

const todaysDate = new Date()

function VolumeNew() {
  // Read the function ID from the URL
  const { functionId } = useParams()

  const app = useAppBridge()
  const redirect = Redirect.create(app)
  const currencyCode = CurrencyCode.Usd
  const authenticatedFetch = useAuthenticatedFetch()

  const {
    fields: {
      discountTitle,
      discountCode,
      discountMethod,
      combinesWith,
      requirementType,
      requirementSubtotal,
      requirementQuantity,
      usageTotalLimit,
      usageOncePerCustomer,
      startDate,
      endDate,
      configuration,
    },
    submit,
    submitting,
    dirty,
    reset,
    submitErrors,
    makeClean,
  } = useForm({
    fields: {
      discountTitle: useField(''),
      discountMethod: useField(DiscountMethod.Code),
      discountCode: useField(''),
      combinesWith: useField({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      requirementType: useField(RequirementType.None),
      requirementSubtotal: useField('0'),
      requirementQuantity: useField('0'),
      usageTotalLimit: useField(null),
      usageOncePerCustomer: useField(false),
      startDate: useField(todaysDate),
      endDate: useField(null),
      configuration: {
        // Add quantity and percentage configuration to form data
        quantity: useField('1'),
        percentage: useField('0'),
      },
    },
    onSubmit: async form => {
      const discount = {
        functionId,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
        metafields: [
          {
            namespace: metafields.volume_discount.namespace,
            key: metafields.volume_discount.key,
            type: 'json',
            value: JSON.stringify({
              // Populate metafield from form data
              quantity: parseInt(form.configuration.quantity),
              percentage: parseFloat(form.configuration.percentage),
            }),
          },
        ],
      }

      let response
      if (form.discountMethod === DiscountMethod.Automatic) {
        response = await authenticatedFetch('/api/discounts/automatic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discount: {
              ...discount,
              title: form.discountTitle,
            },
          }),
        })
      } else {
        response = await authenticatedFetch('/api/discounts/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discount: {
              ...discount,
              title: form.discountCode,
              code: form.discountCode,
            },
          }),
        })
      }

      const data = (await response.json()).data
      const remoteErrors = data.discountCreate.userErrors
      if (remoteErrors.length > 0) {
        return { status: 'fail', errors: remoteErrors }
      }

      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Discount,
      })
      return { status: 'success' }
    },
  })

  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner status="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join('.')} {message}
                </li>
              )
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null

  return (
    <Page
      title="Create volume discount"
      // breadcrumbs={[
      //   {
      //     content: 'Discounts',
      //     onAction: () => onBreadcrumbAction(redirect, true),
      //   },
      // ]}
      additionalMetadata={
        <Breadcrumbs
          backAction={{
            content: 'Discounts',
            onAction: () => onBreadcrumbAction(redirect, true),
          }}
        />
      }
      primaryAction={{
        content: 'Save',
        onAction: submit,
        disabled: !dirty,
        loading: submitting,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <form onSubmit={submit}>
            <MethodCard
              title="Volume"
              discountTitle={discountTitle}
              discountClass={DiscountClass.Order}
              discountCode={discountCode}
              discountMethod={discountMethod}
            />

            {/* Collect data for the configuration metafield. */}
            <LegacyCard title="Value">
              <LegacyCard.Section>
                <LegacyStack>
                  <TextField
                    label="Minimum quantity"
                    autoComplete="off"
                    {...configuration.quantity}
                  />
                  <TextField
                    label="Discount percentage"
                    autoComplete="off"
                    {...configuration.percentage}
                    suffix="%"
                  />
                </LegacyStack>
              </LegacyCard.Section>
            </LegacyCard>
            {discountMethod.value === DiscountMethod.Code && (
              <UsageLimitsCard
                totalUsageLimit={usageTotalLimit}
                oncePerCustomer={usageOncePerCustomer}
              />
            )}
            <CombinationCard
              combinableDiscountTypes={combinesWith}
              discountClass={DiscountClass.Product}
              discountDescriptor={
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value
              }
            />
            <ActiveDatesCard
              startDate={startDate}
              endDate={endDate}
              timezoneAbbreviation="EST"
            />
          </form>
        </Layout.Section>
        <Layout.Section secondary>
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: 'Volume',
              isEditing: false,
            }}
            performance={{
              status: DiscountStatus.Scheduled,
              usageCount: 0,
              isEditing: false,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubtotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
            }}
            usageLimits={{
              oncePerCustomer: usageOncePerCustomer.value,
              totalUsageLimit: usageTotalLimit.value,
            }}
            activeDates={{
              startDate: startDate.value,
              endDate: endDate.value,
            }}
          />
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: 'Save discount',
              onAction: submit,
              disabled: !dirty,
              loading: submitting,
            }}
            secondaryActions={[
              {
                content: 'Discard',
                onAction: () => onBreadcrumbAction(redirect, true),
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default function VolumeNewPage() {
  return (
    <DiscountProvider>
      <VolumeNew />
    </DiscountProvider>
  )
}

// debug router
/*
import { useLocation, useParams } from "react-router-dom"

export default function NewPage() {
  const params = useParams()
  const loc = useLocation()
  return <div>
    <h1>NEW: shopify-functions/volute-discount-order/{'[functionId]'}/{'[new.jsx]'}</h1>

    <div>
      <h3>pathname: {loc.pathname}</h3>
      <pre>{JSON.stringify(params)}</pre>
    </div>
  </div>
}
*/
