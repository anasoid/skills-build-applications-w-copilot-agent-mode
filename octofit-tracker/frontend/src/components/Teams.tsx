import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members: string[] };
type TeamsResponse = { teams: Team[] };
const selectTeams = (response: TeamsResponse) => response.teams;

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyMessage="No teams yet."
      selectItems={selectTeams}
      renderItem={(team) => <><strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''} · {team.members.length} members</>}
    />
  );
}
