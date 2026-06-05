export function setUserId(id: number) {
  localStorage.setItem("nutriscan_user_id", id.toString());
}

export function getUserId(): number | null {
  const id = localStorage.getItem("nutriscan_user_id");
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

export function clearUserId() {
  localStorage.removeItem("nutriscan_user_id");
}
