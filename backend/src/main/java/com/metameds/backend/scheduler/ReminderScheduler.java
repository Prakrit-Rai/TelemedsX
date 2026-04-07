package com.metameds.backend.scheduler;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.metameds.backend.model.Reminder;
import com.metameds.backend.repository.ReminderRepository;

import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderRepository reminderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void checkReminders() {
        System.out.println("⏰ Scheduler running...");
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
        System.out.println("NOW: " + now);
        List<Reminder> reminders = reminderRepository.findByIsActiveTrue();

        for (Reminder r : reminders) {

            System.out.println("Checking reminder ID: " + r.getId());
            System.out.println("Title: " + r.getTitle());
            System.out.println("Active: " + r.isActive());
            System.out.println("NextReminder RAW: " + r.getNextReminder());
            if (r.getNextReminder() != null) {

                LocalDateTime nextReminderTime =
                    r.getNextReminder().truncatedTo(ChronoUnit.MINUTES);
                System.out.println("NEXT (truncated): " + nextReminderTime);
                if (!nextReminderTime.isAfter(now)){

                    // 🔔 SEND NOTIFICATION
                    messagingTemplate.convertAndSend(
                        "/topic/notifications/" + r.getUserId(),
                        "Reminder: " + r.getTitle()
                    );

                    // ⏭️ UPDATE NEXT BASED ON FREQUENCY
                    switch (r.getFrequency()) {
                        case "daily":
                            r.setNextReminder(nextReminderTime.plusDays(1));
                            break;
                        case "every-6":
                            r.setNextReminder(nextReminderTime.plusHours(6));
                            break;
                        case "weekly":
                            r.setNextReminder(nextReminderTime.plusWeeks(1));
                            break;
                        default:
                            r.setNextReminder(null);
                    }

                    reminderRepository.save(r);
                }
            }
        }
    }
}