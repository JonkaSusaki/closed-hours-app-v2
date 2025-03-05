// @ts-check

import { RunInput } from "../generated/api";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

// The configured entrypoint for the 'purchase.validation.run' extension target
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input: RunInput) {
  const error = {
    localizedMessage: "The Store is closed",
    target: "cart",
  };
  const errors = [];
  if (input.shop.localTime?.timeBetween) {
    errors.push(error);
  }

  return { errors };
}
