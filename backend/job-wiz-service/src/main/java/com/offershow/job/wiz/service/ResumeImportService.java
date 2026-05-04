package com.offershow.job.wiz.service;

import com.offershow.job.wiz.common.dto.ResumeImportResultDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 导入 PDF / Word 简历并映射为当前简历 schema。
 */
@Slf4j
@Service
public class ResumeImportService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+?86[- ]?)?1[3-9]\\d{9}");

    public ResumeImportResultDTO parse(String fileName, byte[] bytes) throws IOException {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("请选择需要导入的简历文件");
        }

        String safeFileName = fileName == null || fileName.isBlank() ? "导入简历" : fileName;
        String text = extractText(bytes, safeFileName).trim();
        if (text.length() < 20) {
            throw new IllegalArgumentException("未能从文件中抽取到足够文本，暂不支持扫描件或图片型简历");
        }

        ParseContext context = new ParseContext(text);
        Map<String, Object> content = buildContent(context);
        List<String> missingFields = collectMissingFields(content);
        double confidence = Math.max(0.35, Math.min(0.92, 0.92 - missingFields.size() * 0.06));
        String title = context.name().isBlank() ? stripExtension(safeFileName) : context.name() + "的导入简历";

        return ResumeImportResultDTO.builder()
                .fileName(safeFileName)
                .title(title)
                .textLength(text.length())
                .confidence(confidence)
                .content(content)
                .cssConfig(defaultCssConfig())
                .extractedSections(context.extractedSections())
                .missingFields(missingFields)
                .parseLogs(context.logs())
                .build();
    }

    private String extractText(byte[] bytes, String fileName) throws IOException {
        String lowerName = fileName.toLowerCase(Locale.ROOT);
        try (InputStream inputStream = new ByteArrayInputStream(bytes)) {
            if (lowerName.endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(inputStream)) {
                    return new PDFTextStripper().getText(document);
                }
            }
            if (lowerName.endsWith(".docx")) {
                try (XWPFDocument document = new XWPFDocument(inputStream);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                    return extractor.getText();
                }
            }
            if (lowerName.endsWith(".doc")) {
                try (HWPFDocument document = new HWPFDocument(inputStream);
                     WordExtractor extractor = new WordExtractor(document)) {
                    return extractor.getText();
                }
            }
        }
        throw new IllegalArgumentException("仅支持 PDF、DOCX、DOC 格式");
    }

    private Map<String, Object> buildContent(ParseContext context) {
        List<Map<String, Object>> modules = new ArrayList<>();

        modules.add(module("baseinfo", "基础信息", List.of(mapOf(
                "name", context.name(),
                "phone", context.phone(),
                "email", context.email(),
                "major", context.major(),
                "edu", context.degree()
        ))));
        modules.add(module("interestabout", "求职意向", List.of(mapOf(
                "intended_job", context.targetJob(),
                "intended_city", "",
                "intended_industry", ""
        ))));
        modules.add(module("eduabout", "教育背景", context.educationItems()));
        modules.add(module("workbg", "工作经历", context.workItems()));
        modules.add(module("projectabout", "项目经历", context.projectItems()));
        modules.add(module("skills", "专业技能", List.of(mapOf("skills", htmlParagraph(context.skills())))));
        modules.add(module("self_comment", "自我评价", List.of(mapOf("self_comment", htmlParagraph(context.summary())))));

        return Map.of("modules", modules);
    }

    private Map<String, Object> module(String name, String moduleName, List<Map<String, Object>> child) {
        return mapOf(
                "name", name,
                "modulename", moduleName,
                "is_open", true,
                "child", child == null ? List.of() : child
        );
    }

    private List<String> collectMissingFields(Map<String, Object> content) {
        List<String> missing = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> modules = (List<Map<String, Object>>) content.get("modules");
        Map<String, Object> baseinfo = firstChild(modules, "baseinfo");
        if (blank(baseinfo.get("name"))) missing.add("姓名");
        if (blank(baseinfo.get("phone"))) missing.add("电话");
        if (blank(baseinfo.get("email"))) missing.add("邮箱");
        if (firstChild(modules, "workbg").isEmpty()) missing.add("工作经历");
        if (firstChild(modules, "projectabout").isEmpty()) missing.add("项目经历");
        return missing;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> firstChild(List<Map<String, Object>> modules, String section) {
        return modules.stream()
                .filter(module -> section.equals(module.get("name")))
                .findFirst()
                .map(module -> (List<Map<String, Object>>) module.get("child"))
                .filter(child -> !child.isEmpty())
                .map(child -> child.get(0))
                .orElse(Map.of());
    }

    private Map<String, Object> defaultCssConfig() {
        return Map.of(
                "global", Map.of(
                        "font_family", "system-ui",
                        "theme_color", "#1d4ed8",
                        "font_size", 14
                )
        );
    }

    private Map<String, Object> mapOf(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            map.put(String.valueOf(pairs[i]), pairs[i + 1]);
        }
        return map;
    }

    private String htmlParagraph(String text) {
        if (text == null || text.isBlank()) return "";
        String normalized = text.replace("\r", "\n").replaceAll("\\n{2,}", "\n");
        StringBuilder builder = new StringBuilder();
        for (String line : normalized.split("\\n")) {
            if (!line.isBlank()) {
                builder.append("<p>").append(escapeHtml(line.trim())).append("</p>");
            }
        }
        return builder.toString();
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private boolean blank(Object value) {
        return value == null || String.valueOf(value).isBlank();
    }

    private String stripExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index > 0 ? fileName.substring(0, index) : fileName;
    }

    private final class ParseContext {
        private final String text;
        private final List<String> lines;
        private final List<String> logs = new ArrayList<>();
        private final List<String> extractedSections = new ArrayList<>();

        private ParseContext(String text) {
            this.text = text;
            this.lines = text.lines().map(String::trim).filter(line -> !line.isBlank()).toList();
        }

        private String name() {
            for (String line : lines.subList(0, Math.min(lines.size(), 8))) {
                if (line.length() <= 12 && !line.contains("@") && !PHONE_PATTERN.matcher(line).find()) {
                    logs.add("识别姓名: " + line);
                    return line;
                }
            }
            return "";
        }

        private String email() {
            Matcher matcher = EMAIL_PATTERN.matcher(text);
            return matcher.find() ? matcher.group() : "";
        }

        private String phone() {
            Matcher matcher = PHONE_PATTERN.matcher(text);
            return matcher.find() ? matcher.group() : "";
        }

        private String degree() {
            if (text.contains("博士")) return "博士";
            if (text.contains("硕士") || text.contains("研究生")) return "硕士";
            if (text.contains("本科")) return "本科";
            if (text.contains("大专")) return "大专";
            return "";
        }

        private String major() {
            return lines.stream()
                    .filter(line -> line.contains("专业") || line.contains("科学") || line.contains("工程"))
                    .findFirst()
                    .orElse("");
        }

        private String targetJob() {
            return lines.stream()
                    .filter(line -> line.contains("求职") || line.contains("目标") || line.contains("意向"))
                    .findFirst()
                    .orElse("");
        }

        private List<Map<String, Object>> educationItems() {
            List<Map<String, Object>> result = lines.stream()
                    .filter(line -> line.contains("大学") || line.contains("学院") || line.contains("本科") || line.contains("硕士"))
                    .limit(2)
                    .map(line -> mapOf("school", line, "major", major(), "edu", degree(), "start_time", "", "end_time", ""))
                    .toList();
            if (!result.isEmpty()) extractedSections.add("教育背景");
            return result;
        }

        private List<Map<String, Object>> workItems() {
            String block = sectionBlock("工作经历", "项目经历", "专业技能", "技能", "自我评价");
            if (block.isBlank()) return List.of();
            extractedSections.add("工作经历");
            return List.of(mapOf(
                    "company", firstCompanyLine(block),
                    "position", guessPosition(block),
                    "start_time", "",
                    "end_time", "",
                    "job_detail", htmlParagraph(block)
            ));
        }

        private List<Map<String, Object>> projectItems() {
            String block = sectionBlock("项目经历", "项目经验", "专业技能", "技能", "自我评价");
            if (block.isBlank()) return List.of();
            extractedSections.add("项目经历");
            return List.of(mapOf(
                    "project_title", firstMeaningfulLine(block, "项目"),
                    "project_role", guessPosition(block),
                    "start_time", "",
                    "end_time", "",
                    "project_detail", htmlParagraph(block)
            ));
        }

        private String skills() {
            String block = sectionBlock("专业技能", "技能", "技术栈", "工作经历", "项目经历", "自我评价");
            if (!block.isBlank()) {
                extractedSections.add("专业技能");
                return block;
            }
            return lines.stream()
                    .filter(line -> line.matches(".*(Java|Python|Go|React|Vue|Spring|MySQL|Redis|Docker|Kubernetes|SQL).*"))
                    .reduce("", (left, right) -> left + (left.isBlank() ? "" : "\n") + right);
        }

        private String summary() {
            String block = sectionBlock("自我评价", "个人总结", "专业技能", "技能");
            if (!block.isBlank()) {
                extractedSections.add("自我评价");
                return block;
            }
            return lines.stream().skip(Math.max(0, lines.size() - 4)).reduce("", (left, right) -> left + (left.isBlank() ? "" : "\n") + right);
        }

        private String sectionBlock(String startKeyword, String... endKeywords) {
            int start = -1;
            for (int i = 0; i < lines.size(); i++) {
                if (lines.get(i).contains(startKeyword)) {
                    start = i + 1;
                    break;
                }
            }
            if (start < 0) return "";
            int end = lines.size();
            for (int i = start; i < lines.size(); i++) {
                for (String endKeyword : endKeywords) {
                    if (!endKeyword.equals(startKeyword) && lines.get(i).contains(endKeyword)) {
                        end = i;
                        return String.join("\n", lines.subList(start, Math.max(start, end))).trim();
                    }
                }
            }
            return String.join("\n", lines.subList(start, end)).trim();
        }

        private String firstCompanyLine(String block) {
            return firstMeaningfulLine(block, "公司");
        }

        private String firstMeaningfulLine(String block, String fallback) {
            return block.lines().map(String::trim).filter(line -> !line.isBlank()).findFirst().orElse(fallback);
        }

        private String guessPosition(String block) {
            return block.lines()
                    .filter(line -> line.contains("工程师") || line.contains("经理") || line.contains("开发") || line.contains("产品"))
                    .findFirst()
                    .orElse("");
        }

        private List<String> logs() {
            if (logs.isEmpty()) logs.add("完成文本抽取与结构化映射");
            return logs;
        }

        private List<String> extractedSections() {
            return extractedSections;
        }
    }
}
