import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GoalSetupModal } from "@/components/GoalSetupModal";
import { WorkoutGenerator } from "@/components/WorkoutGenerator";
import { WorkoutCard } from "@/components/WorkoutCard";
import { LogWorkoutModal } from "@/components/LogWorkoutModal";
import { DailySuggestion } from "@/components/DailySuggestion";
import { WorkoutStats } from "@/components/WorkoutStats";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { Dumbbell, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [workoutToLog, setWorkoutToLog] = useState<any>(null);
  const [refreshStats, setRefreshStats] = useState(0);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        setShowGoalModal(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleWorkoutGenerated = (workout: any) => {
    setGeneratedWorkout(workout);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogWorkout = (workout: any) => {
    setWorkoutToLog(workout);
    setShowLogModal(true);
  };

  const handleLogComplete = () => {
    setShowLogModal(false);
    setWorkoutToLog(null);
    setGeneratedWorkout(null);
    setRefreshStats(prev => prev + 1);
    
    // Check milestones
    supabase
      .from("workouts")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", user?.id)
      .then(({ count }) => {
        if (count && [5, 10, 25].includes(count)) {
          toast.success(`🎉 Milestone! You've completed ${count} workouts!`, {
            duration: 5000,
          });
        }
      });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Smart Fitness</h1>
              {profile && (
                <p className="text-xs text-muted-foreground capitalize">
                  Goal: {profile.primary_goal.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {generatedWorkout && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Generated Workout</h2>
                <WorkoutCard 
                  workout={generatedWorkout} 
                  onLog={() => handleLogWorkout(generatedWorkout)} 
                />
              </div>
            )}

            <DailySuggestion onStartWorkout={handleLogWorkout} />

            <WorkoutStats refreshTrigger={refreshStats} />

            <WorkoutHistory refreshTrigger={refreshStats} />
          </div>

          <div className="space-y-8">
            <WorkoutGenerator 
              onWorkoutGenerated={handleWorkoutGenerated}
              userGoal={profile?.primary_goal}
            />
          </div>
        </div>
      </main>

      <GoalSetupModal 
        open={showGoalModal} 
        onComplete={() => {
          setShowGoalModal(false);
          if (user) checkProfile(user.id);
        }} 
      />

      {workoutToLog && (
        <LogWorkoutModal
          open={showLogModal}
          onClose={handleLogComplete}
          workout={workoutToLog}
        />
      )}
    </div>
  );
};

export default Index;
