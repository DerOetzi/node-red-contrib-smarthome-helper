const defaultLocale =
  Intl?.DateTimeFormat()?.resolvedOptions()?.locale ?? "de-DE";

const defaultOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "2-digit",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export function formatDate(
  date: Date,
  locale: string = defaultLocale,
  options: Intl.DateTimeFormatOptions = defaultOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
