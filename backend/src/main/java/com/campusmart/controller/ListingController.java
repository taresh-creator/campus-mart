package com.campusmart.controller;

import com.campusmart.config.UserPrincipal;
import com.campusmart.dto.ListingRequest;
import com.campusmart.dto.ListingResponse;
import com.campusmart.dto.StatusUpdateRequest;
import com.campusmart.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getActiveListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        List<ListingResponse> listings = listingService.getActiveListings(search, category);
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/my-listings")
    public ResponseEntity<List<ListingResponse>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        List<ListingResponse> listings = listingService.getMyListings(principal.getId());
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable UUID id) {
        ListingResponse listing = listingService.getListingById(id);
        return ResponseEntity.ok(listing);
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ListingRequest request) {
        ListingResponse response = listingService.createListing(principal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ListingRequest request) {
        ListingResponse response = listingService.updateListing(id, principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        listingService.deleteListing(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StatusUpdateRequest request) {
        ListingResponse response = listingService.updateStatus(id, principal.getId(), request.getStatus());
        return ResponseEntity.ok(response);
    }
}
