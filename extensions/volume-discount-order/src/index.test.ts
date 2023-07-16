import { describe, it, expect } from "vitest";
import orderDiscounts from "./index";
import {
  FunctionResult,
  DiscountApplicationStrategy,
  CurrencyCode,
  InputQuery,
} from "../generated/api";

type CreateCartInput = {
  items: {
    id: string | number;
    price: string;
    quantity: number;
    product: {
      id: string | number;
      volume_discount_config: string | any[];
    };
  }[];
};
function createCart({ items }: CreateCartInput): InputQuery["cart"] {
  let cart: InputQuery["cart"] = {
    lines: items.map((x, i) => {
      const variantId =
        typeof x.id === "number"
          ? `gid://shopify/ProductVariant/${x.id}`
          : x.id;
      const productId =
        typeof x.product.id === "number"
          ? `gid://shopify/Product/${x.product.id}`
          : x.product.id;

      const priceNum = Number(x.price);
      if (
        Number.isNaN(priceNum) ||
        !Number.isFinite(priceNum) ||
        priceNum < 0
      ) {
        throw new Error(`Invalid price at index "${i}"`);
      }

      const priceTotal = priceNum * x.quantity;

      return {
        id: `gid://shopify/CartLine/${1}`,
        quantity: Math.floor(x.quantity),
        merchandise: {
          id: variantId,
          product: {
            id: productId,
            volume_discount_config: x.product.volume_discount_config
              ? {
                  type: "json",
                  value:
                    typeof x.product.volume_discount_config !== "string"
                      ? JSON.stringify(x.product.volume_discount_config)
                      : x.product.volume_discount_config,
                  __typename: "Metafield",
                }
              : null,
            __typename: "Product",
          },
          __typename: "ProductVariant",
        },
        cost: {
          amountPerQuantity: {
            amount: x.price,
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          subtotalAmount: {
            amount: priceTotal.toFixed(2),
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          totalAmount: {
            amount: priceTotal.toFixed(2),
            currencyCode: CurrencyCode.Usd,
            __typename: "MoneyV2",
          },
          __typename: "CartLineCost",
        },
      };
    }),
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

  const cartSubtotal = cart.lines.reduce(
    (sum, line) => Number(line.cost.subtotalAmount.amount) + sum,
    0
  );

  cart.cost.subtotalAmount.amount = cartSubtotal.toFixed(2);
  cart.cost.totalAmount.amount = cartSubtotal.toFixed(2);

  return cart;
}

describe("order discounts function", () => {
  it("returns no discounts without configuration", () => {
    // console.log(c1);

    const result = orderDiscounts({
      discountNode: {},
      cart: createCart({
        items: [
          {
            id: 1338274873373,
            price: "100.0",
            quantity: 10,
            product: {
              id: 114833883165,
              volume_discount_config:
                '[{"range":[3,5],"discount":10,"discount_type":"percentage"},{"range":[6,10],"discount":50,"discount_type":"percentage"}]',
              // volume_discount_config: [
              //   {
              //     range: [3, 5],
              //     discount: 10,
              //     discount_type: "percentage", // "percentage" | "fixed" | "fixed_each_item"
              //   },
              //   {
              //     range: [6, 100000000],
              //     discount: 50,
              //     discount_type: "percentage",
              //   },
              // ],
            },
          },
        ],
      }),
      __typename: "Input",
    });

    const expected: FunctionResult = {
      discounts: [
        expect.objectContaining({
          targets: [{ orderSubtotal: { excludedVariantIds: [] } }],
          value: {
            fixedAmount: {
              amount: 500,
            },
          },
        }),
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    };

    // expect(result).toEqual(expected);
    expect(result).toEqual(expected);
  });
});
