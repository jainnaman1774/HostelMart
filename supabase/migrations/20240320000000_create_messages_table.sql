-- Create messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- Create indexes for better performance
create index messages_sender_id_idx on messages(sender_id);
create index messages_receiver_id_idx on messages(receiver_id);
create index messages_created_at_idx on messages(created_at);
create index messages_is_read_idx on messages(is_read);

-- Set up Row Level Security (RLS)
alter table messages enable row level security;

-- Create policies
create policy "Users can view their own messages"
  on messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id
  );

create policy "Users can insert their own messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their own message read status"
  on messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

create policy "Users can delete their own messages"
  on messages for delete
  using (auth.uid() = sender_id); 