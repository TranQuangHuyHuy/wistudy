-- Add tier column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tier text NOT NULL DEFAULT 'free' 
CHECK (tier IN ('free', 'pro'));

-- Migrate existing data from user_subscriptions to profiles
UPDATE public.profiles p
SET tier = us.tier::text
FROM public.user_subscriptions us
WHERE p.id = us.user_id;

-- Drop the trigger that creates user_subscriptions entries
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

-- Drop the function that creates user_subscriptions entries
DROP FUNCTION IF EXISTS public.handle_new_user_subscription();

-- Drop the user_subscriptions table
DROP TABLE IF EXISTS public.user_subscriptions;