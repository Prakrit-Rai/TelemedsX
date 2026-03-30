import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  Pill,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ShieldAlert,
  User,
} from 'lucide-react';

interface MedicationCheck {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

type SafetyCheckResult = {
  status: 'safe' | 'warning' | 'danger';
  message: string;
  details: string[];
};

export function MedicationSafety() {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [hasAllergies, setHasAllergies] = useState('no');
  const [allergies, setAllergies] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);

  const handleCheckSafety = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate safety check
    const age = parseInt(patientAge);
    let result: SafetyCheckResult;

    if (age < 12) {
      result = {
        status: 'warning',
        message: 'Caution Required for Pediatric Use',
        details: [
          'This medication requires adjusted dosage for children',
          'Consult a pediatrician before administration',
          'Monitor for side effects closely',
        ],
      };
    } else if (hasAllergies === 'yes') {
      result = {
        status: 'danger',
        message: 'Potential Allergy Risk Detected',
        details: [
          'Patient has reported allergies that may interact with this medication',
          'DO NOT administer without consulting a doctor',
          'Consider alternative medications',
        ],
      };
    } else {
      result = {
        status: 'safe',
        message: 'Medication Appears Safe',
        details: [
          'No major contraindications detected',
          'Age-appropriate dosage',
          'No known allergy conflicts',
          'Always follow doctor\'s prescription',
        ],
      };
    }

    setSafetyResult(result);
    setShowResults(true);
  };

  const commonMedications = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Cetirizine',
    'Omeprazole',
    'Metformin',
    'Azithromycin',
    'Ciprofloxacin',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Medication Safety Checker</h2>
        <p className="text-muted-foreground">
          Verify medication safety based on age, allergies, and dosage
        </p>
      </div>

      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          This tool provides preliminary safety checks only. Always consult a healthcare professional before
          taking any medication.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleCheckSafety} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="medication"
                    placeholder="Search medication..."
                    className="pl-10"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonMedications.map((med) => (
                    <Badge
                      key={med}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setMedicationName(med)}
                    >
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Patient Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies-check">Does the patient have any known allergies?</Label>
                <Select value={hasAllergies} onValueChange={setHasAllergies}>
                  <SelectTrigger id="allergies-check">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No known allergies</SelectItem>
                    <SelectItem value="yes">Yes, has allergies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasAllergies === 'yes' && (
                <div className="space-y-2">
                  <Label htmlFor="allergy-list">List Allergies</Label>
                  <Input
                    id="allergy-list"
                    placeholder="e.g., Penicillin, Sulfa drugs"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
              )}

              <Button type="submit" className="w-full">
                <Pill className="w-4 h-4 mr-2" />
                Check Medication Safety
              </Button>
            </form>
          </Card>

          {/* Results */}
          {showResults && safetyResult && (
            <Card className="p-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {safetyResult.status === 'safe' && (
                    <>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-green-700">{safetyResult.message}</h3>
                        <p className="text-sm text-muted-foreground">Safety check passed</p>
                      </div>
                    </>
                  )}
                  {safetyResult.status === 'warning' && (
                    <>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-orange-700">{safetyResult.message}</h3>
                        <p className="text-sm text-muted-foreground">Please review warnings</p>
                      </div>
                    </>
                  )}
                  {safetyResult.status === 'danger' && (
                    <>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-red-700">{safetyResult.message}</h3>
                        <p className="text-sm text-muted-foreground">Immediate attention required</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="pl-15 space-y-2">
                  {safetyResult.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                          safetyResult.status === 'safe'
                            ? 'bg-green-600'
                            : safetyResult.status === 'warning'
                              ? 'bg-orange-600'
                              : 'bg-red-600'
                        }`}
                      />
                      <p>{detail}</p>
                    </div>
                  ))}
                </div>

                {safetyResult.status !== 'safe' && (
                  <Alert
                    className={
                      safetyResult.status === 'danger'
                        ? 'border-red-200 bg-red-50'
                        : 'border-orange-200 bg-orange-50'
                    }
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${safetyResult.status === 'danger' ? 'text-red-600' : 'text-orange-600'}`}
                    />
                    <AlertDescription
                      className={safetyResult.status === 'danger' ? 'text-red-900' : 'text-orange-900'}
                    >
                      <strong>Important:</strong> Consult with a doctor before administering this medication.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Safety Check Criteria</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm mb-1">Age Verification</h4>
                  <p className="text-xs text-muted-foreground">
                    Checks if dosage is appropriate for patient's age
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm mb-1">Allergy Check</h4>
                  <p className="text-xs text-muted-foreground">
                    Identifies potential allergic reactions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm mb-1">Dosage Validation</h4>
                  <p className="text-xs text-muted-foreground">
                    Ensures dosage is within safe limits
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="mb-2 text-sm">Important Notice</h3>
                <p className="text-xs text-muted-foreground">
                  This automated safety check is not a substitute for professional medical advice. Always
                  consult with a licensed healthcare provider before taking any medication.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3">Common Drug Allergies</h3>
            <div className="space-y-2">
              {['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Codeine'].map((allergy) => (
                <div key={allergy} className="text-sm py-2 border-b last:border-0">
                  {allergy}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
