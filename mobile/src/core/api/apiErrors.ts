
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue. Veuillez réessayer.',
): string {
  if (!isRecord(error) || !('data' in error)) {
    return fallback;
  }

  const data = error.data;

  if (!isRecord(data) || !('detail' in data)) {
    return fallback;
  }

  const detail = data.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        isRecord(item) && typeof item.msg === 'string'
          ? item.msg
          : null,
      )
      .filter((message): message is string => message !== null);

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  return fallback;
}
