import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MapPin, Search, Phone, Clock, Navigation, Star, ExternalLink } from 'lucide-react';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  district: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  services: string[];
}

export function PharmacyLocator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const pharmacies: Pharmacy[] = [
    {
      id: 1,
      name: 'Nepal Aushadhi Medical',
      address: 'Durbar Marg, Kathmandu',
      district: 'Kathmandu',
      phone: '+977 1-4224566',
      distance: '2.5 km',
      rating: 4.5,
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '8:00 PM',
      services: ['Home Delivery', '24/7', 'Online Order'],
    },
    {
      id: 2,
      name: 'Kathmandu Pharmacy',
      address: 'New Road, Kathmandu',
      district: 'Kathmandu',
      phone: '+977 1-4234567',
      distance: '3.2 km',
      rating: 4.2,
      isOpen: true,
      openTime: '7:00 AM',
      closeTime: '9:00 PM',
      services: ['Home Delivery', 'Online Order'],
    },
    {
      id: 3,
      name: 'Patan Medical Hall',
      address: 'Lagankhel, Lalitpur',
      district: 'Lalitpur',
      phone: '+977 1-5234890',
      distance: '5.8 km',
      rating: 4.7,
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '7:00 PM',
      services: ['Home Delivery'],
    },
    {
      id: 4,
      name: 'Bhaktapur Healthcare Pharmacy',
      address: 'Durbar Square, Bhaktapur',
      district: 'Bhaktapur',
      phone: '+977 1-6612345',
      distance: '12.5 km',
      rating: 4.3,
      isOpen: false,
      openTime: '9:00 AM',
      closeTime: '6:00 PM',
      services: ['Online Order'],
    },
    {
      id: 5,
      name: 'Pokhara Medical Store',
      address: 'Lakeside, Pokhara',
      district: 'Kaski',
      phone: '+977 61-462123',
      distance: '200 km',
      rating: 4.6,
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '8:00 PM',
      services: ['Home Delivery', '24/7'],
    },
    {
      id: 6,
      name: 'Chitwan Aushadhi Pasal',
      address: 'Bharatpur, Chitwan',
      district: 'Chitwan',
      phone: '+977 56-522334',
      distance: '146 km',
      rating: 4.1,
      isOpen: true,
      openTime: '7:00 AM',
      closeTime: '7:00 PM',
      services: ['Home Delivery'],
    },
  ];

  const districts = ['all', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Chitwan'];

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      searchQuery === '' ||
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || pharmacy.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Find Nearby Pharmacies</h2>
        <p className="text-muted-foreground">Locate pharmacies near you and check availability</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by pharmacy name or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district === 'all' ? 'All Districts' : district}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Near Me
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {filteredPharmacies.length} pharmacies
          {selectedDistrict !== 'all' && ` in ${selectedDistrict}`}
        </p>
      </div>

      {/* Pharmacy List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredPharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm">{pharmacy.name}</h3>
                    {pharmacy.isOpen ? (
                      <Badge className="bg-green-100 text-green-700">Open</Badge>
                    ) : (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(pharmacy.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({pharmacy.rating})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {pharmacy.distance}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p>{pharmacy.address}</p>
                  <p className="text-muted-foreground">{pharmacy.district}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:underline">
                  {pharmacy.phone}
                </a>
              </div>

              {/* Timings */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {pharmacy.openTime} - {pharmacy.closeTime}
                </span>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2">
                {pharmacy.services.map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPharmacies.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No pharmacies found matching your search criteria.</p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="mb-2">Can't find a nearby pharmacy?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Many pharmacies in Nepal offer home delivery services. Contact them directly to check if they
              can deliver to your location.
            </p>
            <Button variant="link" className="p-0 h-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              Report Missing Pharmacy
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
