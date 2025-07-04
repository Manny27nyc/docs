// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = (req, res, next) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(req.headers['user-agent'])
  if (isSafari) {
    res.header('Last-Modified', (new Date()).toUTCString())
  }
  next()
}
