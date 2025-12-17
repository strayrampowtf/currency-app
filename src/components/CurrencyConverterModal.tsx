import React, { useState, useEffect } from 'react';
import { fetchCurrenciesWithChange } from '../services/cbrApi';
import type { Currency } from '../services/cbrApi';
import styles from './CurrencyConverterModal.module.css';

const CurrencyConverterModal = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('RUB');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [amountFrom, setAmountFrom] = useState<string>('1');
  const [amountTo, setAmountTo] = useState<string>('');

  useEffect(() => {
    fetchCurrenciesWithChange().then(setCurrencies);
  }, []);

  useEffect(() => {
    if (currencies.length === 0) return;

    const getRate = (code: string): number => {
      if (code === 'RUB') return 1;
      return currencies.find(c => c.charCode === code)?.rate || 1;
    };

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);
    const amount = parseFloat(amountFrom) || 0;
    const result = (amount * fromRate) / toRate;

    setAmountTo(isNaN(result) ? '' : result.toFixed(4).replace(/\.?0+$/, ''));
  }, [fromCurrency, toCurrency, amountFrom, currencies]);

  const handleSwap = () => {
    const tempFrom = fromCurrency;
    const tempAmount = amountFrom;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    setAmountFrom(amountTo || '0');
    setAmountTo(tempAmount);
  };

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

export default CurrencyConverterModal;