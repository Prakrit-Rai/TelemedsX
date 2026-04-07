package com.metameds.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.metameds.backend.model.Reminder;
import com.metameds.backend.repository.ReminderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public Reminder createReminder(Reminder reminder) {
        reminder.setActive(true);
        reminder.setNextReminder(LocalDateTime.now().plusMinutes(1)); // test first
        return reminderRepository.save(reminder);
    }

    public List<Reminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserId(userId);
    }

    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    public Reminder toggleReminder(Long id) {
        Reminder r = reminderRepository.findById(id).orElseThrow();
        r.setActive(!r.isActive());
        return reminderRepository.save(r);
    }
}