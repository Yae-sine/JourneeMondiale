package com._com.JourneeMondiale.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true ORDER BY e.eventDate ASC")
    List<Event> findAllActiveEvents();
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.eventDate > :currentDate AND e.registrationDeadline > :currentDate ORDER BY e.eventDate ASC")
    List<Event> findUpcomingOpenEvents(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.eventDate > :currentDate ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT e FROM Event e WHERE e.location LIKE %:location% AND e.isActive = true ORDER BY e.eventDate ASC")
    List<Event> findEventsByLocation(@Param("location") String location);
    
    @Query("SELECT e FROM Event e WHERE e.eventType = :eventType AND e.isActive = true ORDER BY e.eventDate ASC")
    List<Event> findEventsByType(@Param("eventType") String eventType);
}
