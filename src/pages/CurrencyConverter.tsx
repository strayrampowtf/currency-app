import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrenciesWithChange } from '../services/cbrApi';
import type { Currency } from '../services/cbrApi';
import styles from './CurrencyConverter.module.css';

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCurrency, setFromCurrency] = useState<string>('RUB');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [amountFrom, setAmountFrom] = useState<string>('1');
  const [amountTo, setAmountTo] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrenciesWithChange()
      .then(data => {
        setCurrencies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load currencies:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || currencies.length === 0) return;

    const getRate = (code: string): number => {
      if (code === 'RUB') return 1;
      const currency = currencies.find(c => c.charCode === code);
      return currency ? currency.rate : 1;
    };

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);

    const amount = parseFloat(amountFrom);
    if (isNaN(amount)) {
      setAmountTo('');
      return;
    }

    const rubAmount = amount * fromRate;
    const result = rubAmount / toRate;
    setAmountTo(result.toFixed(4).replace(/\.?0+$/, ''));
  }, [fromCurrency, toCurrency, amountFrom, currencies, loading]);

  const handleSwap = () => {
    const tempFrom = fromCurrency;
    const tempAmount = amountFrom;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    setAmountFrom(amountTo || '0');
    setAmountTo(tempAmount);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Загрузка курсов...</p>
      </div>
    );
  }

  // Добавляем RUB в список, если его нет (его нет в API)
  const currencyOptions = currencies.map(c => c.charCode);
  if (!currencyOptions.includes('RUB')) {
    currencyOptions.unshift('RUB');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Конвертер валют</h1>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="number"
          step="any"
          value={amountFrom}
          onChange={(e) => setAmountFrom(e.target.value)}
          className={styles.input}
        />
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className={styles.select}
        >
          {currencyOptions.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSwap}
        className={styles.swapButton}
        aria-label="Поменять валюты местами"
      >
        ⇄
      </button>

      <div className={styles.inputGroup}>
        <input
          type="text"
          value={amountTo}
          readOnly
          className={styles.input}
        />
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className={styles.select}
        >
          {currencyOptions.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CurrencyConverter;