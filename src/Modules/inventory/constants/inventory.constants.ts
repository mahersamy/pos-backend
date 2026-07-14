export const INVENTORY_SELECT =
  'name category quantity stock status price perishable image createdAt';

export const INVENTORY_POPULATE = {
  path: 'category',
  select: 'name isActive',
};

export const INVENTORY_QUERY_OPTIONS = {
  select: INVENTORY_SELECT,
  populate: INVENTORY_POPULATE,
};
