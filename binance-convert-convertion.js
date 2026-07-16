const crypto = require('crypto');
const axios = require('axios');


const apiKey = 'API_KEY_BINANCE';
const apiSecret = 'API_SECRET_BINANCE';
const BASE_URL = 'https://api.binance.com';

function sign(params, secret) {
  const query = new URLSearchParams(params).toString();
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

async function realizarConversion() {
  try {
    const now = Date.now();

    const quoteParams = {
      fromAsset: 'USDT',  // USDT or BTC 
      toAsset: 'BTC',     // BTC or USDT
      fromAmount: '0.04000000', // Value of USDT or BTC when converting USDT to BTC and vice verse, example BTC: 0.00000074
      timestamp: now,
      recvWindow: 5000,
    };

    const quoteSignature = sign(quoteParams, apiSecret);
    const quoteQuery = new URLSearchParams({ ...quoteParams, signature: quoteSignature }).toString();

    console.log('Solicitando cotización...');
    const quoteResponse = await axios.post(
      `${BASE_URL}/sapi/v1/convert/getQuote?${quoteQuery}`,
      null,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    console.log('Cotización recibida:', quoteResponse.data);

    const quoteId = quoteResponse.data.quoteId;
    if (!quoteId) {
      console.error('No se recibió quoteId.');
      return;
    }

    const acceptParams = {
      quoteId,
      timestamp: Date.now(),
      recvWindow: 5000,
    };

    const acceptSignature = sign(acceptParams, apiSecret);
    const acceptQuery = new URLSearchParams({ ...acceptParams, signature: acceptSignature }).toString();

    console.log('Aceptando cotización y ejecutando conversión...');
    const acceptResponse = await axios.post(
      `${BASE_URL}/sapi/v1/convert/acceptQuote?${acceptQuery}`,
      null,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    console.log('Conversión ejecutada:', acceptResponse.data);
  } catch (error) {
    console.error('Error en la transacción:');
    console.error(error.response?.data || error.message);
  }
}

realizarConversion();
