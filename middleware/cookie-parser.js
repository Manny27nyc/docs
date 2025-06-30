// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = require('cookie-parser')(
  process.env.COOKIE_SECRET,
  require('../lib/cookie-settings')
)
