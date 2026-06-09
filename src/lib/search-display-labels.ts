export function formatSearchMovement(value: number | null) {
  if (value === null) {
    return "New this period";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

export function formatSearchPosition(value: number | null | undefined) {
  if (typeof value !== "number" || value <= 0) {
    return "Not ranking yet";
  }

  return value.toString();
}

export function formatSearchPositionWithMovement({
  movement,
  position,
}: {
  movement: number | null;
  position: number | null | undefined;
}) {
  return `${formatSearchPosition(position)} (${formatSearchMovement(movement)})`;
}
