export const SPANISH_MONTHS = ["ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sep.","oct.","nov.","dic."];

export function truncate(text, max = 180) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatSalary(min, max, currency = "USD") {
  if (min && max) return `${currency} ${formatNumber(min)} – ${formatNumber(max)}`;
  if (min) return `Desde ${currency} ${formatNumber(min)}`;
  if (max) return `Hasta ${currency} ${formatNumber(max)}`;
  return "";
}

export function formatClosingDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}