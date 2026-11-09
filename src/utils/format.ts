export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatTimestamp(timestamp: bigint | number): string {
  if (!timestamp) return 'N/A';
  const num = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const date = new Date(num * 1000);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(timestamp: bigint | number): string {
  if (!timestamp) return 'N/A';
  const num = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = now - num;

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

