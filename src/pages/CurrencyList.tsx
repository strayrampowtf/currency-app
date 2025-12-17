import React, { useEffect, useState } from 'react';
import type { CurrencyWithChange } from '../services/cbrApi';
import { fetchCurrenciesWithChange } from '../services/cbrApi';
import styles from './CurrencyList.module.css';
import ModalOverlay from '../components/ModalOverlay';
import CurrencyConverterModal from '../components/CurrencyConverterModal';
import CurrencyDetailModal from '../components/CurrencyDetailModal';

const POPULAR_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD'];

const CurrencyList = () => {
  const [allCurrencies, setAllCurrencies] = useState<CurrencyWithChange[]>([]);
  const [displayedCurrencies, setDisplayedCurrencies] = useState<CurrencyWithChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyWithChange | null>(null);

  const getFormattedDate = () => {
    const now = new Date();
    const day = now.getDate();
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${day} ${months[now.getMonth()]}`;
  };

  useEffect(() => {
    fetchCurrenciesWithChange()
      .then(data => {
        setAllCurrencies(data);
        const popular = data.filter(c => POPULAR_CODES.includes(c.charCode));
        setDisplayedCurrencies(popular);
        setLoading(false);
      })
      .catch(err => {
        setError('Не удалось загрузить курсы валют');
        setLoading(false);
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      const popular = allCurrencies.filter(c => POPULAR_CODES.includes(c.charCode));
      setDisplayedCurrencies(popular);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allCurrencies.filter(
        c => c.charCode.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)
      );
      setDisplayedCurrencies(filtered);
    }
  }, [searchTerm, allCurrencies]);

  const handleCurrencyClick = (currency: CurrencyWithChange) => {
    setSelectedCurrency(currency);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Загрузка курсов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Курсы валют</h1>
        <div className={styles.date}>{getFormattedDate()}</div>
      </div>

      <input
        type="text"
        placeholder="Поиск..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.search}
      />

      <div className={styles.currencyList}>
        {displayedCurrencies.map(currency => {
          const isPositive = currency.change24h >= 0;
          const changePercent = currency.change24hPercent;
          return (
            <div
              key={currency.charCode}
              className={styles.currencyItem}
              onClick={() => handleCurrencyClick(currency)}
            >
              <div className={styles.currencyInfo}>
                <div className={styles.currencyCode}>{currency.charCode}</div>
                <div className={styles.currencyName}>{currency.name}</div>
              </div>
              <div className={styles.rateSection}>
                <div className={styles.rate}>{currency.rate.toFixed(4)}</div>
                <div
                  className={`${styles.changeBox} ${
                    isPositive ? styles.changePositiveBg : styles.changeNegativeBg
                  }`}
                >
                  <span className={styles.changeValue}>
                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.bottomActions}>
        <button
          className={styles.bottomButton}
          onClick={() => setIsConverterOpen(true)}
        >
          Конвертер валют
        </button>
      </div>

      {/* Модалка конвертера */}
      <ModalOverlay
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
      >
        <CurrencyConverterModal />
      </ModalOverlay>

      {/* Модалка деталей валюты */}
      <ModalOverlay
        isOpen={!!selectedCurrency}
        onClose={() => setSelectedCurrency(null)}
      >
        {selectedCurrency && (
          <CurrencyDetailModal currency={selectedCurrency} />
        )}
      </ModalOverlay>
    </div>
  );
};

export default CurrencyList;