package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.ReportCluster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportClusterRepository extends JpaRepository<ReportCluster, Long> {
    List<ReportCluster> findByTypeId(Integer typeId);  // 신고 유형 필터링
    List<ReportCluster> findByStatusId(Integer statusId);  // 처리 상태 필터링
    List<ReportCluster> findByLatitudeBetweenAndLongitudeBetween(Double minLat, Double maxLat, Double minLon, Double maxLon);  // 위경도 범위 검색
}