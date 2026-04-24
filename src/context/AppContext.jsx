import React, { createContext, useState, useEffect } from 'react';
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



  const addActivity = (action, audience = ['Admin']) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      user: currentUser?.name || 'System',
      action,
      time: 'Just now',
      audience
    };
    setRecentActivities(prev => [newActivity, ...prev]);
  };

  const addStudent = (student) => setStudents([...students, student]);
  const editStudent = (id, updated) => setStudents(students.map(s => s.id === id ? { ...s, ...updated } : s));
  const deleteStudent = (id) => setStudents(students.filter(s => s.id !== id));


  const deleteFaculty = (id) => setFaculty(faculty.filter(f => f.id !== id));


  const deleteCourse = (id) => setCourses(courses.filter(c => c.id !== id));

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

  // Polishing Phase: State Mutation Functions
  const addFeeStructure = (structure) => setFeeStructures([...feeStructures, { ...structure, id: `FST00${feeStructures.length + 1}` }]);
  const addFee = (fee) => setFees([...fees, { ...fee, id: `FEE00${fees.length + 1}` }]);
  const addExpense = (expense) => {
    const newFinance = { ...finance, expenses: [...finance.expenses, { ...expense, id: `EXP00${finance.expenses.length + 1}` }] };
    setFinance(newFinance);
  };
  const addExam = (exam) => {
    setExams([...exams, { ...exam, id: `EXM00${exams.length + 1}` }]);
    addActivity(`scheduled a new exam: ${exam.title}`, ['Admin', 'Student', 'Faculty']);
  };
  const addTask = (task) => {
    const newCommunication = { ...communication, tasks: [...communication.tasks, { ...task, id: `TSK00${communication.tasks.length + 1}` }] };
    setCommunication(newCommunication);
    addActivity(`assigned a task to ${task.assignee}`, ['Admin', 'Faculty', 'Student']);
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
  const approveLeave = (leaveId) => {
    setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: 'Approved' } : l));
  };
  const requestLeave = (leave) => {
    setLeaves([...leaves, { ...leave, id: `LVE00${leaves.length + 1}` }]);
    addActivity(`requested leave for ${leave.days} days`, ['Admin', 'Faculty']);
  };
  
  const addFaculty = (fac) => setFaculty([...faculty, { ...fac, id: `FAC00${faculty.length + 1}` }]);
  const editFaculty = (id, updatedFac) => setFaculty(faculty.map(f => f.id === id ? { ...f, ...updatedFac } : f));
  
  const addStaff = (s) => setStaff([...staff, { ...s, id: `STF00${staff.length + 1}` }]);
  const editStaff = (id, updated) => setStaff(staff.map(s => s.id === id ? { ...s, ...updated } : s));
  const deleteStaff = (id) => setStaff(staff.filter(s => s.id !== id));
  
  const addCourse = (crs) => setCourses([...courses, { ...crs, id: `CRS0${courses.length + 1}` }]);
  const editCourse = (id, updatedCrs) => setCourses(courses.map(c => c.id === id ? { ...c, ...updatedCrs } : c));
  
  const addDocument = (doc) => setDocuments([...documents, { ...doc, id: `DOC00${documents.length + 1}` }]);
  const deleteDocument = (id) => setDocuments(documents.filter(d => d.id !== id));
  
  const addTimetable = (slot) => setTimetable([...timetable, { ...slot, id: `TT00${timetable.length + 1}` }]);
  const addPayroll = (record) => setPayroll([...payroll, { ...record, id: `PAY00${payroll.length + 1}` }]);
  
  const addAcademicEntry = (type, entry) => {
    if (type === 'departments') setDepartments([...departments, { ...entry, id: `DPT0${departments.length + 1}` }]);
    if (type === 'categories') setCategories([...categories, { ...entry, id: `CAT0${categories.length + 1}` }]);
    if (type === 'degrees') setDegrees([...degrees, { ...entry, id: `DEG0${degrees.length + 1}` }]);
    if (type === 'subjects') setSubjects([...subjects, { ...entry, id: `SUB0${subjects.length + 1}` }]);
  };

  const editCalendarEvent = (id, updatedEvent) => setCalendar(calendar.map(c => c.id === id ? { ...c, ...updatedEvent } : c));
  const addCalendarEvent = (newEvent) => setCalendar([...calendar, { ...newEvent, id: `CAL00${calendar.length + 1}` }]);
  const deleteCalendarEvent = (id) => setCalendar(calendar.filter(c => c.id !== id));

  const addLibraryBook = (book) => setLibrary([...library, { ...book, id: `LIB00${library.length + 1}` }]);
  const deleteLibraryBook = (id) => setLibrary(library.filter(l => l.id !== id));

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

  const markAttendance = (batchId, date, records) => {
    const existingIndex = attendance.findIndex(a => a.batchId === batchId && a.date === date);
    if (existingIndex >= 0) {
      const newAttendance = [...attendance];
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], records };
      setAttendance(newAttendance);
    } else {
      setAttendance([...attendance, { id: `ATD0${attendance.length + 1}`, batchId, date, records }]);
    }
    addActivity(`marked attendance for batch ${batchId}`, ['Admin', 'Faculty', 'Student']);
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
  




  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      students, addStudent, editStudent, deleteStudent,
      faculty, addFaculty, editFaculty, deleteFaculty,
      staff, addStaff, editStaff, deleteStaff,
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
      finance, setFinance, addExpense,
      exams, setExams, addExam,
      timetable, setTimetable, addTimetable, generateTimetable, editTimetableSlot, bulkReplaceTimetable,
      calendar, setCalendar, editCalendarEvent, addCalendarEvent, deleteCalendarEvent,
      attendance, setAttendance, markAttendance,
      library, setLibrary, addLibraryBook, deleteLibraryBook,
      hostel, setHostel, addRoomOccupant, addVisitor,
      documents, setDocuments, addDocument, deleteDocument,
      communication, setCommunication, addTask, addNotice,
      systemHealth, promoteBatch, addLoan,
      dashboardStats, recentActivities, systemConfig,
      users, setUsers
    }}>

      {children}
    </AppContext.Provider>
  );
};
