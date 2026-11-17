import { affiliationLine, profile } from './data/profile';
import { publications } from './data/publications';

/** Server-rendered summary injected into index.html at build time so content exists before JavaScript runs. */
export function StaticSummary() {
  return (
    <div className="prerender">
      <h1>{profile.name}</h1>
      <p>{profile.role}. {profile.headline}</p>
      <p>{profile.intro}</p>
      <p>{affiliationLine}</p>
      <h2>{publications.length} listed publications</h2>
      <ol>
        {publications.map((p) => (
          <li key={p.id}>
            <a href={p.scholarUrl}>{p.title}</a> ({p.year})
          </li>
        ))}
      </ol>
    </div>
  );
}
