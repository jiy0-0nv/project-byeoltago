package com.kakaoimpact.byeoltago_api.service;

import com.kakaoimpact.byeoltago_api.common.UserContext;
import com.kakaoimpact.byeoltago_api.dto.req.RideInfoResponseDto;
import com.kakaoimpact.byeoltago_api.dto.req.RideSaveRequestDto;
import com.kakaoimpact.byeoltago_api.model.Ride;
import com.kakaoimpact.byeoltago_api.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;

    public void saveRide(RideSaveRequestDto requestDto) {
        Long userId = Long.valueOf(UserContext.getUserId());

        Ride ride = Ride.builder()
                .userId(userId)
                .polyline(requestDto.getPolyline())
                .startedAt(requestDto.getStartedAt())
                .endedAt(requestDto.getEndedAt())
                .isShared(Optional.ofNullable(requestDto.getIsShared()).orElse(false))
                .build();

        rideRepository.save(ride);
    }

    public List<RideInfoResponseDto> getUserRides(Long userId) {
        return rideRepository.findByUserId(userId).stream()
                .map(ride -> RideInfoResponseDto.builder()
                        .id(ride.getId())
                        .startedAt(ride.getStartedAt())
                        .endedAt(ride.getEndedAt())
                        .polyline(ride.getPolyline())
                        .isShared(ride.getIsShared())
                        .build())
                .toList();
    }

    public RideInfoResponseDto getRideById(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주행 기록입니다: " + rideId));

        return RideInfoResponseDto.builder()
                .id(ride.getId())
                .startedAt(ride.getStartedAt())
                .endedAt(ride.getEndedAt())
                .polyline(ride.getPolyline())
                .isShared(ride.getIsShared())
                .build();
    }
}
