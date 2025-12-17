// server/services/cbrService.js
const axios = require('axios');
const xml2js = require('xml2js');
const iconv = require('iconv-lite');

const formatDateForCBR = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const fetchXmlFromCBR = async (date = null, retries = 3) => {
  let url = 'https://www.cbr.ru/scripts/XML_daily.asp';
  if (date) {
    const cbrDate = formatDateForCBR(date);
    url += `?date_req=${cbrDate}`;
  }

  const headers = {
    'Accept': 'text/xml, application/xml, */*',
    'Accept-Language': 'ru,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Cache-Control': 'no-cache',
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers,
      });
      const xml = iconv.decode(response.data, 'win1251');
      return xml;
    } catch (error) {
      if (i === retries - 1) {
        throw new Error(`Не удалось получить данные от ЦБ РФ: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const parseXml = async (xml) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      attrkey: '$',
    });
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(new Error('Ошибка парсинга XML'));
        return;
      }
      if (!result?.ValCurs?.Valute) {
        reject(new Error('XML не содержит данных о валютах'));
        return;
      }
      const valutes = Array.isArray(result.ValCurs.Valute)
        ? result.ValCurs.Valute
        : [result.ValCurs.Valute];
      const currencies = valutes.map(v => ({
        id: v.$.ID || '',
        numCode: v.NumCode || '',
        charCode: v.CharCode || '',
        nominal: parseInt(v.Nominal, 10) || 1,
        name: v.Name || '',
        value: parseFloat((v.Value || '0').replace(',', '.')),
      }));
      resolve(currencies);
    });
  });
};

async function getCurrentRates() {
  const xml = await fetchXmlFromCBR();
  const currencies = await parseXml(xml);
  // Обогащаем rate — это и есть курс к RUB
  return currencies.map(c => ({ ...c, rate: c.value / c.nominal }));
}

async function getHistoricalRatesForCurrency(charCode, daysBack) {
  const today = new Date();
  const history = [];
  let added = 0;
  let daysChecked = 0;

  while (added < daysBack && daysChecked < daysBack * 3) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysChecked);
    daysChecked++;

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // выходные

    try {
      const xml = await fetchXmlFromCBR(date);
      const currencies = await parseXml(xml);
      const target = currencies.find(c => c.charCode === charCode);
      if (target) {
        const isoDate = date.toISOString().split('T')[0];
        // КУРС УЖЕ В RUB — НЕ НУЖЕН RUB КАК ОТДЕЛЬНАЯ ВАЛЮТА
        const rate = target.value / target.nominal;
        history.push({ date: isoDate, rate: parseFloat(rate.toFixed(4)) });
        added++;
      }
    } catch (e) {
      // Пропускаем ошибки
    }
  }

  return history.reverse();
}

module.exports = {
  getCurrentRates,
  getHistoricalRatesForCurrency,
};