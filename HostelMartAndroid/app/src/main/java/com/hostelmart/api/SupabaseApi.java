package com.hostelmart.api;

import com.hostelmart.model.Listing;
import com.hostelmart.model.AuthResponse;
import retrofit2.Call;
import retrofit2.http.*;
import java.util.List;
import java.util.Map;

public interface SupabaseApi {
    // Get all listings
    @GET("items")
    Call<List<Listing>> getListings();

    // Add a new listing
    @POST("items")
    Call<Listing> addListing(@Body Map<String, Object> listing);

    // Delete a listing by id
    @DELETE("items?id=eq.{id}")
    Call<Void> deleteListing(@Path("id") String id);

    // Auth endpoints (example: sign up)
    @POST("/auth/v1/signup")
    Call<AuthResponse> signUp(@Body Map<String, Object> body);

    @POST("/auth/v1/token?grant_type=password")
    Call<AuthResponse> signIn(@Body Map<String, Object> body);
} 