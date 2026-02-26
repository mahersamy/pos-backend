import { Action, Resource, Role } from '../Enums';

export const ROLE_DEFAULT_PERMISSIONS: Record<
  Role,
  { resource: Resource; actions: Action[] }[]
> = {
  [Role.ADMIN]: [],

  [Role.MANAGER]: [
    {
      resource: Resource.STAFF,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
    {
      resource: Resource.PRODUCTS,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
    {
      resource: Resource.ORDERS,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
    { resource: Resource.REPORTS, actions: [Action.READ] },
    {
      resource: Resource.MENU,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
    {
      resource: Resource.CATEGORY,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
    {
      resource: Resource.INVENTORY,
      actions: [Action.READ, Action.WRITE, Action.DELETE],
    },
  ],

  [Role.CASHIER]: [
    { resource: Resource.ORDERS, actions: [Action.READ, Action.WRITE] },
    { resource: Resource.PRODUCTS, actions: [Action.READ] },
    { resource: Resource.INVENTORY, actions: [Action.READ] },
  ],
  [Role.USER]: [],
};
