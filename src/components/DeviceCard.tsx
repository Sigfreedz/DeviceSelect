import React from 'react';
import styles from '../styles/DeviceCard.module.css';

export interface Device {
  id: number;
  name: string;
  image_url?: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
  };
  priceRange: string;
  badge: {
    text: string;
    type: 'value' | 'durable' | 'programming' | 'networking' | 'performance';
  };
}

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const badgeClass = styles[`badge${device.badge.type.charAt(0).toUpperCase() + device.badge.type.slice(1)}`];

  return (
    <div className={styles.card}>
      <div className={styles.imagePlaceholder}>
        {device.image_url ? (
          <img className={styles.deviceImage} src={device.image_url} alt={device.name} loading="lazy" />
        ) : (
          <span className={styles.laptopIcon}>💻</span>
        )}
        <div className={styles.badgeContainer}>
          <span className={`${styles.badge} ${badgeClass}`}>
            {device.badge.text}
          </span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.deviceName}>{device.name}</h3>
        
        <div className={styles.specsGrid}>
          <div className={styles.specItem}>
            <span className={styles.specIcon}>⚡</span>
            <span className={styles.specText}>{device.specs.cpu}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specIcon}>🧠</span>
            <span className={styles.specText}>{device.specs.ram}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specIcon}>💾</span>
            <span className={styles.specText}>{device.specs.storage}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specIcon}>🎮</span>
            <span className={styles.specText}>{device.specs.gpu}</span>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.priceLabel}>Price Range</span>
            <span className={styles.priceValue}>{device.priceRange}</span>
          </div>
          <button className={styles.viewSpecsBtn}>View Specs</button>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
