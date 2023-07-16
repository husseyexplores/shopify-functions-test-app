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
type ProductDiscountConfig = {
  range: [number, number];
  discount: number;
  discount_type: "fixed" | "fixed_each_item" | "percentage";
}[];

export default (input: InputQuery): FunctionResult => {
  // const configuration: Configuration = JSON.parse(
  //   input?.discountNode?.metafield?.value ?? "{}"
  // );
  const totalApplicableDiscount = roundUpto(
    input.cart.lines.reduce<number>((acc, line) => {
      const m = line.merchandise;

      if (m.__typename !== "ProductVariant") return acc;

      const mf = m.product.volume_discount_config;
      if (!mf) return acc;

      if (mf.type !== "json") return acc;
      const productConfig = parseProductDiscountConfig(mf.value);

      if (!productConfig) return acc;

      const matchedConfig = productConfig.find(
        (config) =>
          line.quantity >= config.range[0] && line.quantity <= config.range[1]
      );

      if (!matchedConfig) return acc;

      const discountValue = calculateLineDiscount(line, matchedConfig);
      return acc + discountValue;
    }, 0),
    2
  );

  if (totalApplicableDiscount === 0) {
    return EMPTY_DISCOUNT;
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets: [
          {
            orderSubtotal: {
              excludedVariantIds: [],
            },
          },
        ],
        message: `Order discount by ${totalApplicableDiscount}`,
        value: {
          fixedAmount: {
            amount: totalApplicableDiscount,
          },
        },
      },
    ],
  };
};

function roundUpto(num: number, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function calculateLineDiscount(
  line: InputQuery["cart"]["lines"][number],
  matchedConfig: ProductDiscountConfig[number]
) {
  if (!matchedConfig) return 0;

  if (matchedConfig.discount_type === "fixed") {
    return matchedConfig.discount;
  } else if (matchedConfig.discount_type === "fixed_each_item") {
    return matchedConfig.discount * line.quantity;
  } else if (matchedConfig.discount_type === "percentage") {
    const totalPrice = Number(line.cost.totalAmount.amount);

    // Should never happen - but just in case
    if (Number.isNaN(totalPrice)) return 0;

    return (totalPrice * matchedConfig.discount) / 100;
  }
  return 0;
}

function parseProductDiscountConfig(
  input: unknown
): ProductDiscountConfig | null {
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch (e) {
      return null;
    }
  }
  if (!Array.isArray(input)) return null;

  const allLinesOk = input.every((line, lineIndex) => {
    const isObject = line != null && typeof line === "object";
    if (!isObject) return false;

    const isRange =
      Array.isArray(line.range) &&
      line.range.length === 2 &&
      line.range.every(
        (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0
      );

    if (!isRange) return false;
    if (typeof line.discount !== "number" || line.discount < 0) return false;

    if (typeof line.discount_type !== "string") return false;
    if (
      line.discount_type !== "fixed" &&
      line.discount_type !== "fixed_each_item" &&
      line.discount_type !== "percentage"
    ) {
      return false;
    }

    // make sure they are in [min, max] order
    if (line.range[0] > line.range[1]) {
      const temp = line.range[0];
      line.range[0] = line.range[1];
      line.range[1] = temp;
    }

    if (line.discount_type === "percentage" && line.discount > 100) {
      line.discount = 100;
    }
    return true;
  });

  return allLinesOk ? input : null;
}
