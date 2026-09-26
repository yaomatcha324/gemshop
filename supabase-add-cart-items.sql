-- Run this once in the Supabase SQL Editor before deploying the synced cart.
-- `gem_id` must use the same database type as public.gems.id.

create table if not exists public.cart_items (
  user_id uuid not null
    default auth.uid()
    references auth.users(id)
    on delete cascade,
  gem_id bigint not null
    references public.gems(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, gem_id)
);

alter table public.cart_items enable row level security;

revoke all on table public.cart_items from anon, authenticated;
grant select, insert, delete on table public.cart_items to authenticated;

drop policy if exists "Users can read their own cart" on public.cart_items;
create policy "Users can read their own cart"
on public.cart_items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to their own cart" on public.cart_items;
create policy "Users can add to their own cart"
on public.cart_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove from their own cart" on public.cart_items;
create policy "Users can remove from their own cart"
on public.cart_items
for delete
to authenticated
using ((select auth.uid()) = user_id);
