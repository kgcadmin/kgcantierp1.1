import React, { useContext, useState } from 'react';
import { FileText, Download, UploadCloud, Folder, Trash2, X } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';

const Documents = () => {
  const { documents, addDocument, deleteDocument, currentUser } = useContext(AppContext);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', category: '', type: 'Upload', visibility: 'Public', studentId: '', file: null });

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0], title: uploadData.title || e.target.files[0].name });
    }
  };

  const submitUpload = (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.file) return alert('Please provide a title and select a file.');
    
    addDocument({
      title: uploadData.title,
      category: uploadData.category || 'General',
      type: uploadData.type,
      visibility: uploadData.visibility,
      studentId: uploadData.visibility === 'Student-Specific' ? uploadData.studentId : null,
      dateAdded: new Date().toISOString().split('T')[0],
      size: (uploadData.file.size / 1024).toFixed(1) + ' KB'
    });
    setShowUploadModal(false);
    setUploadData({ title: '', category: '', type: 'Upload', visibility: 'Public', studentId: '', file: null });
  };

  const visibleDocuments = documents.filter(d => {
    if (currentUser?.role === 'Student') {
      const isPublic = d.visibility === 'Public' || !d.visibility; // Mock data defaults to public
      const isMine = d.visibility === 'Student-Specific' && d.studentId === currentUser.linkedId;
      return isPublic || isMine;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Document Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Centralized repository for certificates, templates, and student records.</p>
        </div>
        {currentUser?.role !== 'Student' && (
          <button onClick={() => setShowUploadModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <UploadCloud size={18} /> Upload Document
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {['Template', 'Form', 'Upload'].map(categoryType => (
          <Card key={categoryType} style={{ padding: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <Folder size={20} color="var(--primary)" /> {categoryType}s
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visibleDocuments.filter(d => d.type === categoryType).map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={24} color="var(--text-tertiary)" />
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{doc.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {doc.category} • Added {doc.dateAdded} {doc.size ? `• ${doc.size}` : ''} {doc.visibility === 'Student-Specific' ? '• (Private)' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => window.open('#', '_blank')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Download">
                      <Download size={18} />
                    </button>
                    {currentUser?.role !== 'Student' && (
                      <button onClick={() => deleteDocument(doc.id)} style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {visibleDocuments.filter(d => d.type === categoryType).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>No documents found.</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem', width: '500px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={submitUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select File</label>
                <input type="file" required onChange={handleFileChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px dashed var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Document Title</label>
                <input type="text" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required placeholder="e.g. Admission Form 2026" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Category Type</label>
                  <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                    <option value="Upload">General Upload</option>
                    <option value="Form">Form</option>
                    <option value="Template">Template</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tag/Label</label>
                  <input type="text" value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} placeholder="e.g. Financial" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Access & Visibility</label>
                <select value={uploadData.visibility} onChange={e => setUploadData({...uploadData, visibility: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', marginBottom: uploadData.visibility === 'Student-Specific' ? '0.75rem' : '0' }}>
                  <option value="Public">Public (All Students & Staff)</option>
                  <option value="Student-Specific">Private (Specific Student Record)</option>
                  <option value="Staff-Only">Internal (Staff Only)</option>
                </select>
                
                {uploadData.visibility === 'Student-Specific' && (
                  <input type="text" value={uploadData.studentId} onChange={e => setUploadData({...uploadData, studentId: e.target.value})} required placeholder="Enter Student ID (e.g. STU001)" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                )}
              </div>

              <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
                Upload & Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
