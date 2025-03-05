import type { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";

/**
 * Returns the ID of the validation with title "closed-hours-validation".
 * @param {AdminGraphqlClient} graphql An instance of the `AdminGraphqlClient`.
 * @returns The ID of the validation or undefined if it doesn't exist.
 */
export async function getValidationId(
  graphql: AdminGraphqlClient,
): Promise<string> {
  //query for the validations
  const validationResponse = await graphql(`
    #graphql
    query {
      validations(first: 10) {
        nodes {
          id
          title
          shopifyFunction {
            title
          }
        }
      }
    }
  `);

  const validationResponseJson = await validationResponse.json();

  //filter for the validation with title "closed-hours-validation"
  const validationId = validationResponseJson.data.validations.nodes.filter(
    (n: { id: string; shopifyFunction: { title: string } }) =>
      n?.shopifyFunction?.title === "closed-hours-validation",
  )[0].id;

  return validationId;
}
