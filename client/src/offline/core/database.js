import Dexie from "dexie";
import modules from "../config/modules";

class SalesDatabase extends Dexie {
  constructor() {
    super("SalesManagementDB");

    const stores = {};

    // Register all module stores
    modules.forEach((module) => {
      stores[module.store] = module.schema;
    });

    // Global Queue Store
    stores.queue = `
      ++id,

      queueKey,

      module,

      operation,

      localId,

      status,

      retryCount,

      createdAt,

      updatedAt,

      lastAttemptAt
    `;

    // Global Conflict Store
    stores.conflicts = `
      ++id,

      module,

      localId,

      serverId,

      createdAt
    `;

    this.version(1).stores(stores);
  }
}

const db = new SalesDatabase();

export default db;