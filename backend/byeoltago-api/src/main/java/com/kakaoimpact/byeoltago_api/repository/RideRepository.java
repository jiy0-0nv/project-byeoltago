package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByUserId(Long userId);  // 특정 사용자의 모든 주행경로 조회
    List<Ride> findByIsSharedTrue();  // 공유된 주행경로 조회
    List<Ride> findByUserIdAndIsSharedTrue(Long userId);  // 사용자 + 공유 여부로 필터링
    List<Ride> findByUserIdOrderByStartedAtDesc(Long userId);  // 특정 사용자의 주행경로 정렬
}
