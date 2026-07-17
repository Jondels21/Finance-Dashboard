export function getApiError(
  error: unknown,
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const message =
      axiosError.response?.data?.message;

    if (Array.isArray(message)) {
      return message[0];
    }

    if (message) {
      return message;
    }
  }

  return 'Something went wrong';
}