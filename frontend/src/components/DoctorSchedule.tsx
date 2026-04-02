import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';

// API Imports
import {
  getDoctorAvailability,
  addAvailability,
  deleteAvailability,
  toggleAvailability,
} from "../api/availability";

import { getDoctorAppointments } from "../api/appointment";

export function DoctorSchedule() {

  // --- STATE ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddSlot, setShowAddSlot] = useState(false);

  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newSlotDuration, setNewSlotDuration] = useState("30");

  // 🔥 NEW (Recurring)
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");

  // --- LOAD DATA ---
  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user.id) {
        const [availabilityRes, appointmentRes] = await Promise.all([
          getDoctorAvailability(user.id),
          getDoctorAppointments(user.id)
        ]);

        setTimeSlots(availabilityRes.data);
        setAppointments(appointmentRes.data);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS ---
  const toggleSlotStatus = async (id: number) => {
    try {
      await toggleAvailability(id);
      await loadData();
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // 🔥 VALIDATION
      if (!newStartTime || !newEndTime || (!isRecurring && !newDate) || (isRecurring && !selectedDay)) {
        alert("Please fill all required fields");
        return;
      }

      if (newStartTime >= newEndTime) {
        alert("End time must be after start time");
        return;
      }

      const payload = {
        doctorId: user.id,
        startTime: newStartTime,
        endTime: newEndTime,
        slotDuration: parseInt(newSlotDuration),
        isActive: true,
        ...(isRecurring
          ? { dayOfWeek: selectedDay }
          : { date: newDate })
      };

      await addAvailability(payload);

      alert("Availability added!");
      await loadData();

      // reset
      setShowAddSlot(false);
      setNewDate("");
      setNewStartTime("");
      setNewEndTime("");
      setSelectedDay("");
      setIsRecurring(false);

    } catch (err) {
      console.error(err);
      alert("Failed to add availability");
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Schedule Management</h2>
          <p className="text-muted-foreground">Manage your availability and appointments</p>
        </div>

        <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Time Block
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Block</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">

              {/* 🔥 RECURRING SWITCH */}
              <div className="flex items-center justify-between">
                <Label>Recurring Weekly</Label>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>

              {/* 🔥 DATE OR DAY */}
              {isRecurring ? (
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONDAY">Monday</SelectItem>
                    <SelectItem value="TUESDAY">Tuesday</SelectItem>
                    <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                    <SelectItem value="THURSDAY">Thursday</SelectItem>
                    <SelectItem value="FRIDAY">Friday</SelectItem>
                    <SelectItem value="SATURDAY">Saturday</SelectItem>
                    <SelectItem value="SUNDAY">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              )}

              {/* TIME */}
              <div className="grid grid-cols-2 gap-4">
                <Input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
                <Input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
              </div>

              {/* DURATION */}
              <Select value={newSlotDuration} onValueChange={setNewSlotDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full" onClick={handleAddAvailability}>
                Add Time Block
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* SCHEDULE */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="mb-4">Schedule</h3>

            {timeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No availability found.
              </p>
            ) : (
              timeSlots.map((slot) => (
                <Card key={slot.id} className="p-4 bg-gray-50 mb-2">
                  <div className="flex justify-between">

                    <div>
                      <p className="font-medium">
                        {slot.dayOfWeek || new Date(slot.date).toLocaleDateString(undefined, { weekday: "long" })}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {slot.date || "Recurring"}
                      </p>

                      <p className="text-sm">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <Switch
                        checked={slot.isActive ?? true}
                        onCheckedChange={() => toggleSlotStatus(slot.id)}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm("Delete this slot?")) {
                            await deleteAvailability(slot.id);
                            await loadData();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>

                    </div>
                  </div>
                </Card>
              ))
            )}
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* CALENDAR */}
          <Card className="p-6">
            <h3 className="mb-4">Calendar</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
            />
          </Card>

          {/* APPOINTMENTS */}
          <Card className="p-6">
            <h3 className="mb-4">Appointments</h3>

            <ScrollArea className="h-[300px]">
              {appointments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No appointments
                </p>
              ) : (
                appointments.map((a) => (
                  <Card key={a.id} className="p-3 mb-2 bg-gray-50">
                    <p className="text-sm font-semibold">
                      Patient ID: {a.patientId}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(a.appointmentTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>

                    <Badge className="mt-2">{a.status}</Badge>
                  </Card>
                ))
              )}
            </ScrollArea>
          </Card>

        </div>
      </div>
    </div>
  );
}