import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import StudentDirectory from './pages/StudentDirectory';
import StudentEnrollment from './pages/StudentEnrollment';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import AttendanceReports from './pages/AttendanceReports';
import AttendanceHistory from './pages/AttendanceHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="students" element={<StudentDirectory />} />
          <Route path="students/new" element={<StudentEnrollment />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<AttendanceReports />} />
          <Route path="history" element={<AttendanceHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
