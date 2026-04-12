package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.common.enums.BizCodeEnum;
import com.offershow.job.wiz.common.model.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * 全局统一异常拦截器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        log.error("参数类型错误: {} -> {}", e.getName(), e.getValue(), e);
        String msg = String.format("参数 '%s' 的值 '%s' 类型不匹配，期望类型: %s",
                e.getName(), e.getValue(), e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "unknown");
        return ResponseEntity.badRequest().body(ApiResponse.fail(BizCodeEnum.PARAM_ERROR));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("非法参数: {}", e.getMessage(), e);
        return ResponseEntity.badRequest().body(ApiResponse.fail(BizCodeEnum.PARAM_ERROR.getCode(), e.getMessage()));
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponse<Object>> handleNullPointer(NullPointerException e) {
        log.error("空指针异常", e);
        return ResponseEntity.internalServerError().body(ApiResponse.fail(BizCodeEnum.SERVER_ERROR));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneral(Exception e) {
        log.error("未知异常", e);
        String msg = e.getMessage() != null ? e.getMessage() : "服务器异常，请稍后重试";
        return ResponseEntity.internalServerError().body(ApiResponse.fail(BizCodeEnum.SERVER_ERROR.getCode(), msg));
    }
}
