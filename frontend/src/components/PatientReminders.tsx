import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bell, Plus, Clock, Pill, Calendar, Trash2, Edit, CheckCircle } from 'lucide-react';

interface Reminder {
  id: number;
  title: string;
  type: 'medication' | 'appointment' | 'checkup';
  time: string;
  frequency: string;
  isActive: boolean;
  nextReminder: string;
  details: string;
}

export function PatientReminders() {
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      title: 'Take Paracetamol',
      type: 'medication',
      time: '9:00 AM',
      frequency: 'Every 6 hours',
      isActive: true,
      nextReminder: 'Today at 9:00 AM',
      details: '500mg after meals',
    },
    {
      id: 2,
      title: 'Blood Pressure Check',
      type: 'checkup',
      time: '8:00 AM',
      frequency: 'Daily',
      isActive: true,
      nextReminder: 'Tomorrow at 8:00 AM',
      details: 'Record and track daily readings',
    },
    {
      id: 3,
      title: 'Dr. Sita Patel Consultation',
      type: 'appointment',
      time: '10:00 AM',
      frequency: 'Jan 15, 2026',
      isActive: true,
      nextReminder: 'Jan 15 at 10:00 AM',
      details: 'Follow-up consultation',
    },
    {
      id: 4,
      title: 'Take Amoxicillin',
      type: 'medication',
      time: '8:00 AM',
      frequency: 'Twice daily',
      isActive: false,
      nextReminder: 'Completed',
      details: '250mg with water',
    },
  ]);

  const toggleReminder = (id: number) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, isActive: !reminder.isActive } : reminder
      )
    );
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-5 h-5" />;
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'checkup':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-blue-100 text-blue-700';
      case 'appointment':
        return 'bg-green-100 text-green-700';
      case 'checkup':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeReminders = reminders.filter((r) => r.isActive);
  const inactiveReminders = reminders.filter((r) => !r.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Reminders & Notifications</h2>
          <p className="text-muted-foreground">Manage your medication and appointment reminders</p>
        </div>
        <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Reminder Type</Label>
                <Select defaultValue="medication">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="checkup">Health Checkup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g., Take Paracetamol" />
              </div>

              <div className="space-y-2">
                <Label>Details</Label>
                <Input placeholder="e.g., 500mg after breakfast" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice">Twice daily</SelectItem>
                      <SelectItem value="three">Three times daily</SelectItem>
                      <SelectItem value="every-6">Every 6 hours</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" onClick={() => setShowAddReminder(false)}>
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Reminders</p>
              <h2 className="mt-2">{activeReminders.length}</h2>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Reminders</p>
              <h2 className="mt-2">
                {reminders.filter((r) => r.isActive && r.nextReminder.includes('Today')).length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Medications</p>
              <h2 className="mt-2">
                {reminders.filter((r) => r.type === 'medication' && r.isActive).length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Reminders */}
      <div>
        <h3 className="mb-4">Active Reminders</h3>
        <div className="space-y-3">
          {activeReminders.length > 0 ? (
            activeReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${getTypeColor(reminder.type)} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4>{reminder.title}</h4>
                      <Badge className={getTypeColor(reminder.type)}>{reminder.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{reminder.details}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {reminder.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {reminder.frequency}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Next: {reminder.nextReminder}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch checked={reminder.isActive} onCheckedChange={() => toggleReminder(reminder.id)} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No active reminders. Create one to get started!</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Inactive/Completed Reminders */}
      {inactiveReminders.length > 0 && (
        <div>
          <h3 className="mb-4">Inactive Reminders</h3>
          <div className="space-y-3">
            {inactiveReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4 opacity-60">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="line-through">{reminder.title}</h4>
                      <Badge variant="secondary">{reminder.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reminder.details}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Switch checked={reminder.isActive} onCheckedChange={() => toggleReminder(reminder.id)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="mb-2">Notification Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enable browser notifications to receive reminders even when you're not on the app. You'll get
              timely alerts for medications and appointments.
            </p>
            <Button variant="outline">Enable Notifications</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
