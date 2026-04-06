import React from 'react';
import styles from '../styles/FilterSidebar.module.css';

interface FilterSidebarProps {
  filters: {
    budget: string;
    specializations: string[];
    portability: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    budget: string;
    specializations: string[];
    portability: string;
  }>>;
  onReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, onReset }) => {
  const handleSpecializationChange = (spec: string) => {
    const updated = filters.specializations.includes(spec)
      ? filters.specializations.filter(s => s !== spec)
      : [...filters.specializations, spec];
    setFilters({ ...filters, specializations: updated });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Budget Range</h3>
        <select 
          className={styles.select} 
          value={filters.budget}
          onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
        >
          <option value="all">All Budgets</option>
          <option value="entry">Under ₱30,000</option>
          <option value="mid">₱30,000 - ₱50,000</option>
          <option value="high">₱50,000 - ₱80,000</option>
          <option value="premium">Over ₱80,000</option>
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Specialization</h3>
        <div className={styles.checkboxGroup}>
          {['Programming', 'Networking', 'Multimedia', 'Cybersecurity', 'Data Science'].map(spec => (
            <label key={spec} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={filters.specializations.includes(spec)}
                onChange={() => handleSpecializationChange(spec)}
              /> {spec}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Portability</h3>
        <div className={styles.radioGroup}>
          {['all', 'Lightweight', 'Balanced', 'High Performance'].map(p => (
            <label key={p} className={styles.radioLabel}>
              <input 
                type="radio" 
                name="portability" 
                checked={filters.portability === p}
                onChange={() => setFilters({ ...filters, portability: p })}
              /> {p === 'all' ? 'Any' : p}
            </label>
          ))}
        </div>
      </div>

      <button className={styles.resetBtn} onClick={onReset}>Reset Filters</button>
    </aside>
  );
};

export default FilterSidebar;
