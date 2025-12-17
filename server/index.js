// server/index.js
const express = require('express');
const cors = require('cors');
const cbrService = require('./services/cbrService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/rates', async (req, res) => {
  try {
    const rates = await cbrService.getCurrentRates();
    res.json(rates);
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error.message);
    res.status(500).json({ error: 'Не удалось загрузить курсы' });
  }
});

app.get('/api/rates/history/:code/:days', async (req, res) => {
  try {
    const { code, days } = req.params;
    const numDays = Math.min(parseInt(days, 10), 365);
    const history = await cbrService.getHistoricalRatesForCurrency(code, numDays);
    res.json(history);
  } catch (error) {
    console.error('Ошибка загрузки истории:', error.message);
    res.status(500).json({ error: 'Не удалось загрузить историю' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Бэкенд работает. Источник: exchangerate.host (реальные данные ECB)' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});