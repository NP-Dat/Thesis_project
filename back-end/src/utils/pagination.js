export function parsePagination({ page, limit }, { defaultLimit = 10, maxLimit = 100 } = {}) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(maxLimit, Math.max(1, Number.parseInt(limit, 10) || defaultLimit));
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
}

export function buildPaginationMeta({ page, limit, totalItems }) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}
