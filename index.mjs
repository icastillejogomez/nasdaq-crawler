// Import modules
import async from 'async'

// Import utils
import getSymbolHistorical from './getSymbolHistorical.mjs'
import saveContentInFile from './saveContentInFile.mjs'

// Import symbol database
import symbols from './symbols.json'

const tickers = symbols.map((s) => s.symbol)
// const tickers = ['MSFT', 'AAPL', 'dsadas', 'NFLX']

async.mapLimit(tickers, 2,(ticker, next) => {
  console.log(`[$${ticker}] Descargando la cotización....`)
  let tries = 0
  let maxTries = 3
  let timeout = 1500

  const toDoFunc = async () => {
    getSymbolHistorical(ticker)
      .then((historical) => saveContentInFile(ticker, historical))
      .then(() => next())
      .catch((error) => {
        if (error.message === 'NOT_FOUND') {
          return next(null, {
            ticker,
            error: error.message,
            reason: 'Símbolo no encontrado'
          })
        }

        tries++

        if (tries > maxTries) return next(null, {
          ticker,
          error,
          reason: 'Max tries',
        })

        setTimeout(toDoFunc, Math.pow(timeout, tries / 2))
        console.log()
        console.log('No se han podido obtener las cotizaciones de ' + ticker + ' lo volveremso a intentar en ' + (Math.pow(timeout, tries / 2) / 1000) + 's.')
        console.error(error)
        
      })
  }

  setTimeout(toDoFunc, Math.pow(timeout, tries))
  
  
}, (error, results) => {
  if (error) throw error

  console.log('Los resultados son: ', JSON.stringify(results.filter(f => !!f), null, 2))

  saveContentInFile('results', results.filter(f => !!f))
    .then(() => {})
    .catch(error => { throw error })
})

