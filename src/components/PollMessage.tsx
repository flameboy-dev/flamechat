import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollMessageProps {
  pollId: string;
  username: string;
}

export const PollMessage = ({ pollId, username }: PollMessageProps) => {
  const [poll, setPoll] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPoll();
    loadVotes();

    const pollChannel = supabase
      .channel(`poll-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_votes",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          loadVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollChannel);
    };
  }, [pollId]);

  const loadPoll = async () => {
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (!error && data) {
      setPoll(data);
    }
  };

  const loadVotes = async () => {
    const { data, error } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", pollId);

    if (!error && data) {
      setVotes(data);
      setHasVoted(data.some((v) => v.username === username));
    }
  };

  const handleVote = async (optionId: string) => {
    const { error } = await supabase.from("poll_votes").insert({
      poll_id: pollId,
      username,
      option_id: optionId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Vote recorded!",
        description: "Your vote has been submitted",
      });
    }
  };

  if (!poll) return null;

  const options = poll.options as PollOption[];
  const totalVotes = votes.length;

  const getVoteCount = (optionId: string) => {
    return votes.filter((v) => v.option_id === optionId).length;
  };

  return (
    <Card className="p-4 max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{poll.question}</h3>
      </div>
      <div className="space-y-3">
        {options.map((option) => {
          const voteCount = getVoteCount(option.id);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return (
            <div key={option.id} className="space-y-1">
              {hasVoted ? (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{option.text}</span>
                    <span className="text-muted-foreground">
                      {voteCount} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleVote(option.id)}
                  disabled={poll.closed}
                >
                  {option.text}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </Card>
  );
};
