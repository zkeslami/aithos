import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", emoji: "🎯" },
  { value: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { value: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
  { value: "increase_flexibility", label: "Increase Flexibility", emoji: "🧘" },
  { value: "general_fitness", label: "General Fitness", emoji: "⚡" },
];

export const GoalSetupModal = ({ open, onComplete }: GoalSetupModalProps) => {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedGoal) {
      toast.error("Please select a fitness goal");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .insert({ 
          id: user.id, 
          primary_goal: selectedGoal 
        });

      if (error) throw error;

      toast.success("Your fitness goal has been set!");
      onComplete();
    } catch (error: any) {
      console.error("Error saving goal:", error);
      toast.error(error.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Smart Fitness!</DialogTitle>
          <DialogDescription className="text-base">
            Let's start by setting your primary fitness goal. This helps us personalize your workouts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal}>
            {GOALS.map((goal) => (
              <div key={goal.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-base cursor-pointer">
                <RadioGroupItem value={goal.value} id={goal.value} />
                <Label 
                  htmlFor={goal.value} 
                  className="flex items-center gap-3 cursor-pointer flex-1 text-base"
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <span>{goal.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Button onClick={handleSave} disabled={saving || !selectedGoal} size="lg" className="w-full">
          {saving ? "Saving..." : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};