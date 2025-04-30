-- Create items table
create table items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  price numeric(10,2) not null,
  description text,
  location text,
  image_url text,
  seller_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index items_seller_id_idx on items(seller_id);
create index items_created_at_idx on items(created_at);

-- Set up Row Level Security (RLS)
alter table items enable row level security;

-- Create policies
create policy "Anyone can view items"
  on items for select
  using (true);

create policy "Users can insert their own items"
  on items for insert
  with check (auth.uid() = seller_id);

create policy "Users can update their own items"
  on items for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Users can delete their own items"
  on items for delete
  using (auth.uid() = seller_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_items_updated_at
  before update on items
  for each row
  execute function update_updated_at_column(); 