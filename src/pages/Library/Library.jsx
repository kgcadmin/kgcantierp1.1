import React, { useContext, useState } from 'react';
import { Search, Book, Bookmark, BookOpen, Plus, Trash2, X, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import ModuleGuide from '../../components/ModuleGuide';

const Library = () => {
  const { library, addLibraryBook, deleteLibraryBook, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showReports, setShowReports] = useState(false);

  const filteredLibrary = library.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' ? true : book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleGuide 
        role={currentUser?.role}
        adminText="Manage library inventory, track issued books, and handle reservations."
        staffText="Manage library inventory, track issued books, and handle reservations."
        studentText="Search the library catalog, view your issued books, and make reservations."
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Library Management (OPAC)</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Online Public Access Catalog and Circulation System.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentUser?.role !== 'Student' && (
            <button onClick={() => setShowAddBook(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={18} /> Add Book
            </button>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div className="responsive-grid-3">
        <Card onClick={() => setFilterStatus('All')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: filterStatus === 'All' ? '2px solid #388e3c' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
          <div style={{ color: '#388e3c' }}><Book size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Titles Available</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{library.length}</h2>
          </div>
        </Card>
        <Card onClick={() => setFilterStatus('Issued')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: filterStatus === 'Issued' ? '2px solid #f57c00' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
          <div style={{ color: '#f57c00' }}><BookOpen size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Currently Issued</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{library.filter(b => b.status === 'Issued').length}</h2>
          </div>
        </Card>
        <Card onClick={() => setFilterStatus('Reserved')} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: filterStatus === 'Reserved' ? '2px solid #1976d2' : '1px solid var(--border-light)', transition: 'border 0.2s' }}>
          <div style={{ color: '#1976d2' }}><Bookmark size={24} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Reservations</p>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{library.filter(b => b.status === 'Reserved').length}</h2>
          </div>
        </Card>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Search Catalog</h2>
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search by Title, Author, or ISBN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 0.5rem 0.5rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '0.75rem' }}>Title & Author</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>ISBN</th>
                <th style={{ padding: '0.75rem' }}>Location</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                {currentUser?.role !== 'Student' && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLibrary.map(book => (
                <tr key={book.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{book.title}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{book.author}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{book.category}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{book.isbn}</td>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>Shelf {book.shelf}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: book.status === 'Available' ? '#e8f5e9' : book.status === 'Issued' ? '#fff3e0' : '#e3f2fd',
                        color: book.status === 'Available' ? '#2e7d32' : book.status === 'Issued' ? '#e65100' : '#1976d2'
                      }}>
                        {book.status}
                      </span>
                      {book.dueDate && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Due: {book.dueDate}</span>}
                    </div>
                  </td>
                  {currentUser?.role !== 'Student' && (
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <button onClick={() => { if(window.confirm('Delete this book?')) deleteLibraryBook(book.id); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '0.5rem' }} title="Delete Book">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredLibrary.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No books found in the catalog matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddBook && (
        <div onClick={() => setShowAddBook(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.75rem', width: '400px', maxWidth: '90%', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Add New Book</h2>
              <button onClick={() => setShowAddBook(false)} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addLibraryBook({
                title: formData.get('title'),
                author: formData.get('author'),
                category: formData.get('category'),
                isbn: formData.get('isbn'),
                shelf: formData.get('shelf'),
                status: 'Available'
              });
              setShowAddBook(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'transparent', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                <input name="title" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Author</label>
                <input name="author" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>ISBN</label>
                  <input name="isbn" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Shelf/Location</label>
                  <input name="shelf" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                <select name="category" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                  <option value="Textbook">Textbook</option>
                  <option value="Reference">Reference</option>
                  <option value="Journal">Journal</option>
                  <option value="Fiction">Fiction</option>
                </select>
              </div>
              <button type="submit" style={{ padding: '0.875rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Save Book</button>
            </form>
          </div>
        </div>
      )}

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Library Book"
        data={library}
        columns={[
          { key: 'id', label: 'Book ID' },
          { key: 'title', label: 'Title' },
          { key: 'author', label: 'Author' },
          { key: 'isbn', label: 'ISBN' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: Array.from(new Set(library.map(b => b.status))).filter(Boolean).map(s => ({ value: s, label: s })) },
          { key: 'category', label: 'Category', options: Array.from(new Set(library.map(b => b.category))).filter(Boolean).map(c => ({ value: c, label: c })) }
        ]}
      />
    </div>
  );
};

export default Library;
