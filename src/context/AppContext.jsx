import React, { createContext, useState, useEffect, useMemo } from 'react';
import { 
  usersData,
  studentsData as initialStudents, 
  facultyData as initialFaculty, 
  coursesData as initialCourses, 
  departmentsData as initialDepartments,
  categoriesData as initialCategories,
  degreesData as initialDegrees,
  subjectsData as initialSubjects,
  batchesData as initialBatches,
  enrollmentsData as initialEnrollments,
  systemConfigData as initialConfig,
  feeStructuresData as initialFeeStructures,
  feesData as initialFees,
  payrollData as initialPayroll,
  leavesData as initialLeaves,
  financeData as initialFinance,
  examsData as initialExams,
  timetableData as initialTimetable,
  attendanceData as initialAttendance,
  libraryData as initialLibrary,
  hostelData as initialHostel,
  documentsData as initialDocuments,
  communicationData as initialCommunication,
  academicCalendarData as initialCalendar,
  dashboardStats, 
  recentActivities as initialActivities,
  staffData as initialStaff,
  systemHealthData as initialSystemHealth
} from '../data/mockData';
import { api } from '../utils/api';


export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('edusec_users');
    return savedUsers ? JSON.parse(savedUsers) : usersData;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) return JSON.parse(savedUser);
    return users[0]; // Default to Admin
  });
  
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_user');
  };

  // Helper to load from localStorage or fallback to initial
  const loadState = (key, fallback) => {
    const saved = localStorage.getItem(`edusec_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [students, setStudents] = useState(() => loadState('students', initialStudents));
  const [faculty, setFaculty] = useState(() => loadState('faculty', initialFaculty));
  const [staff, setStaff] = useState(() => loadState('staff', initialStaff));
  const [courses, setCourses] = useState(() => loadState('courses', initialCourses));
  const [departments, setDepartments] = useState(() => loadState('departments', initialDepartments));
  const [categories, setCategories] = useState(() => loadState('categories', initialCategories));
  const [degrees, setDegrees] = useState(() => loadState('degrees', initialDegrees));
  const [subjects, setSubjects] = useState(() => loadState('subjects', initialSubjects));
  const [batches, setBatches] = useState(() => loadState('batches', initialBatches));
  const [enrollments, setEnrollments] = useState(() => loadState('enrollments', initialEnrollments));
  const [systemConfig, setSystemConfig] = useState(() => loadState('config', initialConfig));
  
  const [feeStructures, setFeeStructures] = useState(() => loadState('feeStructures', initialFeeStructures));
  const [fees, setFees] = useState(() => loadState('fees', initialFees));
  const [payroll, setPayroll] = useState(() => loadState('payroll', initialPayroll));
  const [leaves, setLeaves] = useState(() => loadState('leaves', initialLeaves));
  const [finance, setFinance] = useState(() => loadState('finance', initialFinance));

  const [exams, setExams] = useState(() => loadState('exams', initialExams));
  const [timetable, setTimetable] = useState(() => loadState('timetable', initialTimetable));
  const [attendance, setAttendance] = useState(() => loadState('attendance', initialAttendance));
  const [library, setLibrary] = useState(() => loadState('library', initialLibrary));

  const [hostel, setHostel] = useState(() => loadState('hostel', initialHostel));
  const [documents, setDocuments] = useState(() => loadState('documents', initialDocuments));
  const [communication, setCommunication] = useState(() => loadState('communication', initialCommunication));
  const [calendar, setCalendar] = useState(() => loadState('calendar', initialCalendar));
  const [systemHealth, setSystemHealth] = useState(() => loadState('health', initialSystemHealth));
  const [recentActivities, setRecentActivities] = useState(() => loadState('activities', initialActivities));
  const [recoveredItems, setRecoveredItems] = useState([]);
  const [academicYear, setAcademicYear] = useState(() => loadState('academicYear', '2026-27'));
  
  // Dynamic Form Templates for Personal Info
  const [profileTemplate, setProfileTemplate] = useState(() => loadState('profileTemplate', {
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        fields: [
          { id: 'certificateName', label: 'Certificate Name', type: 'text', required: true },
          { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
          { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
          { id: 'nationality', label: 'Nationality', type: 'text' },
          { id: 'bloodgroup', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
          { id: 'religion', label: 'Religion', type: 'text' },
          { id: 'cast', label: 'Caste', type: 'text' },
          { id: 'birthPlace', label: 'Birth Place', type: 'text' }
        ]
      },
      {
        id: 'contact',
        title: 'Contact Details',
        fields: [
          { id: 'resident', label: 'Resident Type', type: 'select', options: ['Home', 'Hostel', 'Rental'] },
          { id: 'passportNo', label: 'Passport Number', type: 'text' },
          { id: 'visaExpiry', label: 'Visa Expiry', type: 'date' }
        ]
      }
    ]
  }));

  // Initialize data from API if VITE_API_URL is set
  useEffect(() => {
    const fetchData = async () => {
      const apiStudents = await api.get('students');
      if (apiStudents) setStudents(apiStudents);
      const apiFaculty = await api.get('faculty');
      if (apiFaculty) setFaculty(apiFaculty);
      const apiStaff = await api.get('staff');
      if (apiStaff) setStaff(apiStaff);
      const apiCourses = await api.get('courses');
      if (apiCourses) setCourses(apiCourses);
      const apiDepartments = await api.get('departments');
      if (apiDepartments) setDepartments(apiDepartments);
      const apiCategories = await api.get('categories');
      if (apiCategories) setCategories(apiCategories);
      const apiDegrees = await api.get('degrees');
      if (apiDegrees) setDegrees(apiDegrees);
      const apiSubjects = await api.get('subjects');
      if (apiSubjects) setSubjects(apiSubjects);
      const apiBatches = await api.get('batches');
      if (apiBatches) setBatches(apiBatches);
      const apiEnrollments = await api.get('enrollments');
      if (apiEnrollments) setEnrollments(apiEnrollments);
      const apiConfig = await api.get('config');
      if (apiConfig) setSystemConfig(apiConfig);
      const apiFees = await api.get('fees');
      if (apiFees) setFees(apiFees);
      const apiPayroll = await api.get('payroll');
      if (apiPayroll) setPayroll(apiPayroll);
      const apiLeaves = await api.get('leaves');
      if (apiLeaves) setLeaves(apiLeaves);
      const apiFinance = await api.get('finance');
      if (apiFinance) setFinance(apiFinance);
      const apiExams = await api.get('exams');
      if (apiExams) setExams(apiExams);
      const apiTimetable = await api.get('timetable');
      if (apiTimetable) setTimetable(apiTimetable);
      const apiAttendance = await api.get('attendance');
      if (apiAttendance) setAttendance(apiAttendance);
      const apiLibrary = await api.get('library');
      if (apiLibrary) setLibrary(apiLibrary);
      const apiHostel = await api.get('hostel');
      if (apiHostel) setHostel(apiHostel);
      const apiDocs = await api.get('documents');
      if (apiDocs) setDocuments(apiDocs);
      const apiComm = await api.get('communication');
      if (apiComm) setCommunication(apiComm);
      const apiCalendar = await api.get('calendar');
      if (apiCalendar) setCalendar(apiCalendar);
      const apiHealth = await api.get('health');
      if (apiHealth) setSystemHealth(apiHealth);
      const apiActivities = await api.get('activities');
      if (apiActivities) setRecentActivities(apiActivities);
      const apiTemplate = await api.get('profileTemplate');
      if (apiTemplate) setProfileTemplate(apiTemplate);
      const apiUsers = await api.get('users');
      if (apiUsers) setUsers(apiUsers);
    };
    fetchData();
  }, []);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('edusec_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('edusec_faculty', JSON.stringify(faculty)); }, [faculty]);
  useEffect(() => { localStorage.setItem('edusec_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('edusec_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('edusec_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('edusec_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('edusec_degrees', JSON.stringify(degrees)); }, [degrees]);
  useEffect(() => { localStorage.setItem('edusec_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('edusec_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('edusec_enrollments', JSON.stringify(enrollments)); }, [enrollments]);
  useEffect(() => { localStorage.setItem('edusec_config', JSON.stringify(systemConfig)); }, [systemConfig]);
  useEffect(() => { localStorage.setItem('edusec_feeStructures', JSON.stringify(feeStructures)); }, [feeStructures]);
  useEffect(() => { localStorage.setItem('edusec_fees', JSON.stringify(fees)); }, [fees]);
  useEffect(() => { localStorage.setItem('edusec_payroll', JSON.stringify(payroll)); }, [payroll]);
  useEffect(() => { localStorage.setItem('edusec_leaves', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem('edusec_finance', JSON.stringify(finance)); }, [finance]);
  useEffect(() => { localStorage.setItem('edusec_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('edusec_timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('edusec_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('edusec_library', JSON.stringify(library)); }, [library]);
  useEffect(() => { localStorage.setItem('edusec_hostel', JSON.stringify(hostel)); }, [hostel]);
  useEffect(() => { localStorage.setItem('edusec_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('edusec_communication', JSON.stringify(communication)); }, [communication]);
  useEffect(() => { localStorage.setItem('edusec_calendar', JSON.stringify(calendar)); }, [calendar]);
  useEffect(() => { localStorage.setItem('edusec_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('edusec_health', JSON.stringify(systemHealth)); }, [systemHealth]);
  useEffect(() => { localStorage.setItem('edusec_activities', JSON.stringify(recentActivities)); }, [recentActivities]);
  useEffect(() => { localStorage.setItem('edusec_profileTemplate', JSON.stringify(profileTemplate)); }, [profileTemplate]);
  useEffect(() => { localStorage.setItem('edusec_academicYear', JSON.stringify(academicYear)); }, [academicYear]);



  const addActivity = (action, audience = ['Admin']) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      user: currentUser?.name || 'System',
      action,
      time: 'Just now',
      audience
    };
    setRecentActivities(prev => [newActivity, ...prev]);
    api.post('activities', newActivity);
  };

  const syncToVPS = async (collection, data, id = null, method = 'POST') => {
    // Remove the check for VITE_API_URL to allow relative paths in production
    if (method === 'POST') await api.post(collection, data);
    else if (method === 'PUT') await api.put(collection, id, data);
    else if (method === 'DELETE') {
      await api.delete(collection, id);
      refreshRecoveryData();
    }
  };

  // Shared Helper Functions
  const generateRandomPassword = (id) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    return `KGC!${id.slice(-3)}${rand}`;
  };

  const processCSV = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      let importedCount = 0;

      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const data = {};
        headers.forEach((h, i) => data[h] = values[i]);

        if (data.name && data.department) {
          const id = `${type === 'student' ? 'STU' : type === 'faculty' ? 'FAC' : 'STF'}${Date.now().toString().slice(-3)}${index}`;
          const pass = generateRandomPassword(id);
          const email = data.email || `${data.name.split(' ')[0].toLowerCase()}${index}${Date.now().toString().slice(-2)}@kashibaiganpatcollege.com`;

          const baseData = {
            id,
            name: data.name,
            department: data.department,
            status: 'Active',
            email,
            password: pass,
            personalDetails: {} 
          };

          if (type === 'student') {
            addStudent({
              ...baseData,
              rollNo: data.rollno || `ROL${id.slice(-4)}`,
              grNumber: data.grnumber || `GR${Date.now().toString().slice(-6)}`,
              year: data.year || 'Freshman',
            });
          } else if (type === 'faculty') {
            addFaculty({ ...baseData, role: data.role || 'Professor' });
          } else if (type === 'staff') {
            addStaff({ ...baseData, role: data.role || 'Staff' });
          }
          importedCount++;
        }
      });
      alert(`Successfully imported ${importedCount} ${type}s!`);
      addActivity(`bulk imported ${importedCount} ${type}s`, ['Admin']);
    };
    reader.readAsText(file);
  };

  const addStudent = (student) => {
    const id = student.id || `STU00${students.length + 1}`;
    const newStudent = { ...student, id };
    setStudents(prev => [...prev, newStudent]);
    
    const newUser = {
      id: `USR${id}`,
      email: student.email, // Using provided email
      password: student.password || 'password',
      role: 'Student',
      name: student.name,
      linkedId: id
    };
    setUsers(prev => [...prev, newUser]);
    
    syncToVPS('students', newStudent);
    syncToVPS('users', newUser);
  };
  const editStudent = (id, updated) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    syncToVPS('students', { ...updated, id }, id, 'PUT');
  };
  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    const user = users.find(u => u.linkedId === id);
    if (user) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      syncToVPS('users', null, user.id, 'DELETE');
    }
    syncToVPS('students', null, id, 'DELETE');
  };

  const addFaculty = (fac) => {
    const id = fac.id || `FAC00${faculty.length + 1}`;
    const newFac = { ...fac, id };
    setFaculty(prev => [...prev, newFac]);
    
    const newUser = {
      id: `USR${id}`,
      email: fac.email, // Using provided email
      password: fac.password || 'password',
      role: 'Faculty',
      name: fac.name,
      linkedId: id
    };
    setUsers(prev => [...prev, newUser]);
    
    syncToVPS('faculty', newFac);
    syncToVPS('users', newUser);
  };
  const editFaculty = (id, updated) => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
    syncToVPS('faculty', { ...updated, id }, id, 'PUT');
  };
  const deleteFaculty = (id) => {
    setFaculty(prev => prev.filter(f => f.id !== id));
    const user = users.find(u => u.linkedId === id);
    if (user) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      syncToVPS('users', null, user.id, 'DELETE');
    }
    syncToVPS('faculty', null, id, 'DELETE');
  };

  // Staff Handlers
  const addStaff = (s) => {
    const id = s.id || `STF00${staff.length + 1}`;
    const newStaff = { ...s, id };
    setStaff(prev => [...prev, newStaff]);
    
    const newUser = {
      id: `USR${id}`,
      email: s.email,
      password: s.password || 'password',
      role: 'Office Staff',
      name: s.name,
      linkedId: id
    };
    setUsers(prev => [...prev, newUser]);
    
    syncToVPS('staff', newStaff);
    syncToVPS('users', newUser);
  };
  const editStaff = (id, updated) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    syncToVPS('staff', { ...updated, id }, id, 'PUT');
  };
  const deleteStaff = (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    const user = users.find(u => u.linkedId === id);
    if (user) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      syncToVPS('users', null, user.id, 'DELETE');
    }
    syncToVPS('staff', null, id, 'DELETE');
  };



  const updateBatchStatus = (id, newStatus, historyEntry) => {
    setBatches(batches.map(b => b.id === id ? {
      ...b, 
      status: newStatus, 
      history: [...b.history, historyEntry]
    } : b));
  };

  const promoteBatch = (batchId, nextBatchId) => {
    const batchStudents = enrollments.filter(e => e.batchId === batchId).map(e => e.studentId);
    setStudents(students.map(s => batchStudents.includes(s.id) ? { ...s, year: 'Promoted' } : s)); // Simple logic for demo
    batchStudents.forEach(sid => enrollStudent(sid, nextBatchId));
    addActivity(`promoted batch ${batchId} to ${nextBatchId}`, ['Admin', 'Management']);
  };


  const enrollStudent = (studentId, batchId) => {
    const newEnrollment = {
      id: `ENR0${enrollments.length + 1}`,
      studentId,
      batchId,
      date: new Date().toISOString().split('T')[0],
      status: 'Enrolled'
    };
    setEnrollments([...enrollments, newEnrollment]);
    addActivity(`enrolled student ${studentId} in batch ${batchId}`, ['Admin', 'Student']);
  };

  const addFeeStructure = (structure) => {
    const newStructure = { ...structure, id: `FST00${feeStructures.length + 1}` };
    setFeeStructures([...feeStructures, newStructure]);
    syncToVPS('feeStructures', newStructure);
  };
  const addFee = (fee) => {
    const newFee = { ...fee, id: `FEE00${fees.length + 1}` };
    setFees([...fees, newFee]);
    syncToVPS('fees', newFee);
  };
  const addExpense = (expense) => {
    const newExpense = { ...expense, id: `EXP00${finance.expenses.length + 1}` };
    const newBalance = finance.pettyCash.balance - (expense.amount || 0);
    const newFinance = { 
      ...finance, 
      pettyCash: { ...finance.pettyCash, balance: newBalance },
      expenses: [...finance.expenses, newExpense] 
    };
    setFinance(newFinance);
    syncToVPS('finance', newFinance, 'finance-global', 'PUT'); // Special case for global finance object
    addActivity(`recorded expense: ${expense.description} (-₹${expense.amount})`, ['Admin', 'Management']);
  };

  const refillPettyCash = (amount) => {
    const newFinance = {
      ...finance,
      pettyCash: {
        balance: finance.pettyCash.balance + Number(amount),
        lastRefill: new Date().toISOString().split('T')[0]
      }
    };
    setFinance(newFinance);
    addActivity(`refilled petty cash: +₹${amount}`, ['Admin', 'Management']);
  };
  const deleteFee = (id) => {
    setFees(prev => prev.filter(f => f.id !== id));
    syncToVPS('fees', null, id, 'DELETE');
  };
  const addExam = (exam) => {
    setExams([...exams, { ...exam, id: `EXM00${exams.length + 1}` }]);
    addActivity(`scheduled a new exam: ${exam.title}`, ['Admin', 'Student', 'Faculty']);
  };
  const deleteExam = (id) => {
    setExams(prev => prev.filter(e => e.id !== id));
    syncToVPS('exams', null, id, 'DELETE');
  };
  const addTask = (task) => {
    const newCommunication = { ...communication, tasks: [...communication.tasks, { ...task, id: `TSK00${communication.tasks.length + 1}` }] };
    setCommunication(newCommunication);
    addActivity(`assigned a task to ${task.assignee}`, ['Admin', 'Faculty', 'Student']);
  };
  const deleteTask = (id) => {
    const newComm = { ...communication, tasks: communication.tasks.filter(t => t.id !== id) };
    setCommunication(newComm);
    syncToVPS('communication', newComm, 'communication-global', 'PUT'); // Communication is often a global object in this app
    // Actually, if I want it in recovery centre, it should be its own collection.
    // But looking at how it's stored, it's inside communicationData.
    // For now, I'll just sync the whole thing.
  };

  const addLoan = (loan) => {
    setFinance(prev => ({
      ...prev,
      loans: [...prev.loans, { ...loan, id: `LON00${prev.loans.length + 1}` }]
    }));
    addActivity(`approved a ${loan.type} for ${loan.employeeId}`, ['Admin', 'Management']);
  };


  const addRoomOccupant = (roomId, studentId) => {
    setHostel(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, occupants: [...r.occupants, studentId], status: r.occupants.length + 1 >= parseInt(r.type) ? 'Full' : 'Available' } : r)
    }));
    addActivity(`allocated room ${roomId} to student ${studentId}`, ['Admin', 'Student']);
  };

  const addVisitor = (visitor) => {
    setHostel(prev => ({
      ...prev,
      visitors: [...prev.visitors, { ...visitor, id: `VIS00${prev.visitors.length + 1}` }]
    }));
    addActivity(`logged a visitor for student ${visitor.studentId}`, ['Admin', 'Office Staff']);
  };
  const addNotice = (notice) => {
    const newCommunication = { ...communication, notices: [...communication.notices, { ...notice, id: `NOT00${communication.notices.length + 1}` }] };
    setCommunication(newCommunication);
    let audienceMap = ['Admin'];
    if (notice.audience === 'All') audienceMap = ['Admin', 'Student', 'Faculty', 'Management', 'Office Staff'];
    if (notice.audience === 'Students') audienceMap = ['Admin', 'Student'];
    if (notice.audience === 'Faculty') audienceMap = ['Admin', 'Faculty'];
    addActivity(`posted a new notice: ${notice.title}`, audienceMap);
  };
  const deleteNotice = (id) => {
    const newComm = { ...communication, notices: communication.notices.filter(n => n.id !== id) };
    setCommunication(newComm);
    syncToVPS('communication', newComm, 'communication-global', 'PUT');
  };
  const approveLeave = (leaveId) => {
    setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: 'Approved' } : l));
  };
  const deleteLeave = (id) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    syncToVPS('leaves', null, id, 'DELETE');
  };
  const requestLeave = (leave) => {
    setLeaves([...leaves, { ...leave, id: `LVE00${leaves.length + 1}` }]);
    addActivity(`requested leave for ${leave.days} days`, ['Admin', 'Faculty']);
  };
  
  
  const addCourse = (crs) => {
    const id = `CRS0${courses.length + 1}`;
    setCourses([...courses, { ...crs, id }]);
    addActivity(`added a new course: ${crs.title}`, ['Admin', 'Management', 'Faculty']);
  };
  const editCourse = (id, updatedCrs) => setCourses(courses.map(c => c.id === id ? { ...c, ...updatedCrs } : c));
  const deleteCourse = (id) => {
    const crs = courses.find(c => c.id === id);
    setCourses(courses.filter(c => c.id !== id));
    syncToVPS('courses', null, id, 'DELETE');
    if (crs) addActivity(`deleted course: ${crs.title}`, ['Admin', 'Management']);
  };
  
  const addDocument = (doc) => {
    const id = doc.id || `DOC00${documents.length + 1}`;
    setDocuments([...documents, { ...doc, id }]);
    
    let audience = ['Admin', 'Office Staff'];
    if (doc.visibility === 'Public') audience = [...audience, 'Student', 'Faculty'];
    if (doc.visibility === 'Student-Specific' && doc.studentId) audience = [...audience, `USR${doc.studentId}`];

    addActivity(`uploaded a new document: ${doc.title}`, audience);
  };
  
  const deleteDocument = (id) => {
    const doc = documents.find(d => d.id === id);
    setDocuments(documents.filter(d => d.id !== id));
    syncToVPS('documents', null, id, 'DELETE');
    if (doc) addActivity(`deleted document: ${doc.title}`, ['Admin', 'Office Staff']);
  };
  
  const addTimetable = (slot) => setTimetable([...timetable, { ...slot, id: `TT00${timetable.length + 1}` }]);
  const addPayroll = (record) => setPayroll([...payroll, { ...record, id: `PAY00${payroll.length + 1}` }]);
  const deletePayroll = (id) => {
    setPayroll(prev => prev.filter(p => p.id !== id));
    syncToVPS('payroll', null, id, 'DELETE');
  };
  
  const addAcademicEntry = (type, entry) => {
    if (type === 'departments') setDepartments([...departments, { ...entry, id: `DPT0${departments.length + 1}` }]);
    if (type === 'categories') setCategories([...categories, { ...entry, id: `CAT0${categories.length + 1}` }]);
    if (type === 'degrees') setDegrees([...degrees, { ...entry, id: `DEG0${degrees.length + 1}` }]);
    if (type === 'subjects') setSubjects([...subjects, { ...entry, id: `SUB0${subjects.length + 1}` }]);
  };

  const deleteDepartment = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    syncToVPS('departments', null, id, 'DELETE');
  };
  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    syncToVPS('categories', null, id, 'DELETE');
  };
  const deleteDegree = (id) => {
    setDegrees(prev => prev.filter(d => d.id !== id));
    syncToVPS('degrees', null, id, 'DELETE');
  };
  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    syncToVPS('subjects', null, id, 'DELETE');
  };
  const deleteBatch = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    syncToVPS('batches', null, id, 'DELETE');
  };

  const editCalendarEvent = (id, updatedEvent) => setCalendar(calendar.map(c => c.id === id ? { ...c, ...updatedEvent } : c));
  const addCalendarEvent = (newEvent) => setCalendar([...calendar, { ...newEvent, id: `CAL00${calendar.length + 1}` }]);
  const deleteCalendarEvent = (id) => {
    setCalendar(calendar.filter(c => c.id !== id));
    syncToVPS('calendar', null, id, 'DELETE');
  };

  const addLibraryBook = (book) => setLibrary([...library, { ...book, id: `LIB00${library.length + 1}` }]);
  const deleteLibraryBook = (id) => {
    setLibrary(library.filter(l => l.id !== id));
    syncToVPS('library', null, id, 'DELETE');
  };

  const updateBatch = (batchId, updatedFields) => {
    setBatches(batches.map(b => b.id === batchId ? { ...b, ...updatedFields } : b));
  };

  const editTimetableSlot = (id, newDetails) => {
    setTimetable(timetable.map(t => t.id === id ? { ...t, ...newDetails } : t));
  };

  const bulkReplaceTimetable = (batchId, type, oldVal, newVal) => {
    setTimetable(timetable.map(t => {
      if (t.batchId === batchId) {
        if (type === 'faculty' && t.facultyId === oldVal) return { ...t, facultyId: newVal };
        if (type === 'subject' && t.subject === oldVal) return { ...t, subject: newVal };
      }
      return t;
    }));
  };

  const markAttendance = (batchId, date, records, subjectId) => {
    const existingIndex = attendance.findIndex(a => a.batchId === batchId && a.date === date && a.subjectId === subjectId);
    if (existingIndex >= 0) {
      const newAttendance = [...attendance];
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], records };
      setAttendance(newAttendance);
    } else {
      setAttendance([...attendance, { id: `ATD0${attendance.length + 1}`, batchId, date, records, subjectId }]);
    }
    addActivity(`marked attendance for ${subjectId || 'batch'} in ${batchId}`, ['Admin', 'Faculty', 'Student']);
  };

  const generateTimetable = (maxClassesPerTeacher, batchId, courseId) => {
    const batch = batches.find(b => b.id === batchId);
    const config = batch?.timetableConfig || { startTime: '09:00', durationMinutes: 90, periodsPerDay: 3, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] };
    
    const days = config.days;
    let times = [];
    let [hours, minutes] = config.startTime.split(':').map(Number);
    let currentTime = new Date(2000, 0, 1, hours, minutes);

    for (let i = 0; i < config.periodsPerDay; i++) {
      const startStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      currentTime.setMinutes(currentTime.getMinutes() + config.durationMinutes);
      const endStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      times.push(`${startStr} - ${endStr}`);
    }

    const rooms = ['Hall A', 'Hall B', 'Lab 1', 'Lab 2', 'Room 101'];
    
    // Keep existing timetable for OTHER batches, only clear the current batch
    let newTimetable = timetable.filter(t => t.batchId !== batchId);
    let ttId = timetable.length + 1;

    days.forEach(day => {
      let dailyLoad = {}; 
      faculty.forEach(f => dailyLoad[f.id] = 0);

      times.forEach(time => {
        let availableRooms = [...rooms];
        
        // Schedule 1 class per time slot for this specific batch
        const availableFaculty = faculty.filter(f => dailyLoad[f.id] < maxClassesPerTeacher && f.status === 'Active');
        
        if (availableFaculty.length > 0 && availableRooms.length > 0) {
          const fac = availableFaculty[Math.floor(Math.random() * availableFaculty.length)];
          
          let subject = subjects[0].code;
          if (fac.coursesTaught && fac.coursesTaught.length > 0) {
            subject = fac.coursesTaught[Math.floor(Math.random() * fac.coursesTaught.length)];
          }
          
          const roomIndex = Math.floor(Math.random() * availableRooms.length);
          const room = availableRooms[roomIndex];
          availableRooms.splice(roomIndex, 1);

          newTimetable.push({
            id: `TT00${ttId++}`,
            batchId,
            courseId,
            subject,
            facultyId: fac.id,
            day,
            time,
            room
          });

          dailyLoad[fac.id]++;
        }
      });
    });

    setTimetable(newTimetable);
  };
  


  const refreshRecoveryData = async () => {
    if (currentUser?.role === 'Admin') {
      const data = await api.getRecovery();
      setRecoveredItems(data || []);
    }
  };

  const restoreItem = async (collection, id) => {
    const res = await api.restore(collection, id);
    if (res?.success) {
      // Refresh the specific collection and recovery data
      const updatedData = await api.get(collection);
      if (collection === 'students') setStudents(updatedData);
      else if (collection === 'faculty') setFaculty(updatedData);
      else if (collection === 'staff') setStaff(updatedData);
      else if (collection === 'courses') setCourses(updatedData);
      // Add more as needed...
      
      refreshRecoveryData();
      addActivity(`restored ${collection} record: ${id}`, ['Admin']);
      return true;
    }
    return false;
  };

  const permanentDeleteItem = async (collection, id) => {
    const res = await api.permanentDelete(collection, id);
    if (res?.success) {
      refreshRecoveryData();
      addActivity(`permanently deleted ${collection} record: ${id}`, ['Admin']);
      return true;
    }
    return false;
  };

  const contextValue = useMemo(() => ({
    currentUser, login, logout,
    students, addStudent, editStudent, deleteStudent,
    faculty, addFaculty, editFaculty, deleteFaculty,
    staff, addStaff, editStaff, deleteStaff,
    processCSV,
    courses, addCourse, editCourse, deleteCourse,
    departments, setDepartments,
    categories, setCategories,
    degrees, setDegrees,
    subjects, setSubjects,
    addAcademicEntry,
    batches, updateBatchStatus, updateBatch,
    enrollments, enrollStudent,
    systemConfig, setSystemConfig,
    feeStructures, setFeeStructures, addFeeStructure,
    fees, setFees, addFee,
    payroll, setPayroll, addPayroll,
    leaves, setLeaves, approveLeave, requestLeave,
    finance, setFinance, addExpense, refillPettyCash,
    exams, setExams, addExam,
    timetable, setTimetable, addTimetable, generateTimetable, editTimetableSlot, bulkReplaceTimetable,
    calendar, setCalendar, editCalendarEvent, addCalendarEvent, deleteCalendarEvent,
    attendance, setAttendance, markAttendance,
    library, setLibrary, addLibraryBook, deleteLibraryBook,
    hostel, setHostel, addRoomOccupant, addVisitor,
    documents, setDocuments, addDocument, deleteDocument,
    communication, setCommunication, addTask, addNotice,
    systemHealth, promoteBatch, addLoan,
    dashboardStats, recentActivities,
    users, setUsers,
    profileTemplate, setProfileTemplate,
    recoveredItems, refreshRecoveryData, restoreItem, permanentDeleteItem,
    academicYear, setAcademicYear,
    deleteDepartment, deleteCategory, deleteDegree, deleteSubject, deleteBatch,
    deleteExam, deleteTask, deleteNotice, deleteFee, deletePayroll, deleteLeave
  }), [
    currentUser, students, faculty, staff, courses, departments, categories, degrees, subjects, 
    batches, enrollments, systemConfig, feeStructures, fees, payroll, leaves, finance, exams, 
    timetable, calendar, attendance, library, hostel, documents, communication, systemHealth, 
    recentActivities, users, profileTemplate, recoveredItems, academicYear
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
