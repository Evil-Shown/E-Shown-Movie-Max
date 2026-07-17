const KEY = "chithra-notifications";
const MAX = 50;

export interface LocalNotification {
  id: string;
  type: "watching" | "watchlist" | "completed";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  posterPath?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getNotifications(): LocalNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalNotification[]) : [];
  } catch {
    return [];
  }
}

function save(items: LocalNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

export function addNotifications(items: Omit<LocalNotification, "id" | "timestamp" | "read">[]): LocalNotification[] {
  const list = getNotifications();
  const existingKeys = new Set(list.map((n) => `${n.title}::${n.type}`));
  const toAdd: LocalNotification[] = [];

  for (const n of items) {
    if (!existingKeys.has(`${n.title}::${n.type}`)) {
      toAdd.push({
        ...n,
        id: generateId(),
        timestamp: Date.now(),
        read: false,
      });
    }
  }

  if (toAdd.length > 0) {
    save([...toAdd, ...list]);
  }

  return toAdd;
}

export function markNotificationRead(id: string) {
  const list = getNotifications();
  const found = list.find((n) => n.id === id);
  if (found) {
    found.read = true;
    save(list);
  }
}

export function markAllNotificationsRead() {
  const list = getNotifications();
  list.forEach((n) => (n.read = true));
  save(list);
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}
