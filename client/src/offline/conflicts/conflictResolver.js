import {
  serverWins,
  clientWins,
  lastWriteWins,
  fieldLevelMerge,
} from "./mergeStrategies";

import { CONFLICT_TYPES } from "./conflictTypes";

/**
 * Resolve synchronization conflict
 */
export const resolveConflict = ({
  type,
  localRecord,
  serverRecord,
}) => {
  switch (type) {
    case CONFLICT_TYPES.SERVER_CHANGED:
      return serverWins(localRecord, serverRecord);

    case CONFLICT_TYPES.LOCAL_CHANGED:
      return clientWins(localRecord, serverRecord);

    case CONFLICT_TYPES.VERSION:
      return lastWriteWins(localRecord, serverRecord);

    case CONFLICT_TYPES.DUPLICATE:
      return fieldLevelMerge(localRecord, serverRecord);

    case CONFLICT_TYPES.DELETE:
      return serverWins(localRecord, serverRecord);

    default:
      return lastWriteWins(localRecord, serverRecord);
  }
};