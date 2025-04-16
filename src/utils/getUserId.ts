export const getUserIdFromLocalStorage = (): string | null => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (!persistedRoot) return null;

    const rootState = JSON.parse(persistedRoot);
    const userState = JSON.parse(rootState.user);

    return userState.currentUser?._id || null;
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
};
