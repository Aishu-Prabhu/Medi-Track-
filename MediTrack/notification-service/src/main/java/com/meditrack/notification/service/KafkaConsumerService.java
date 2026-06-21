package com.meditrack.notification.service;

import com.meditrack.notification.entity.Notification;
import com.meditrack.notification.event.NotificationEvent;
import com.meditrack.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

	private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);

	private final NotificationRepository notificationRepository;

	@KafkaListener(topics = "notifications", groupId = "notification-group")
	public void consumeNotification(NotificationEvent event) {

		log.info("Notification event received: {}", event);

		Notification notification = new Notification();

		notification.setPatientId(event.getPatientId());

		notification.setDoctorId(event.getDoctorId());

		notification.setTitle(event.getTitle());

		notification.setMessage(event.getMessage());

		notificationRepository.save(notification);

		log.info("Notification saved successfully");
	}
}