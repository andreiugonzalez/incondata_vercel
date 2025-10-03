import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Función para verificar y decodificar el token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Token inválido o expirado');
  }
};

// Función para verificar si el usuario tiene al menos uno de los roles requeridos
export const hasRequiredRole = (userRoles, requiredRoles) => {
  return requiredRoles.some(role => userRoles.includes(role));
};
