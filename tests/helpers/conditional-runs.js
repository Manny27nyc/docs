// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const runningActionsOnInternalRepo = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY === 'github/docs-internal'

const testViaActionsOnly = runningActionsOnInternalRepo ? test : test.skip
const describeViaActionsOnly = runningActionsOnInternalRepo ? describe : describe.skip

module.exports = {
  testViaActionsOnly,
  describeViaActionsOnly
}
