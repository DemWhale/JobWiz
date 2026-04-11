package com.offershow.job.wiz.common.utils;

/**
 * 字符串工具类
 */
public class StringUtils {

    private StringUtils() {
    }

    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }
}
