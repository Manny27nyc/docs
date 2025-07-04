// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const Operation = require('./operation')

// The module accepts a JSON schema object as input
// and returns an array of its operation objects with their
// HTTP verb and requestPath attached as properties

module.exports = async function getOperations (schema) {
  const operations = []

  for (const [requestPath, operationsAtPath] of Object.entries(schema.paths)) {
    for (const [verb, props] of Object.entries(operationsAtPath)) {
      const serverUrl = schema.servers[0].url
        .replace('{protocol}', 'https')
        .replace('{hostname}', 'api.github.com')
      const operation = new Operation(verb, requestPath, props, serverUrl)
      operations.push(operation)
    }
  }

  return operations
}
