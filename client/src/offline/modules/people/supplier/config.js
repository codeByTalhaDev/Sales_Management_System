const supplierConfig = {
  // Module name
  module: "suppliers",

  // IndexedDB store
  store: "suppliers",

  // Backend API endpoint
  api: "/suppliers",

  // IndexedDB schema
  schema: `
    ++localId,

    id,

    offlineId,

    supplierName,

    contact,

    company,

    email,

    address,

    status,

    syncStatus,

    version,

    isDeleted,

    createdAt,

    updatedAt
  `,
};

export default supplierConfig;