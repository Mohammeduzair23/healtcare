package com.medicare.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private String error;
    private T data;

    public static <T> ApiResponse <T> success(T data) {
        ApiResponse<T> reponse = new ApiResponse<>();
        reponse.setSuccess(true);
        reponse.setData(data);
        return reponse;
    }

    public static <T> ApiResponse<T> error(String error) {
        ApiResponse<T> reponse = new ApiResponse<>();
        reponse.setSuccess(false);
        reponse.setError(error);
        return reponse;
    }
}
