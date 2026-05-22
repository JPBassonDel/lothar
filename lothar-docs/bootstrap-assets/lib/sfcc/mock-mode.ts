const PLACEHOLDER_VALUES = {
  clientId: "your-client-id",
  secret: "your-secret",
  shortCode: "your-short-code",
  organizationId: "f_ecom_xxxx_xxx",
} as const;

export function isSfccMockMode(): boolean {
  const flag = process.env.SFCC_USE_MOCK;
  if (flag === "true") return true;
  if (flag === "false") return false;

  const clientId = process.env.SFCC_CLIENT_ID || "";
  const secret = process.env.SFCC_SECRET || "";
  const shortCode = process.env.SFCC_SHORTCODE || "";
  const organizationId = process.env.SFCC_ORGANIZATIONID || "";

  return (
    !clientId ||
    !secret ||
    !shortCode ||
    !organizationId ||
    clientId === PLACEHOLDER_VALUES.clientId ||
    secret === PLACEHOLDER_VALUES.secret ||
    shortCode === PLACEHOLDER_VALUES.shortCode ||
    organizationId === PLACEHOLDER_VALUES.organizationId
  );
}
