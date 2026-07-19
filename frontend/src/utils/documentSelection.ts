export function toggleDocumentSelection(previous: Set<string>, docId: string): Set<string> {
  const next = new Set(previous);

  if (next.has(docId)) {
    next.delete(docId);
    return next;
  }

  next.clear();
  next.add(docId);
  return next;
}
