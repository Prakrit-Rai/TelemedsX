package com.metameds.backend.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.service.PharmacyService;

@RestController
@RequestMapping("/api/pharmacies")
@CrossOrigin(origins = "*")
public class PharmacyController {

    @Autowired
    private PharmacyService pharmacyService;

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearby(
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        return ResponseEntity.ok(pharmacyService.getNearby(lat, lng));
    }
}