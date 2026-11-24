import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<TResponse, TItem> = {
  title: string;
  description: string;
  endpoint: string;
  emptyMessage: string;
  selectItems: (response: TResponse) => TItem[];
  renderItem: (item: TItem) => ReactNode;
};

export function CapabilityCard<TResponse, TItem>({
  title,
  description,
  endpoint,
  emptyMessage,
  selectItems,
  renderItem,
}: Props<TResponse, TItem>) {
  const [items, setItems] = useState<TItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);

    void getJson<TResponse>(endpoint)
      .then((response) => {
        if (active) setItems(selectItems(response));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Request failed.');
      });

    return () => {
      active = false;
    };
  }, [endpoint, selectItems]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p role="status">{emptyMessage}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((item, index) => (
              <li className="list-group-item" key={index}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
