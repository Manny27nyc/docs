// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const Hydro = require('../lib/hydro')

module.exports = (req, res, next) => {
  req.hydro = new Hydro()
  return next()
}
