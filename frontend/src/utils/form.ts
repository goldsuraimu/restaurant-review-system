export function getFieldError(
  field: string,
  isValid: boolean,
  frontMessage: string,
  fieldErrors: Record<string, string>
) {
  if (fieldErrors[field]) return fieldErrors[field]
  if (!isValid) return frontMessage
  return ''
}


