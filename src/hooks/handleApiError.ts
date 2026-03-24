import { fallbackMessages } from "@/constants/fallbackMessages";
import { toast } from "sonner";

export const handleApiError = (error): void => {
  const data = error.response?.data;
  const isValidErrorMessage = (msg: unknown): boolean => {
    if (msg === null || msg === undefined) return false;
    if (typeof msg === "string" && msg.trim() === "") return false;
    return true;
  };

  if (Array.isArray(data?.errors)) {
    const validErrors = data.errors.filter(isValidErrorMessage);

    if (validErrors.length > 0) {
      validErrors.forEach((message) => {
        toast.error(
          typeof message === "string"
            ? message
            : message.msg || message.message || JSON.stringify(message)
        );
      });
      return;
    }
  }

  if (data?.errors && typeof data.errors === "object") {
    const errorMessages = Object.values(data.errors)
      .filter(isValidErrorMessage)
      .map((msg) =>
        typeof msg === "string"
          ? msg
          : (msg as any).msg || (msg as any).message || JSON.stringify(msg)
      );

    if (errorMessages.length > 0) {
      errorMessages.forEach((msg) => toast.error(msg));
      return;
    }
  }

  if (isValidErrorMessage(data?.message)) {
    toast.error(data.message[0].toUpperCase() + data.message.slice(1));
    return;
  }

  if (isValidErrorMessage(error?.message)) {
    toast.error(error.message[0].toUpperCase() + error.message.slice(1));
    return;
  }

  toast.error(fallbackMessages.genericError);
};
