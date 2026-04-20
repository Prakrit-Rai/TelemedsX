import { Button } from './ui/button';
import { Card } from './ui/card';
import { Heart, Stethoscope, MapPin, Shield, Clock, Pill } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'signup') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-semibold">TeleMeds Nepal</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => onNavigate('login')}>
                Login
              </Button>
              <Button onClick={() => onNavigate('signup')}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6">
              Healthcare Access for Everyone in Nepal
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with doctors remotely, get AI-powered symptom analysis, and find nearby pharmacies.
              Quality healthcare support for rural and low-connectivity regions.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => onNavigate('signup')}>
                Start Consultation
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>
                I'm a Doctor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mb-2">AI Symptom Analysis</h3>
              <p className="text-muted-foreground">
                Get instant AI-powered triage and symptom analysis to understand your condition better.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-2">Remote Consultation</h3>
              <p className="text-muted-foreground">
                Consult with licensed doctors via text or voice from the comfort of your home.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mb-2">Pharmacy Locator</h3>
              <p className="text-muted-foreground">
                Find nearby pharmacies and check medication availability in your area.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Pill className="w-6 h-6 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Never miss a dose with automated medication and appointment reminders.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your health data is encrypted and protected with the highest security standards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="mb-2">Describe Your Symptoms</h3>
                  <p className="text-muted-foreground">
                    Use our AI-powered symptom checker to get an initial assessment of your condition.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="mb-2">Connect with a Doctor</h3>
                  <p className="text-muted-foreground">
                    Book a consultation and connect with qualified doctors via text or voice call.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="mb-2">Get Your Prescription</h3>
                  <p className="text-muted-foreground">
                    Receive digital prescriptions and find nearby pharmacies to collect your medication.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="mb-2">Stay on Track</h3>
                  <p className="text-muted-foreground">
                    Get automated reminders for medication and follow-up appointments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of patients who trust TeleMeds Nepal for their healthcare needs.
            </p>
            <Button size="lg" onClick={() => onNavigate('signup')}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2026 TeleMeds Nepal. Bringing healthcare to every corner of Nepal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
