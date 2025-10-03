const jwt = require("jsonwebtoken");
const { response } = require("../utils/response");

function authenticateMiddleware(roles) {
  return function (req, res, next) {
    authenticateAdmin(req, res, next, roles);
  };
}

const authenticateAdmin = (req, res, next, roles) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).send(response(401, "Usuario no autorizado"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = req.user || {};
    req.user.email = decoded.email;
    req.user.rol = decoded.rol;
    if (decoded.id) req.user.id = decoded.id;

    // Lunixia: Permitir que el rol sea string o array
    const isAuthorized = Array.isArray(req.user.rol)
      ? req.user.rol.some((role) => roles.includes(role))
      : roles.includes(req.user.rol);

    if (!isAuthorized) {
      return res.status(401).send(response(401, "Usuario con rol no autorizado"));
    }

    next();
  } catch (err) {
    return res.status(401).send(response(401, "Usuario no autorizado, token inválido"));
  }
};

module.exports = { authenticateAdmin, authenticateMiddleware };
