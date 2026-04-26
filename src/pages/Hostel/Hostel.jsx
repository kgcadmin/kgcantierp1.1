import React, { useContext, useState } from 'react';
import { Home, Users, Search, Plus, MapPin, FileText } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import ReportExportModal from '../../components/ReportExportModal/ReportExportModal';
import AddEntryModal from '../../components/AddEntryModal';

const Hostel = () => {
  const { hostel, students, addRoomOccupant, addVisitor, addRoom, currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('rooms');
  const [showReports, setShowReports] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('allocate'); // 'allocate', 'visitor', 'create'

  // Use fallbacks to ensure the page doesn't crash OR get stuck on "Loading"
  const rooms = hostel?.rooms || [];
  const visitors = hostel?.visitors || [];

  const getStudentName = (id) => students?.find(s => s.id === id)?.name || id;

  const relevantRooms = currentUser?.role === 'Student' 
    ? rooms.filter(r => r.occupants?.includes(currentUser.linkedId))
    : rooms;

  const relevantVisitors = currentUser?.role === 'Student'
    ? visitors.filter(v => v.studentId === currentUser.linkedId)
    : visitors;

  const handleSaveAction = (data) => {
    if (modalType === 'allocate') {
      if (data.roomId && data.studentId) addRoomOccupant(data.roomId, data.studentId);
    } else if (modalType === 'create') {
      addRoom({
        id: data.id,
        block: data.block,
        type: data.type,
        capacity: data.capacity
      });
    } else {
      if (data.name && data.studentId) {
        addVisitor({ 
          ...data, 
          date: new Date().toISOString().split('T')[0], 
          timeIn: 'Just Now', 
          timeOut: '' 
        });
      }
    }
    setShowAddModal(false);
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Hostel Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Room allotments, fees, and visitor logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currentUser?.role === 'Admin' && activeTab === 'rooms' && (
            <button onClick={() => { setModalType('create'); setShowAddModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={18} /> Add New Room
            </button>
          )}
          {currentUser?.role !== 'Student' && (
            <button onClick={() => { setModalType(activeTab === 'rooms' ? 'allocate' : 'visitor'); setShowAddModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={18} /> {activeTab === 'rooms' ? 'Allocate Room' : 'Log Visitor'}
            </button>
          )}
          <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('rooms')}
          style={{ background: 'none', border: 'none', color: activeTab === 'rooms' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'rooms' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Home size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Room Allotments</button>
        
        <button 
          onClick={() => setActiveTab('visitors')}
          style={{ background: 'none', border: 'none', color: activeTab === 'visitors' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'visitors' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Visitor Logs</button>
      </div>

      {activeTab === 'rooms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {relevantRooms.map(room => (
            <Card key={room.id} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={18} /> Room {room.id}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }}/> 
                    {room.block} • {room.type}
                  </span>
                </div>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  background: room.status === 'Full' ? '#e8f5e9' : '#e3f2fd',
                  color: room.status === 'Full' ? '#2e7d32' : '#1976d2'
                }}>
                  {room.status}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Current Occupants</h4>
                {room.occupants.length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {room.occupants.map(occ => (
                      <li key={occ} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', padding: '0.25rem 0' }}>• {getStudentName(occ)} ({occ})</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Vacant</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'visitors' && (
        <Card style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem' }}>Visitor Name</th>
                  <th style={{ padding: '0.75rem' }}>Relation</th>
                  <th style={{ padding: '0.75rem' }}>Visiting Student</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Time In/Out</th>
                </tr>
              </thead>
              <tbody>
                {relevantVisitors.map(visitor => (
                  <tr key={visitor.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{visitor.name}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{visitor.relation}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{getStudentName(visitor.studentId)}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{visitor.date}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{visitor.timeIn} - {visitor.timeOut || 'Present'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ReportExportModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        title="Hostel Room"
        data={relevantRooms}
        columns={[
          { key: 'id', label: 'Room No' },
          { key: 'block', label: 'Block' },
          { key: 'type', label: 'Type' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'occupants', label: 'Occupants List' },
          { key: 'status', label: 'Status' }
        ]}
        filters={[
          { key: 'status', label: 'Status', options: [{ value: 'Available', label: 'Available' }, { value: 'Full', label: 'Full' }] },
          { key: 'block', label: 'Block', options: Array.from(new Set(relevantRooms.map(r => r.block))).filter(Boolean).map(b => ({ value: b, label: b })) }
        ]}
      />

      <AddEntryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveAction}
        title={modalType === 'create' ? 'Add New Room' : (modalType === 'allocate' ? 'Allocate Room' : 'Log Visitor')}
        fields={modalType === 'create' ? [
          { name: 'id', label: 'Room Number', required: true, placeholder: 'e.g. 101' },
          { name: 'block', label: 'Block', required: true, placeholder: 'e.g. A' },
          { name: 'type', label: 'Type', required: true, placeholder: 'e.g. Double Sharing' },
          { name: 'capacity', label: 'Total Capacity', type: 'number', required: true, placeholder: 'e.g. 2' }
        ] : (modalType === 'allocate' ? [
          { 
            name: 'roomId', 
            label: 'Room', 
            type: 'select', 
            required: true, 
            options: rooms.filter(r => r.status !== 'Full').map(r => ({ value: r.id, label: `Room ${r.id} (${r.block})` })) 
          },
          { name: 'studentId', label: 'Student ID', required: true, placeholder: 'e.g. STU001' }
        ] : [
          { name: 'name', label: 'Visitor Name', required: true, placeholder: 'e.g. John Smith' },
          { name: 'relation', label: 'Relation', required: true, placeholder: 'e.g. Father' },
          { name: 'studentId', label: 'Visiting Student ID', required: true, placeholder: 'e.g. STU001' }
        ])}
      />
    </div>
  );
};

export default Hostel;
