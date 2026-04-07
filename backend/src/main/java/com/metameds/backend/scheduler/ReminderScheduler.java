package com.metameds.backend.scheduler;

import java.time.LocalDateTime;
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

    @Scheduled(fixedRate = 60000) // every 1 min
    public void checkReminders() {

        List<Reminder> reminders = reminderRepository.findByIsActiveTrue();

        for (Reminder r : reminders) {

            if (r.getNextReminder() != null &&
                r.getNextReminder().isBefore(LocalDateTime.now())) {

                // 🔔 SEND REAL-TIME NOTIFICATION
                messagingTemplate.convertAndSend(
                        "/topic/notifications/" + r.getUserId(),
                        "Reminder: " + r.getTitle()
                );

                // ⏭️ Update next reminder (simple logic for now)
                r.setNextReminder(LocalDateTime.now().plusMinutes(1));

                reminderRepository.save(r);
            }
        }
    }
}