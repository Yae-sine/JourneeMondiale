// package com._com.JourneeMondiale.config;

// import java.time.LocalDateTime;
// import java.time.Month;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;

// import com._com.JourneeMondiale.model.Event;
// import com._com.JourneeMondiale.repository.EventRepository;

// @Component
// public class EventDataLoader implements CommandLineRunner {
    
//     @Autowired
//     private EventRepository eventRepository;
    
//     @Override
//     public void run(String... args) throws Exception {
//         // Only create events if none exist
//         if (eventRepository.count() == 0) {
//             createSampleEvents();
//         }
//     }
    
//     private void createSampleEvents() {
//         // Event 1: Marathon of Casablanca
//         Event casablancaMarathon = new Event(
//             "Marathon de Casablanca pour la Journée Mondiale",
//             "Rejoignez-nous pour un marathon de 42km à travers les rues emblématiques de Casablanca. Courez pour une cause qui compte et contribuez à faire la différence dans la vie de nombreuses personnes.",
//             "Casablanca, Maroc",
//             LocalDateTime.of(2025, Month.SEPTEMBER, 15, 8, 0), // Event date
//             LocalDateTime.of(2025, Month.SEPTEMBER, 10, 23, 59), // Registration deadline
//             500, // Max participants
//             "MARATHON"
//         );        
//         // Event 2: Run of Marrakech
//         Event marrakechRun = new Event(
//             "Course Solidaire de Marrakech",
//             "Une course de 10km dans la magnifique ville rouge de Marrakech. Découvrez les paysages époustouflants tout en participant à une action solidaire.",
//             "Marrakech, Maroc",
//             LocalDateTime.of(2025, Month.OCTOBER, 20, 9, 0), // Event date
//             LocalDateTime.of(2025, Month.OCTOBER, 15, 23, 59), // Registration deadline
//             300, // Max participants
//             "RUN"
//         );        
//         // Event 3: Walk of Rabat
//         Event rabatWalk = new Event(
//             "Marche de la Solidarité de Rabat",
//             "Une marche de 5km dans la capitale du Maroc. Accessible à tous, cette marche permet de sensibiliser et de rassembler pour la cause.",
//             "Rabat, Maroc",
//             LocalDateTime.of(2025, Month.NOVEMBER, 10, 10, 0), // Event date
//             LocalDateTime.of(2025, Month.NOVEMBER, 5, 23, 59), // Registration deadline
//             1000, // Max participants
//             "WALK"
//         );
        
//         eventRepository.save(casablancaMarathon);
//         eventRepository.save(marrakechRun);
//         eventRepository.save(rabatWalk);
        
//         System.out.println("Sample events created successfully!");
//     }
// }
