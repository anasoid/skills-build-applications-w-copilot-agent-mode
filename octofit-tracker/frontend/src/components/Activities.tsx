import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };
const loadActivities = () => getJson<ActivitiesResponse>('/api/activities').then((response) => response.activities);

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadItems={loadActivities}
      emptyMessage="No activities yet."
      renderItem={(activity) => <><strong>{activity.type}</strong> · {activity.minutes} min · {activity.points} points</>}
    />
  );
}
