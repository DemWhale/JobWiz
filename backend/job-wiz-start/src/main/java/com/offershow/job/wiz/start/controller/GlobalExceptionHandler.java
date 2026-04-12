package com.offershow.job.wiz.start.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * 全局统一异常拦截器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        log.error("参数类型错误: {} -> {}", e.getName(), e.getValue(), e);
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "参数类型错误");
        body.put("message", String.format("参数 '%s' 的值 '%s' 类型不匹配", e.getName(), e.getValue()));
        body.put("path", e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "unknown");
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("非法参数: {}", e.getMessage(), e);
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "非法参数");
        body.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, Object>> handleNullPointer(NullPointerException e) {
        log.error("空指针异常", e);
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "空指针异常");
        body.put("message", "请求处理异常，请稍后重试");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception e) {
        log.error("未知异常", e);
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "服务器内部错误");
        body.put("message", e.getMessage() != null ? e.getMessage() : "服务器异常，请稍后重试");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
