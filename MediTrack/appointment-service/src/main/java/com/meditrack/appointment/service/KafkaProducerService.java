package com.meditrack.appointment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.meditrack.appointment.event.NotificationEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

	private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);

	private static final String TOPIC = "notifications";

	private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

	public void sendNotification(NotificationEvent event) {

		kafkaTemplate.send(TOPIC, event);

		log.info("Notification event sent to Kafka: {}", event);
	}
}