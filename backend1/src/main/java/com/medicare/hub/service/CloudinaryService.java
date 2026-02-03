package com.medicare.hub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    //Upload file to cloudinary and return URL
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Generate unique public id  (publicId can change to filename)
            String publicId = UUID.randomUUID().toString();

            // Upload to cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId, // here as well filename
                                    "resource_type", "auto",
                            "folder", folder,
                            "secure", true
                    ));

            String url = (String) uploadResult.get("secure_url");
            if (url != null) {
                if (url.startsWith("https:/") && !url.startsWith("https://")) {
                    url = url.replace("https:/", "https://");
                    log.warn("Fixed malformed URL from Cloudinary");
                }
                log.info("File uploaded to Cloudinary: {}", url);
            } else {
                log.error("Cloudinary return null URL");
                throw new RuntimeException("Cloudinary upload failed - no URL returned");
            }

            return url;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    // Delete from cloudinary
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public_id from URL
            String publicId = extractPublicId(fileUrl);

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("File deleted from Cloudinary: {}", publicId);
        } catch (Exception e) {
            log.error("Cloudinary delete error:", e);
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * // URL format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.jpg
     */
    private String extractPublicId(String url) {
        try {
            // ✅ ADDED: Fix malformed URL before processing
            if (url.startsWith("https:/") && !url.startsWith("https://")) {
                url = url.replace("https:/", "https://");
            }
            String[] parts = url.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Remove version (v123456/)
                String path = pathWithVersion.replaceFirst("v\\d+/", "");
                // Remove file extension
                int lastDot = path.lastIndexOf('.');
                if (lastDot > 0) {
                    return path.substring(0, lastDot);
                }
                return path;
            }
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", url, e);
        }
        return url;
    }
}