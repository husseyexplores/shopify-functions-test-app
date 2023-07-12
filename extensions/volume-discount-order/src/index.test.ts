import { describe, it, expect } from "vitest";
import orderDiscounts from "./index";
import {
  FunctionResult,
  DiscountApplicationStrategy,
  CurrencyCode,
  InputQuery,
} from "../generated/api";

function createCart(metafieldConfig: any): InputQuery["cart"] {
  let cart: InputQuery["cart"] = {
    lines: [
      {
        id: "gid://shopify/CartLine/0",
        quantity: 4,
        merchandise: {
          id: "gid://shopify/ProductVariant/1338274873373",
          product: {
            id: "gid://shopify/Product/114833883165",
            metafield: metafieldConfig
              ? {
                  type: "json",
                  value: JSON.stringify(metafieldConfig),
                  __typename: "Metafield",
                }
              : null,
            __typename: "Product",
          },
          __typename: "ProductVariant",
        },
        cost: {
          amountPerQuantity: {
            amount: 10000,
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          subtotalAmount: {
            amount: 0,
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          totalAmount: {
            amount: 0,
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          __typename: "CartLineCost",
        },
      },
    ],
    cost: {
      subtotalAmount: {
        amount: 0,
        currencyCode: CurrencyCode.Usd,
        __typename: "MoneyV2",
      },
      totalAmount: {
        amount: 0,
        currencyCode: CurrencyCode.Usd,
        __typename: "MoneyV2",
      },
      __typename: "CartCost",
    },
  };

  cart.lines.forEach((line) => {
    const lineSubtotal = line.cost.amountPerQuantity.amount * line.quantity;
    line.cost.subtotalAmount.amount = lineSubtotal;
    line.cost.totalAmount.amount = lineSubtotal;
  });

  const cartSubtotal = cart.lines.reduce(
    (sum, line) => line.cost.subtotalAmount.amount + sum,
    0
  );
  cart.cost.subtotalAmount.amount = cartSubtotal;
  cart.cost.totalAmount.amount = cartSubtotal;

  return cart;
}

describe("order discounts function", () => {
  it("returns no discounts without configuration", () => {
    const result = orderDiscounts({
      discountNode: {},
      cart: createCart([
        {
          range: [3, 5],
          discount: 10,
          discount_type: "percentage",
        },
        {
          range: [6, 10],
          discount: 10,
          discount_type: "percentage",
        },
      ]),
      __typename: "Input",
    });

    const expected: FunctionResult = {
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    };

    expect(result).toEqual(expected);
  });
});
