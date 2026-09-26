package com.stresssense.repository;

import com.stresssense.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    Optional<SensorReading> findFirstByDeviceIdOrderByTimestampDesc(String deviceId);
    List<SensorReading> findTop100ByDeviceIdOrderByTimestampDesc(String deviceId);
    List<SensorReading> findBySessionIdOrderByTimestampAsc(Long sessionId);

    @Query("SELECT r FROM SensorReading r WHERE r.deviceId = :deviceId ORDER BY r.timestamp DESC LIMIT :limit")
    List<SensorReading> findRecentByDeviceId(@Param("deviceId") String deviceId, @Param("limit") int limit);
}
