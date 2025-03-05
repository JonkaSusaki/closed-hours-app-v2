import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  FormLayout,
  InlineError,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getValidationId } from "app/queries/validation";
import TimeInput from "app/components/input/TimeInput";
import type { ClosedHour } from "app/types/closedHours";
import isValidTimeFormat from "app/validations/timeValidation";
import {
  getClosedHours,
  setClosedHours,
} from "app/queries/closedHours.metafield";
import { formatTime } from "app/utils/formatClosedHours";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const closedHours = await getClosedHours(admin.graphql);

  return json({ closedHours: JSON.parse(closedHours) });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const body: ClosedHour = {
    initialHour: formData.get("initialHour") as string,
    finalHour: formData.get("finalHour") as string,
  };

  const validationId = await getValidationId(admin.graphql);

  await setClosedHours(admin.graphql, body, validationId);

  return null;
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const [formData, setFormData] = useState<ClosedHour>({
    initialHour: formatTime(loaderData.closedHours?.initialHour) || "00:00",
    finalHour: formatTime(loaderData.closedHours?.finalHour) || "00:00",
  });
  const [errors, setErrors] = useState<Partial<ClosedHour>>({});

  function handleBlur(fieldName: "initialHour" | "finalHour") {
    if (!formData[fieldName] || !isValidTimeFormat(formData[fieldName])) {
      setErrors({
        ...errors,
        [fieldName]: "Invalid time format",
      });

      return false;
    }

    setErrors({
      ...errors,
      [fieldName]: "",
    });

    return true;
  }

  function handleSubmit() {
    const body: ClosedHour = {
      initialHour: formData.initialHour,
      finalHour: formData.finalHour,
    };

    if (!handleBlur("initialHour") || !handleBlur("finalHour")) {
      return;
    }

    shopify.toast.show("Closed hour saved successfully");
    submit(body, { method: "post" });
  }

  return (
    <Page>
      <TitleBar title="Closed hours"></TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Set your shop closed hours
                  </Text>
                  <Text variant="bodyMd" as="p">
                    With this app, you can set closed hours for your store. If
                    the store is closed, customers will be able to see your
                    products, but they won't be able to buy them.
                  </Text>
                </BlockStack>

                <FormLayout>
                  <FormLayout.Group condensed>
                    <div>
                      <TimeInput
                        label="Initial hour"
                        setValue={(value) =>
                          setFormData({ ...formData, initialHour: value })
                        }
                        value={formData.initialHour}
                        onBlur={() => handleBlur("initialHour")}
                      />
                      <InlineError
                        message={errors.initialHour || ""}
                        fieldID="initialHour"
                      />
                    </div>

                    <div>
                      <TimeInput
                        label="Final hour"
                        setValue={(value) =>
                          setFormData({ ...formData, finalHour: value })
                        }
                        value={formData.finalHour}
                        onBlur={() => handleBlur("finalHour")}
                      />
                      <InlineError
                        message={errors.finalHour || ""}
                        fieldID="finalHour"
                      />
                    </div>
                  </FormLayout.Group>
                </FormLayout>
                <InlineStack align="end">
                  <ButtonGroup>
                    <Button
                      onClick={handleSubmit}
                      loading={isSaving}
                      disabled={
                        isSaving ||
                        Boolean(errors.initialHour) ||
                        Boolean(errors.finalHour)
                      }
                    >
                      Save
                    </Button>
                  </ButtonGroup>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
