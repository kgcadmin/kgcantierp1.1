import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login/Login';
import { AppContext, AppContextProvider } from './context/AppContext';
import { ShieldAlert } from 'lucide-react';

// Lazy loaded modules to keep the app lightweight
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Students = lazy(() => import('./pages/Students/Students'));
const Faculty = lazy(() => import('./pages/Faculty/Faculty'));
const Staff = lazy(() => import('./pages/Staff/Staff'));
const Courses = lazy(() => import('./pages/Courses/Courses'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const AcademicSetup = lazy(() => import('./pages/AcademicSetup/AcademicSetup'));
const Batches = lazy(() => import('./pages/Batches/Batches'));
const Payroll = lazy(() => import('./pages/Payroll/Payroll'));
const Documents = lazy(() => import('./pages/Documents/Documents'));
const Fees = lazy(() => import('./pages/Fees/Fees'));
const Exams = lazy(() => import('./pages/Exams/Exams'));
const Timetable = lazy(() => import('./pages/Timetable/Timetable'));
const Hostel = lazy(() => import('./pages/Hostel/Hostel'));
const Library = lazy(() => import('./pages/Library/Library'));
const Communication = lazy(() => import('./pages/Communication/Communication'));
const SystemManagement = lazy(() => import('./pages/SystemManagement/SystemManagement'));
const Finance = lazy(() => import('./pages/Finance/Finance'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
    <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading Module...</div>
  </div>
);

const MaintenanceMode = () => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: 'white', textAlign: 'center', padding: '2rem' }}>
    <ShieldAlert size={64} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>System Under Maintenance</h1>
    <p style={{ color: '#94a3b8', maxWidth: '500px', fontSize: '1.125rem' }}>We are currently performing scheduled updates to improve your experience. The EduSec ERP will be back online shortly. Thank you for your patience.</p>
  </div>
);

function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}

function AppContent() {
  const { systemConfig } = useContext(AppContext);

  if (systemConfig?.maintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>

          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes inside MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="faculty" element={<Faculty />} />
              <Route path="staff" element={<Staff />} />
              <Route path="courses" element={<Courses />} />
              <Route path="academic-setup" element={<AcademicSetup />} />
              <Route path="batches" element={<Batches />} />
              
              {/* New ERP Modules */}
              <Route path="payroll" element={<Payroll />} />
              <Route path="documents" element={<Documents />} />
              <Route path="fees" element={<Fees />} />
              <Route path="exams" element={<Exams />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="hostel" element={<Hostel />} />
              <Route path="library" element={<Library />} />
              <Route path="communication" element={<Communication />} />
              <Route path="system" element={<SystemManagement />} />
              <Route path="finance" element={<Finance />} />
              
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  );
}


export default App;
