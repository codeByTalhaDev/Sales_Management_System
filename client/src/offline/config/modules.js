import customerConfig from "../modules/people/customer/config";
import { syncCustomers } from "../modules/people/customer/sync";

const modules = [
  {
    ...customerConfig,
    sync: syncCustomers,
  },
];

export default modules;