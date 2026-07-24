export const generateOfflineId = () => {
  return `offline_${crypto.randomUUID()}`;
};