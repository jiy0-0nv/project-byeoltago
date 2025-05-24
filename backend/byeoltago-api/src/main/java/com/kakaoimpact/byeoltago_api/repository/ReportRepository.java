package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserId(Long userId);  // 특정 유저의 모든 신고 조회
    List<Report> findByClusterId(Long clusterId);  // 특정 클러스터에 속한 신고 조회
    List<Report> findByLatitudeBetweenAndLongitudeBetween(Float latitude, Float longitude, Float latitude2, Float longitude2);  // 위경도 범위 검색
    List<Report> findByTypeIdAndStatusId(Integer typeId, Integer statusId);  // 신고 유형 및 상태 필터링
}