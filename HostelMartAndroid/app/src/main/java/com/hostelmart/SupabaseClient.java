package com.hostelmart;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.*;
import okhttp3.OkHttpClient;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.IOException;

public class SupabaseClient {
    // TODO: Paste your Supabase URL and anon key here
    public static final String SUPABASE_URL = "https://your-project-id.supabase.co";
    public static final String SUPABASE_ANON_KEY = "your-anon-key";

    private static Retrofit retrofit = null;

    public static Retrofit getClient() {
        if (retrofit == null) {
            OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(new Interceptor() {
                    @Override
                    public Response intercept(Chain chain) throws IOException {
                        Request original = chain.request();
                        Request.Builder requestBuilder = original.newBuilder()
                            .header("apikey", SUPABASE_ANON_KEY)
                            .header("Authorization", "Bearer " + SUPABASE_ANON_KEY)
                            .header("Content-Type", "application/json");
                        Request request = requestBuilder.build();
                        return chain.proceed(request);
                    }
                })
                .build();

            Gson gson = new GsonBuilder().setLenient().create();

            retrofit = new Retrofit.Builder()
                .baseUrl(SUPABASE_URL + "/rest/v1/")
                .addConverterFactory(GsonConverterFactory.create(gson))
                .client(client)
                .build();
        }
        return retrofit;
    }
} 