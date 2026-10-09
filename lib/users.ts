import { User } from "./types";

// Default order used until an admin sets a custom order (users.sort_order)
export const ORDERED_JOCKEYS = [
    "原田", "矢橋", "佐久間", "伊藤",
    "冨田", "大橋", "櫛部"
];

const defaultIndex = (u: User) => {
    const i = ORDERED_JOCKEYS.indexOf(u.jockey);
    return i === -1 ? 999 : i;
};

// Custom order (sort_order) wins when any user has one; otherwise the fixed jockey order.
export function sortUsers(users: User[]): User[] {
    const hasCustom = users.some(u => typeof u.sort_order === "number");
    return [...users].sort((a, b) => {
        if (hasCustom) {
            const sa = typeof a.sort_order === "number" ? a.sort_order : 9999;
            const sb = typeof b.sort_order === "number" ? b.sort_order : 9999;
            if (sa !== sb) return sa - sb;
        }
        return defaultIndex(a) - defaultIndex(b);
    });
}
