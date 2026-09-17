package com.campusmart.repository;

import com.campusmart.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);

    @Query("SELECT l FROM Listing l WHERE l.status = 'active' " +
           "AND (:category IS NULL OR :category = '' OR :category = 'All' OR l.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<Listing> searchActiveListings(@Param("search") String search, @Param("category") String category);
}
