import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { FileUploadDialog } from "./FileUploadDialog";
import { CreatePollDialog } from "./CreatePollDialog";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  username: string;
}

export const ChatInput = ({ onSend, disabled, username }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card border-t border-border">
      <div className="flex gap-2">
        <FileUploadDialog username={username} type="image" onFileUploaded={() => {}} />
        <FileUploadDialog username={username} type="document" onFileUploaded={() => {}} />
        <CreatePollDialog username={username} onPollCreated={() => {}} />
      </div>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-background"
      />
      <Button type="submit" disabled={disabled || !message.trim()} size="icon" className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
