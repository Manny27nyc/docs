// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const connectDatadog = require('connect-datadog')
const statsd = require('../lib/statsd')

module.exports = connectDatadog({
  dogstatsd: statsd,
  method: true, // Track HTTP methods (GET, POST, etc)
  response_code: true // Track response codes
})
