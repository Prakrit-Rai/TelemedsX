import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  User,
  Clock,
  Search,
  Filter,
  MessageSquare,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { startAppointment, completeAppointment, getDoctorAppointments } from '../api/appointment';

interface Patient {
  id: number;
  name: string;
  symptoms: string;
  time: string;
  type: 'Voice Call' | 'Text Chat';
  status: 'waiting' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  waitTime: string;
}

export function PatientQueue() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const mapStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
      case "waiting":
        return "waiting";

      case "in_progress":
      case "in-progress":
        return "in-progress";

      case "completed":
        return "completed";

      default:
        return "waiting";
    }
  };
  
useEffect(() => {
  const fetchPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return;
      const res = await getDoctorAppointments(user.id);

      const today = new Date().toDateString();

      const mapped = res.data
        .filter((a: any) => {
          return new Date(a.appointmentTime).toDateString() === today;
        })
        .map((a: any) => ({
          id: a.id,
          name: a.name || `Patient #${a.patientId}`,
          symptoms: a.notes || "General consultation",

          time: new Date(a.appointmentTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),

          type: a.type || 'Voice Call',
          status: mapStatus(a.status),
          priority: a.priority || 'medium',
          waitTime: a.waitTime || '0 min',
        }));
      setPatients(mapped);
    } catch (err) {
      console.error("Queue fetch error", err);
    }
  };

  fetchPatients();
  const interval = setInterval(fetchPatients, 5000);

  // CRITICAL: Return a cleanup function
  return () => clearInterval(interval); 
}, []); // Empty dependency array is correct

  const filterByStatus = (status: string) => {
    if (status === 'all') return patients;
    return patients.filter((p) => p.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Patient Queue</h2>
          <p className="text-muted-foreground">Manage your patient consultations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search patients..." className="pl-10" />
      </div>

      {/* Queue Tabs */}
      <Tabs defaultValue="waiting">
        <TabsList>
          <TabsTrigger value="all">All ({patients.length})</TabsTrigger>
          <TabsTrigger value="waiting">
            Waiting ({patients.filter((p) => p.status === 'waiting').length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({patients.filter((p) => p.status === 'in-progress').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({patients.filter((p) => p.status === 'completed').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'waiting', 'in-progress', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-3">
              {filterByStatus(status).map((patient) => (
                <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm">{patient.name}</h3>
                          <Badge className={`text-xs ${getPriorityColor(patient.priority)}`}>
                            {patient.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{patient.symptoms}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Scheduled: {patient.time}
                          </div>
                          {patient.status === 'waiting' && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Waiting: {patient.waitTime}
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {patient.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {patient.status === 'waiting' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              try {
                                await startAppointment(patient.id);
                                localStorage.setItem("activePatient", JSON.stringify(patient));
                                // Update local state to move patient from 'waiting' to 'in-progress'
                                setPatients(prev => 
                                  prev.map(p => p.id === patient.id ? { ...p, status: 'in-progress' } : p)
                                );
                              } catch (error) {
                                console.error("Failed to start appointment:", error);
                              }
                            }}
                          >
                            {patient.type === 'Voice Call' ? (
                              <>
                                <Phone className="w-3 h-3 mr-1" />
                                Start Call
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Start Chat
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </>
                      )}
                      {patient.status === 'in-progress' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await completeAppointment(patient.id);
                                // Update local state to move patient from 'in-progress' to 'completed'
                                setPatients(prev => 
                                  prev.map(p => p.id === patient.id ? { ...p, status: 'completed' } : p)
                                );
                              } catch (error) {
                                console.error("Failed to complete appointment:", error);
                              }
                            }}
                          >
                            End Session
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowPrescription(true)}>
                            <FileText className="w-3 h-3 mr-1" />
                            Prescribe
                          </Button>
                        </>
                      )}
                      {patient.status === 'completed' && (
                        <>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                          <Button size="sm" variant="outline">
                            View Notes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Prescription Dialog */}
      <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea placeholder="Enter diagnosis..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Medications</Label>
              <Textarea placeholder="Enter medications with dosage and duration..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea placeholder="Special instructions for the patient..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Follow-up</Label>
              <Input type="text" placeholder="e.g., After 1 week" />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1">Issue Prescription</Button>
              <Button variant="outline" onClick={() => setShowPrescription(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
