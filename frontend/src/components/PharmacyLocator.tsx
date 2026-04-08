  import { useState,useEffect } from 'react';
  import { Button } from './ui/button';
  import { Card } from './ui/card';
  import { Input } from './ui/input';
  import { Badge } from './ui/badge';
  import { MapPin, Search, Phone, Clock, Navigation, Star, ExternalLink } from 'lucide-react';
  import { getNearbyPharmacies } from "../api/pharmacy";

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
    lat: number;   
    lng: number;   
    distanceValue: number;
  }

  export function PharmacyLocator() {
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return (R * c).toFixed(2); // km
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    
    const fetchNearbyPharmacies = async (coords: { lat: number; lng: number }) => {
      try {
        const res = await getNearbyPharmacies(coords.lat, coords.lng);

        console.log("API RESPONSE:", res.data); 

    const results = res.data || [];

    const mapped = results
      .filter((p: any) =>
        p.name &&
        p.name.trim() !== "" &&
        p.name !== "Unnamed Pharmacy" &&
        p.name !== "Unknown"
      )
      .map((p: any, index: number) => {
        const distance = (p.lat && p.lng)
          ? parseFloat(calculateDistance(coords.lat, coords.lng, p.lat, p.lng))
          : 999;

        return {
          id: p.id || index,
          name: p.name,
          address: p.address || "Nearby location",
          lat: p.lat,
          lng: p.lng,
          district: "Nearby",
          phone: p.phone || "N/A",
          distance: distance + " km",
          distanceValue: distance, 
          rating: 4,
          isOpen: true,
          openTime: "N/A",
          closeTime: "N/A",
          services: ["Pharmacy"],
        };
      })
      .sort((a: Pharmacy, b: Pharmacy) => a.distanceValue - b.distanceValue);

        console.log("MAPPED:", mapped); 

        setPharmacies(mapped);
        localStorage.setItem("pharmacies", JSON.stringify(mapped));
      } catch (err) {
        console.error(err);
        alert("Failed to fetch nearby pharmacies");
      } finally {
        setLoadingLocation(false);
      }
    };
    useEffect(() => {
      const savedPharmacies = localStorage.getItem("pharmacies");
      const savedLocation = localStorage.getItem("location");

      if (savedPharmacies) {
        setPharmacies(JSON.parse(savedPharmacies));
      }

      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    }, []);
    useEffect(() => {
      if (location) {
        fetchNearbyPharmacies(location);
      }
    }, [location]);
    const handleNearMe = () => {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          setLocation(coords);
          localStorage.setItem("location", JSON.stringify(coords));           
        },
        (err) => {
          console.error(err);
          alert("Failed to get location");
          setLoadingLocation(false);
        }
      );
    };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (!pharmacy.name) return false;

    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase();

    return (
      pharmacy.name.toLowerCase().includes(query) ||
      pharmacy.address.toLowerCase().includes(query)
    );
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
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleNearMe}disabled={loadingLocation}>
                <Navigation className="w-4 h-4 mr-2" />
                {loadingLocation ? "Finding..." : "Near Me"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p>
            {loadingLocation
              ? "Searching nearby pharmacies..."
              : location
              ? `Found ${filteredPharmacies.length} pharmacies near you`
              : `Found ${filteredPharmacies.length} pharmacies`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredPharmacies.map((pharmacy) => (
            <Card key={`${pharmacy.id}-${pharmacy.name}`} className="p-6 hover:shadow-lg transition-shadow">
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
                {pharmacy.phone !== "N/A" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:underline">
                      {pharmacy.phone}
                    </a>
                  </div>
                )}

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
                  <Button
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`,
                        "_blank"
                      )
                    }
                  >
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
