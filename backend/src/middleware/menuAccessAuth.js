const prisma = require('../config/database');
const { authorize } = require('./auth');
const logger = require('../utils/logger');

/**
 * When no menu_access row exists, or createRoles is empty, delegate to a static
 * `authorize(…fallback…)`-style check (role mapping matches auth.js).
 *
 * @param {string} menuPath - e.g. '/fptk'
 * @param {string[]} fallbackAllowedRoles - Prisma userRole enums allowed if config is open-ended
 * @returns {import('express').RequestHandler}
 */
function requireMenuCreate(menuPath, fallbackAllowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const menu = await prisma.menuAccess.findUnique({
        where: { menuPath },
        select: { createRoles: true },
      });
      const configured = menu?.createRoles && Array.isArray(menu.createRoles) && menu.createRoles.length > 0;

      if (!configured) {
        return authorize(...fallbackAllowedRoles)(req, res, next);
      }

      const userRole = req.user.role;
      if (menu.createRoles.includes(userRole)) {
        return next();
      }

      logger.warn(
        `Menu create denied: user=${req.user.id} path=${menuPath} role=${userRole} createRoles=${menu.createRoles.join(
          ','
        )}`
      );
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create this resource',
      });
    } catch (error) {
      logger.error('Menu access (create) check failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking menu permissions',
      });
    }
  };
}

module.exports = {
  requireMenuCreate,
};
