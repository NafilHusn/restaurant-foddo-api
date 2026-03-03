export const getErrorMessage = (
  error: unknown,
  key: string = 'message',
  fallbackMessage: string = 'Something went wrong',
) => {
  return error instanceof Error
    ? (error[key as keyof Error] as string)
    : fallbackMessage;
};
