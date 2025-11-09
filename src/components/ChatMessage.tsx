import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { PollMessage } from "./PollMessage";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  username: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  pollId?: string;
  currentUsername: string;
}

export const ChatMessage = ({
  username,
  content,
  createdAt,
  isOwn,
  messageType = "text",
  fileUrl,
  fileName,
  pollId,
  currentUsername,
}: ChatMessageProps) => {
  const renderMessageContent = () => {
    if (messageType === "poll" && pollId) {
      return <PollMessage pollId={pollId} username={currentUsername} />;
    }

    if (messageType === "image" && fileUrl) {
      return (
        <div className="space-y-2">
          {!isOwn && <p className="text-xs font-semibold text-muted-foreground">{username}</p>}
          <img
            src={fileUrl}
            alt={fileName || "Shared image"}
            className="rounded-lg max-w-full h-auto max-h-96 object-cover"
          />
          {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
        </div>
      );
    }

    if (messageType === "document" && fileUrl) {
      return (
        <div className="space-y-2">
          {!isOwn && <p className="text-xs font-semibold mb-1 text-muted-foreground">{username}</p>}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName || "Document"}</p>
              <p className="text-xs text-muted-foreground">Click to download</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        {!isOwn && <p className="text-xs font-semibold mb-1 text-muted-foreground">{username}</p>}
        <p className="text-sm break-words">{content}</p>
      </>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwn ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl shadow-sm",
          messageType === "text"
            ? cn(
                "px-4 py-3 max-w-[70%]",
                isOwn
                  ? "bg-chat-bubble-sent text-primary-foreground"
                  : "bg-chat-bubble-received text-card-foreground border border-border"
              )
            : "max-w-md"
        )}
      >
        {renderMessageContent()}
      </div>
      <p className="text-xs text-muted-foreground mt-1 px-2">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </p>
    </div>
  );
};
