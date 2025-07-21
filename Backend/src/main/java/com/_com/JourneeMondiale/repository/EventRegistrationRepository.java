package com._com.JourneeMondiale.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.EventRegistration;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    
    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId ORDER BY er.registrationDate DESC")
    List<EventRegistration> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId ORDER BY er.registrationDate DESC")
    List<EventRegistration> findByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId AND er.event.id = :eventId")
    Optional<EventRegistration> findByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);
    
    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId AND er.event.eventDate > CURRENT_TIMESTAMP AND er.status = 'CONFIRMED' ORDER BY er.event.eventDate ASC")
    List<EventRegistration> findUpcomingEventsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event.id = :eventId AND er.status = 'CONFIRMED'")
    Long countConfirmedRegistrationsByEventId(@Param("eventId") Long eventId);
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
