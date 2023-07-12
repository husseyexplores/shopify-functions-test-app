const discountConfig = {
  "policy_refs": {
    "1": [
      { "range": [0, 10], "discount": 0.05, "discount_type": "percent" },
      { "range": [11, 20], "discount": 0.1, "discount_type": "percent" },
      { "range": [21, 30], "discount": 0.15, "discount_type": "percent" },
    ],
    "2": [
      { "range": [0, 10], "discount": 0.05, "discount_type": "percent" },
      { "range": [11, 20], "discount": 0.1, "discount_type": "percent" },
      { "range": [21, 30], "discount": 0.15, "discount_type": "percent" }
    ]
  },

  "discounts_policies": {
    "*": "policy_refs.1",
    "gid://shopify/Product/1": "policy_refs.1",
    "gid://shopify/Variant/1.1": "policy_refs.1",

    "gid://shopify/Product/2":  [
      { "range": [0, 5], "discount": 0.0, "discount_type": "percent" },
      { "range": [6, 10], "discount": 0.05, "discount_type": "percent" }
    ],
    "gid://shopify/Variant/2.1": "policy_refs.2",
  }
};

const input = {
  cart: {
    lines: [
      {
        id: "1",
        productId: "blue-shirt",
        variantId: "blue-shirt/small",
        quantity: 11,
      },
    ],
  },
};

const output = {
  discounts: [
    {
      targets: [{ productVariant: { id: "blue-shirt/small" } }],
      value: {
        percentage: {
          // Find out the correct discount from the config
          value: '@TODO'
        },
      },
    },
  ],
};


// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------

// Function to calculate the discount for a given product variant and quantity
function calculateDiscount(productVariant, quantity) {
  const discountPolicies = discountConfig[productVariant]?.discounts_policies;

  if (!discountPolicies) {
    return 0; // If no discount policies are found, return 0 discount
  }

  const policies = discountPolicies["*"] || [];
  const variantPolicies = discountPolicies[productVariant] || [];

  // Combine the default policies and the variant-specific policies
  const combinedPolicies = [...variantPolicies, ...policies];

  // Find the correct discount tier based on the quantity
  let selectedPolicy = null;
  for (const policy of combinedPolicies) {
    if (quantity >= policy.range[0] && quantity <= policy.range[1]) {
      selectedPolicy = policy;
      break;
    }
  }

  if (!selectedPolicy) {
    return 0; // If no matching policy is found, return 0 discount
  }

  // Calculate the discount value based on the discount type
  if (selectedPolicy.discount_type === "percent") {
    return selectedPolicy.discount;
  } else if (selectedPolicy.discount_type === "fixed") {
    // Calculate the fixed discount amount
    return selectedPolicy.discount * quantity;
  }

  return 0; // Default to 0 discount if discount_type is not recognized
}

// Calculate the discount for the given product variant and quantity
const productVariantId = input.cart.lines[0].variantId;
const productQuantity = input.cart.lines[0].quantity;

const discountValue = calculateDiscount(productVariantId, productQuantity);

// Create the output object
const output_result = {
  discounts: [
    {
      targets: [{ productVariant: { id: productVariantId } }],
      value: {
        percentage: {
          value: discountValue,
        },
      },
    },
  ],
};

console.log(output)