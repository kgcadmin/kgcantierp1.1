export const usersData = [
  { id: 'USR001', email: 'admin@kashibaiganpatcollege.com', password: 'password', role: 'Admin', name: 'Super Admin' },
  { id: 'USR002', email: 'management@edu.com', password: 'password', role: 'Management', name: 'Director Board' },
  { id: 'USR003', email: 'office@kashibaiganpatcollege.com', password: 'password', role: 'Office Staff', name: 'Registrar Office' },
  { id: 'USR004', email: 'faculty@edu.com', password: 'password', role: 'Faculty', name: 'Dr. Alan Smith', linkedId: 'FAC001' },
  { id: 'USR005', email: 'student@edu.com', password: 'password', role: 'Student', name: 'Alice Freeman', linkedId: 'STU001' }
];

export const dashboardStats = [
  { id: 1, title: 'Total Students', value: '4,852', change: '+12%', isPositive: true, icon: 'Users' },
  { id: 2, title: 'Total Faculty', value: '312', change: '+2%', isPositive: true, icon: 'GraduationCap' },
  { id: 3, title: 'Active Courses', value: '145', change: '0%', isPositive: null, icon: 'BookOpen' },
  { id: 4, title: 'Revenue (Term)', value: '₹2.4M', change: '+5%', isPositive: true, icon: 'DollarSign' },
];

export const recentActivities = [
  { id: 1, user: 'Dr. Smith', action: 'published grades for CS101', time: '2 hours ago', audience: ['Admin', 'Student', 'Faculty'] },
  { id: 2, user: 'Admin', action: 'updated the Fall 2026 academic calendar', time: '4 hours ago', audience: ['Admin', 'Student', 'Faculty', 'Management', 'Office Staff'] },
  { id: 3, user: 'Sarah Jenkins', action: 'submitted admission fee', time: '5 hours ago', audience: ['Admin', 'Office Staff', 'Management'] },
  { id: 4, user: 'Prof. Davis', action: 'cancelled lecture for PHY202', time: '1 day ago', audience: ['Admin', 'Student', 'Faculty'] },
  { id: 5, user: 'Admin', action: 'payroll processed for April', time: '2 days ago', audience: ['Admin', 'Management', 'Faculty'] },
  { id: 6, user: 'System', action: 'Hostel fee due reminder', time: '1 hour ago', audience: ['Admin', 'Student'] }
];

export const studentsData = [
  { 
    id: 'STU001', name: 'Alice Freeman', rollNo: 'CS26-001', grNumber: 'GR-10542', department: 'Computer Science', year: 'Junior', status: 'Active', gpa: 3.8, 
    email: 'alice.f@edu.com', collegeEmail: 'alice.f@kgc.edu.com', mobile: '+1 234 567 890', institute: 'Kashibai Ganpat College', profileStatus: 'Verified',
    personalDetails: {
      certificateName: 'ALICE FREEMAN', gender: 'Female', dob: '2004-05-12', motherName: 'Mary Freeman', fatherName: 'John Freeman',
      nationality: 'American', religion: 'Christian', cast: 'General', birthPlace: 'New York, USA', bloodgroup: 'O+', languages: 'English, Spanish',
      hobbies: 'Coding, Reading', nricNo: 'SSN-1234', resident: 'Hostel', libraryQuota: 5, passportNo: 'P1234567', visaExpiry: '2028-01-01',
      isLocal: false, isDisabled: false
    },
    academicHistory: [{semester: 'Fall 2024', gpa: 3.7, status: 'Promoted'}, {semester: 'Spring 2025', gpa: 3.9, status: 'Promoted'}]
  },
  { 
    id: 'STU002', name: 'Bob Johnson', rollNo: 'ME26-045', grNumber: 'GR-10891', department: 'Mechanical Eng.', year: 'Senior', status: 'Active', gpa: 3.2,
    email: 'bob.j@edu.com', collegeEmail: 'bob.j@kgc.edu.com', mobile: '+1 987 654 321', institute: 'Kashibai Ganpat College', profileStatus: 'Pending Docs',
    personalDetails: {
      certificateName: 'BOB JOHNSON', gender: 'Male', dob: '2003-11-22', motherName: 'Sarah Johnson', fatherName: 'David Johnson',
      nationality: 'American', religion: 'Other', cast: 'General', birthPlace: 'Chicago, USA', bloodgroup: 'A+', languages: 'English',
      hobbies: 'Gaming, Basketball', nricNo: 'SSN-5678', resident: 'Home', libraryQuota: 3, passportNo: 'P7654321', visaExpiry: '2027-12-31',
      isLocal: true, isDisabled: false
    },
    academicHistory: [{semester: 'Fall 2023', gpa: 3.0, status: 'Promoted'}, {semester: 'Spring 2024', gpa: 3.3, status: 'Promoted'}]
  },
  { 
    id: 'STU003', name: 'Charlie Davis', rollNo: 'BA26-012', grNumber: 'GR-11022', department: 'Business Admin', year: 'Sophomore', status: 'Probation', gpa: 2.1,
    email: 'charlie.d@edu.com', collegeEmail: 'charlie.d@kgc.edu.com', mobile: '+1 456 789 012', institute: 'Kashibai Ganpat College', profileStatus: 'Verified',
    personalDetails: {
      certificateName: 'CHARLIE DAVIS', gender: 'Male', dob: '2005-02-14', motherName: 'Linda Davis', fatherName: 'Richard Davis',
      nationality: 'American', religion: 'Christian', cast: 'General', birthPlace: 'Los Angeles, USA', bloodgroup: 'B-', languages: 'English',
      hobbies: 'Music, Swimming', nricNo: 'SSN-9012', resident: 'Home', libraryQuota: 5, passportNo: 'P9012345', visaExpiry: '2029-06-15',
      isLocal: true, isDisabled: false
    },
    academicHistory: [{semester: 'Fall 2025', gpa: 2.1, status: 'Warning'}]
  },
  { 
    id: 'STU004', name: 'Diana Prince', rollNo: 'PH26-001', grNumber: 'GR-11500', department: 'Physics', year: 'Freshman', status: 'Active', gpa: 4.0,
    email: 'diana.p@edu.com', collegeEmail: 'diana.p@kgc.edu.com', mobile: '+1 321 654 987', institute: 'Kashibai Ganpat College', profileStatus: 'Verified',
    personalDetails: {
      certificateName: 'DIANA PRINCE', gender: 'Female', dob: '2006-08-30', motherName: 'Hippolyta', fatherName: 'Zeus',
      nationality: 'Themysciran', religion: 'Mythology', cast: 'Royal', birthPlace: 'Themyscira', bloodgroup: 'Godly', languages: 'All',
      hobbies: 'Justice, Training', nricNo: 'WONDER-1', resident: 'Hostel', libraryQuota: 10, passportNo: 'AMAZON-1', visaExpiry: '9999-12-31',
      isLocal: false, isDisabled: false
    },
    academicHistory: []
  },
];

export const facultyData = [
  { 
    id: 'FAC001', name: 'Dr. Alan Smith', department: 'Computer Science', role: 'Professor', status: 'Active', email: 'alan.smith@edu.com', 
    collegeEmail: 'alan.s@kgc.edu.com', mobile: '+1 111 222 333', institute: 'Kashibai Ganpat College', hireDate: '2015-08-15', coursesTaught: ['CS101', 'CS302'],
    personalDetails: {
      certificateName: 'ALAN SMITH', gender: 'Male', dob: '1975-04-12', motherName: 'Jane Smith', fatherName: 'Tom Smith',
      nationality: 'British', religion: 'Christian', cast: 'General', birthPlace: 'London, UK', bloodgroup: 'AB+', languages: 'English, German',
      hobbies: 'Chess, Hiking', nricNo: 'UK-12345', resident: 'Home', libraryQuota: 10, passportNo: 'P123', visaExpiry: '2030-01-01',
      isLocal: true, isDisabled: false
    }
  },
  { 
    id: 'FAC002', name: 'Prof. Sarah Jenkins', department: 'Mechanical Eng.', role: 'Associate Professor', status: 'On Leave', email: 'sarah.j@edu.com', 
    collegeEmail: 'sarah.j@kgc.edu.com', mobile: '+1 444 555 666', institute: 'Kashibai Ganpat College', hireDate: '2018-01-10', coursesTaught: ['ME201'],
    personalDetails: {
      certificateName: 'SARAH JENKINS', gender: 'Female', dob: '1982-09-25', motherName: 'Ann Jenkins', fatherName: 'Paul Jenkins',
      nationality: 'American', religion: 'Christian', cast: 'General', birthPlace: 'Boston, USA', bloodgroup: 'O-', languages: 'English, French',
      hobbies: 'Painting, Travel', nricNo: 'US-67890', resident: 'Home', libraryQuota: 8, passportNo: 'P456', visaExpiry: '2028-12-31',
      isLocal: true, isDisabled: false
    }
  },
  { 
    id: 'FAC003', name: 'Dr. Emily Davis', department: 'Physics', role: 'Assistant Professor', status: 'Active', email: 'emily.d@edu.com', 
    collegeEmail: 'emily.d@kgc.edu.com', mobile: '+1 777 888 999', institute: 'Kashibai Ganpat College', hireDate: '2020-06-01', coursesTaught: ['PHY101', 'PHY202'],
    personalDetails: {
      certificateName: 'EMILY DAVIS', gender: 'Female', dob: '1988-12-05', motherName: 'Susan Davis', fatherName: 'Mark Davis',
      nationality: 'Canadian', religion: 'None', cast: 'General', birthPlace: 'Toronto, Canada', bloodgroup: 'B+', languages: 'English',
      hobbies: 'Stargazing, Reading', nricNo: 'CA-11223', resident: 'Home', libraryQuota: 5, passportNo: 'P789', visaExpiry: '2026-06-01',
      isLocal: true, isDisabled: false
    }
  },
  { 
    id: 'FAC004', name: 'Dr. Robert Brown', department: 'Mathematics', role: 'Professor', status: 'Active', email: 'robert.b@edu.com', 
    collegeEmail: 'robert.b@kgc.edu.com', mobile: '+1 000 999 888', institute: 'Kashibai Ganpat College', hireDate: '2012-09-01', coursesTaught: ['MTH101', 'MTH301'],
    personalDetails: {
      certificateName: 'ROBERT BROWN', gender: 'Male', dob: '1970-01-01', motherName: 'Ruth Brown', fatherName: 'James Brown',
      nationality: 'American', religion: 'Other', cast: 'General', birthPlace: 'New York, USA', bloodgroup: 'A-', languages: 'English',
      hobbies: 'Sailing, Math', nricNo: 'US-44332', resident: 'Home', libraryQuota: 12, passportNo: 'P321', visaExpiry: '2035-09-01',
      isLocal: true, isDisabled: false
    }
  },
  { 
    id: 'FAC005', name: 'Dr. Lisa White', department: 'Biology', role: 'Adjunct Professor', status: 'Active', email: 'lisa.w@edu.com', 
    collegeEmail: 'lisa.w@kgc.edu.com', mobile: '+1 222 333 444', institute: 'Kashibai Ganpat College', hireDate: '2022-08-20', coursesTaught: ['BIO101'],
    personalDetails: {
      certificateName: 'LISA WHITE', gender: 'Female', dob: '1990-03-30', motherName: 'Helen White', fatherName: 'George White',
      nationality: 'American', religion: 'Christian', cast: 'General', birthPlace: 'Miami, USA', bloodgroup: 'AB-', languages: 'English, Spanish',
      hobbies: 'Gardening, Yoga', nricNo: 'US-99887', resident: 'Home', libraryQuota: 5, passportNo: 'P654', visaExpiry: '2027-08-20',
      isLocal: true, isDisabled: false
    }
  },
];

export const staffData = [
  { 
    id: 'STF001', name: 'Registrar Office', department: 'Administration', role: 'Registrar', status: 'Active', email: 'staff@edu.com',
    collegeEmail: 'registrar@kgc.edu.com', mobile: '+1 555 666 777', institute: 'Kashibai Ganpat College', hireDate: '2010-05-15',
    personalDetails: {
      certificateName: 'REGISTRAR OFFICE', gender: 'Other', dob: '1980-01-01', motherName: 'N/A', fatherName: 'N/A',
      nationality: 'American', religion: 'Other', cast: 'General', birthPlace: 'New York, USA', bloodgroup: 'O+', languages: 'English',
      hobbies: 'Management', nricNo: 'NRIC-123', resident: 'Home', libraryQuota: 10, passportNo: 'N/A', visaExpiry: 'N/A',
      isLocal: true, isDisabled: false
    }
  },
  { 
    id: 'STF002', name: 'Sarah Jenkins', department: 'HR', role: 'HR Manager', status: 'Active', email: 'sarah.h@edu.com',
    collegeEmail: 'sarah.hr@kgc.edu.com', mobile: '+1 444 333 222', institute: 'Kashibai Ganpat College', hireDate: '2018-03-20',
    personalDetails: {
      certificateName: 'SARAH JENKINS', gender: 'Female', dob: '1985-06-15', motherName: 'Jane Jenkins', fatherName: 'Mark Jenkins',
      nationality: 'American', religion: 'Christian', cast: 'General', birthPlace: 'Chicago, USA', bloodgroup: 'A+', languages: 'English',
      hobbies: 'Reading', nricNo: 'NRIC-456', resident: 'Home', libraryQuota: 5, passportNo: 'N/A', visaExpiry: 'N/A',
      isLocal: true, isDisabled: false
    }
  }
];

export const departmentsData = [
  { id: 'DPT01', name: 'Computer Science', head: 'Dr. Alan Smith' },
  { id: 'DPT02', name: 'Mechanical Engineering', head: 'Prof. Sarah Jenkins' },
  { id: 'DPT03', name: 'Physics', head: 'Dr. Emily Davis' },
];

export const categoriesData = [
  { id: 'CAT01', name: 'Undergraduate Program' },
  { id: 'CAT02', name: 'Postgraduate Program' },
  { id: 'CAT03', name: 'Certification Course' },
];

export const degreesData = [
  { id: 'DEG01', name: 'B.Sc. Computer Science', categoryId: 'CAT01', departmentId: 'DPT01' },
  { id: 'DEG02', name: 'M.Sc. Physics', categoryId: 'CAT02', departmentId: 'DPT03' },
];

export const subjectsData = [
  { id: 'SUB01', code: 'CS101', name: 'Intro to Programming', credits: 4, syllabus: 'Variables, Loops, Functions, OOP', books: 'Clean Code, Pragmatic Programmer' },
  { id: 'SUB02', code: 'PHY202', name: 'Quantum Mechanics I', credits: 4, syllabus: 'Wave functions, Schrodinger equation', books: 'Introduction to Quantum Mechanics' },
];

export const coursesData = [
  { id: 'CRS01', title: 'B.Sc. CS - First Year', degreeId: 'DEG01', subjects: ['SUB01'], instructor: 'Dr. Alan Smith', credits: 4, schedule: 'MWF 10:00 AM' },
  { id: 'CRS02', title: 'M.Sc. PHY - Advanced', degreeId: 'DEG02', subjects: ['SUB02'], instructor: 'Dr. Emily Davis', credits: 4, schedule: 'MWF 2:00 PM' },
];

export const batchesData = [
  { id: 'BAT01', name: 'Fall 2026 - CS Batch A', courseId: 'CRS01', status: 'Active', startDate: '2026-09-01', endDate: '2027-05-30', timetableConfig: { startTime: '09:00', durationMinutes: 90, periodsPerDay: 3, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }, history: [{date: '2026-04-21', action: 'Batch Created'}] },
  { id: 'BAT02', name: 'Spring 2026 - PHY Intake', courseId: 'CRS02', status: 'Completed', startDate: '2026-01-15', endDate: '2026-05-15', timetableConfig: { startTime: '09:00', durationMinutes: 90, periodsPerDay: 3, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }, history: [{date: '2026-05-15', action: 'Batch Completed'}] },
];

export const enrollmentsData = [
  { id: 'ENR01', studentId: 'STU001', batchId: 'BAT01', date: '2026-08-15', status: 'Enrolled' },
  { id: 'ENR02', studentId: 'STU004', batchId: 'BAT02', date: '2026-01-10', status: 'Completed' },
];

export const systemConfigData = {
  collegeName: 'Kashibai Ganpat College',
  collegeShortName: 'KGC',
  collegeLogo: null, // Base64 or URL
  collegeFavicon: null, // Base64 or URL
  timezone: 'UTC+05:30',
  currency: 'INR (₹)',
  loginAttempts: 5,
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: false,
};

// Phase 3: Financial Ecosystem Data
export const feeStructuresData = [
  { id: 'FST001', courseId: 'CRS01', totalAmount: 5000, breakdown: { Tuition: 3500, Lab: 1000, Library: 500 } },
  { id: 'FST002', courseId: 'CRS02', totalAmount: 7500, breakdown: { Tuition: 6000, Lab: 1000, Library: 500 } },
];

export const feesData = [
  { id: 'FEE001', studentId: 'STU001', amount: 1500, type: 'Tuition', status: 'Paid', date: '2026-08-10' },
  { id: 'FEE002', studentId: 'STU002', amount: 1500, type: 'Tuition', status: 'Pending', date: '2026-08-10' },
  { id: 'FEE003', studentId: 'STU004', amount: 500, type: 'Hostel', status: 'Paid', date: '2026-01-15' },
];

export const payrollData = [
  { id: 'PAY001', employeeId: 'FAC001', baseSalary: 8000, allowances: 1000, deductions: 500, netPay: 8500, status: 'Processed', month: 'April 2026', statutory: { tds: 200, pf: 300, gratuity: 100 } },
  { id: 'PAY002', employeeId: 'FAC002', baseSalary: 6000, allowances: 800, deductions: 400, netPay: 6400, status: 'Pending', month: 'April 2026', statutory: { tds: 150, pf: 200, gratuity: 50 } },
];


export const leavesData = [
  { id: 'LEV001', employeeId: 'FAC002', type: 'Sick Leave', days: 2, status: 'Approved' },
  { id: 'LEV002', employeeId: 'FAC003', type: 'Casual Leave', days: 1, status: 'Pending' },
];

export const financeData = {
  pettyCash: { balance: 1250, lastRefill: '2026-04-01' },
  expenses: [
    { id: 'EXP001', description: 'Lab Equipment Maintenance', amount: 450, date: '2026-04-10', category: 'Maintenance' },
    { id: 'EXP002', description: 'Office Supplies', amount: 120, date: '2026-04-15', category: 'Supplies' },
  ],
  loans: [
    { id: 'LON001', employeeId: 'FAC001', amount: 5000, type: 'Advance Salary', status: 'Active', remaining: 2500, installment: 500 },
  ]
};

// Phase 4: Day-to-Day Operations Data
export const examsData = [
  { id: 'EXM001', title: 'Midterm: Intro to Programming', courseId: 'CRS01', date: '2026-10-15', status: 'Scheduled', type: 'Descriptive' },
  { id: 'EXM002', title: 'Final: Quantum Mechanics I', courseId: 'CRS02', date: '2026-12-10', status: 'Evaluated', type: 'Objective' },
];

export const timetableData = [
  { id: 'TT001', batchId: 'BAT01', courseId: 'CRS01', subject: 'CS101', facultyId: 'FAC001', day: 'Monday', time: '10:00 AM - 11:30 AM', room: 'Lab 4', lessonNotes: 'Intro to Syntax', isSubstitute: false },
  { id: 'TT002', batchId: 'BAT02', courseId: 'CRS02', subject: 'PHY202', facultyId: 'FAC003', day: 'Wednesday', time: '02:00 PM - 04:00 PM', room: 'Hall B', lessonNotes: 'Wave Duality', isSubstitute: false },
];


export const attendanceData = [
  { id: 'ATD01', date: '2026-04-21', batchId: 'BAT01', records: { 'STU001': 'Present', 'STU003': 'Absent' } },
  { id: 'ATD02', date: '2026-04-21', batchId: 'BAT02', records: { 'STU004': 'Present' } },
];

export const libraryData = [
  { id: 'LIB001', title: 'Clean Code', author: 'Robert C. Martin', category: 'Textbook', isbn: '978-0132350884', status: 'Available', shelf: 'A-12' },
  { id: 'LIB002', title: 'Introduction to Quantum Mechanics', author: 'David J. Griffiths', category: 'Textbook', isbn: '978-1107189638', status: 'Issued', shelf: 'C-04', dueDate: '2026-04-28' },
  { id: 'LIB003', title: 'Pragmatic Programmer', author: 'Andrew Hunt', category: 'Textbook', isbn: '978-0135957059', status: 'Reserved', shelf: 'A-12' },
];

// Phase 5: Support & Infrastructure
export const hostelData = {
  rooms: [
    { id: 'RM101', block: 'A-Block', type: '2-Seater', status: 'Full', occupants: ['STU001', 'STU004'] },
    { id: 'RM102', block: 'A-Block', type: '2-Seater', status: 'Available', occupants: ['STU002'] },
  ],
  visitors: [
    { id: 'VIS001', name: 'John Freeman', relation: 'Father', studentId: 'STU001', date: '2026-04-20', timeIn: '10:00 AM', timeOut: '12:30 PM' },
  ]
};

export const documentsData = [
  { id: 'DOC001', title: 'Bonafide Certificate Template', type: 'Template', category: 'Certification', dateAdded: '2026-01-10' },
  { id: 'DOC002', title: 'Fee Concession Form', type: 'Form', category: 'Financial', dateAdded: '2026-02-15' },
  { id: 'DOC003', title: 'STU001_Passport.pdf', type: 'Upload', category: 'Student ID', dateAdded: '2026-08-10' },
];

export const communicationData = {
  tasks: [
    { id: 'TSK001', title: 'Prepare Midterm Question Papers', assignee: 'FAC001', dueDate: '2026-10-01', status: 'In Progress', priority: 'High' },
    { id: 'TSK002', title: 'Review Physics Curriculum', assignee: 'FAC003', dueDate: '2026-05-15', status: 'Pending', priority: 'Medium' },
  ],
  notices: [
    { id: 'NOT001', title: 'Campus Closed for Memorial Day', date: '2026-05-25', audience: 'All', type: 'Holiday' },
    { id: 'NOT002', title: 'Fall 2026 Registration Opens', date: '2026-04-15', audience: 'Students', type: 'Academic' },
  ]
};

export const academicCalendarData = [
  { id: 'CAL001', title: 'Fall Semester Begins', date: '2026-09-01', type: 'Academic', description: 'First day of classes for the Fall 2026 term.' },
  { id: 'CAL002', title: 'Thanksgiving Break', date: '2026-11-25', endDate: '2026-11-29', type: 'Holiday', description: 'Campus closed for Thanksgiving week.' },
  { id: 'CAL003', title: 'Final Exams Week', date: '2026-12-10', endDate: '2026-12-15', type: 'Exam', description: 'Fall semester final examinations.' },
  { id: 'CAL004', title: 'Spring Semester Begins', date: '2027-01-15', type: 'Academic', description: 'First day of classes for the Spring 2027 term.' },
  { id: 'CAL005', title: 'Spring Break', date: '2026-04-10', endDate: '2026-04-14', type: 'Holiday', description: 'Spring vacation.' },
];

export const systemHealthData = {
  status: 'Healthy',
  lastBackup: '2026-04-22 03:00 AM',
  schedulerSummary: { active: 12, expired: 2, disabled: 1, running: 1 },
  executions: { total: 450, success: 448, failed: 2 },
  errors: [
    { id: 1, type: 'Mailer', message: 'Failed to send fee reminder to STU002', time: '2026-04-22 10:05 AM' },
  ]
};

