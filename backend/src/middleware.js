export function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
    return;
  }

  res.status(401).json({ message: "Debes iniciar sesion para continuar." });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.session.user?.role;

    if (role && allowedRoles.includes(role)) {
      next();
      return;
    }

    res.status(403).json({ message: "No tienes permisos para realizar esta accion." });
  };
}
