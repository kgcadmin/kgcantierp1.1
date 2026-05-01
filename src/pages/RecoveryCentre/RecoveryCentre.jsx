import React, { useContext, useEffect, useState } from 'react';
import { RotateCcw, Trash2, ShieldAlert, Clock, Search, Filter } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Card from '../../components/Card/Card';
import ModuleGuide from '../../components/ModuleGuide';
import styles from './RecoveryCentre.module.css';

const RecoveryCentre = () => {
  const { recoveredItems, refreshRecoveryData, restoreItem, permanentDeleteItem, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    refreshRecoveryData();
  }, []);

  const calculateDaysRemaining = (deletedAt) => {
    const delDate = new Date(deletedAt);
    const expiryDate = new Date(delDate);
    expiryDate.setDate(delDate.getDate() + 90);
    
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredItems = recoveredItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.collectionName === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(recoveredItems.map(item => item.collectionName)));

  return (
    <div className={`${styles.recoveryPage} page-animate`}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Manage recently deleted institutional data. Items are kept for 90 days before permanent deletion."
      />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Recovery Centre</h1>
          <p className={styles.subtitle}>Manage recently deleted institutional data. Items are kept for 90 days.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', padding: '0 0.75rem' }}>
            <Search size={18} color="var(--text-tertiary)" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', padding: '0.75rem', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Modules</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Record Info</th>
                <th>Module</th>
                <th>Deleted On</th>
                <th>Auto-Delete In</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const daysLeft = calculateDaysRemaining(item.deletedAt);
                return (
                  <tr key={`${item.collectionName}-${item.id}`}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name || 'Unnamed Record'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {item.id}</div>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>{item.collectionName}</span>
                    </td>
                    <td>
                      <span className={styles.dateText}>{new Date(item.deletedAt).toLocaleDateString()}</span>
                      <span className={styles.timeText}>{new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td>
                      <div className={`${styles.countdown} ${daysLeft <= 10 ? styles.countdownWarning : ''}`}>
                        <Clock size={16} />
                        <span>{daysLeft} Days</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.restoreBtn}
                          onClick={() => {
                            if (window.confirm(`Restore this ${item.collectionName} record?`)) {
                              restoreItem(item.collectionName, item.id);
                            }
                          }}
                        >
                          <RotateCcw size={16} />
                          <span>Restore</span>
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => {
                            if (window.confirm(`PERMANENTLY delete this record? This cannot be undone.`)) {
                              permanentDeleteItem(item.collectionName, item.id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className={styles.emptyState}>
                      <ShieldAlert size={48} className={styles.emptyIcon} />
                      <h3>No Deleted Records Found</h3>
                      <p>When you delete data from modules, it will appear here for 90 days.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RecoveryCentre;
