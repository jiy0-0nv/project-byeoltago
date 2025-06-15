package com.kakaoimpact.byeoltago_api.controller;

import com.kakaoimpact.byeoltago_api.common.Const;
import com.kakaoimpact.byeoltago_api.common.UserContext;
import com.kakaoimpact.byeoltago_api.dto.req.ReportDetailResponseDto;
import com.kakaoimpact.byeoltago_api.dto.req.ReportRequestDto;
import com.kakaoimpact.byeoltago_api.dto.req.ReportInfoResponseDto;
import com.kakaoimpact.byeoltago_api.model.Report;
import com.kakaoimpact.byeoltago_api.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping( Const.API_BASE_URL + "/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // 위험 신고 수신 API
    @PostMapping("/report")
    public ResponseEntity<Report> submitReport(@ModelAttribute ReportRequestDto request,
                                               @RequestPart(required = false) MultipartFile image) {
        String userIdStr = UserContext.getUserId();
        if (userIdStr == null || userIdStr.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            userId = 0;
        }

        request.setUserId(userId);
        Report result = reportService.submitReport(request, image);
        return ResponseEntity.ok(result);
    }

    // 위치 기반 마커 조회 API
    @GetMapping("/markers")
    public ResponseEntity<List<ReportInfoResponseDto>> getMarkers(@RequestParam double minLat,
                                                                 @RequestParam double maxLat,
                                                                 @RequestParam double minLon,
                                                                 @RequestParam double maxLon) {
        return ResponseEntity.ok(reportService.getMarkersInBounds(minLat, maxLat, minLon, maxLon));
    }

    // 상세 정보 조회 API
    @GetMapping("/{clusterId}/details")
    public ResponseEntity<ReportDetailResponseDto> getReportDetails(@PathVariable Long clusterId) {
        ReportDetailResponseDto details = reportService.getReportDetails(clusterId);
        return ResponseEntity.ok(details);
    }

}
