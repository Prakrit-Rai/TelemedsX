import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Stethoscope,
  ThermometerSun,
  Activity,
  Brain,
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface SymptomCheckerProps {
  onStartConsultation: () => void;
}

type AnalysisStep = 'input' | 'analyzing' | 'results';

export function SymptomChecker({ onStartConsultation }: SymptomCheckerProps) {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('input');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const commonSymptoms = [
    'Fever',
    'Headache',
    'Cough',
    'Fatigue',
    'Body ache',
    'Sore throat',
    'Runny nose',
    'Nausea',
    'Dizziness',
    'Chest pain',
  ];

  const handleAnalyze = async () => {
    setCurrentStep('analyzing');

    try {
      const res = await fetch('http://localhost:8081/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          additionalSymptoms,
        }),
      });

      const data = await res.json();
      setResult(data);

      setCurrentStep('results');
    } catch (error) {
      console.error(error);
      alert('Error analyzing symptoms');
      setCurrentStep('input');
    }
  };

  const toggleSymptom = (symptom: string) => {
    setAdditionalSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  if (currentStep === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="mb-2">Analyzing Your Symptoms</h2>
        <p className="text-muted-foreground">Our AI is processing your information...</p>
      </div>
    );
  }

  if (currentStep === 'results' && result) {
    return (
      <div className="space-y-6">

        <div>
          <h2 className="mb-2">Symptom Analysis Results</h2>
          <p className="text-muted-foreground">
            Based on your symptoms, here's what our AI suggests
          </p>
        </div>

        {/* Severity */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>{result?.severity?.toUpperCase() || 'UNKNOWN'} Severity:</strong>{" "}
            {result.doctorNeeded
              ? "Consult a doctor soon."
              : "Monitor symptoms and rest."} 
          </AlertDescription>
        </Alert>

        {/* Conditions */}
        <Card className="p-6">
          <h3 className="mb-4">Possible Conditions</h3>

          <div className="space-y-4">
            {result.conditions?.map((c: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4>{c.name}</h4>
                    <Badge>{c.probability}% Match</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {c.reason || "AI-based possible condition (not a diagnosis)"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="mb-4">AI Recommendations</h3>

          <div className="space-y-3">
            {result.recommendations?.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Step */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-start gap-4">

            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="mb-2">Next Step</h3>

              <p className="text-muted-foreground mb-4">
                {result.doctorNeeded
                  ? "We recommend consulting a doctor for proper diagnosis."
                  : "Monitor your condition. Consult doctor if symptoms persist."}
              </p>

              <div className="flex gap-3 flex-wrap">
                <Button onClick={onStartConsultation}>
                  Book Consultation
                </Button>

                <Button variant="outline" onClick={() => setCurrentStep('input')}>
                  Check Again
                </Button>
              </div>
            </div>
          </div>
        </Card>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">AI Symptom Checker</h2>
        <p className="text-muted-foreground">
          Describe your symptoms and get an AI-powered preliminary assessment
        </p>
      </div>

      <Alert>
        <Stethoscope className="h-4 w-4" />
        <AlertDescription>
          This AI tool provides preliminary guidance only. It does not replace professional medical advice.
          Always consult a doctor for proper diagnosis.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="symptoms">Main Symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe your symptoms in detail (e.g., 'I have a fever and headache for 2 days')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">How long have you had these symptoms?</Label>
              <Select value={duration} onValueChange={setDuration} required>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-than-1-day">Less than 1 day</SelectItem>
                  <SelectItem value="1-3-days">1-3 days</SelectItem>
                  <SelectItem value="4-7-days">4-7 days</SelectItem>
                  <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                  <SelectItem value="more-than-2-weeks">More than 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity} required>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild - Doesn't interfere with daily activities</SelectItem>
                  <SelectItem value="moderate">Moderate - Some difficulty with activities</SelectItem>
                  <SelectItem value="severe">Severe - Unable to perform normal activities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Additional Symptoms (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonSymptoms.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={additionalSymptoms.includes(symptom)}
                    onCheckedChange={() => toggleSymptom(symptom)}
                  />
                  <label
                    htmlFor={symptom}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Stethoscope className="w-4 h-4 mr-2" />
            Analyze Symptoms
          </Button>
        </form>
      </Card>
    </div>
  );
}
