/**
 * Server Wins
 */
export const serverWins = (
  localRecord,
  serverRecord
) => {
  return {
    ...serverRecord,
    localId: localRecord.localId,
    offlineId: localRecord.offlineId,
  };
};

/**
 * Client Wins
 */
export const clientWins = (
  localRecord,
  serverRecord
) => {
  return {
    ...localRecord,
  };
};

/**
 * Last Write Wins
 */
export const lastWriteWins = (
  localRecord,
  serverRecord
) => {
  const localTime = new Date(localRecord.updatedAt).getTime();

  const serverTime = new Date(serverRecord.updatedAt).getTime();

  return localTime >= serverTime
    ? clientWins(localRecord, serverRecord)
    : serverWins(localRecord, serverRecord);
};

/**
 * Field Level Merge
 */
export const fieldLevelMerge = (
  localRecord,
  serverRecord
) => {
  return {
    ...serverRecord,
    ...localRecord,

    localId: localRecord.localId,
    offlineId: localRecord.offlineId,
  };
};