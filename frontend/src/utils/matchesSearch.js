export function matchesSearch(profile, query, _filters) {
  if (!query) return true;

  return (
    profile.name.toLowerCase().includes(query.toLowerCase()) ||
    profile.title.toLowerCase().includes(query.toLowerCase())
  );
}
