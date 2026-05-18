import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import deviceData from '../data/devices.json';
import { supabase } from '../lib/supabase';
import styles from '../styles/Compare.module.css';

type RawDevice = Record<string, any>;

interface Device {
  id: string;
  name: string;
  brand: string;
  specs: {
    cpu: string;
    ram: number;
    storage: number;
    gpu: string;
    display: string;
  };
  price: number;
  category: string;
  badge: { text: string; type: string };
}

const normalizeDevice = (device: RawDevice): Device => {
  const price = device.price ?? device.price_php ?? 0;
  const specs = device.specs ?? {
    cpu: device.cpu ?? device.processor ?? 'Unknown CPU',
    ram: device.ram_gb ?? device.ram ?? 0,
    storage: device.storage_gb ?? device.storage ?? 0,
    gpu: device.gpu ?? (typeof device.has_gpu === 'boolean' ? (device.has_gpu ? 'Dedicated GPU' : 'Integrated GPU') : 'Unknown GPU'),
    display: device.display ?? 'Unknown'
  };

  return {
    id: String(device.id ?? device.device_id ?? device.name ?? Math.random()),
    name: device.name ?? 'Unknown Device',
    brand: device.brand ?? 'Unknown',
    specs: {
      cpu: specs.cpu,
      ram: Number(specs.ram ?? 0),
      storage: Number(specs.storage ?? 0),
      gpu: specs.gpu,
      display: specs.display
    },
    price,
    category: device.category ?? 'General',
    badge: device.badge ?? { text: 'Best Value', type: 'value' }
  };
};

const Compare: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<RawDevice[]>(deviceData as RawDevice[]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const logComparisonClick = async (deviceId: string) => {
    if (!user?.id) return;
    const safeDeviceId = isUuid(deviceId) ? deviceId : null;
    const { error } = await supabase.from('interaction_logs').insert({
      user_id: user.id,
      event_type: 'comparison_click',
      device_id: safeDeviceId
    });
    if (error) {
      console.error('Unable to log comparison click:', error.message);
    }
  };

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

  const toggleDevice = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
      void logComparisonClick(id);
    }
  };

  const selectedDevices = useMemo(() => {
    return devices.map(normalizeDevice).filter(d => selectedIds.includes(d.id));
  }, [devices, selectedIds]);

  const allDevices = useMemo(() => devices.map(normalizeDevice), [devices]);

  // Find "best values" (e.g., lowest price, highest RAM)
  const bestValues = useMemo(() => {
    if (selectedDevices.length < 2) return {};
    return {
      price: Math.min(...selectedDevices.map(d => d.price)),
      ram: Math.max(...selectedDevices.map(d => d.specs.ram)),
      storage: Math.max(...selectedDevices.map(d => d.specs.storage)),
    };
  }, [selectedDevices]);

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Compare Devices</h1>
            <p className={styles.subtitle}>Select up to 3 devices to compare side-by-side.</p>
            {loading && <p className={styles.subtitle}>Loading devices from Supabase...</p>}
            {loadError && <p className={styles.subtitle}>Using local data: {loadError}</p>}
          </header>

          <div className={styles.selectionArea}>
            <h3 className={styles.sectionTitle}>Available Devices</h3>
            <div className={styles.devicePicker}>
              {allDevices.map(device => (
                <button 
                  key={device.id} 
                  className={`${styles.pickerItem} ${selectedIds.includes(device.id) ? styles.selected : ''}`}
                  onClick={() => toggleDevice(device.id)}
                  disabled={!selectedIds.includes(device.id) && selectedIds.length >= 3}
                >
                  <span className={styles.pickerName}>{device.brand} {device.name}</span>
                  <span className={styles.pickerPrice}>₱{device.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedDevices.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th className={styles.stickyCol}>Specification</th>
                    {selectedDevices.map(device => (
                      <th key={device.id} className={styles.deviceHeader}>
                        <div className={styles.deviceInfo}>
                          <span className={styles.brand}>{device.brand}</span>
                          <h3 className={styles.name}>{device.name}</h3>
                          <button 
                            className={styles.removeBtn} 
                            onClick={() => toggleDevice(device.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                    {/* Empty placeholders to maintain 3 columns */}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => (
                      <th key={`empty-${i}`} className={styles.emptyHeader}>
                        <div className={styles.placeholder}>Add device</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.specLabel}>CPU</td>
                    {selectedDevices.map(d => <td key={d.id}>{d.specs.cpu}</td>)}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-cpu-${i}`}>-</td>)}
                  </tr>
                  <tr>
                    <td className={styles.specLabel}>RAM</td>
                    {selectedDevices.map(d => (
                      <td key={d.id} className={d.specs.ram === (bestValues as any).ram ? styles.highlight : ''}>
                        {d.specs.ram}GB
                      </td>
                    ))}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-ram-${i}`}>-</td>)}
                  </tr>
                  <tr>
                    <td className={styles.specLabel}>Storage</td>
                    {selectedDevices.map(d => (
                      <td key={d.id} className={d.specs.storage === (bestValues as any).storage ? styles.highlight : ''}>
                        {d.specs.storage}GB SSD
                      </td>
                    ))}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-storage-${i}`}>-</td>)}
                  </tr>
                  <tr>
                    <td className={styles.specLabel}>GPU</td>
                    {selectedDevices.map(d => <td key={d.id}>{d.specs.gpu}</td>)}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-gpu-${i}`}>-</td>)}
                  </tr>
                  <tr>
                    <td className={styles.specLabel}>Price</td>
                    {selectedDevices.map(d => (
                      <td key={d.id} className={d.price === (bestValues as any).price ? styles.highlight : ''}>
                        ₱{d.price.toLocaleString()}
                      </td>
                    ))}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-price-${i}`}>-</td>)}
                  </tr>
                  <tr>
                    <td className={styles.specLabel}>Best For</td>
                    {selectedDevices.map(d => <td key={d.id}><span className={styles.badge}>{d.badge.text}</span></td>)}
                    {[...Array(3 - selectedDevices.length)].map((_, i) => <td key={`empty-best-${i}`}>-</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h3>No devices selected</h3>
              <p>Choose up to 3 devices from the list above to compare their specifications.</p>
            </div>
          )}
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

export default Compare;
