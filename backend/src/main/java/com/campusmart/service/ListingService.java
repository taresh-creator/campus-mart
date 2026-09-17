package com.campusmart.service;

import com.campusmart.dto.ListingRequest;
import com.campusmart.dto.ListingResponse;
import com.campusmart.dto.SellerDto;
import com.campusmart.exception.ResourceNotFoundException;
import com.campusmart.exception.UnauthorizedException;
import com.campusmart.model.Listing;
import com.campusmart.model.Profile;
import com.campusmart.repository.ListingRepository;
import com.campusmart.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final ProfileRepository profileRepository;

    public ListingService(ListingRepository listingRepository, ProfileRepository profileRepository) {
        this.listingRepository = listingRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getActiveListings(String search, String category) {
        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String sanitizedCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) 
                ? category.trim() 
                : null;

        return listingRepository.searchActiveListings(sanitizedSearch, sanitizedCategory)
                .stream()
                .map(this::mapToListingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(UUID id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));
        return mapToListingResponse(listing);
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getMyListings(UUID userId) {
        return listingRepository.findBySellerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToListingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ListingResponse createListing(UUID userId, ListingRequest request) {
        Profile seller = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setTitle(request.getTitle().trim());
        listing.setDescription(request.getDescription().trim());
        listing.setCategory(request.getCategory());
        listing.setCondition(request.getCondition());
        listing.setPrice(request.getPrice());
        listing.setPriceType(request.getPriceType() != null ? request.getPriceType() : "Fixed");
        listing.setContact(request.getContact().trim());
        listing.setLocation(request.getLocation().trim());
        listing.setImageUrl(request.getImageUrl());
        listing.setStatus(request.getStatus() != null ? request.getStatus() : "active");
        listing.setCreatedAt(Instant.now());

        Listing saved = listingRepository.save(listing);
        return mapToListingResponse(saved);
    }

    @Transactional
    public ListingResponse updateListing(UUID listingId, UUID userId, ListingRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        if (!listing.getSeller().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to update this listing");
        }

        listing.setTitle(request.getTitle().trim());
        listing.setDescription(request.getDescription().trim());
        listing.setCategory(request.getCategory());
        listing.setCondition(request.getCondition());
        listing.setPrice(request.getPrice());
        if (request.getPriceType() != null) {
            listing.setPriceType(request.getPriceType());
        }
        listing.setContact(request.getContact().trim());
        listing.setLocation(request.getLocation().trim());
        if (request.getImageUrl() != null) {
            listing.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            listing.setStatus(request.getStatus());
        }

        Listing updated = listingRepository.save(listing);
        return mapToListingResponse(updated);
    }

    @Transactional
    public void deleteListing(UUID listingId, UUID userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        if (!listing.getSeller().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this listing");
        }

        listingRepository.delete(listing);
    }

    @Transactional
    public ListingResponse updateStatus(UUID listingId, UUID userId, String status) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        if (!listing.getSeller().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this listing");
        }

        listing.setStatus(status);
        Listing updated = listingRepository.save(listing);
        return mapToListingResponse(updated);
    }

    private ListingResponse mapToListingResponse(Listing listing) {
        ListingResponse dto = new ListingResponse();
        dto.setId(listing.getId());
        dto.setSellerId(listing.getSeller().getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setCategory(listing.getCategory());
        dto.setCondition(listing.getCondition());
        dto.setPrice(listing.getPrice());
        dto.setPriceType(listing.getPriceType());
        dto.setContact(listing.getContact());
        dto.setLocation(listing.getLocation());
        dto.setImageUrl(listing.getImageUrl());
        dto.setStatus(listing.getStatus());
        dto.setCreatedAt(listing.getCreatedAt());

        if (listing.getSeller() != null) {
            dto.setSeller(new SellerDto(listing.getSeller().getFullName(), listing.getSeller().getEmail()));
        }
        return dto;
    }
}
