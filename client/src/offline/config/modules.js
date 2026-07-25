import customerConfig from "../modules/people/customer/config";
import { syncCustomers } from "../modules/people/customer/sync";

import supplierConfig from "../modules/people/supplier/config";
import { syncSuppliers } from "../modules/people/supplier/sync";

import employeeConfig from "../modules/people/employee/config";
import { syncEmployees } from "../modules/people/employee/sync";

const modules = [
  {
    ...customerConfig,
    sync: syncCustomers,
  },
  {
    ...supplierConfig,
    sync: syncSuppliers,
  },
  {
    ...employeeConfig,
    sync: syncEmployees,
  },
];

export default modules;