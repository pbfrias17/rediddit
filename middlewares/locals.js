const importLocals = (req, res, next) => {
  res.locals.user = req.user;
  next();
}

export { importLocals };