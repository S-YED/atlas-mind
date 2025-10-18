import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Flame } from 'lucide-react';
import { useProgressStats } from '@/hooks/use-progress';

interface CompletionCelebrationProps {
  open: boolean;
  onClose: () => void;
  moduleName: string;
  score: number;
}

export function CompletionCelebration({ open, onClose, moduleName, score }: CompletionCelebrationProps) {
  const { data: stats } = useProgressStats();
  
  useEffect(() => {
    if (open) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#1E3A8A', '#10B981', '#8B5CF6']
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#1E3A8A', '#10B981', '#8B5CF6']
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [open]);
  
  const achievements = [];
  
  if (stats) {
    if (stats.totalModulesCompleted === 1) {
      achievements.push({ icon: Target, title: 'First Steps', description: 'Complete your first module' });
    }
    if (stats.totalModulesCompleted === 5) {
      achievements.push({ icon: Trophy, title: 'Course Master', description: 'Complete 5 modules' });
    }
    if (stats.currentStreak >= 7) {
      achievements.push({ icon: Flame, title: '7-Day Streak', description: 'Study for 7 consecutive days' });
    }
    if (score === 100) {
      achievements.push({ icon: Star, title: 'Perfect Score', description: 'Complete a module with 100%' });
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Congratulations!</DialogTitle>
          <DialogDescription className="text-center text-base">
            You've completed <span className="font-semibold text-foreground">{moduleName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Score */}
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              {score}%
            </div>
            <p className="text-sm text-muted-foreground">Completion Score</p>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.totalModulesCompleted}</div>
                <p className="text-xs text-muted-foreground">Modules Completed</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {stats.currentStreak}
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          )}
          
          {/* New Achievements */}
          {achievements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-center">New Achievements Unlocked!</h4>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <achievement.icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onClose} className="w-full">
            View Progress Dashboard
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Continue Learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}