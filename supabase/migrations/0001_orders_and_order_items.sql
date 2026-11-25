-- Phase 3: guest checkout — orders & order_items
--
-- No auth in this demo, so every guest writes as the `anon` role. RLS is
-- kept permissive on INSERT/SELECT (an order's `id` is an unguessable
-- UUID and the app never lists all orders, only fetches one by id), but
-- there is deliberately no public UPDATE or DELETE policy — flipping
-- `payment_status` to "paid" after a verified Razorpay signature happens
-- server-side via the service_role key (see /lib/supabase/admin.ts),
-- which bypasses RLS entirely.
--
-- Note: `menu_item_id` is `text`, not `uuid`, because the current menu
-- data (lib/data/menu.ts) uses slug-style string ids like "idli-sambar"
-- rather than real UUIDs. Switch it to `uuid` (and add a foreign key)
-- once a real `menu_items` table with UUID primary keys exists.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_phone text not null,
  delivery_address text not null,
  notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total_amount numeric(10,2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  order_status text not null default 'placed'
    check (order_status in ('placed','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id text,
  item_name text not null,
  item_price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on order_items(order_id);

alter table orders enable row level security;
alter table order_items enable row level security;

-- Guests can place an order...
create policy "orders_insert_anon" on orders
  for insert to anon
  with check (true);

create policy "order_items_insert_anon" on order_items
  for insert to anon
  with check (true);

-- ...and can look their own order up by its (unguessable) id/link.
-- The app never queries `orders` or `order_items` without a specific id,
-- so this does not expose a browsable list of every order.
create policy "orders_select_anon" on orders
  for select to anon
  using (true);

create policy "order_items_select_anon" on order_items
  for select to anon
  using (true);

-- No update/delete policies for `anon` — those default to denied.
-- Payment-status transitions happen server-side with the service_role
-- key from /api/verify-payment, which bypasses RLS.
