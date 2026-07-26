import { Action, Resource, Role } from '../Enums';
import type { PermissionsMap } from '../../Modules/users/models/users.model';


const DEFAULT_PERMISSIONS = {
  [Resource.STAFF]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.PRODUCTS]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.ORDERS]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.REPORTS]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.MENU]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.CATEGORY]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.INVENTORY]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
  [Resource.DASHBOARD]: { [Action.READ]: false, [Action.WRITE]: false, [Action.DELETE]: false },
}
export const ROLE_DEFAULT_PERMISSIONS: Record<Role, PermissionsMap> = {
  [Role.ADMIN]: {},

  [Role.MANAGER]: {
    ...DEFAULT_PERMISSIONS,
    [Resource.STAFF]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.PRODUCTS]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.ORDERS]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.REPORTS]: { [Action.READ]: true, [Action.WRITE]: false, [Action.DELETE]: false },
    [Resource.MENU]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.CATEGORY]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.INVENTORY]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: true },
    [Resource.DASHBOARD]: { [Action.READ]: true, [Action.WRITE]: false, [Action.DELETE]: false },
  },

  [Role.CASHIER]: {
    ...DEFAULT_PERMISSIONS,
    [Resource.ORDERS]: { [Action.READ]: true, [Action.WRITE]: true, [Action.DELETE]: false },
    [Resource.PRODUCTS]: { [Action.READ]: true, [Action.WRITE]: false, [Action.DELETE]: false },
    [Resource.INVENTORY]: { [Action.READ]: true, [Action.WRITE]: false, [Action.DELETE]: false },
  },

  [Role.USER]: {},
};
