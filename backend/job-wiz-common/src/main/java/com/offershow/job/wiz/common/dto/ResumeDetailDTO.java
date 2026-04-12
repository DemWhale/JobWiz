package com.offershow.job.wiz.common.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 简历详细信息 DTO（对应 resume_detail 字段）
 */
public class ResumeDetailDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 基本信息 */
    private Basics basics;

    /** 元数据（模板/渲染配置） */
    private Metadata metadata;

    /** 内容区块 Map<sectionId, Section> */
    private Map<String, Section> sections;

    // ==================== Basics ====================

    public record Basics(
            Url url,
            String name,
            String email,
            String phone,
            Picture picture,
            String headline,
            String location,
            List<Object> customFields
    ) implements Serializable {}

    public record Url(String href, String label) implements Serializable {}

    public record Picture(
            String url,
            Integer size,
            Effects effects,
            Double aspectRatio,
            Integer borderRadius
    ) implements Serializable {}

    public record Effects(Boolean border, Boolean hidden, Boolean grayscale) implements Serializable {}

    // ==================== Metadata ====================

    public record Metadata(
            Css css,
            Page page,
            String notes,
            Theme theme,
            List<List<List<String>>> layout,
            String template,
            Typography typography
    ) implements Serializable {}

    public record Css(String value, Boolean visible) implements Serializable {}

    public record Page(String format, Integer margin, Options options) implements Serializable {}

    public record Options(Boolean breakLine, Boolean pageNumbers) implements Serializable {}

    public record Theme(String text, String primary, String background) implements Serializable {}

    public record Typography(
            Font font,
            Boolean hideIcons,
            Double lineHeight,
            Boolean underlineLinks
    ) implements Serializable {}

    public record Font(
            Integer size,
            String family,
            String subset,
            List<String> variants
    ) implements Serializable {}

    // ==================== Sections ====================

    /**
     * Section 基类
     * items 类型：
     * - awards, certifications, projects, education, volunteer, experience,
     *   references, publications, profiles -> List<CommonItem>
     * - skills -> List<SkillItem>
     * - languages -> List<LanguageItem>
     * - interests -> List<InterestItem>
     * - summary -> items 为空，content 字段承载文本
     */
    public sealed interface Section permits CommonSection, SkillSection, LanguageSection, InterestSection, SummarySection {}

    /** 通用 Section（awards, certifications, projects, education, volunteer, experience 等） */
    public record CommonSection(
            String id,
            String name,
            Integer columns,
            Boolean visible,
            Boolean separateLinks,
            List<CommonItem> items
    ) implements Section {}

    /** Summary Section（content 字段承载文本，items 为空） */
    public record SummarySection(
            String id,
            String name,
            Integer columns,
            Boolean visible,
            Boolean separateLinks,
            List<Object> items,  // 空
            String content
    ) implements Section {}

    /** Skills Section */
    public record SkillSection(
            String id,
            String name,
            Integer columns,
            Boolean visible,
            Boolean separateLinks,
            List<SkillItem> items
    ) implements Section {}

    /** Languages Section */
    public record LanguageSection(
            String id,
            String name,
            Integer columns,
            Boolean visible,
            Boolean separateLinks,
            List<LanguageItem> items
    ) implements Section {}

    /** Interests Section */
    public record InterestSection(
            String id,
            String name,
            Integer columns,
            Boolean visible,
            Boolean separateLinks,
            List<InterestItem> items
    ) implements Section {}

    // ==================== Items ====================

    /** 通用 Item（awards, certifications, projects, education, volunteer, experience, references, publications, profiles） */
    public record CommonItem(
            String id,
            Url url,
            String date,
            Boolean visible,
            String summary,
            // awards
            String title,
            String awarder,
            // certifications
            String name,
            String issuer,
            // projects
            List<String> keywords,
            String description,
            // education
            String studyType,
            String institution,
            String area,
            String score,
            // volunteer
            String organization,
            String position,
            String location,
            // experience
            String company,
            // publications
            String publisher,
            // profiles
            String network,
            String username
    ) implements Serializable {}

    /** Skill Item */
    public record SkillItem(
            String id,
            String name,
            Integer level,
            Boolean visible,
            List<String> keywords,
            String description
    ) implements Serializable {}

    /** Language Item */
    public record LanguageItem(
            String id,
            String language,
            String fluency,
            Boolean visible
    ) implements Serializable {}

    /** Interest Item */
    public record InterestItem(
            String id,
            String name,
            List<String> keywords,
            Boolean visible
    ) implements Serializable {}

    // ==================== Getters/Setters ====================

    public Basics getBasics() { return basics; }
    public void setBasics(Basics basics) { this.basics = basics; }

    public Metadata getMetadata() { return metadata; }
    public void setMetadata(Metadata metadata) { this.metadata = metadata; }

    public Map<String, Section> getSections() { return sections; }
    public void setSections(Map<String, Section> sections) { this.sections = sections; }
}
