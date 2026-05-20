export function formatCvDate(iso) {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
