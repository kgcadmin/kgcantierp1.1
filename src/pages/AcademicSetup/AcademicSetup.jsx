import React, { useContext, useState } from 'react';
import { Book, Grid, Layers, Building2, Plus } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './AcademicSetup.module.css';

const AcademicSetup = () => {
  const { departments, categories, degrees, subjects, addAcademicEntry, currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('departments');

  const handleAddEntry = () => {
    if (activeTab === 'departments') {
      const name = window.prompt("Enter Department Name:");
      const head = window.prompt("Enter Head of Department:");
      if (name && head) addAcademicEntry('departments', { name, head });
    } else if (activeTab === 'categories') {
      const name = window.prompt("Enter Category Name:");
      if (name) addAcademicEntry('categories', { name });
    } else if (activeTab === 'degrees') {
      const name = window.prompt("Enter Degree Name:");
      const categoryId = window.prompt("Enter Category ID (e.g., CAT01):");
      const departmentId = window.prompt("Enter Department ID (e.g., DPT01):");
      if (name && categoryId && departmentId) addAcademicEntry('degrees', { name, categoryId, departmentId });
    } else if (activeTab === 'subjects') {
      const name = window.prompt("Enter Subject Name:");
      const code = window.prompt("Enter Subject Code:");
      const credits = window.prompt("Enter Credits:");
      if (name && code && credits) addAcademicEntry('subjects', { name, code, credits: Number(credits), syllabus: 'New Syllabus', books: 'New Books' });
    }
  };

  return (
    <div className={styles.setupPage}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>Academic Setup</h1>
            <p className={styles.subtitle}>Centralized management of departments, categories, degrees, and subjects.</p>
          </div>
          {currentUser?.role !== 'Management' && (
            <button onClick={handleAddEntry} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={18} /> Add Entry
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${activeTab === 'departments' ? styles.active : ''}`} onClick={() => setActiveTab('departments')}>
          <Building2 size={18} /> Departments
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}>
          <Grid size={18} /> Categories
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'degrees' ? styles.active : ''}`} onClick={() => setActiveTab('degrees')}>
          <Layers size={18} /> Degrees
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'subjects' ? styles.active : ''}`} onClick={() => setActiveTab('subjects')}>
          <Book size={18} /> Subjects
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'departments' && (
          <Card className={styles.dataCard}>
            <h2 className={styles.sectionTitle}>Departments</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Head of Department</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.head}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'categories' && (
          <Card className={styles.dataCard}>
            <h2 className={styles.sectionTitle}>Course Categories</h2>
            <ul className={styles.list}>
              {categories.map(c => (
                <li key={c.id} className={styles.listItem}>
                  <span className={styles.idBadge}>{c.id}</span>
                  <span className={styles.itemName}>{c.name}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {activeTab === 'degrees' && (
          <Card className={styles.dataCard}>
            <h2 className={styles.sectionTitle}>Degrees Map</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Degree ID</th>
                  <th>Name</th>
                  <th>Category ID</th>
                  <th>Department ID</th>
                </tr>
              </thead>
              <tbody>
                {degrees.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.categoryId}</td>
                    <td>{d.departmentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'subjects' && (
          <div className={styles.grid}>
            {subjects.map(s => (
              <Card key={s.id} className={styles.subjectCard}>
                <div className={styles.subjectHeader}>
                  <span className={styles.subjectCode}>{s.code}</span>
                  <span className={styles.creditsBadge}>{s.credits} Credits</span>
                </div>
                <h3 className={styles.subjectName}>{s.name}</h3>
                <div className={styles.subjectDetails}>
                  <strong>Syllabus:</strong>
                  <p>{s.syllabus}</p>
                  <strong>Books:</strong>
                  <p>{s.books}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicSetup;
