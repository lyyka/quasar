const packageName = '@fortawesome/fontawesome-free'
const distName = 'fontawesome-v6'
const iconSetName = 'Fontawesome Free'
const prefix = 'fa'

// ------------

const glob = require('glob')
const { copySync } = require('fs-extra')
const { writeFileSync } = require('fs')
const { resolve, join } = require('path')

const skipped = []
const distFolder = resolve(__dirname, '../fontawesome-v6')
const { defaultNameMapper, extract, writeExports, copyCssFile } = require('./utils')

const svgFolder = resolve(__dirname, `../node_modules/${ packageName }/svgs/`)
const iconTypes = [ 'brands', 'regular', 'solid' ]
let iconNames = new Set()

const svgExports = []
const typeExports = []

iconTypes.forEach(type => {
  const svgFiles = glob.sync(svgFolder + `/${ type }/*.svg`)

  svgFiles.forEach(file => {
    const name = defaultNameMapper(file, prefix + type.charAt(0))

    if (iconNames.has(name)) {
      return
    }

    try {
      const { svgDef, typeDef } = extract(file, name)
      svgExports.push(svgDef)
      typeExports.push(typeDef)

      iconNames.add(name)
    }
    catch (err) {
      console.error(err)
      skipped.push(name)
    }
  })
})

iconNames = [ ...iconNames ]
svgExports.sort((a, b) => {
  return ('' + a).localeCompare(b)
})
typeExports.sort((a, b) => {
  return ('' + a).localeCompare(b)
})
iconNames.sort((a, b) => {
  return ('' + a).localeCompare(b)
})

writeExports(iconSetName, packageName, distFolder, svgExports, typeExports, skipped)

// then update webfont files

const webfont = [
  'fa-brands-400.ttf',
  'fa-brands-400.woff2',
  'fa-regular-400.ttf',
  'fa-regular-400.woff2',
  'fa-solid-900.ttf',
  'fa-solid-900.woff2',
  'fa-v4compatibility.ttf',
  'fa-v4compatibility.woff2'
]

webfont.forEach(file => {
  copySync(
    resolve(__dirname, `../node_modules/${ packageName }/webfonts/${ file }`),
    resolve(__dirname, `../fontawesome-v6/${ file }`)
  )
})

copyCssFile({
  from: resolve(__dirname, `../node_modules/${ packageName }/css/all.css`),
  to: resolve(__dirname, '../fontawesome-v6/fontawesome-v6.css'),
  replaceFn: content => content.replace(/\.\.\/webfonts/g, '\.')
})

copySync(
  resolve(__dirname, `../node_modules/${ packageName }/LICENSE.txt`),
  resolve(__dirname, '../fontawesome-v6/LICENSE.txt')
)

// write the JSON file
const file = resolve(__dirname, join('..', distName, 'icons.json'))
writeFileSync(file, JSON.stringify([ ...iconNames ].sort(), null, 2), 'utf-8')

console.log(`${ distName } done with ${ iconNames.length } icons`)
