package com.example.food_delivery.service.imp;

import com.nimbusds.jose.JOSEException;
import com.example.food_delivery.dto.request.IntrospectRequest;
import com.example.food_delivery.dto.request.LoginRequest;
import com.example.food_delivery.dto.request.LogoutRequest;
import com.example.food_delivery.dto.request.RefreshRequest;
import com.example.food_delivery.dto.response.AuthenticationResponse;
import com.example.food_delivery.dto.response.IntrospectResponse;

import java.text.ParseException;

public interface AuthenticationServiceImp {
    AuthenticationResponse checkLogin(LoginRequest loginRequest);

    void logout(LogoutRequest logoutRequest) throws ParseException, JOSEException;

    IntrospectResponse introspect(IntrospectRequest introspectRequest) throws JOSEException, ParseException;

    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
