import { useEffect, useState, type ReactNode } from 'react';

type Props<TItem> = {
  title: string;
  description: string;
  loadItems: () => Promise<TItem[]>;
  emptyMessage: string;
  renderItem: (item: TItem) => ReactNode;
};

export function CapabilityCard<TItem>({
  title,
  description,
  loadItems,
  emptyMessage,
  renderItem,
}: Props<TItem>) {
  const [items, setItems] = useState<TItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);

    void loadItems()
      .then((results) => {
        if (active) setItems(results);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Request failed.');
      });

    return () => {
      active = false;
    };
  }, [loadItems]);

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
