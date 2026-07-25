const employeeConfig = {
  // Module name
  module: "employees",

  // IndexedDB store
  store: "employees",

  // Backend API endpoint
  api: "/employees",

  // IndexedDB schema
  schema: `
    ++localId,

    id,

    offlineId,

    employeeName,

    contact,

    email,

    designation,

    salary,

    joiningDate,

    status,

    syncStatus,

    version,

    isDeleted,

    createdAt,

    updatedAt
  `,
};

export default employeeConfig;