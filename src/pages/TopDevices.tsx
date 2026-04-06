import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FilterSidebar from '../components/FilterSidebar';
import DeviceCard, { Device } from '../components/DeviceCard';
import deviceData from '../data/devices.json';
import styles from '../styles/TopDevices.module.css';

const TopDevices: React.FC = () => {
  const [filters, setFilters] = useState({
    budget: 'all',
    specializations: [] as string[],
    portability: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Read search query from URL
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  const filteredDevices = useMemo(() => {
    return (deviceData as any[]).filter(device => {
      // 0. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = device.name.toLowerCase().includes(query);
        const matchesBrand = device.brand.toLowerCase().includes(query);
        const matchesCategory = device.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }

      // 1. Budget Filter
      if (filters.budget !== 'all') {
        const price = device.price;
        if (filters.budget === 'entry' && price > 30000) return false;
        if (filters.budget === 'mid' && (price < 30000 || price > 50000)) return false;
        if (filters.budget === 'high' && (price < 50000 || price > 80000)) return false;
        if (filters.budget === 'premium' && price < 80000) return false;
      }

      // 2. Specialization Filter
      if (filters.specializations.length > 0) {
        if (!filters.specializations.includes(device.category)) return false;
      }

      // 3. Portability Filter
      if (filters.portability !== 'all') {
        if (device.portability !== filters.portability) return false;
      }

      return true;
    }).map(d => ({
      ...d,
      specs: {
        cpu: d.specs.cpu,
        ram: `${d.specs.ram}GB`,
        storage: `${d.specs.storage}GB SSD`,
        gpu: d.specs.gpu
      }
    }));
  }, [filters, searchQuery]);

  const handleReset = () => {
    setFilters({ budget: 'all', specializations: [], portability: 'all' });
    setSearchQuery('');
    window.history.pushState({}, '', '/top-devices');
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.title}>Top Recommended Devices</h1>
            {searchQuery && (
              <div className={styles.searchBadge}>
                Search: "{searchQuery}" <button onClick={() => setSearchQuery('')}>&times;</button>
              </div>
            )}
          </div>
          <p className={styles.subtitle}>
            Showing {filteredDevices.length} hand-picked laptops for your academic journey.
          </p>
        </header>

        <div className={styles.contentLayout}>
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            onReset={handleReset} 
          />
          <div className={styles.deviceGrid}>
            {filteredDevices.length > 0 ? (
              filteredDevices.map(device => (
                <DeviceCard key={device.id} device={device} />
              ))
            ) : (
              <div className={styles.noResults}>
                <h3>No devices match your search or filters.</h3>
                <p>Try adjusting your search terms or filters.</p>
                <button onClick={handleReset} className={styles.resetBtnInline}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer>
        <div className="footer-content">
          <p>&copy; 2026 Web-Based Device Selection Platform for IT Students. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TopDevices;
