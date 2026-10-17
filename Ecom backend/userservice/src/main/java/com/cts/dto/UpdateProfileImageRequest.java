// src/main/java/com/cts/dto/UpdateProfileImageRequest.java (UPDATE THIS FILE)
package com.cts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileImageRequest {

    @NotBlank(message = "Profile image data cannot be empty")
    // Adjusted max size. A 1MB image can be ~1.33MB as Base64, plus overhead.
    // 2MB (2 * 1024 * 1024 bytes) * 1.33 = ~2.8MB. Using 3MB for safety.
    @Size(max = 3145728, message = "Profile image data exceeds maximum size (approx. 3MB)") // Set max size for Base64 string
    // REMOVE THIS LINE: @Pattern(regexp = "^(http|https)://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/[^ \"' لذا]*)?$",
    //                            message = "Profile image URL must be a valid HTTP or HTTPS URL")
    private String profileimg;
}