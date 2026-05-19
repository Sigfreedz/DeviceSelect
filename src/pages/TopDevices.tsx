import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FilterSidebar from '../components/FilterSidebar';
import DeviceCard from '../components/DeviceCard';
import deviceData from '../data/devices.json';
import { supabase } from '../lib/supabase';
import styles from '../styles/TopDevices.module.css';

type RawDevice = Record<string, any>;

type BadgeType = 'value' | 'durable' | 'programming' | 'networking' | 'performance';

interface TopDevice {
  id: number;
  name: string;
  brand: string;
  image_url?: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
  };
  price: number;
  category: string;
  portability: string;
  badge: { text: string; type: BadgeType };
  priceRange: string;
}

const getCategoryFromTrack = (device: RawDevice): string => {
  const scores = device.track_scores;
  if (!scores) return 'Programming';

  const entries = Object.entries(scores) as Array<[string, number]>;
  const top = entries.sort((a, b) => b[1] - a[1])[0]?.[0];

  switch (top) {
    case 'web_dev':
      return 'Programming';
    case 'networking':
      return 'Networking';
    case 'data':
      return 'Data Science';
    default:
      return 'Programming';
  }
};

const getPortabilityFromWeight = (device: RawDevice): string => {
  const weight = device.weight_kg;
  if (typeof weight !== 'number') return 'Balanced';
  if (weight <= 1.4) return 'Lightweight';
  if (weight <= 2.1) return 'Balanced';
  return 'High Performance';
};

const getBadgeForCategory = (category: string): { text: string; type: BadgeType } => {
  switch (category) {
    case 'Programming':
      return { text: 'Best for Programming', type: 'programming' } as const;
    case 'Networking':
      return { text: 'Best for Networking', type: 'networking' } as const;
    case 'Cybersecurity':
      return { text: 'Most Durable', type: 'durable' } as const;
    case 'Multimedia':
    case 'Data Science':
      return { text: 'High Performance', type: 'performance' } as const;
    default:
      return { text: 'Best Value', type: 'value' } as const;
  }
};

const formatPriceRange = (price: number) => `₱${price.toLocaleString()}`;

const normalizeBadgeType = (value: unknown): BadgeType => {
  switch (value) {
    case 'value':
    case 'durable':
    case 'programming':
    case 'networking':
    case 'performance':
      return value;
    default:
      return 'value';
  }
};

const normalizeDevice = (device: RawDevice, fallbackId: number): TopDevice => {
  const name = String(device.name ?? 'Unknown Device');
  const brand = String(device.brand ?? 'Unknown');
  const price = device.price ?? device.price_php ?? 0;
  const category = device.category ?? getCategoryFromTrack(device);
  const portability = device.portability ?? getPortabilityFromWeight(device);
  const badge = device.badge
    ? { text: device.badge.text ?? 'Best Value', type: normalizeBadgeType(device.badge.type) }
    : getBadgeForCategory(category);
  const rawId = device.id ?? device.device_id ?? fallbackId;
  const id = typeof rawId === 'number' ? rawId : Number(rawId) || fallbackId;

  const specs = device.specs ?? {
    cpu: device.cpu ?? device.processor ?? 'Unknown CPU',
    ram: device.ram_gb ?? device.ram ?? 0,
    storage: device.storage_gb ?? device.storage ?? 0,
    gpu: device.gpu ?? (typeof device.has_gpu === 'boolean' ? (device.has_gpu ? 'Dedicated GPU' : 'Integrated GPU') : 'Unknown GPU')
  };

  const storageLabel = specs.storage ? `${specs.storage}GB${device.storage_type ? ` ${device.storage_type}` : ' SSD'}` : 'Unknown Storage';
  const ramLabel = specs.ram ? `${specs.ram}GB` : 'Unknown RAM';

  return {
    id,
    name,
    brand,
    image_url: device.image_url ?? undefined,
    price,
    category,
    portability,
    badge,
    specs: {
      cpu: specs.cpu,
      ram: ramLabel,
      storage: storageLabel,
      gpu: specs.gpu
    },
    priceRange: device.priceRange ?? formatPriceRange(price)
  };
};

const TopDevices: React.FC = () => {
  const [devices, setDevices] = useState<RawDevice[]>(deviceData as RawDevice[]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase.from('devices').select('*');
        if (error) throw error;
        if (isMounted && data && data.length > 0) {
          setDevices(data as RawDevice[]);
        }
      } catch (error: any) {
        if (isMounted) {
          setLoadError(error?.message || 'Unable to load Supabase devices.');
          setDevices(deviceData as RawDevice[]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDevices = useMemo(() => {
    return devices.map((device, index) => normalizeDevice(device, index + 1)).filter(device => {
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
    });
  }, [devices, filters, searchQuery]);

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
          {loading && <p className={styles.subtitle}>Loading devices from Supabase...</p>}
          {loadError && <p className={styles.subtitle}>Using local data: {loadError}</p>}
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
