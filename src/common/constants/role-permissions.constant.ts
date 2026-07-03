import { Action, Resource, Role } from '../Enums';
import type { PermissionsMap } from '../../DB/Models/users.model';

export const ROLE_DEFAULT_PERMISSIONS: Record<Role, PermissionsMap> = {
  [Role.ADMIN]: {},

  [Role.MANAGER]: {
    [Resource.STAFF]:     { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.PRODUCTS]:  { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.ORDERS]:    { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.REPORTS]:   { [Action.READ]: true,  [Action.WRITE]: false, [Action.DELETE]: false },
    [Resource.MENU]:      { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.CATEGORY]:  { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.INVENTORY]: { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: true  },
    [Resource.DASHBOARD]: { [Action.READ]: true,  [Action.WRITE]: false, [Action.DELETE]: false },
  },

  [Role.CASHIER]: {
    [Resource.ORDERS]:    { [Action.READ]: true,  [Action.WRITE]: true,  [Action.DELETE]: false },
    [Resource.PRODUCTS]:  { [Action.READ]: true,  [Action.WRITE]: false, [Action.DELETE]: false },
    [Resource.INVENTORY]: { [Action.READ]: true,  [Action.WRITE]: false, [Action.DELETE]: false },
  },

  [Role.USER]: {},
};
