package com.metameds.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PharmacyService {

    public List<Map<String, Object>> getNearby(double lat, double lng) {

        try {
            String overpassUrl = "https://overpass-api.de/api/interpreter";

            String query = "[out:json][timeout:25];" +
                    "(" +
                    "node[\"amenity\"=\"pharmacy\"](around:3000," + lat + "," + lng + ");" +
                    "way[\"amenity\"=\"pharmacy\"](around:3000," + lat + "," + lng + ");" +
                    "relation[\"amenity\"=\"pharmacy\"](around:3000," + lat + "," + lng + ");" +
                    ");out center;";

            RestTemplate restTemplate = new RestTemplate();

            // 🔥 NO ENCODING AT ALL
            String url = overpassUrl + "?data=" + query;

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    Map.class
            );

            Map body = response.getBody();

            if (body == null) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> elements =
                    (List<Map<String, Object>>) body.get("elements");

            List<Map<String, Object>> pharmacies = new ArrayList<>();

            for (Map<String, Object> el : elements) {

                Map<String, Object> tags =
                        (Map<String, Object>) el.get("tags");

                if (tags == null) tags = new HashMap<>();

                Map<String, Object> p = new HashMap<>();

                p.put("id", el.get("id"));
                p.put("name", tags.getOrDefault("name", "Unnamed Pharmacy"));
                p.put("address", "Nearby location");
                p.put("district", "Nearby");

                String phone = "N/A";
                if (tags.get("phone") != null) {
                    phone = tags.get("phone").toString();
                } else if (tags.get("contact:phone") != null) {
                    phone = tags.get("contact:phone").toString();
                }
                p.put("phone", phone);

                Double latVal = null;
                Double lonVal = null;

                if (el.get("lat") != null) {
                    latVal = ((Number) el.get("lat")).doubleValue();
                    lonVal = ((Number) el.get("lon")).doubleValue();
                } else if (el.get("center") != null) {
                    Map<String, Object> center = (Map<String, Object>) el.get("center");
                    latVal = ((Number) center.get("lat")).doubleValue();
                    lonVal = ((Number) center.get("lon")).doubleValue();
                }

                p.put("lat", latVal);
                p.put("lng", lonVal);

                p.put("distance", "Nearby");
                p.put("rating", "N/A");
                p.put("isOpen", "Unknown");
                p.put("openTime", "N/A");
                p.put("closeTime", "N/A");
                p.put("services", List.of("Pharmacy"));

                pharmacies.add(p);
            }

            return pharmacies;

        } catch (Exception e) {
            System.out.println("Overpass API error: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}