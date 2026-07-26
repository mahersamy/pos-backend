export const AUDIT_LOG_SELECT =
  "action entity entityId performedBy oldValue newValue ipAddress userAgent description createdAt";

export const AUDIT_LOG_POPULATE = [
  { path: 'performedBy', select: 'firstName lastName email profilePicture.secure_url role' },
];

export const AUDIT_LOG_QUERY_OPTIONS = {
  select: AUDIT_LOG_SELECT,
  populate: AUDIT_LOG_POPULATE,
};
