package com.offershow.job.wiz.common.enums;

/**
 * 响应码枚举
 */
public enum CodeEnum {

    SUCCESS(200, "成功"),
    FAIL(500, "失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权");

    private final int code;
    private final String message;

    CodeEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
