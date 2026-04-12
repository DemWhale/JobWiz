package com.offershow.job.wiz.common.model;

import com.offershow.job.wiz.common.enums.BizCodeEnum;

/**
 * 统一 API 响应结构
 * @param <T> 数据类型
 */
public class ApiResponse<T> {

    private int code;
    private String message;
    private T data;

    public ApiResponse() {}

    public ApiResponse(BizCodeEnum bizCode, T data) {
        this.code = bizCode.getCode();
        this.message = bizCode.getMessage();
        this.data = data;
    }

    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(BizCodeEnum.SUCCESS, data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(BizCodeEnum.SUCCESS.getCode(), message, data);
    }

    public static <T> ApiResponse<T> fail(BizCodeEnum bizCode) {
        return new ApiResponse<>(bizCode.getCode(), bizCode.getMessage(), null);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(BizCodeEnum.FAIL.getCode(), message, null);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
