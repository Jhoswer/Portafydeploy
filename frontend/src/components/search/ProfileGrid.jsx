import { SearchResultCard } from "./SearchResultCard";

/**
 * Grid de tarjetas de perfiles con animación de entrada.
 *
 * @param {{
 *   profiles: object[],
 *   query: string,
 * }} props
 */
export function ProfileGrid({ profiles, query }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
      data-testid="results-grid"
    >
      {profiles.map((profile) => (
        <SearchResultCard
          key={profile.id}
          profile={profile}
          query={query}
        />
      ))}
    </div>
  );
}