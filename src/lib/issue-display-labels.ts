export function formatIssueNoteAuthor(value: string | null | undefined) {
  return value?.trim() ? value : "No author yet";
}
