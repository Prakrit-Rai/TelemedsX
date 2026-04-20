import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Heart,
  Stethoscope,
  MapPin,
  Bell,
  Calendar,
  MessageSquare,
  User,
  Menu,
  LogOut,
  Activity,
  Clock,
} from 'lucide-react';

import { SymptomChecker } from './SymptomChecker';
import { ConsultationInterface } from './ConsultationInterface';
import { PharmacyLocator } from './PharmacyLocator';
import { PatientReminders } from './PatientReminders';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
// ✅ API Imports
import { getPatientAppointments, bookAppointment, getAvailableSlots, cancelAppointment } from '../api/appointment';
import { getDoctors } from '../api/doctor';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}
interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Appointment {
  id: number;
  doctorId: number;
  appointmentTime: string; 
  status: string;
}

type PatientView =
  | 'overview'
  | 'symptom-checker'
  | 'consultation'
  | 'pharmacy'
  | 'reminders';

export function PatientDashboard({ onNavigate, onLogout }: PatientDashboardProps) {
  const [currentView, setCurrentView] = useState<PatientView>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showDoctorList, setShowDoctorList] = useState(false);

  // ✅ New States
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  // --- 1. HELPER FUNCTION ---
  const getDoctorDetails = (doctorId: number) => {
    const doc = doctors.find((d: any) => d.id === doctorId);
    if (!doc) return "Unknown Doctor";
    return `${doc.name}${doc.specialization ? ` (${doc.specialization})` : ""}`;
  };

  // --- 2. DATA LOADING ---
useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = async () => {

    const userData = localStorage.getItem("user");

    if (!userData) return; // 🛑 stop if no user

    const user = JSON.parse(userData);

    if (!user?.id) return; // 🛑 stop if id missing

    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        getPatientAppointments(user.id),
        getDoctors()
      ]);
      setUpcomingAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error("Auto-refresh error", error);
    }
  };

  loadData();

  const interval = setInterval(() => {
    if (!bookingSlot && !selectedDoctor && !selectedDate) {
      loadData();
    }
  }, 5000);

  return () => clearInterval(interval);

}, [bookingSlot, selectedDoctor, selectedDate]);

  // --- 3. BOOK APPOINTMENT HANDLER ---
  const handleBookAppointment = async (doctorId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.id) {
        alert("User not logged in");
        return;
      }

      if (!selectedSlot) {
        alert("Please select a time slot first");
        return;
      }

      // 🔒 LOCK SLOT + GLOBAL LOADING
      setBookingSlot(selectedSlot);
      setBookingLoading(true);

      const appointment = {
        patientId: user.id,
        doctorId,
        appointmentTime: selectedSlot.slice(0, 19), // ✅ keep backend safe
        notes: "General consultation"
      };

      console.log("BOOKING:", appointment);

      await bookAppointment(appointment);

      alert("Appointment booked successfully!");

      const res = await getPatientAppointments(user.id);
      setUpcomingAppointments(res.data);

      // Reset UI
      setSelectedDoctor(null);
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedSlot("");
      setShowDoctorList(false);

    } catch (error: any) {
      console.error("BOOK ERROR:", error.response?.data || error.message);

      alert(
        error.response?.data?.message ||
        "Slot already booked or unavailable"
      );

    } finally {
      // 🔓 UNLOCK EVERYTHING
      setBookingSlot(null);
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
  try {
    await cancelAppointment(appointmentId);

    alert("Appointment cancelled");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await getPatientAppointments(user.id);

    setUpcomingAppointments(res.data);

  } catch (err) {
    console.error(err);
    alert("Failed to cancel appointment");
  }
};
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    const socket = new SockJS("http://localhost:8081/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        console.log("Connected to notifications");

        stompClient.subscribe(`/topic/notifications/${user.id}`, (msg) => {
          const message = msg.body;

          console.log("NEW NOTIFICATION:", message); // 🔍 debug

          setNotifications(prev => [message, ...prev]);

          setUnreadCount(prev => {
            console.log("Increment unread:", prev + 1); // 🔍 debug
            return prev + 1;
          });
        });
      },
    });

    stompClient.activate();

    
    return () => {
      stompClient.deactivate(); 
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'symptom-checker':
        return <SymptomChecker onStartConsultation={() => setCurrentView('consultation')} />;
      case 'consultation':
        return <ConsultationInterface />;
      case 'pharmacy':
        return <PharmacyLocator />;
      case 'reminders':
        return <PatientReminders />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => setCurrentView('symptom-checker')}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Check Symptoms</h3>
                      <p className="text-xs text-muted-foreground">AI Analysis</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => setCurrentView('consultation')}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Consult Doctor</h3>
                      <p className="text-xs text-muted-foreground">Text or Voice</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => setCurrentView('pharmacy')}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Find Pharmacy</h3>
                      <p className="text-xs text-muted-foreground">Nearby</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setShowDoctorList(!showDoctorList)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Book Appointment</h3>
                      <p className="text-xs text-muted-foreground">Schedule visit</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {showDoctorList && (
              <div className="space-y-4">
                <Card className="p-4 border-blue-200 bg-blue-50/30">
                  <h3 className="mb-3 font-semibold">Select a Doctor</h3>
                  <div className="grid gap-2">
                  {doctors.map((doc: Doctor) => (
                    <div key={doc.id} className="flex justify-between items-center bg-white border p-3 rounded-md shadow-sm">
                      <div>
                        <span className="font-medium">{doc.name}</span>
                        <Badge variant="secondary" className="ml-2 font-normal">
                          {doc.specialization}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedDoctor?.id === doc.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setAvailableSlots([]);
                          setSelectedSlot("");
                        }}
                      >
                        {selectedDoctor?.id === doc.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground"
                    onClick={() => {
                      setShowDoctorList(false);
                      setSelectedDoctor(null);
                    }}>
                    Close List
                  </Button>
                </Card>

                {selectedDoctor && (
                  <Card className="p-4 border-green-200 bg-green-50/30">
                    <h3 className="font-semibold mb-2">
                      Booking with {selectedDoctor.name}
                    </h3>

                    <input
                      type="date"
                      className="border p-2 rounded mb-3 w-full max-w-xs bg-white"
                      onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                        const date = e.target.value;

                        setSelectedDate(date);
                        setSelectedSlot("");

                        if (!date || !selectedDoctor) return;

                        if (loadingSlots) return; // 🚨 prevent spam

                        try {
                          setLoadingSlots(true);

                          console.log("Fetching slots for:", selectedDoctor.id, date);

                          const res = await getAvailableSlots(selectedDoctor.id, date);

                          const slotsData = Array.isArray(res.data) ? res.data : [];

                          const now = new Date();

                          const filteredSlots = slotsData
                            .map((slotStr: string) => new Date(slotStr))
                            .filter((slotDate: Date) => slotDate > now)
                            .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                            .map((d: Date) =>
                              d.getFullYear() + "-" +
                              String(d.getMonth() + 1).padStart(2, "0") + "-" +
                              String(d.getDate()).padStart(2, "0") + "T" +
                              String(d.getHours()).padStart(2, "0") + ":" +
                              String(d.getMinutes()).padStart(2, "0") + ":00"
                            );

                          setAvailableSlots(filteredSlots);

                        } catch (err) {
                          console.error(err);
                          alert("Failed to load slots");
                        } finally {
                          setLoadingSlots(false);
                        }
                      }}
                    />

                    {/* 🔹 Loading Guard UI */}
                    {loadingSlots && (
                      <p className="text-sm text-muted-foreground animate-pulse">Loading slots...</p>
                    )}

                    {/* Available slots display grid */}
                    {!loadingSlots && availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableSlots.map((slot: string) => {
                        const time = new Date(slot).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            disabled={bookingSlot === slot} // 🔒 disables only clicked slot
                            className={`transition ${
                              selectedSlot === slot
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-white hover:bg-gray-100"
                            }`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {bookingSlot === slot
                              ? "Booking..."
                              : new Date(slot).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                          </Button>
                        );
                      })}
                      </div>
                    ) : !loadingSlots && selectedDate ? (
                      <p className="text-sm text-muted-foreground italic mt-2">
                        No slots available for this date.
                      </p>
                    ) : null}

                    <Button
                      className="mt-4 w-full md:w-auto"
                      disabled={!selectedSlot || loadingSlots || bookingLoading}
                      onClick={() => handleBookAppointment(selectedDoctor.id)}
                    >
                      {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </Card>
                )}
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
              <div className="grid gap-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{getDoctorDetails(appointment.doctorId)}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(appointment.appointmentTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant={appointment.status === 'BOOKED' ? 'default' : 'outline'}>
                        {appointment.status}
                      </Badge>
                      {appointment.status !== "CANCELLED" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
                ) : (
                  <p className="text-muted-foreground italic">No upcoming appointments found.</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <Menu className="w-5 h-5" />
              </Button>
              <Heart className="w-6 h-6 text-red-500" />
              <span className="font-bold text-lg tracking-tight">TelePharm Nepal</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setUnreadCount(0); 
                  }}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />

                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-3 border-b font-semibold">Notifications</div>

                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                        <div key={i} className="p-3 border-b text-sm hover:bg-gray-50">
                          {n}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button variant="ghost" onClick={onLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-12 gap-6">
          <aside className={`md:col-span-3 ${showMobileMenu ? 'block' : 'hidden'} md:block`}>
            <Card className="p-2 sticky top-24">
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'overview', icon: Activity, label: 'Overview' },
                  { id: 'symptom-checker', icon: Stethoscope, label: 'Symptom Checker' },
                  { id: 'consultation', icon: MessageSquare, label: 'Consultations' },
                  { id: 'pharmacy', icon: MapPin, label: 'Find Pharmacy' },
                  { id: 'reminders', icon: Bell, label: 'Reminders' },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setCurrentView(item.id as PatientView);
                      setShowMobileMenu(false);
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </Card>
          </aside>
          <main className="md:col-span-9 min-h-[calc(100vh-120px)]">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}