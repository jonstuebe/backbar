import { Dispatch, SetStateAction } from "react";

export function convertToCents(num: string | undefined) {
  if (num === undefined) return 0;

  return parseFloat(num) * 100;
}

export function updateCurrencyOnBlur(
  text: string,
  updater: Dispatch<SetStateAction<string | undefined>>
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const num = parseFloat(text);

  if (!isNaN(num)) {
    updater(formatter.format(num).replace("$", ""));
  }
}

export function stripCharacters(
  text: string,
  updater: Dispatch<SetStateAction<string | undefined>>
) {
  updater(text.replace(/[^0-9.]/g, ""));
}
