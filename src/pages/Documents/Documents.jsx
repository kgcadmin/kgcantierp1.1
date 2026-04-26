import React, { useContext, useState, useEffect } from 'react';
import { FileText, Download, UploadCloud, Folder, Trash2, X, Search, Users } from 'lucide-react';
import { api } from '../../utils/api';
import Card from '../../components/Card/Card';
import { AppContext, fileStore } from '../../context/AppContext';

const Documents = () => {
  const { documents, addDocument, deleteDocument, currentUser } = useContext(AppContext);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [uploadData, setUploadData] = useState({ title: '', category: '', type: 'General', visibility: 'Public', studentId: '', file: null });

  const [showPreview, setShowPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const handlePreview = (doc) => {
    // Check if we have the actual file in memory
    const file = fileStore.get(doc.id);
    if (file) {
      const url = URL.createObjectURL(file);
      setShowPreview({ ...doc, fileUrl: url });
    } else if (doc.fileUrl && doc.fileUrl.length > 5 && doc.fileUrl !== '/') {
      // Basic check to ensure it's a real path like /uploads/... and not just /
      setShowPreview(doc);
    } else {
      showToast('File not found or not yet synced to server');
    }
  };

  // Auto-open document preview if ?doc=ID is in the URL — runs once on mount only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('doc');
    if (!docId) return;
    // Wait until documents are loaded
    if (documents.length === 0) return;
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setShowPreview(doc.fileUrl ? doc : { ...doc });
      // Clean URL
      window.history.replaceState({}, '', '/documents');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]);

  const categories = ['All', 'Template', 'Form', 'Academic', 'Financial', 'Personal'];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getMimeType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadData({ ...uploadData, file, url, title: uploadData.title || file.name });
    }
  };

  const submitUpload = (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.file) return alert('Please provide a title and select a file.');
    
    const extension = uploadData.file.name.split('.').pop();
    const finalTitle = uploadData.title.includes('.') ? uploadData.title : `${uploadData.title}.${extension}`;
    const docId = `DOC${Date.now()}`;

    fileStore.set(docId, uploadData.file); // Keep local cache for instant preview

    const shouldUpload = import.meta.env.PROD || import.meta.env.VITE_API_URL;

    if (shouldUpload) {
      api.upload(uploadData.file).then(res => {
        if (res && res.success) {
          addDocument({
            id: docId,
            title: finalTitle,
            category: uploadData.category || 'General',
            type: uploadData.type,
            visibility: uploadData.visibility,
            studentId: uploadData.visibility === 'Student-Specific' ? uploadData.studentId : null,
            dateAdded: new Date().toISOString().split('T')[0],
            size: (uploadData.file.size / 1024).toFixed(1) + ' KB',
            fileUrl: res.url, // Standard relative path from server
            fileType: res.mimetype || uploadData.file.type
          });
          showToast('Document uploaded successfully!');
        } else {
          throw new Error(res?.message || 'Server rejected the file');
        }
      }).catch(err => {
        console.error('Upload Error:', err);
        showToast(`Upload failed: ${err.message}`);
      });
    } else {
      // Local mode
      addDocument({
        id: docId,
        title: finalTitle,
        category: uploadData.category || 'General',
        type: uploadData.type,
        visibility: uploadData.visibility,
        studentId: uploadData.visibility === 'Student-Specific' ? uploadData.studentId : null,
        dateAdded: new Date().toISOString().split('T')[0],
        size: (uploadData.file.size / 1024).toFixed(1) + ' KB',
        fileUrl: URL.createObjectURL(uploadData.file),
        fileType: uploadData.file.type
      });
      showToast('Saved to local session.');
    }
    setShowUploadModal(false);
    setUploadData({ title: '', category: '', type: 'General', visibility: 'Public', studentId: '', file: null });
  };

  const filteredDocuments = documents?.filter(d => {
    if (!d) return false;
    const title = (d.title || '').toLowerCase();
    const category = (d.category || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || d.type === activeCategory || d.category === activeCategory;
    
    let isVisible = true;
    if (currentUser?.role === 'Student') {
      const isPublic = d.visibility === 'Public' || !d.visibility;
      const isMine = d.visibility === 'Student-Specific' && d.studentId === currentUser.linkedId;
      isVisible = isPublic || isMine;
    }

    return matchesSearch && matchesCategory && isVisible;
  }) || [];


  const handleDownload = async (doc) => {
    const file = fileStore.get(doc.id);
    if (file) {
      if (window.showSaveFilePicker) {
        try {
          const ext = file.name.split('.').pop();
          const handle = await window.showSaveFilePicker({
            suggestedName: doc.title,
            types: [{ description: 'File', accept: { [file.type || 'application/octet-stream']: [`.${ext}`] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(file);
          await writable.close();
          showToast('File saved successfully!');
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      showToast('File opened — use Ctrl+S to save');
    } else if (doc.fileUrl) {
      // Ensure relative URLs are correctly opened
      const fullUrl = doc.fileUrl.startsWith('http') ? doc.fileUrl : `${window.location.origin}${doc.fileUrl}`;
      window.open(fullUrl, '_blank');
      showToast('Opening file...');
    } else {
      showToast('No file available for download');
    }
  };

  const handleDeleteWithCleanup = (id) => {
    fileStore.delete(id);
    deleteDocument(id);
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Document Hub</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Secure storage for institutional records and academic resources.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            />
          </div>
          {currentUser?.role !== 'Student' && (
            <button 
              onClick={() => setShowUploadModal(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer', 
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--primary-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              <UploadCloud size={18} /> Upload
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }} className="mobile-stack">
        {/* Sidebar Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>Categories</h3>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activeCategory === cat ? 'var(--primary-light)' : 'transparent',
                color: activeCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: activeCategory === cat ? 600 : 500,
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Folder size={18} /> {cat}
            </button>
          ))}
        </div>

        {/* Document Library Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ padding: '0' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    <th style={{ padding: '1rem' }}>Document Name</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Size</th>
                    <th style={{ padding: '1rem' }}>Date Added</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ padding: '0.5rem', background: 'var(--bg-base)', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{doc.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{doc.visibility === 'Public' ? 'Public' : 'Restricted'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', background: 'var(--surface-hover)', borderRadius: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {doc.type || doc.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{doc.size || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{doc.dateAdded}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handlePreview(doc)} style={{ padding: '0.6rem', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.5rem', transition: 'all 0.2s' }} className="icon-button-hover" title="Preview">
                            <FileText size={18} />
                          </button>
                          <button onClick={() => handleDownload(doc)} style={{ padding: '0.6rem', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.5rem', transition: 'all 0.2s' }} className="icon-button-hover" title="Download">
                            <Download size={18} />
                          </button>
                          {currentUser?.role !== 'Student' && (
                            <button 
                              onClick={() => handleDeleteWithCleanup(doc.id)} 
                              style={{ padding: '0.6rem', background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: '#ef4444', cursor: 'pointer', borderRadius: '0.5rem', transition: 'all 0.2s' }} 
                              onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = '#ef4444'; }}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Folder size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>No documents found in this view.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <Card style={{ width: '550px', maxWidth: '100%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Upload New Document</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={submitUpload} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '0.75rem', 
                padding: '2rem', 
                textAlign: 'center',
                background: 'var(--bg-base)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <UploadCloud size={40} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Click or drag file to upload</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PDF, JPG, PNG or DOCX (Max 10MB)</div>
                <input type="file" required onChange={handleFileChange} style={{ position: 'absolute', opacity: 0, cursor: 'pointer', height: '0', width: '0' }} id="file-upload" />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block', marginTop: '1rem', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>Browse Files</label>
                {uploadData.file && <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--primary-light)', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>{uploadData.file.name}</div>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Document Title</label>
                <input type="text" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required placeholder="e.g. Admission Form 2026" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Main Type</label>
                  <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                    <option value="General">General</option>
                    <option value="Form">Official Form</option>
                    <option value="Template">Template</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Specific Label</label>
                  <input type="text" value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} placeholder="e.g. Scholarship" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>Access & Privacy</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <select value={uploadData.visibility} onChange={e => setUploadData({...uploadData, visibility: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    <option value="Public">Public (Visible to All)</option>
                    <option value="Student-Specific">Private (Student ID Required)</option>
                    <option value="Staff-Only">Internal (Staff/Admin Only)</option>
                  </select>
                  
                  {uploadData.visibility === 'Student-Specific' && (
                    <div style={{ position: 'relative' }}>
                      <Users size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input type="text" value={uploadData.studentId} onChange={e => setUploadData({...uploadData, studentId: e.target.value})} required placeholder="Enter Student ID (e.g. STU001)" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.875rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>Confirm Upload</button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 3000, display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
          {toast}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '2rem' }}>
          <Card style={{ width: '800px', height: '80vh', maxWidth: '95vw', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Preview: {showPreview.title}</h2>
              </div>
              <button onClick={() => setShowPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', overflow: 'hidden' }}>
              {showPreview.fileUrl ? (
                (() => {
                  const fullUrl = showPreview.fileUrl.startsWith('http') ? showPreview.fileUrl : `${window.location.origin}${showPreview.fileUrl.startsWith('/') ? '' : '/'}${showPreview.fileUrl}`;
                  
                  if (showPreview.fileType?.startsWith('image/')) {
                    return (
                      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <img src={fullUrl} alt={showPreview.title} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', objectFit: 'contain' }} />
                      </div>
                    );
                  } else if (showPreview.fileType === 'application/pdf') {
                    return (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <iframe 
                          src={fullUrl} 
                          title={showPreview.title} 
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
                          <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: 'white', fontSize: '0.75rem', textDecoration: 'underline' }}>PDF blocked or not loading? Click to Open</a>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                        <FileText size={80} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Preview not available for this file type</p>
                        <p style={{ fontSize: '0.875rem' }}>{showPreview.title} ({showPreview.fileType || 'Unknown Type'})</p>
                        <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>Open Direct Link</a>
                      </div>
                    );
                  }
                })()
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                  <FileText size={80} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>Sample Data Preview</p>
                  <p style={{ fontSize: '0.875rem' }}>{showPreview.title}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button 
                 onClick={() => { handleDownload(showPreview); setShowPreview(null); }} 
                 style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '0.5rem', 
                   padding: '0.75rem 1.5rem', 
                   borderRadius: '0.5rem', 
                   background: 'var(--primary)', 
                   color: 'white', 
                   border: 'none', 
                   cursor: 'pointer', 
                   fontWeight: 600,
                   transition: 'all 0.2s'
                 }}
                 onMouseOver={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                 onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
               >
                 <Download size={18} /> Download Now
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Documents;
