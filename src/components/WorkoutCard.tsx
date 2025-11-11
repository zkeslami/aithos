import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

interface Exercise {
  name: string;
  details: string;
}

interface WorkoutSection {
  title: string;
  exercises: Exercise[];
}

interface Workout {
  title: string;
  type: string;
  duration_minutes: number;
  sections: WorkoutSection[];
  rationale?: string;
}

interface WorkoutCardProps {
  workout: Workout;
  onLog?: () => void;
  showDate?: boolean;
  date?: string;
}

export const WorkoutCard = ({ workout, onLog, showDate, date }: WorkoutCardProps) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{workout.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{workout.type}</Badge>
              <span className="flex items-center gap-1 text-sm">
                <Clock className="w-3 h-3" />
                {workout.duration_minutes} min
              </span>
            </CardDescription>
          </div>
        </div>
        {workout.rationale && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{workout.rationale}</span>
            </p>
          </div>
        )}
        {showDate && date && (
          <p className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {workout.sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">{section.title}</h4>
            <ul className="space-y-2">
              {section.exercises.map((exercise, exIdx) => (
                <li key={exIdx} className="text-sm flex items-start gap-2 p-2 rounded bg-secondary/30">
                  <span className="text-primary mt-0.5">•</span>
                  <div>
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-muted-foreground"> — {exercise.details}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {onLog && (
          <Button onClick={onLog} className="w-full mt-4" size="lg">
            Log This Workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
};