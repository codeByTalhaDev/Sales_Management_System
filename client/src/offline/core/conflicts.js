import db from "./database";
import { now } from "../utils/timestamp";

/**
 * Log a resolved or unresolved conflict for audit/review.
 */
export const logConflict = async ({
  module,
  localId,
  serverId,
  type,
  localRecord,
  serverRecord,
  resolvedRecord,
}) => {
  return await db.conflicts.add({
    module,
    localId,
    serverId,
    type,
    localRecord,
    serverRecord,
    resolvedRecord,
    createdAt: now(),
  });
};

/**
 * Get all logged conflicts (optionally filtered by module).
 */
export const getAll = async (module = null) => {
  if (!module) {
    return await db.conflicts.toArray();
  }

  return await db.conflicts.where("module").equals(module).toArray();
};