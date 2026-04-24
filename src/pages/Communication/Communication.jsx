import React, { useContext, useState } from 'react';
import { MessageSquare, Bell, CheckSquare, Plus, AlertCircle } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';

const Communication = () => {
  const { communication, faculty, addTask, addNotice, currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('tasks');

  const relevantTasks = currentUser?.role === 'Student' 
    ? communication.tasks.filter(t => t.assignee === currentUser.linkedId)
    : currentUser?.role === 'Faculty'
    ? communication.tasks.filter(t => t.assignee === currentUser.linkedId)
    : communication.tasks;

  const relevantNotices = currentUser?.role === 'Student'
    ? communication.notices.filter(n => n.audience === 'All' || n.audience === 'Students')
    : communication.notices;

  const getFacultyName = (id) => faculty.find(f => f.id === id)?.name || id;

  const handleCreate = () => {
    if (activeTab === 'tasks') {
      if (currentUser?.role !== 'Admin') {
        alert("Only Admins can create tasks.");
        return;
      }
      const title = window.prompt("Enter Task Title:");
      const assignee = window.prompt("Enter Assignee ID (e.g., FAC001):");
      const dueDate = window.prompt("Enter Due Date (YYYY-MM-DD):");
      const priority = window.prompt("Enter Priority (High, Medium, Low):");
      if (title && assignee && dueDate && priority) {
        addTask({ title, assignee, dueDate, priority, status: 'Pending' });
      }
    } else {
      const title = window.prompt("Enter Notice Title:");
      const audiencePromptStr = currentUser?.role === 'Faculty' ? "Enter Audience (Students):" : "Enter Audience (All, Students, Faculty):";
      const audience = window.prompt(audiencePromptStr);
      if (currentUser?.role === 'Faculty' && audience !== 'Students') {
        alert("Faculty can only post notices for Students.");
        return;
      }
      const type = window.prompt("Enter Notice Type (Holiday, Academic, Alert):");
      if (title && audience && type) {
        addNotice({ title, audience, type, date: new Date().toISOString().split('T')[0] });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Communication Hub</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Task management, E-Notices, and communication channels.</p>
        </div>
        {currentUser?.role !== 'Student' && (
          <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <Plus size={18} /> {activeTab === 'tasks' ? 'Create Task' : 'Post Notice'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ background: 'none', border: 'none', color: activeTab === 'tasks' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'tasks' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><CheckSquare size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> Task Management</button>
        
        <button 
          onClick={() => setActiveTab('notices')}
          style={{ background: 'none', border: 'none', color: activeTab === 'notices' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'notices' ? 600 : 500, cursor: 'pointer', padding: '0.5rem 1rem' }}
        ><Bell size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}/> E-Notice Board</button>
      </div>

      {activeTab === 'tasks' && (
        <Card style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem' }}>Task ID</th>
                  <th style={{ padding: '0.75rem' }}>Title</th>
                  <th style={{ padding: '0.75rem' }}>Assignee</th>
                  <th style={{ padding: '0.75rem' }}>Due Date</th>
                  <th style={{ padding: '0.75rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {relevantTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{task.id}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{getFacultyName(task.assignee)}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{task.dueDate}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, background: task.priority === 'High' ? '#ffebee' : '#fff3e0', color: task.priority === 'High' ? '#c62828' : '#e65100' }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: task.status === 'In Progress' ? '#e3f2fd' : '#e8f5e9', color: task.status === 'In Progress' ? '#1976d2' : '#2e7d32' }}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {relevantNotices.map(notice => (
            <Card key={notice.id} style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--surface-hover)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{notice.title}</h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{notice.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Audience:</strong> {notice.audience}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Type:</strong> {notice.type}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communication;
