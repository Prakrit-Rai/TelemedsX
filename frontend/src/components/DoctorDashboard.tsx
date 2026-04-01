import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { ScrollArea } from './ui/scroll-area';
import {
  Heart,
  Calendar as CalendarIcon,
  Clock,
  Users,
  User,
  MessageSquare,
  Activity,
  LogOut,
  Menu,
  Bell,
  CheckCircle,
  XCircle,
  Pause,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { DoctorSchedule } from './DoctorSchedule';
import { PatientQueue } from './PatientQueue';
import { ConsultationInterface } from './ConsultationInterface';
import { useEffect } from 'react';
import { getDoctorAppointments, completeAppointment, cancelAppointment, getRecentActivity } from '../api/appointment';

interface DoctorDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type DoctorView = 'overview' | 'schedule' | 'patients' | 'consultations';

export function DoctorDashboard({ onNavigate, onLogout }: DoctorDashboardProps) {
  const [currentView, setCurrentView] = useState<DoctorView>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const handleComplete = async (id: number) => {
  try {
    await completeAppointment(id);
  } catch (err) {
    console.error(err);
    alert("Failed to complete appointment");
  }
};

const handleCancel = async (id: number) => {
  try {
    await cancelAppointment(id);
  } catch (err) {
    console.error(err);
    alert("Failed to cancel appointment");
  }
};
  useEffect(() => {
  const loadDoctorData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setDoctor(user);

      if (!user.id) return;

      const res = await getDoctorAppointments(user.id);
      setAppointments(res.data);

      const res2 = await getRecentActivity(user.id);
      setActivities(res2.data);
      

    } catch (err) {
      console.error("Doctor data error", err);
    }
  };

  loadDoctorData();

  // real-time polling
  const interval = setInterval(loadDoctorData, 5000);
  return () => clearInterval(interval);

}, []);

  const todayAppointments = appointments.filter((a) => {
    const apptDate = new Date(a.appointmentTime);
    const today = new Date();

    return (
      apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate()
    );
  });
  
  const todayStats = {
    totalConsultations: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === "COMPLETED").length,
    pending: todayAppointments.filter(a => a.status === "BOOKED").length,
    cancelled: todayAppointments.filter(a => a.status === "CANCELLED").length,
  };

  const renderContent = () => {
    switch (currentView) {
      case 'schedule':
        return <DoctorSchedule />;
      case 'patients':
        return <PatientQueue />;
      case 'consultations':
        return <ConsultationInterface />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Today</p>
                    <h2 className="mt-2">{todayStats.totalConsultations}</h2>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <h2 className="mt-2">{todayStats.completed}</h2>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <h2 className="mt-2">{todayStats.pending}</h2>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <h2 className="mt-2">{todayStats.cancelled}</h2>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2>Today's Patients</h2>
                    <Button variant="outline" size="sm" onClick={() => setCurrentView('patients')}>
                      View All
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {todayAppointments.map((appt) => {
                      const time = new Date(appt.appointmentTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const isToday =
                        new Date(appt.appointmentTime).toDateString() === new Date().toDateString();

                      return (
                        <Card key={appt.id} className="p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                              <h3 className="text-sm">
                                {appt.name || "Unknown Patient"}
                              </h3>
                                <p className="text-sm text-muted-foreground">
                                  Appointment Scheduled
                                </p>

                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1 text-xs">
                                    <Clock className="w-3 h-3" />
                                    {time}
                                  </div>

                                  <Badge variant="outline" className="text-xs">
                                    {appt.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {appt.status === "BOOKED" && (
                                <>
                                  <Button size="sm" onClick={() => setCurrentView('consultations')}>
                                    Start
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleComplete(appt.id)}
                                  >
                                    Complete
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancel(appt.id)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}

                              {appt.status === "COMPLETED" && (
                                <Badge className="bg-green-600 text-white">Completed</Badge>
                              )}

                              {appt.status === "CANCELLED" && (
                                <Badge variant="destructive">Cancelled</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h2 className="mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const time = new Date(activity.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'completed'
                                ? 'bg-green-100'
                                : activity.type === 'cancelled'
                                ? 'bg-red-100'
                                : 'bg-purple-100'
                            }`}
                          >
                            {activity.type === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {activity.type === 'cancelled' && <XCircle className="w-4 h-4 text-red-600" />}
                            {activity.type === 'scheduled' && <CalendarIcon className="w-4 h-4 text-purple-600" />}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.patientName}</span> - {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">{time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Calendar & Quick Actions */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="mb-4">Schedule</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    className="rounded-md border"
                  />
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => setCurrentView('schedule')}
                  >
                    Manage Schedule
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Heart className="w-6 h-6 text-red-500" />
              <span className="font-semibold">TelePharm Nepal</span>
              <Badge variant="secondary" className="ml-2">
                Doctor Portal
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className={`md:col-span-3 ${showMobileMenu ? 'block' : 'hidden'} md:block`}>
            <Card className="p-4">
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {doctor?.role === "DOCTOR" 
                        ? `Dr. ${doctor?.name || doctor?.fullName || "User"}` 
                        : doctor?.name || doctor?.fullName || "User"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {doctor?.specialization || "General"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant={currentView === 'overview' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentView('overview');
                    setShowMobileMenu(false);
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={currentView === 'patients' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentView('patients');
                    setShowMobileMenu(false);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Patient Queue
                </Button>
                <Button
                  variant={currentView === 'consultations' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentView('consultations');
                    setShowMobileMenu(false);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Consultations
                </Button>
                <Button
                  variant={currentView === 'schedule' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentView('schedule');
                    setShowMobileMenu(false);
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
