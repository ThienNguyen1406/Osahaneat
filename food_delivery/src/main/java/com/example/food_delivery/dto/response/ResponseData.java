package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResponseData {
    private int status = 200;
    private boolean isSuccess = true;
    private String desc;
    private Object data;

    public boolean isSuccess() {
        return isSuccess;
    }

    @JsonProperty("isSuccess")
    public void setIsSuccess(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }
    
    // Alias setter for compatibility
    public void setSuccess(boolean success) {
        this.isSuccess = success;
    }
    
    // Alias getter for compatibility (Jackson may serialize isSuccess as "success")
    @JsonProperty("success")
    public boolean getSuccess() {
        return isSuccess;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
