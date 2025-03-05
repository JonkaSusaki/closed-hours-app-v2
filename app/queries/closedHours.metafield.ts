import type { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";
import type { ClosedHour } from "app/types/closedHours";

/**
 * Sets the closed hours using a GraphQL mutation.
 * The metafield
 * is stored with the key "closed-hours" in the "$app:closed-hours" namespace and
 * saved as a JSON object.
 *
 * @param {AdminGraphqlClient} graphql - An instance of the `AdminGraphqlClient` to perform the GraphQL request.
 * @param {ClosedHour} closedHour - An object containing the initial and final hours to be set.
 * @param {string} validationId - The ID of the validation to which the closed hours will be applied.
 */
export async function setClosedHours(
  graphql: AdminGraphqlClient,
  closedHour: ClosedHour,
  validationId: string,
) {
  await graphql(
    `
      #graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            key: "closed-hours",
            namespace: "$app:closed-hours",
            value: JSON.stringify({
              initialHour: `${closedHour.initialHour}:00`,
              finalHour: `${closedHour.finalHour}:00`,
            }),
            type: "json",
            ownerId: validationId,
          },
        ],
      },
    },
  );
}

/**
 * Removes the closed hours metafield, setting it to its default value.
 *
 * @param {AdminGraphqlClient} graphql - The `AdminGraphqlClient` instance.
 * @param {string} validationId - The ID of the validation that the metafield belongs to.
 */
export async function removeClosedHours(
  graphql: AdminGraphqlClient,
  validationId: string,
) {
  await graphql(
    `
      #graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            key: "closed-hours",
            namespace: "$app:closed-hours",
            value: JSON.stringify({
              initialHour: `00:00:00`,
              finalHour: `00:00:00`,
            }),
            type: "json",
            ownerId: validationId,
          },
        ],
      },
    },
  );
}

/**
 * Retrieves the closed hours metafield value
 *
 * @param {AdminGraphqlClient} graphql - An instance of the `AdminGraphqlClient` to perform the GraphQL request.
 * @returns {Promise<string | undefined>} The closed hours as a stringified JSON object or undefined if not found.
 */

export async function getClosedHours(graphql: AdminGraphqlClient) {
  const response = await graphql(`
    #graphql
    query {
      validations(first: 10) {
        nodes {
          metafield(key: "closed-hours", namespace: "$app:closed-hours") {
            value
          }
        }
      }
    }
  `);

  const responseJson = await response.json();

  const closedHours =
    responseJson.data.validations?.nodes?.[0]?.metafield?.value;

  return closedHours;
}
