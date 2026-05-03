import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import { AppContext, AppContextProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';

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
const AttendanceTracking = lazy(() => import('./pages/AttendanceTracking/AttendanceTracking'));
const RecoveryCentre = lazy(() => import('./pages/RecoveryCentre/RecoveryCentre'));
const UserCredentials = lazy(() => import('./pages/UserCredentials/UserCredentials'));
const DataArchive = lazy(() => import('./pages/DataArchive/DataArchive'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
    <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading Module...</div>
  </div>
);

const MaintenanceMode = () => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: 'white', textAlign: 'center', padding: '2rem' }}>
    <ShieldAlert size={64} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>System Under Maintenance</h1>
    <p style={{ color: '#94a3b8', maxWidth: '500px', fontSize: '1.125rem' }}>We are currently performing scheduled updates to improve your experience. The KGC ERP will be back online shortly. Thank you for your patience.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </AuthProvider>
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
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes inside MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="students" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Faculty', 'Office Staff']}>
                  <Students />
                </ProtectedRoute>
              } />
              
              <Route path="faculty" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <Faculty />
                </ProtectedRoute>
              } />
              
              <Route path="staff" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff']}>
                  <Staff />
                </ProtectedRoute>
              } />
              
              <Route path="courses" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Faculty']}>
                  <Courses />
                </ProtectedRoute>
              } />
              
              <Route path="academic-setup" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <AcademicSetup />
                </ProtectedRoute>
              } />
              
              <Route path="batches" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <Batches />
                </ProtectedRoute>
              } />
              
              <Route path="payroll" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff', 'Faculty']}>
                  <Payroll />
                </ProtectedRoute>
              } />
              
              <Route path="documents" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff', 'Student']}>
                  <Documents />
                </ProtectedRoute>
              } />
              
              <Route path="fees" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff', 'Student']}>
                  <Fees />
                </ProtectedRoute>
              } />
              
              <Route path="exams" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Faculty', 'Student']}>
                  <Exams />
                </ProtectedRoute>
              } />
              
              <Route path="timetable" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Faculty', 'Student']}>
                  <Timetable />
                </ProtectedRoute>
              } />
              
              <Route path="hostel" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff', 'Student']}>
                  <Hostel />
                </ProtectedRoute>
              } />
              
              <Route path="library" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff', 'Student']}>
                  <Library />
                </ProtectedRoute>
              } />
              
              <Route path="communication" element={
                <ProtectedRoute>
                  <Communication />
                </ProtectedRoute>
              } />
              
              <Route path="system" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <SystemManagement />
                </ProtectedRoute>
              } />
              
              <Route path="finance" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Office Staff']}>
                  <Finance />
                </ProtectedRoute>
              } />
              
              <Route path="attendance" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management', 'Faculty', 'Student', 'Office Staff']}>
                  <AttendanceTracking />
                </ProtectedRoute>
              } />
              
              <Route path="recovery" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <RecoveryCentre />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <Settings />
                </ProtectedRoute>
              } />
 
              <Route path="user-credentials" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <UserCredentials />
                </ProtectedRoute>
              } />
 
              <Route path="data-archive" element={
                <ProtectedRoute allowedRoles={['Admin', 'Management']}>
                  <DataArchive />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  );
}

export default App;
