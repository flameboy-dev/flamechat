-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read messages
CREATE POLICY "Anyone can view messages" 
ON public.messages 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert messages
CREATE POLICY "Anyone can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);