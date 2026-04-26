import React, { useContext, useState } from 'react';
import { Book, Grid, Layers, Building2, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './AcademicSetup.module.css';
import AddEntryModal from '../../components/AddEntryModal';

const AcademicSetup = () => {
  const { 
    departments, categories, degrees, subjects, addAcademicEntry, 
    deleteDepartment, deleteCategory, deleteDegree, deleteSubject,
    currentUser 
  } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('departments');
  const [showAddModal, setShowAddModal] = useState(false);

  const getFields = () => {
    switch (activeTab) {
      case 'departments':
        return [
          { name: 'name', label: 'Department Name', required: true, placeholder: 'e.g. Mechanical Engineering' },
          { name: 'head', label: 'Head of Department', required: true, placeholder: 'e.g. Dr. Sarah Jenkins' }
        ];
      case 'categories':
        return [
          { name: 'name', label: 'Category Name', required: true, placeholder: 'e.g. Postgraduate' }
        ];
      case 'degrees':
        return [
          { name: 'name', label: 'Degree Name', required: true, placeholder: 'e.g. M.Tech' },
          { name: 'categoryId', label: 'Category ID', required: true, placeholder: 'e.g. CAT01' },
          { name: 'departmentId', label: 'Department ID', required: true, placeholder: 'e.g. DPT01' }
        ];
      case 'subjects':
        return [
          { name: 'name', label: 'Subject Name', required: true, placeholder: 'e.g. Thermodynamics' },
          { name: 'code', label: 'Subject Code', required: true, placeholder: 'e.g. ME101' },
          { name: 'credits', label: 'Credits', type: 'number', required: true, placeholder: 'e.g. 4' }
        ];
      default:
        return [];
    }
  };

  const handleSave = (data) => {
    if (activeTab === 'subjects') {
      addAcademicEntry('subjects', { 
        ...data, 
        credits: Number(data.credits), 
        syllabus: 'New Syllabus defined', 
        books: 'Recommended textbook list' 
      });
    } else {
      addAcademicEntry(activeTab, data);
    }
    setShowAddModal(false);
  };

  return (
    <div className={`${styles.setupPage} page-animate`}>
      <div className={`${styles.header} mobile-stack`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Academic Setup</h1>
            <p className={styles.subtitle}>Centralized management of departments, categories, degrees, and subjects.</p>
          </div>
          {currentUser?.role !== 'Management' && (
            <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
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
            <div className="table-responsive">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department Name</th>
                    <th>Head of Department</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.name}</td>
                      <td>{d.head}</td>
                      <td>
                        <button className={styles.deleteBtn} onClick={() => deleteDepartment(d.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'categories' && (
          <Card className={styles.dataCard}>
            <h2 className={styles.sectionTitle}>Course Categories</h2>
            <ul className={styles.list}>
              {categories.map(c => (
                <li key={c.id} className={styles.listItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={styles.idBadge}>{c.id}</span>
                    <span className={styles.itemName}>{c.name}</span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => deleteCategory(c.id)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {activeTab === 'degrees' && (
          <Card className={styles.dataCard}>
            <h2 className={styles.sectionTitle}>Degrees Map</h2>
            <div className="table-responsive">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Degree ID</th>
                    <th>Name</th>
                    <th>Category ID</th>
                    <th>Department ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {degrees.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.name}</td>
                      <td>{d.categoryId}</td>
                      <td>{d.departmentId}</td>
                      <td>
                        <button className={styles.deleteBtn} onClick={() => deleteDegree(d.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'subjects' && (
          <div className={styles.grid}>
            {subjects.map(s => (
              <Card key={s.id} className={styles.subjectCard}>
                <div className={styles.subjectHeader}>
                  <span className={styles.subjectCode}>{s.code}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={styles.creditsBadge}>{s.credits} Credits</span>
                    <button className={styles.deleteBtnSmall} onClick={() => deleteSubject(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
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
            <Card className={styles.addCard} onClick={() => setShowAddModal(true)}>
              <Plus size={32} />
              <span>Add New Subject</span>
            </Card>
          </div>
        )}
      </div>

      <AddEntryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
        title={`Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
        fields={getFields()}
      />
    </div>
  );
};

export default AcademicSetup;
