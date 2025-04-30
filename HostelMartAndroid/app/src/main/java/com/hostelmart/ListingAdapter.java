package com.hostelmart;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.hostelmart.model.Listing;
import java.util.ArrayList;
import java.util.List;

public class ListingAdapter extends RecyclerView.Adapter<ListingAdapter.ListingViewHolder> {
    private List<Listing> listings = new ArrayList<>();
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Listing listing);
    }

    public ListingAdapter(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void setListings(List<Listing> listings) {
        this.listings = listings;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ListingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_listing, parent, false);
        return new ListingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ListingViewHolder holder, int position) {
        holder.bind(listings.get(position));
    }

    @Override
    public int getItemCount() {
        return listings.size();
    }

    class ListingViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvPrice, tvLocation;
        public ListingViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvLocation = itemView.findViewById(R.id.tvLocation);
            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        listener.onItemClick(listings.get(getAdapterPosition()));
                    }
                }
            });
        }
        void bind(Listing listing) {
            tvTitle.setText(listing.title);
            tvPrice.setText("$" + listing.price);
            tvLocation.setText(listing.location);
        }
    }
} 