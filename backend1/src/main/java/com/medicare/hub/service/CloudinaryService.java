package com.medicare.hub.service;
/*
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service 
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    //Upload File to S3 and Return S3 URL
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        //Generate Unique Filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String filename = folder + "/" + UUID.randomUUID().toString() + "-" + System.currentTimeMillis() + extension;

        try {
            //Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket("bucketName")
                    .key("filename")
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            //Return S3 URL
            String s3Url = String.format("https://%s.s3.amazonaws.com/%s", bucketName, filename);
            log.info("📁 File uploaded to S3: {}", s3Url);

            return s3Url;
        } catch (S3Exception e) {
            log.error("❌ S3 upload error:", e);
            throw new IOException("Failed to upload file to S3: " + e.getMessage());
        }
    }

    //Delete File From S3

    public void deleteFile(String s3Url) {
        if (s3Url == null || s3Url.isEmpty()) {
            return;
        }

        try {
            // Extract Key From S3
            String key = extractKeyFromUrl(s3Url);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("🗑️ File deleted from S3: {}", key);

        } catch (S3Exception e) {
            log.error("❌ S3 delete error:", e);
        }
    }

    // Extract S3 Full Key From URL

    private String extractKeyFromUrl(String s3Url) {
        // https://bucket-name.s3.amazonaws.com/folder/filename
        String[] parts = s3Url.split(".s3.amazonaws.com/");
        return parts.length > 1 ? parts[1] : s3Url;
    }

    // Generate Presigned URL for temporary access(optional)
    public String generatePresignedUrl(String s3Url, int expirationMinutes) {
        // For now, S3 URLs are public
        // You can implement pre-signed URLs for private access
        return s3Url;
    }

}
*/


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.enabled:false}")
    private boolean s3Enabled;

    public S3StorageService(@Autowired(required = false) S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (!s3Enabled || s3Client == null) {
            String mockUrl = "http://localhost:5000/uploads/" + folder + "/" + file.getOriginalFilename();
            log.warn("⚠️ S3 disabled - mock URL: {}", mockUrl);
            return mockUrl;
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String filename = folder + "/" + UUID.randomUUID() + "-" + System.currentTimeMillis() + extension;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

            String s3Url = String.format("https://%s.s3.amazonaws.com/%s", bucketName, filename);
            log.info("📁 Uploaded to S3: {}", s3Url);
            return s3Url;

        } catch (S3Exception e) {
            log.error("❌ S3 error:", e);
            throw new IOException("S3 upload failed: " + e.getMessage());
        }
    }

    public void deleteFile(String s3Url) {
        if (!s3Enabled || s3Client == null || s3Url == null || s3Url.isEmpty()) {
            log.warn("⚠️ S3 disabled - skip delete: {}", s3Url);
            return;
        }

        try {
            String key = s3Url.split(".s3.amazonaws.com/")[1];
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("🗑️ Deleted from S3: {}", key);
        } catch (Exception e) {
            log.error("❌ S3 delete error:", e);
        }
    }
}