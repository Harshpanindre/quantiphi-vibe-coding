/**
 * Utility helper functions for the frontend.
 */

/**
 * Formats a date string to a human-readable relative time.
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Truncates a string to a maximum character count with ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str, maxLen = 60) => {
  if (!str) return "";
  return str.length > maxLen ? `${str.substring(0, maxLen)}...` : str;
};

/**
 * Generates a temporary unique ID (for optimistic UI updates).
 * @returns {string}
 */
export const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Debounces a function call.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
