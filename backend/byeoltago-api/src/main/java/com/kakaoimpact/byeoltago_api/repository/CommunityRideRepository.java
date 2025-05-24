package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.CommunityRide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityRideRepository extends JpaRepository<CommunityRide, Long> {
    List<CommunityRide> findByUserId(Long userId);  // 사용자로 조회
    List<CommunityRide> findAllByOrderByLikesDesc();  // 좋아요 수로 정렬
    List<CommunityRide> findAllByOrderBySharedAtDesc();  // 공유 시간으로 정렬
}
