import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // If country is "US", then zipCode is required
    shippingAddress: TRefine<
      {
        country: string;
        zipCode?: string;
      },
      {
        if: { properties: { country: { const: "US" } } };
        then: { required: ["zipCode"] };
      }
    >;

    // If age >= 18, then hasDriverLicense must be provided
    userInfo: TRefine<
      {
        age: number;
        hasDriverLicense?: boolean;
      },
      {
        if: { properties: { age: { minimum: 18 } } };
        then: { required: ["hasDriverLicense"] };
      }
    >;
  }>(async () => {}),
]);
