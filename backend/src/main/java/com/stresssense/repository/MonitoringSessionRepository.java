package com.stresssense.repository;

import com.stresssense.entity.MonitoringSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitoringSessionRepository extends JpaRepository<MonitoringSession, Long> {
    Optional<MonitoringSession> findFirstByDeviceIdAndStatusOrderByStartTimeDesc(String deviceId, String status);
    List<MonitoringSession> findByDeviceIdOrderByStartTimeDesc(String deviceId);
    List<MonitoringSession> findAllByOrderByStartTimeDesc();
}
