const customerConfig = {
  // Module name
  module: "customers",

  // IndexedDB store
  store: "customers",

  // Backend API endpoint
  api: "/customers",

  // IndexedDB schema
  schema: `
    ++localId,

    id,

    offlineId,

    customerName,

    contact,

    cnic,

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

export default customerConfig;