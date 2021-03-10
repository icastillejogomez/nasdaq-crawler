import axios from 'axios'

const todate = new Date().toISOString().split('T')[0]
const fromdate = '2000-03-06'

async function getSymbolHistorical(ticker, limit) {
  const { data, status } = await axios({
    method: 'GET',
    baseURL: 'https://api.nasdaq.com/api',
    url: `/quote/${ticker}/historical`,
    params: {
      todate,
      fromdate,
      assetclass: 'stocks',
      limit,
    }
  })

  const { data: historical, message, status: nasdaqStatus } = data

  
  if (nasdaqStatus.bCodeMessage && nasdaqStatus.bCodeMessage[0].code === 1001) {
    throw new Error('NOT_FOUND')
  }

  if (status < 200 || status >= 300) throw new Error(`Fallo en la petición al servidor con status ${status} para el símbolo ${ticker}`)
  if (nasdaqStatus.rCode < 200 || nasdaqStatus.rCode >= 300) throw new Error(`Fallo en la petición al servidor con nasdaq status ${nasdaqStatus.rCode} para el símbolo ${ticker}: ${nasdaqStatus.bCodeMessage[0].errorMessage}`)

  // if (!historical) throw new Error(`No hay datos históricos para el símbolo ${ticker}`)
  if (!historical) throw {
    status,
    serverMessage: message,
    nasdaqError: nasdaqStatus.bCodeMessage ? nasdaqStatus.bCodeMessage[0] : nasdaqStatus.rCode,
    developerMessage: nasdaqStatus.developerMessage,
  }

  return historical
}

// https://api.nasdaq.com/api/quote/:ticker/historical?assetclass=stocks&fromdate=2000-03-06&limit=2&todate=2021-03-06

export default async function (ticker) {
  const preHistorical = await getSymbolHistorical(ticker, 1)
  const historical = await getSymbolHistorical(ticker, preHistorical.totalRecords)
  return historical
}