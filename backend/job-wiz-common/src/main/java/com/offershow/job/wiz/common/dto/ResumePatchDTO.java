package com.offershow.job.wiz.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * AI 编辑简历时使用的结构化 patch DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumePatchDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Builder.Default
    private String type = "resume_patch";

    private Target target;

    private String summary;

    private String previewText;

    private Boolean needsConfirmation;

    @Builder.Default
    private List<Operation> operations = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Target implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String section;

        private Integer itemIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Operation implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String op;

        private String path;

        private Object value;
    }
}
