export function formatInviteCount(value: number) {
  if (value <= 0) {
    return "No invites waiting";
  }

  return `${value} ${value === 1 ? "invite" : "invites"} waiting`;
}

export function formatInviteSeatDetail(value: number) {
  if (value <= 0) {
    return "none waiting to join";
  }

  return `${value} waiting to join`;
}
