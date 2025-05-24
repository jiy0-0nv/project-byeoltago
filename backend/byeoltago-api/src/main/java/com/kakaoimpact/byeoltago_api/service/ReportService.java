package com.kakaoimpact.byeoltago_api.service;

import com.kakaoimpact.byeoltago_api.dto.req.ReportInfoResponseDto;
import com.kakaoimpact.byeoltago_api.dto.req.ReportRequestDto;
import com.kakaoimpact.byeoltago_api.model.*;
import com.kakaoimpact.byeoltago_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportClusterRepository clusterRepository;
    private final UserRepository userRepository;

    // 클러스터링 기준 거리 (약 5m)
    private static final float CLUSTER_DISTANCE_THRESHOLD = 0.00005f;

    @Transactional
    public Report submitReport(ReportRequestDto request, MultipartFile image) {
        // 1. 기존 클러스터 탐색 또는 생성
        ReportCluster cluster = findOrCreateCluster(request);

        // 2. 신고 정보 저장 (Report)
        Report report = Report.builder()
                .userId(request.getUserId())
                .clusterId(cluster.getId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .typeId(request.getTypeId())
                .statusId(1) // 초기 상태값
                .description(request.getDescription())
                .reportedAt(new Timestamp(System.currentTimeMillis()))
                .build();

        reportRepository.save(report);

        // 3. 클러스터 정보 갱신
        // 가중 평균 방식으로 클러스터의 중심점 업데이트
        int newCount = cluster.getReportCount() + 1;
        float newLat = (cluster.getLatitude() * cluster.getReportCount() + report.getLatitude()) / newCount;
        float newLon = (cluster.getLongitude() * cluster.getReportCount() + report.getLongitude()) / newCount;

        cluster.setLatitude(newLat);
        cluster.setLongitude(newLon);
        cluster.setReportCount(newCount);  // 신고 횟수 증가
        cluster.setLastUpdated(report.getReportedAt());  // 최신 신고 시각 업데이트

        clusterRepository.save(cluster);

        // 4. 이미지 업로드 처리 (추후 추가..)
        // if (image != null && !image.isEmpty()) {}

        // 5. 포인트 지급
        userRepository.findById(request.getUserId()).ifPresent(user -> {
            user.setPoints(user.getPoints() + 1000);
            userRepository.save(user);
        });

        return report;
    }

    // 마커 조회
    public List<ReportInfoResponseDto> getMarkersInBounds(float minLat, float maxLat, float minLon, float maxLon) {
        // 지정된 위경도 범위 내 클러스터를 조회
        List<ReportCluster> clusters = clusterRepository.findByLatitudeBetweenAndLongitudeBetween(minLat, maxLat, minLon, maxLon);
        return clusters.stream().map(cluster -> ReportInfoResponseDto.builder()
                .id(cluster.getId())
                .latitude(cluster.getLatitude())
                .longitude(cluster.getLongitude())
                .reportCount(cluster.getReportCount())
                .riskLevel(calculateRiskLevel(cluster.getReportCount()))
                .build()).toList();
    }

    // 신고 수에 따라 위험도 계산
    private int calculateRiskLevel(int count) {
        if (count >= 6) return 3;
        if (count >= 3) return 2;
        return 1;
    }

    // 클러스터를 찾거나 새로 만드는 함수
    private ReportCluster findOrCreateCluster(ReportRequestDto request) {
        // 범위 내 클러스터 목록을 조회
        List<ReportCluster> nearbyClusters = clusterRepository.findByLatitudeBetweenAndLongitudeBetween(
                request.getLatitude() - CLUSTER_DISTANCE_THRESHOLD,
                request.getLatitude() + CLUSTER_DISTANCE_THRESHOLD,
                request.getLongitude() - CLUSTER_DISTANCE_THRESHOLD,
                request.getLongitude() + CLUSTER_DISTANCE_THRESHOLD
        );

        // 그 중 가장 가까운 클러스터를 선택
        Optional<ReportCluster> matched = nearbyClusters.stream()
                .filter(c -> distance(request.getLatitude(), request.getLongitude(), c.getLatitude(), c.getLongitude()) < CLUSTER_DISTANCE_THRESHOLD)
                .findFirst();

        if (matched.isPresent()) {
            return matched.get();
        } else {  // 해당하는 클러스터가 없을 경우 신규 생성
            ReportCluster cluster = ReportCluster.builder()
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .typeId(request.getTypeId())
                    .statusId(1)
                    .reportCount(1)
                    .build();
            return clusterRepository.save(cluster);
        }
    }

    // 유클리드 거리를 계산하는 함수
    private float distance(float lat1, float lon1, float lat2, float lon2) {
        return (float) Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
    }
}
