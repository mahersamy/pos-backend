export const CATEGORY_SELECT =
  'name description isActive image.secure_url menu createdAt';

export const CATEGORY_POPULATE = [
  { path: 'menu', select: 'name isActive' },
];

export const CATEGORY_QUERY_OPTIONS = {
  select: CATEGORY_SELECT,
  populate: CATEGORY_POPULATE,
};
