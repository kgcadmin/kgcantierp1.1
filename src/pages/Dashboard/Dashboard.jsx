import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../components/Card/Card';
import { AppContext } from '../../context/AppContext';
import styles from './Dashboard.module.css';

const iconMap = {
  Users: <Users size={24} />,
  GraduationCap: <GraduationCap size={24} />,
  BookOpen: <BookOpen size={24} />,
  DollarSign: <DollarSign size={24} />
};

const Dashboard = () => {
  const { students, faculty, courses, fees, feeStructures, recentActivities, currentUser, enrollments, batches } = useContext(AppContext);
  const navigate = useNavigate();

  const getDynamicStats = () => {
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
      const myEnrollments = enrollments?.filter(en => en.studentId === currentUser.linkedId) || [];
      return [
        { id: 1, title: 'My Courses', value: myEnrollments.length, change: '', isPositive: null, icon: 'BookOpen', path: '/timetable' },
        { id: 2, title: 'Pending Dues', value: '₹' + pendingFees.toLocaleString(), change: '', isPositive: null, icon: 'DollarSign', path: '/fees' },
        { id: 3, title: 'Library Books', value: '2', change: '', isPositive: null, icon: 'BookOpen', path: '/library' },
        { id: 4, title: 'Upcoming Exams', value: '3', change: '', isPositive: null, icon: 'BookOpen', path: '/exams' },
      ];
    } else if (currentUser?.role === 'Faculty') {
      const myBatches = batches?.filter(b => b.facultyId === currentUser.linkedId) || [];
      const totalStudents = myBatches.reduce((acc, b) => acc + (b.capacity || 30), 0);
      return [
        { id: 1, title: 'My Batches', value: myBatches.length, change: '', isPositive: null, icon: 'BookOpen', path: '/timetable' },
        { id: 2, title: 'Total Students', value: totalStudents, change: '', isPositive: null, icon: 'Users', path: '/students' },
        { id: 3, title: 'Leaves Remaining', value: '12', change: '', isPositive: null, icon: 'Users', path: '/payroll' },
        { id: 4, title: 'Pending Grading', value: '45', change: '', isPositive: null, icon: 'BookOpen', path: '/exams' },
      ];
    }
    
    return [
      { id: 1, title: 'Total Students', value: students?.length || 0, change: '+12%', isPositive: true, icon: 'Users', path: '/students' },
      { id: 2, title: 'Total Faculty', value: faculty?.length || 0, change: '+2%', isPositive: true, icon: 'GraduationCap', path: '/faculty' },
      { id: 3, title: 'Active Courses', value: courses?.length || 0, change: '0%', isPositive: null, icon: 'BookOpen', path: '/courses' },
      { id: 4, title: 'Revenue (Term)', value: '₹' + (fees?.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) || 0).toLocaleString(), change: '+5%', isPositive: true, icon: 'DollarSign', path: '/finance' },
    ];
  };

  const dynamicStats = getDynamicStats();

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}!` : 'Dashboard Overview'}</h1>
          <p className={styles.subtitle}>Here's what's happening today in your workspace.</p>
        </div>
        <button onClick={() => window.print()} className={styles.primaryBtn}>Generate Report</button>
      </div>

      <div className={styles.statsGrid}>
        {dynamicStats.map((stat) => (
          <Card key={stat.id} className={styles.statCard} onClick={() => navigate(stat.path)} style={{ cursor: 'pointer' }}>
            <div className={styles.statHeader}>
              <div className={styles.iconWrapper}>
                {iconMap[stat.icon]}
              </div>
              {stat.isPositive !== null && (
                <div className={`${styles.badge} ${stat.isPositive ? styles.positive : styles.negative}`}>
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
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
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Enrollment Trends</h3>
            <select className={styles.select}>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className={styles.chartPlaceholder}>
            {/* Simple CSS-based bar chart representation */}
            <div className={styles.bars}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className={styles.barWrapper}>
                  <div className={styles.bar} style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Activity</h3>
          </div>
          <div className={styles.activityList}>
            {recentActivities.filter(act => !act.audience || ['Admin', 'Management', 'Office Staff'].includes(currentUser?.role) || act.audience.includes(currentUser?.role || 'Guest')).slice(0, 5).map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityDot}></div>
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
  );
};

export default Dashboard;
