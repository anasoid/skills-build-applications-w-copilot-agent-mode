import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };
type WorkoutsResponse = { suggestions: WorkoutSuggestion[] };
const loadSuggestions = () => getJson<WorkoutsResponse>(
  `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
).then((response) => response.suggestions);

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadItems={loadSuggestions}
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <><strong>{suggestion.title}</strong>{suggestion.focus ? ` · ${suggestion.focus}` : ''}{suggestion.reason ? ` — ${suggestion.reason}` : ''}</>}
    />
  );
}
