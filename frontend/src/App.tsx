import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from "./components/AdminDashboard";
type Page = 'landing' | 'login' | 'signup' | 'patient-dashboard' | 'doctor-dashboard' | 'admin-dashboard';
type UserRole = 'patient' | 'doctor' | 'admin' | null;

export default function App() {

const [currentPage, setCurrentPage] = useState<Page>('landing');
const [userRole, setUserRole] = useState<UserRole>(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");


if (token && user) {
  const parsedUser = JSON.parse(user);

  if (parsedUser.role === "PATIENT") {
    handleLogin("patient");
  }

  if (parsedUser.role === "DOCTOR") {
    handleLogin("doctor");
  }

  if (parsedUser.role === "ADMIN") {
    handleLogin("admin");
  }
}


}, []);

const handleLogin = (role: 'patient' | 'doctor' | 'admin') => {
setUserRole(role);
setIsAuthenticated(true);

if (role === 'patient') {
  setCurrentPage('patient-dashboard');
} 
else if (role === 'doctor') {
  setCurrentPage('doctor-dashboard');
} 
else if (role === 'admin') {
  setCurrentPage('admin-dashboard');
}

};

const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");
setUserRole(null);
setIsAuthenticated(false);
setCurrentPage('landing');
};

const renderPage = () => {
switch (currentPage) {
case 'landing':
return <LandingPage onNavigate={setCurrentPage} />;
case 'login':
return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
case 'signup':
return <SignupPage onNavigate={setCurrentPage} onSignup={handleLogin} />;
case 'patient-dashboard':
return <PatientDashboard onNavigate={setCurrentPage} onLogout={handleLogout} />;
case 'doctor-dashboard':
return <DoctorDashboard onNavigate={setCurrentPage} onLogout={handleLogout} />;
case 'admin-dashboard':
  return <AdminDashboard />;
default:
return <LandingPage onNavigate={setCurrentPage} />;
}
};

return <div className="min-h-screen bg-background">{renderPage()}</div>;
}
