package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportStatusRepository extends JpaRepository<ReportStatus, Integer> {
    Optional<ReportStatus> findByName(String name);
}
