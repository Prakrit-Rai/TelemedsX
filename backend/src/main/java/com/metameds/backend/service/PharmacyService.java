package com.metameds.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PharmacyService {

    public List<Map<String, Object>> getNearby(double lat, double lng) {

        try {
            String overpassUrl = "https://overpass-api.de/api/interpreter";

            String query = "[out:json];node(around:3000," + lat + "," + lng + ")[\"amenity\"=\"pharmacy\"];out;";

            RestTemplate restTemplate = new RestTemplate();

            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    overpassUrl + "?data=" + query,
                    HttpMethod.GET,
                    entity,
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

                Map<String, Object> p = new HashMap<>();

                p.put("id", el.get("id"));
                p.put("name", tags != null ? tags.getOrDefault("name", "Unnamed Pharmacy") : "Unknown");
                p.put("address", "Nearby location");
                p.put("district", "Nearby");
                String phone = "N/A";
                if (tags != null) {
                    if (tags.get("phone") != null) {
                        phone = tags.get("phone").toString();
                    } else if (tags.get("contact:phone") != null) {
                        phone = tags.get("contact:phone").toString();
                    }
                }
                p.put("phone", phone);
                p.put("distance", "Nearby");
                p.put("rating", 4.0);
                p.put("isOpen", true);
                p.put("openTime", "N/A");
                p.put("closeTime", "N/A");
                p.put("services", List.of("Pharmacy"));
                p.put("lat", el.get("lat"));
                p.put("lng", el.get("lon"));
                pharmacies.add(p);
            }

            return pharmacies;

        } catch (Exception e) {
            e.printStackTrace(); 
            return new ArrayList<>();
        }
    }
}