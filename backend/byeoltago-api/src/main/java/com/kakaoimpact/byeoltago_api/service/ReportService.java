package com.kakaoimpact.byeoltago_api.service;

import com.kakaoimpact.byeoltago_api.model.Report;
import com.kakaoimpact.byeoltago_api.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public List<Report> getReportsByUserId(Long userId) {
        return reportRepository.findByUserId(userId);
    }

    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    public List<Report> getReportsByTypeAndStatus(Integer typeId, Integer statusId) {
        return reportRepository.findByTypeIdAndStatusId(typeId, statusId);
    }

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
