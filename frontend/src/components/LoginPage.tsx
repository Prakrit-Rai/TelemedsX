import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, ArrowLeft } from 'lucide-react';
import { loginUser } from "../api/auth";

interface LoginPageProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
  onLogin: (role: 'patient' | 'doctor') => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {

  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');

  // ✅ Auto login if token already exists
  useEffect(() => {

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {

      const parsedUser = JSON.parse(user);

      if (parsedUser.role === "PATIENT") {
        onLogin("patient");
      }

      if (parsedUser.role === "DOCTOR") {
        onLogin("doctor");
      }

    }

  }, [onLogin]);


  const handlePatientLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    const credentials = {
      email: patientEmail,
      password: patientPassword
    };

    try {

      const response = await loginUser(credentials);

      if (response.user.role === "PATIENT") {

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("Token saved:", response.token);

        onLogin("patient");

      } else {

        alert("This account is not registered as a Patient.");

      }

    } catch (error) {

      console.error("Login Error:", error);
      alert("Invalid email or password");

    }

  };


  const handleDoctorLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    const credentials = {
      email: doctorEmail,
      password: doctorPassword
    };

    try {

      const response = await loginUser(credentials);

      if (response.user.role === "DOCTOR") {

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("Token saved:", response.token);

        onLogin("doctor");

      } else {

        alert("This account is not registered as a Doctor.");

      }

    } catch (error) {

      console.error("Login Error:", error);
      alert("Invalid email or password");

    }

  };


  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

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


      <div className="container mx-auto px-4 py-12">

        <div className="max-w-md mx-auto">

          <div className="text-center mb-8">

            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-10 h-10 text-red-500" />
              <span className="text-2xl font-semibold">TelePharm Nepal</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>

            <p className="text-muted-foreground">
              Sign in to your account
            </p>

          </div>


          <Card className="p-6">

            <Tabs defaultValue="patient">

              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>


              {/* PATIENT LOGIN */}

              <TabsContent value="patient">

                <form onSubmit={handlePatientLogin} className="space-y-4">

                  <div className="space-y-2">

                    <Label htmlFor="patient-email">Email</Label>

                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      required
                    />

                  </div>


                  <div className="space-y-2">

                    <Label htmlFor="patient-password">Password</Label>

                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="••••••••"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      required
                    />

                  </div>


                  <Button type="submit" className="w-full">
                    Sign In as Patient
                  </Button>

                </form>

              </TabsContent>


              {/* DOCTOR LOGIN */}

              <TabsContent value="doctor">

                <form onSubmit={handleDoctorLogin} className="space-y-4">

                  <div className="space-y-2">

                    <Label htmlFor="doctor-email">Email</Label>

                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      required
                    />

                  </div>


                  <div className="space-y-2">

                    <Label htmlFor="doctor-password">Password</Label>

                    <Input
                      id="doctor-password"
                      type="password"
                      placeholder="••••••••"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      required
                    />

                  </div>


                  <Button type="submit" className="w-full">
                    Sign In as Doctor
                  </Button>

                </form>

              </TabsContent>

            </Tabs>


            <div className="mt-6 text-center text-sm">

              <span className="text-muted-foreground">
                Don't have an account?
              </span>

              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => onNavigate('signup')}
              >
                Sign up
              </Button>

            </div>

          </Card>

        </div>

      </div>

    </div>

  );

}

