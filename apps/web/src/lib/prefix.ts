export const prefixColor: Record<string, string> = {
  A: '#2563EB',
  B: '#16A34A',
  C: '#7C3AED',
}

export function getPrefixColor(prefix: string) {
  return prefixColor[prefix] ?? '#64748B'
}
