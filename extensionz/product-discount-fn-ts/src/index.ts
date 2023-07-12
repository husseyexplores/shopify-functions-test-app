import {
  InputQuery,
  FunctionResult,
  DiscountApplicationStrategy,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export default (input: InputQuery): FunctionResult => {
  const config: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  if (!config) {
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          targets: [
            {
              productVariant: {
                id: "gid://shopify/ProductVariant/123456789",
              }
            }
          ],
          message: "Test",
          value: {
            fixedAmount: {
              amount: 5,
            },
          },
        },
      ],
    };
  }

  return EMPTY_DISCOUNT;
};
