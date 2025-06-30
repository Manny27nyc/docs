// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = {
  launch: process.env.GITHUB_ACTIONS
    ? { executablePath: 'google-chrome-stable' }
    : {}
}
