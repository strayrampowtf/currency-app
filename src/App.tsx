import React from 'react';
import CurrencyList from './pages/CurrencyList';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <div className="App">
      <OfflineIndicator />
      <CurrencyList />
    </div>
  );
}

export default App;