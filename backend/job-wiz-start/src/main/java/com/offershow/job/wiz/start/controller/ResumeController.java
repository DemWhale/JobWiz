package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.common.dto.ResumeImportResultDTO;
import com.offershow.job.wiz.common.model.ApiResponse;
import com.offershow.job.wiz.dal.entity.Resume;
import com.offershow.job.wiz.service.ResumeImportService;
import com.offershow.job.wiz.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * 简历信息控制器
 */
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;
    @Autowired
    private ResumeImportService resumeImportService;

    @GetMapping("/list")
    public ApiResponse<List<Resume>> listByUserId(@RequestParam("userId") Long userId) {
        List<Resume> list = resumeService.listByUserId(userId);
        return ApiResponse.ok(list);
    }

    @GetMapping("/{id}")
    public ApiResponse<Resume> getById(@PathVariable("id") Long id) {
        Resume resume = resumeService.getById(id);
        return resume != null ? ApiResponse.ok(resume) : ApiResponse.fail("简历不存在");
    }

    @PostMapping("/create")
    public ApiResponse<Resume> create(@RequestBody Resume resume) {
        Resume result = resumeService.createResume(resume);
        return result != null ? ApiResponse.ok(result) : ApiResponse.fail("创建失败");
    }

    @PutMapping("/update")
    public ApiResponse<Boolean> update(@RequestBody Resume resume) {
        boolean ok = resumeService.updateResume(resume);
        return ok ? ApiResponse.ok(ok) : ApiResponse.fail("更新失败");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> delete(@PathVariable("id") Long id) {
        boolean ok = resumeService.deleteResume(id);
        return ok ? ApiResponse.ok(ok) : ApiResponse.fail("删除失败");
    }

    @PostMapping(value = "/import/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ApiResponse<ResumeImportResultDTO>> parseImport(@RequestPart("file") FilePart file) {
        return DataBufferUtils.join(file.content())
                .map(dataBuffer -> parseImportBuffer(file.filename(), dataBuffer))
                .onErrorResume(error -> Mono.just(ApiResponse.fail(error.getMessage())));
    }

    private ApiResponse<ResumeImportResultDTO> parseImportBuffer(String fileName, DataBuffer dataBuffer) {
        byte[] bytes = new byte[dataBuffer.readableByteCount()];
        try {
            dataBuffer.read(bytes);
            return ApiResponse.ok(resumeImportService.parse(fileName, bytes));
        } catch (Exception error) {
            return ApiResponse.fail(error.getMessage());
        } finally {
            DataBufferUtils.release(dataBuffer);
        }
    }
}
