import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };
type WorkoutsResponse = { suggestions: WorkoutSuggestion[] };
const selectSuggestions = (response: WorkoutsResponse) => response.suggestions;

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      emptyMessage="No workout suggestions yet."
      selectItems={selectSuggestions}
      renderItem={(suggestion) => <><strong>{suggestion.title}</strong>{suggestion.focus ? ` · ${suggestion.focus}` : ''}{suggestion.reason ? ` — ${suggestion.reason}` : ''}</>}
    />
  );
}
