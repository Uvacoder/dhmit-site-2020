const fs = require('fs')
const path = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const cx = require('nanoclass')

module.exports = function(eleventyConfig) {
  eleventyConfig.addLiquidShortcode('webpackAsset', async (name) => {
    const manifestData = await readFile(
      path.resolve(__dirname, 'src/templates/includes/manifest.json'),
    )
    const manifest = JSON.parse(manifestData)

    return manifest[name]
  })

  eleventyConfig.addShortcode(
    'debug',
    (value) =>
      `<div class="ph25 pv100">
        <pre
          class="p25 f14 mono bg-blue tan"
          style="width: 100%; overflow: auto; border-radius: 6px;"
        >
          ${JSON.stringify(value, null, 2)}
        </pre>
      </div>`,
  )

  eleventyConfig.addShortcode('classNames', (...all) => cx(all))

  return {
    dir: {
      input: 'src/templates',
      data: '../data',
      includes: 'includes',
      output: 'build',
    },
  }
}
