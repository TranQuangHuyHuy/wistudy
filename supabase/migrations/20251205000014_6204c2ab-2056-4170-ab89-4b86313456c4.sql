-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  tier subscription_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, email, tier)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$;

-- Trigger for new user subscription
CREATE TRIGGER on_auth_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();

-- Insert subscriptions for existing users (set all to free)
INSERT INTO public.user_subscriptions (user_id, email, tier)
SELECT id, email, 'free'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;