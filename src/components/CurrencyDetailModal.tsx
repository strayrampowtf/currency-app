import React, { useEffect, useState } from 'react';
import type { Currency, HistoricalRate } from '../services/cbrApi';
import { fetchHistoricalRates } from '../services/cbrApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './CurrencyDetailModal.module.css';

interface CurrencyDetailModalProps {
  currency: Currency;
}

const CurrencyDetailModal = ({ currency }: CurrencyDetailModalProps) => {
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '365'>('7');

  useEffect(() => {
    if (currency.charCode === 'RUB') {
      setHistoricalData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const days = parseInt(period, 10);
    fetchHistoricalRates(currency.charCode, days)
      .then(data => {
        setHistoricalData(data);
        setLoading(false);
      })
      .catch(() => {
        setHistoricalData([]);
        setLoading(false);
      });
  }, [currency.charCode, period]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Детали валюты</h1>
      </div>

      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Код:</span>
        <span className={styles.infoValue}>{currency.charCode}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Название:</span>
        <span className={styles.infoValue}>{currency.name}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Курс к RUB:</span>
        <span className={styles.infoValue}>{currency.rate.toFixed(4)}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>За {currency.nominal} {currency.charCode}:</span>
        <span className={styles.infoValue}>{currency.value.toFixed(4)} RUB</span>
      </div>

      {currency.charCode === 'RUB' ? (
        <p className={styles.error}>График недоступен для рубля</p>
      ) : (
        <>
          <div className={styles.periodSelector}>
            <button
              className={`${styles.periodButton} ${period === '7' ? styles.active : ''}`}
              onClick={() => setPeriod('7')}
            >
              Неделя
            </button>
            <button
              className={`${styles.periodButton} ${period === '30' ? styles.active : ''}`}
              onClick={() => setPeriod('30')}
            >
              Месяц
            </button>
            <button
              className={`${styles.periodButton} ${period === '365' ? styles.active : ''}`}
              onClick={() => setPeriod('365')}
            >
              Год
            </button>
          </div>

          {loading ? (
            <p className={styles.loading}>Загрузка графика...</p>
          ) : historicalData.length > 0 ? (
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#AAAAAA', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#AAAAAA', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(4)} RUB`, 'Курс']}
                    labelFormatter={(label) => `Дата: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1C1C1E',
                      borderColor: '#333',
                      color: '#FFFFFF',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#007AFF"
                    dot={{ r: 2, fill: '#007AFF' }}
                    activeDot={{ r: 5, fill: '#007AFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={styles.error}>Исторические данные недоступны</p>
          )}
        </>
      )}
    </div>
  );
};

export default CurrencyDetailModal;