/*
  # Fix search path for security

  Updates the `update_updated_at_column()` function to use SECURITY DEFINER
  with proper search_path for enhanced security.
*/

-- Fix the search path issue for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';