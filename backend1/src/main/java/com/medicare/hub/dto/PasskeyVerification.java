package com.medicare.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasskeyVerification {
    private String patientEmail;
    private String passkey;
}
