export function formatAlertDeliveryStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs a check",
    PENDING: "Waiting to send",
    SENT: "Sent",
  };

  return labels[value] ?? formatEnum(value);
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
