import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members: string[] };
type TeamsResponse = { teams: Team[] };
const loadTeams = () => getJson<TeamsResponse>('/api/teams').then((response) => response.teams);

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadItems={loadTeams}
      emptyMessage="No teams yet."
      renderItem={(team) => <><strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''} · {team.members.length} members</>}
    />
  );
}
