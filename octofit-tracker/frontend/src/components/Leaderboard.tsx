import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };
const selectLeaderboard = (response: LeaderboardResponse) => response.leaderboard;

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyMessage="No leaderboard rankings yet."
      selectItems={selectLeaderboard}
      renderItem={(entry) => <><strong>#{entry.rank} {entry.teamName}</strong> · {entry.totalPoints} points</>}
    />
  );
}
