import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };
const selectActivities = (response: ActivitiesResponse) => response.activities;

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      emptyMessage="No activities yet."
      selectItems={selectActivities}
      renderItem={(activity) => <><strong>{activity.type}</strong> · {activity.minutes} min · {activity.points} points</>}
    />
  );
}
