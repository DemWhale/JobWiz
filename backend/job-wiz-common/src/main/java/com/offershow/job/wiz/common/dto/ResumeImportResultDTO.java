package com.offershow.job.wiz.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 简历导入解析结果。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeImportResultDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String fileName;

    private String title;

    private Integer textLength;

    private Double confidence;

    private Map<String, Object> content;

    private Map<String, Object> cssConfig;

    @Builder.Default
    private List<String> extractedSections = new ArrayList<>();

    @Builder.Default
    private List<String> missingFields = new ArrayList<>();

    @Builder.Default
    private List<String> parseLogs = new ArrayList<>();
}
