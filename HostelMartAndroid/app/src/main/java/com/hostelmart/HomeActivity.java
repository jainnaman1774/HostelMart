package com.hostelmart;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.hostelmart.api.SupabaseApi;
import com.hostelmart.model.Listing;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeActivity extends AppCompatActivity implements ListingAdapter.OnItemClickListener {
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private Button btnAddListing;
    private ListingAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);
        btnAddListing = findViewById(R.id.btnAddListing);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ListingAdapter(this);
        recyclerView.setAdapter(adapter);

        btnAddListing.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(HomeActivity.this, AddListingActivity.class));
            }
        });

        fetchListings();
    }

    private void fetchListings() {
        progressBar.setVisibility(View.VISIBLE);
        SupabaseApi api = SupabaseClient.getClient().create(SupabaseApi.class);
        api.getListings().enqueue(new Callback<List<Listing>>() {
            @Override
            public void onResponse(Call<List<Listing>> call, Response<List<Listing>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    adapter.setListings(response.body());
                } else {
                    Toast.makeText(HomeActivity.this, "Failed to load listings", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<List<Listing>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(HomeActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onItemClick(Listing listing) {
        Intent intent = new Intent(this, ItemDetailActivity.class);
        intent.putExtra("listing_id", listing.id);
        startActivity(intent);
    }
} 