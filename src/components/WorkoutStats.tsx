import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Flame, Clock } from "lucide-react";

interface WorkoutStatsProps {
  refreshTrigger?: number;
}

export const WorkoutStats = ({ refreshTrigger }: WorkoutStatsProps) => {
  const [stats, setStats] = useState<any>({
    totalWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
    chartData: [],
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: workouts } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (workouts) {
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
        const totalMinutes = workouts.reduce((sum, w) => sum + (w.logged_duration || 0), 0);

        const chartData = workouts
          .reverse()
          .map((w, idx) => ({
            name: `W${idx + 1}`,
            calories: w.calories_burned || 0,
            duration: w.logged_duration || 0,
          }));

        setStats({ totalWorkouts, totalCalories, totalMinutes, chartData });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMinutes}</div>
          </CardContent>
        </Card>
      </div>

      {stats.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Calories"
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Duration (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};