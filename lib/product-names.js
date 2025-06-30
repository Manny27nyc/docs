// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const enterpriseServerReleases = require('../lib/enterprise-server-releases')

const productNames = {
  dotcom: 'GitHub.com'
}

enterpriseServerReleases.all.forEach(version => {
  productNames[version] = `Enterprise Server ${version}`
})

module.exports = productNames
