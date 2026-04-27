function normalizeSearchTokens(rawSearch) {
  if (rawSearch === undefined || rawSearch === null) {
    return [];
  }

  return String(rawSearch)
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildTokenizedSearch(filters, tokenToConditions) {
  const tokens = normalizeSearchTokens(filters && filters.search);
  if (tokens.length === 0) {
    return null;
  }

  const andConditions = tokens
    .map((token) => {
      const orConditions = tokenToConditions(token).filter(Boolean);
      if (orConditions.length === 0) {
        return null;
      }
      return { OR: orConditions };
    })
    .filter(Boolean);

  if (andConditions.length === 0) {
    return null;
  }

  return andConditions.length === 1 ? andConditions[0] : { AND: andConditions };
}

module.exports = {
  normalizeSearchTokens,
  buildTokenizedSearch,
};
