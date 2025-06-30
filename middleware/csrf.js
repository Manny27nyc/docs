// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = require('csurf')({
  cookie: require('../lib/cookie-settings'),
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
})
