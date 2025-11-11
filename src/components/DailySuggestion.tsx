import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";

interface DailySuggestionProps {
  onStartWorkout: (workout: any) => void;
}

export const DailySuggestion = ({ onStartWorkout }: DailySuggestionProps) => {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-workout');

      if (error) throw error;

      if (data?.workout) {
        setSuggestion(data.workout);
      }
    } catch (error: any) {
      console.error("Error fetching suggestion:", error);
      toast.error(error.message || "Failed to get suggestion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Today's Suggestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No suggestion available yet. Complete some workouts to get personalized recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Today's Suggestion
        </h2>
        <Button variant="ghost" size="sm" onClick={fetchSuggestion}>
          Refresh
        </Button>
      </div>
      <WorkoutCard 
        workout={suggestion} 
        onLog={() => onStartWorkout(suggestion)} 
      />
    </div>
  );
};