import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, ArrowLeft } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { registerUser } from "../api/auth";

interface SignupPageProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
  onSignup: (role: 'patient' | 'doctor') => void;
}

export function SignupPage({ onNavigate, onSignup }: SignupPageProps) {
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });

  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialization: '',
  });

const handlePatientSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (patientData.password !== patientData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const user = {
    fullName: patientData.name,
    email: patientData.email,
    phone: patientData.phone,
    password: patientData.password,
    role: "PATIENT"
  };

  console.log("Sending:", user);

  try {
    const response = await registerUser(user);
    console.log("Registered:", response);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Account created! Please check your email to verify your account.");
    onNavigate("login");  

  } catch (error) {
    console.error("Signup error:", error);
    alert("Registration failed");
  }
};

  const handleDoctorSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (doctorData.password !== doctorData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const user = {
      name: doctorData.name,
      email: doctorData.email,
      phone: doctorData.phone,
      password: doctorData.password,
      role: "DOCTOR",
      licenseNumber: doctorData.licenseNumber,
      specialization: doctorData.specialization
    };

    console.log("Sending doctor:", user); // 👈 DEBUG

    try {
      const response = await registerUser(user);
      console.log("Registered:", response);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Account created! Please check your email to verify your account.");
      onNavigate("login");

    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Signup Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-10 h-10 text-red-500" />
              <span className="text-2xl font-semibold">TelePharm Nepal</span>
            </div>
            <h1 className="mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join our healthcare platform</p>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="patient">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>

              <TabsContent value="patient">
                <form onSubmit={handlePatientSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full Name</Label>
                    <Input
                      id="patient-name"
                      type="text"
                      placeholder="Ram Sharma"
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={patientData.email}
                      onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Phone Number</Label>
                    <Input
                      id="patient-phone"
                      type="tel"
                      placeholder="+977 9XXXXXXXXX"
                      value={patientData.phone}
                      onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-dob">Date of Birth</Label>
                    <Input
                      id="patient-dob"
                      type="date"
                      value={patientData.dateOfBirth}
                      onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="••••••••"
                      value={patientData.password}
                      onChange={(e) => setPatientData({ ...patientData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-confirm-password">Confirm Password</Label>
                    <Input
                      id="patient-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={patientData.confirmPassword}
                      onChange={(e) => setPatientData({ ...patientData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-terms" required />
                    <label
                      htmlFor="patient-terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Patient Account
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="doctor">
                <form onSubmit={handleDoctorSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Full Name</Label>
                    <Input
                      id="doctor-name"
                      type="text"
                      placeholder="Dr. Sita Patel"
                      value={doctorData.name}
                      onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={doctorData.email}
                      onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-phone">Phone Number</Label>
                    <Input
                      id="doctor-phone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={doctorData.phone}
                      onChange={(e) => setDoctorData({ ...doctorData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-license">Medical License Number</Label>
                    <Input
                      id="doctor-license"
                      type="text"
                      placeholder="NMC-XXXXX"
                      value={doctorData.licenseNumber}
                      onChange={(e) => setDoctorData({ ...doctorData, licenseNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialization">Specialization</Label>
                    <Input
                      id="doctor-specialization"
                      type="text"
                      placeholder="General Medicine"
                      value={doctorData.specialization}
                      onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Password</Label>
                    <Input
                      id="doctor-password"
                      type="password"
                      placeholder="••••••••"
                      value={doctorData.password}
                      onChange={(e) => setDoctorData({ ...doctorData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-confirm-password">Confirm Password</Label>
                    <Input
                      id="doctor-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={doctorData.confirmPassword}
                      onChange={(e) => setDoctorData({ ...doctorData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="doctor-terms" required />
                    <label
                      htmlFor="doctor-terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Doctor Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate('login')}>
                Sign in
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
