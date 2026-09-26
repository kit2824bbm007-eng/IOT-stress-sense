package com.stresssense.service;

import com.stresssense.dto.DeviceDto;
import com.stresssense.entity.Device;
import com.stresssense.exception.ResourceNotFoundException;
import com.stresssense.repository.DeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private static final Logger logger = LoggerFactory.getLogger(DeviceService.class);
    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public Device getOrCreateDevice(String deviceId, String deviceName, String deviceType) {
        Optional<Device> existing = deviceRepository.findByDeviceId(deviceId);
        if (existing.isPresent()) {
            Device dev = existing.get();
            dev.setStatus("ONLINE");
            dev.setLastSeen(LocalDateTime.now());
            if (deviceType != null && !deviceType.isBlank()) {
                dev.setDeviceType(deviceType);
            }
            if (deviceName != null && !deviceName.isBlank()) {
                dev.setDeviceName(deviceName);
            }
            return deviceRepository.save(dev);
        }

        try {
            String name = (deviceName != null && !deviceName.isBlank()) ? deviceName : ("Device " + deviceId);
            String type = (deviceType != null && !deviceType.isBlank()) ? deviceType : "IOT_CONTROLLER";
            Device newDevice = new Device(deviceId, name, type, "ONLINE");
            logger.info("Registering new device: ID={}, Type={}", deviceId, type);
            return deviceRepository.saveAndFlush(newDevice);
        } catch (DataIntegrityViolationException ex) {
            // Handle race condition from concurrent incoming packets
            logger.debug("Device {} created concurrently by another thread", deviceId);
            return deviceRepository.findByDeviceId(deviceId)
                    .orElseThrow(() -> new IllegalStateException("Failed to resolve device " + deviceId));
        }
    }

    @Transactional
    public void updateDeviceLastSeen(String deviceId, String deviceType) {
        getOrCreateDevice(deviceId, null, deviceType);
    }

    @Transactional(readOnly = true)
    public List<DeviceDto> getAllDevices() {
        return deviceRepository.findAllByOrderByLastSeenDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeviceDto getDeviceById(String deviceId) {
        Device device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + deviceId));
        return mapToDto(device);
    }

    public DeviceDto mapToDto(Device device) {
        DeviceDto dto = new DeviceDto();
        dto.setId(device.getId());
        dto.setDeviceId(device.getDeviceId());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceType(device.getDeviceType());

        boolean isRecent = device.getLastSeen() != null &&
                device.getLastSeen().isAfter(LocalDateTime.now().minusSeconds(15));
        dto.setStatus(isRecent ? "ONLINE" : "OFFLINE");
        dto.setLastSeen(device.getLastSeen());
        dto.setCreatedAt(device.getCreatedAt());
        dto.setDataRate(isRecent ? "2 Hz (500ms)" : "Inactive");
        return dto;
    }
}
