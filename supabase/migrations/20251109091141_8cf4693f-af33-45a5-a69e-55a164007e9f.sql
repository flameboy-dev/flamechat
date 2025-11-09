-- Create storage buckets for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-documents', 'chat-documents', true);

-- Create storage policies for images
CREATE POLICY "Anyone can view chat images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');

CREATE POLICY "Anyone can upload chat images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-images');

-- Create storage policies for documents
CREATE POLICY "Anyone can view chat documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-documents');

CREATE POLICY "Anyone can upload chat documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-documents');

-- Create message_type enum
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'poll');

-- Add columns to messages table for different message types
ALTER TABLE public.messages 
ADD COLUMN message_type message_type NOT NULL DEFAULT 'text',
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN poll_id UUID;

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id: string, text: string, votes: number}
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed BOOLEAN DEFAULT false
);

-- Enable RLS on polls
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Policies for polls
CREATE POLICY "Anyone can view polls" 
ON public.polls 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update polls" 
ON public.polls 
FOR UPDATE 
USING (true);

-- Create poll_votes table to track who voted
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, username)
);

-- Enable RLS on poll_votes
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for poll_votes
CREATE POLICY "Anyone can view poll votes" 
ON public.poll_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create poll votes" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;