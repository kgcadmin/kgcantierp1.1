import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, GraduationCap, BookOpen, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, Calendar, 
  CheckCircle2, AlertCircle, Plus, FileText, 
  RotateCcw, ShieldCheck, TrendingUp, Wallet
} from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './Dashboard.module.css';

const iconMap = {
  Users: <Users size={24} />,
  GraduationCap: <GraduationCap size={24} />,
  BookOpen: <BookOpen size={24} />,
  DollarSign: <DollarSign size={24} />,
  Clock: <Clock size={24} />,
  Calendar: <Calendar size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Wallet: <Wallet size={24} />
};

const Dashboard = () => {
  const { 
    students, faculty, courses, fees, feeStructures, 
    recentActivities, currentUser, enrollments, 
    batches, timetable, recoveredItems, finance
  } = useContext(AppContext);
  const navigate = useNavigate();

  // Helper: Get Today's Day
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Logic: Personal Stats based on role
  const dynamicStats = useMemo(() => {
    if (currentUser?.role === 'Student') {
      const getTrueStudentDue = (studentId) => {
        const enrollment = enrollments?.find(en => en.studentId === studentId && en.status === 'Enrolled');
        if (!enrollment) return 0;
        const batch = batches?.find(b => b.id === enrollment.batchId);
        if (!batch) return 0;
        const structure = feeStructures?.find(fs => fs.courseId === batch.courseId);
        if (!structure) return 0;
        const totalPaid = fees?.filter(f => f.studentId === studentId && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) || 0;
        return Math.max(0, structure.totalAmount - totalPaid);
      };

      const pendingFees = getTrueStudentDue(currentUser.linkedId);
      const myClassesToday = timetable?.filter(t => t.day === today && enrollments.some(e => e.studentId === currentUser.linkedId && e.batchId === t.batchId)).length || 0;
      
      return [
        { id: 1, title: 'Classes Today', value: myClassesToday, icon: 'Clock', path: '/timetable', color: 'var(--primary)' },
        { id: 2, title: 'Pending Dues', value: '₹' + pendingFees.toLocaleString(), icon: 'DollarSign', path: '/fees', color: '#f59e0b' },
        { id: 3, title: 'Attendance Avg', value: '92%', icon: 'TrendingUp', path: '/attendance', color: '#10b981' },
        { id: 4, title: 'Library Status', value: '2 Issued', icon: 'BookOpen', path: '/library', color: '#6366f1' },
      ];
    } else if (currentUser?.role === 'Faculty') {
      const myBatches = batches?.filter(b => b.facultyId === currentUser.linkedId) || [];
      const myClassesToday = timetable?.filter(t => t.day === today && t.facultyId === currentUser.linkedId).length || 0;
      
      return [
        { id: 1, title: 'Classes Today', value: myClassesToday, icon: 'Clock', path: '/timetable', color: 'var(--primary)' },
        { id: 2, title: 'Active Batches', value: myBatches.length, icon: 'Users', path: '/batches', color: '#8b5cf6' },
        { id: 3, title: 'Exam Papers', value: '14 Pending', icon: 'FileText', path: '/exams', color: '#f59e0b' },
        { id: 4, title: 'Leaves Taken', value: '3/15', icon: 'Calendar', path: '/payroll', color: '#ec4899' },
      ];
    }

    // Admin / Management Stats
    const totalRevenue = fees?.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) || 0;
    const totalExpenses = finance?.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return [
      { id: 1, title: 'Total Students', value: students?.length || 0, icon: 'Users', path: '/students', change: '+12%', isPositive: true },
      { id: 2, title: 'Total Revenue', value: '₹' + totalRevenue.toLocaleString(), icon: 'DollarSign', path: '/fees', change: '+5%', isPositive: true },
      { id: 3, title: 'Monthly Expenses', value: '₹' + totalExpenses.toLocaleString(), icon: 'Wallet', path: '/finance', change: '-2%', isPositive: false },
      { id: 4, title: 'System Health', value: '99.9%', icon: 'ShieldCheck', path: '/system', color: '#10b981' },
    ];
  }, [currentUser, students, faculty, fees, feeStructures, enrollments, batches, timetable, recoveredItems, finance, today]);

  // Logic: Today's Schedule
  const todaySchedule = useMemo(() => {
    if (currentUser?.role === 'Student') {
      const myEnrollments = enrollments.filter(e => e.studentId === currentUser.linkedId);
      return timetable.filter(t => t.day === today && myEnrollments.some(e => e.batchId === t.batchId)).sort((a, b) => a.time.localeCompare(b.time));
    }
    if (currentUser?.role === 'Faculty') {
      return timetable.filter(t => t.day === today && t.facultyId === currentUser.linkedId).sort((a, b) => a.time.localeCompare(b.time));
    }
    return [];
  }, [currentUser, timetable, enrollments, today]);

  // Logic: Quick Actions
  const quickActions = useMemo(() => {
    if (currentUser?.role === 'Student') return [
      { label: 'Pay Fees', icon: <DollarSign size={20} />, path: '/fees' },
      { label: 'View Exams', icon: <FileText size={20} />, path: '/exams' },
      { label: 'My Documents', icon: <BookOpen size={20} />, path: '/documents' },
      { label: 'Help Desk', icon: <AlertCircle size={20} />, path: '/communication' },
    ];
    if (currentUser?.role === 'Faculty') return [
      { label: 'Mark Attendance', icon: <CheckCircle2 size={20} />, path: '/attendance' },
      { label: 'Schedule Exam', icon: <Plus size={20} />, path: '/exams' },
      { label: 'Apply Leave', icon: <Calendar size={20} />, path: '/payroll' },
      { label: 'Staff Chat', icon: <BookOpen size={20} />, path: '/communication' },
    ];
    if (currentUser?.role === 'Admin') return [
      { label: 'Add User', icon: <Plus size={20} />, path: '/system' },
      { label: 'Record Expense', icon: <DollarSign size={20} />, path: '/finance' },
      { label: 'Recovery Centre', icon: <RotateCcw size={20} />, path: '/recovery' },
      { label: 'System Audit', icon: <ShieldCheck size={20} />, path: '/system' },
    ];
    return [];
  }, [currentUser]);

  return (
    <div className={`${styles.dashboard} page-animate`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}!` : 'Dashboard Overview'}
          </h1>
          <p className={styles.subtitle}>
            {today}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. 
            {todaySchedule.length > 0 ? ` You have ${todaySchedule.length} scheduled sessions today.` : " You're all caught up for today."}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className={styles.primaryBtn} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            Export PDF
          </button>
          <button className={styles.primaryBtn}>Refresh Sync</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {dynamicStats.map((stat) => (
          <Card key={stat.id} className={styles.statCard} onClick={() => navigate(stat.path)} style={{ cursor: 'pointer' }}>
            <div className={styles.statHeader}>
              <div className={styles.iconWrapper} style={stat.color ? { background: `rgba(${stat.color}, 0.1)`, color: stat.color } : {}}>
                {iconMap[stat.icon]}
              </div>
              {stat.change && (
                <div className={`${styles.badge} ${stat.isPositive ? styles.positive : styles.negative}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
            <div className={styles.statBody}>
              <h3 className={styles.statValue}>{stat.value}</h3>
              <p className={styles.statTitle}>{stat.title}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Widget Area (Schedule or Enrollment) */}
          <Card className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                {['Admin', 'Management'].includes(currentUser?.role) ? 'Institutional Growth' : 'My Weekly Attendance'}
              </h3>
              <select className={styles.select}>
                <option>Last 7 Days</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className={styles.chartPlaceholder}>
              <div className={styles.bars}>
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className={styles.barWrapper}>
                    <div className={styles.bar} style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Actions Grid */}
          <div className={styles.quickActions}>
            {quickActions.map((action, idx) => (
              <button key={idx} className={styles.actionBtn} onClick={() => navigate(action.path)}>
                <div className={styles.actionIcon}>{action.icon}</div>
                <span className={styles.actionLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Side Panel (Today's Schedule or Recovery Stats) */}
          {(currentUser?.role === 'Student' || currentUser?.role === 'Faculty') ? (
            <Card className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Today's Schedule</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{today}</span>
              </div>
              <div className={styles.scheduleList}>
                {todaySchedule.map((slot) => (
                  <div key={slot.id} className={styles.scheduleItem}>
                    <div className={styles.timeBox}>
                      {slot.time.split(' - ')[0]}
                    </div>
                    <div className={styles.scheduleInfo}>
                      <h4>{slot.subject}</h4>
                      <p>{slot.room} • {currentUser.role === 'Student' ? 'Faculty: ' + (faculty.find(f => f.id === slot.facultyId)?.name || 'TBA') : 'Batch: ' + slot.batchId}</p>
                    </div>
                  </div>
                ))}
                {todaySchedule.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    <Calendar size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '0.875rem' }}>No classes scheduled for today.</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>System Integrity</h3>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div className={styles.scheduleList}>
                <div className={styles.scheduleItem} style={{ cursor: 'pointer' }} onClick={() => navigate('/recovery')}>
                  <div className={styles.timeBox} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    {recoveredItems.length}
                  </div>
                  <div className={styles.scheduleInfo}>
                    <h4>Recovery Centre</h4>
                    <p>Deleted items awaiting purge</p>
                  </div>
                </div>
                <div className={styles.scheduleItem}>
                  <div className={styles.timeBox} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    98%
                  </div>
                  <div className={styles.scheduleInfo}>
                    <h4>Server Uptime</h4>
                    <p>Operating normally</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Common Recent Activity */}
          <Card className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Institutional Logs</h3>
            </div>
            <div className={styles.activityList}>
              {recentActivities.filter(act => 
                !act.audience || 
                ['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) || 
                act.audience.includes(currentUser?.role)
              ).slice(0, 5).map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{ background: activity.action.includes('deleted') || activity.action.includes('error') ? '#ef4444' : activity.action.includes('restored') || activity.action.includes('added') ? '#10b981' : 'var(--primary)' }}></div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <span className={styles.activityUser}>{activity.user}</span> {activity.action}
                    </p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
