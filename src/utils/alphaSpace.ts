import { toast } from "sonner";

export const filterAlphaSpaces = (value: string): string => {
  if (/\s{2,}/.test(value)) {
    toast.error("Only one space is allowed between words.");
  }
  return value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " ");
};
