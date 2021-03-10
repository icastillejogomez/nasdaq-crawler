import fs from 'fs'
import path from 'path'

export default async function (filename, content) {
  fs.writeFileSync(path.join( 'symbols', `${filename}.json`), JSON.stringify(content, null, 2))
}