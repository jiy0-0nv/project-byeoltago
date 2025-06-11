package com.kakaoimpact.byeoltago_api.controller;

import com.kakaoimpact.byeoltago_api.common.Const;
import com.kakaoimpact.byeoltago_api.common.UserContext;
import com.kakaoimpact.byeoltago_api.dto.req.RideInfoResponseDto;
import com.kakaoimpact.byeoltago_api.dto.req.RideSaveRequestDto;
import com.kakaoimpact.byeoltago_api.service.RideService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Const.API_BASE_URL + "/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    // 1. 주행 종료 시 경로 저장 API
    @PostMapping("/save")
    public ResponseEntity<Void> saveRide(@RequestBody RideSaveRequestDto requestDto) {
        rideService.saveRide(requestDto);
        return ResponseEntity.ok().build();
    }

    // 2. 특정 유저의 주행 기록 조회 API
    @GetMapping("/user")
    public ResponseEntity<List<RideInfoResponseDto>> getUserRides() {
        Long userId = Long.valueOf(UserContext.getUserId());
        return ResponseEntity.ok(rideService.getUserRides(userId));
    }

    // 3. 단일 주행 상세 조회 API
    @GetMapping("/{rideId}")
    public ResponseEntity<RideInfoResponseDto> getRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(rideService.getRideById(rideId));
    }
}