/**
 * Utilidades para manejo de roles de usuario
 */

/**
 * Verifica si el usuario tiene un rol específico
 * @param {Object} user - Objeto usuario del store
 * @param {string} targetRole - Rol a verificar
 * @returns {boolean} - true si el usuario tiene el rol, false en caso contrario
 */
export const hasRole = (user, targetRole) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.some(role => role.name === targetRole);
};

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 * @param {Object} user - Objeto usuario del store
 * @param {string[]} targetRoles - Array de roles a verificar
 * @returns {boolean} - true si el usuario tiene al menos uno de los roles
 */
export const hasAnyRole = (user, targetRoles) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || !Array.isArray(targetRoles)) {
    return false;
  }
  
  return user.roles.some(role => targetRoles.includes(role.name));
};

/**
 * Obtiene todos los nombres de roles del usuario
 * @param {Object} user - Objeto usuario del store
 * @returns {string[]} - Array con los nombres de todos los roles
 */
export const getUserRoles = (user) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return [];
  }
  
  return user.roles.map(role => role.name);
};

/**
 * Obtiene el rol principal del usuario (primer rol para compatibilidad)
 * @param {Object} user - Objeto usuario del store
 * @returns {string} - Nombre del primer rol o string vacío
 */
export const getPrimaryRole = (user) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return '';
  }
  
  return user.roles[0].name;
};

/**
 * Verifica si el usuario es superadmin
 * @param {Object} user - Objeto usuario del store
 * @returns {boolean} - true si el usuario es superadmin
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, 'superadmin');
};

/**
 * Verifica si el usuario es admin (admin o superadmin)
 * @param {Object} user - Objeto usuario del store
 * @returns {boolean} - true si el usuario es admin o superadmin
 */
export const isAdmin = (user) => {
  return hasAnyRole(user, ['admin', 'superadmin']);
};