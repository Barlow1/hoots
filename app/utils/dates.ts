export const formatDateDisplay = (
  date: string | number | Date,
  locale: Intl.LocalesArgument = 'en-US',
  options: Intl.DateTimeFormatOptions | undefined = {},
) => new Date(date).toLocaleDateString(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'utc',
  ...options,
});

export default formatDateDisplay;