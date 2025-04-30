package com.hostelmart;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.hostelmart.api.SupabaseApi;
import com.hostelmart.model.Listing;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddListingActivity extends AppCompatActivity {
    private EditText etTitle, etDescription, etPrice, etLocation, etImageUrl;
    private Button btnSubmit;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_listing);

        etTitle = findViewById(R.id.etTitle);
        etDescription = findViewById(R.id.etDescription);
        etPrice = findViewById(R.id.etPrice);
        etLocation = findViewById(R.id.etLocation);
        etImageUrl = findViewById(R.id.etImageUrl);
        btnSubmit = findViewById(R.id.btnSubmit);
        progressBar = findViewById(R.id.progressBar);

        btnSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addListing();
            }
        });
    }

    private void addListing() {
        String title = etTitle.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String priceStr = etPrice.getText().toString().trim();
        String location = etLocation.getText().toString().trim();
        String imageUrl = etImageUrl.getText().toString().trim();
        if (title.isEmpty() || description.isEmpty() || priceStr.isEmpty() || location.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }
        double price;
        try {
            price = Double.parseDouble(priceStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid price", Toast.LENGTH_SHORT).show();
            return;
        }
        progressBar.setVisibility(View.VISIBLE);
        SupabaseApi api = SupabaseClient.getClient().create(SupabaseApi.class);
        Map<String, Object> body = new HashMap<>();
        body.put("title", title);
        body.put("description", description);
        body.put("price", price);
        body.put("location", location);
        if (!imageUrl.isEmpty()) body.put("image_url", imageUrl);
        // TODO: Add seller_id from session/user info if available
        api.addListing(body).enqueue(new Callback<Listing>() {
            @Override
            public void onResponse(Call<Listing> call, Response<Listing> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(AddListingActivity.this, "Listing added!", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(AddListingActivity.this, HomeActivity.class));
                    finish();
                } else {
                    Toast.makeText(AddListingActivity.this, "Failed to add listing", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<Listing> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(AddListingActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
} 