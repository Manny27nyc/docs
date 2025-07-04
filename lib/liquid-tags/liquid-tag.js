// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const fs = require('fs')
const path = require('path')
const Liquid = require('liquid')
const { paramCase } = require('change-case')

module.exports = class LiquidTag extends Liquid.Tag {
  constructor (template, tagName, param) {
    super()
    this.param = param
    this.tagName = tagName
    this.templatePath = path.join(__dirname, `../../includes/liquid-tags/${paramCase(this.constructor.name)}.html`)
    this.template = null
    return this
  }

  async render (context) {
    return this.parseTemplate(context)
  }

  async getTemplate () {
    if (!this.template) {
      this.template = await fs.promises.readFile(this.templatePath, 'utf8')
      this.template = this.template.replace(/\r/g, '')
    }

    return this.template
  }
}
