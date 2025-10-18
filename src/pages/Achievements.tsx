import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProgressStats } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Flame, Star, Award, Clock, CheckCircle2, Lock } from 'lucide-react';

export default function Achievements() {
  const { data: stats } = useProgressStats();

  const achievements = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        icon: Target,
        title: 'First Steps',
        description: 'Complete your first module',
        unlocked: stats.totalModulesCompleted >= 1,
        progress: Math.min(stats.totalModulesCompleted, 1),
        total: 1,
        category: 'Learning',
        points: 10
      },
      {
        icon: Trophy,
        title: 'Course Master',
        description: 'Complete 5 modules',
        unlocked: stats.totalModulesCompleted >= 5,
        progress: Math.min(stats.totalModulesCompleted, 5),
        total: 5,
        category: 'Learning',
        points: 50
      },
      {
        icon: Award,
        title: 'Dedicated Learner',
        description: 'Complete 10 modules',
        unlocked: stats.totalModulesCompleted >= 10,
        progress: Math.min(stats.totalModulesCompleted, 10),
        total: 10,
        category: 'Learning',
        points: 100
      },
      {
        icon: Flame,
        title: '3-Day Streak',
        description: 'Study for 3 consecutive days',
        unlocked: stats.currentStreak >= 3,
        progress: Math.min(stats.currentStreak, 3),
        total: 3,
        category: 'Consistency',
        points: 25
      },
      {
        icon: Flame,
        title: '7-Day Streak',
        description: 'Study for 7 consecutive days',
        unlocked: stats.currentStreak >= 7,
        progress: Math.min(stats.currentStreak, 7),
        total: 7,
        category: 'Consistency',
        points: 75
      },
      {
        icon: Star,
        title: 'Perfect Score',
        description: 'Get 100% on a module',
        unlocked: stats.averageScore === 100,
        progress: stats.averageScore === 100 ? 1 : 0,
        total: 1,
        category: 'Excellence',
        points: 30
      },
      {
        icon: Clock,
        title: 'Time Master',
        description: 'Study for 5 hours total',
        unlocked: stats.totalStudyTime >= 300,
        progress: Math.min(stats.totalStudyTime, 300),
        total: 300,
        category: 'Dedication',
        points: 40
      },
      {
        icon: Clock,
        title: 'Marathon Learner',
        description: 'Study for 20 hours total',
        unlocked: stats.totalStudyTime >= 1200,
        progress: Math.min(stats.totalStudyTime, 1200),
        total: 1200,
        category: 'Dedication',
        points: 150
      }
    ];
  }, [stats]);

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const categories = ['All', 'Learning', 'Consistency', 'Excellence', 'Dedication'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Achievements</h1>
        </div>
        <p className="text-muted-foreground">Track your learning milestones and unlock rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unlockedCount}/{achievements.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</div>
            <Progress value={(unlockedCount / achievements.length) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`relative transition-all hover:shadow-lg ${
              achievement.unlocked 
                ? 'bg-card border-primary/20 shadow-sm' 
                : 'bg-muted/30 border-muted'
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {achievement.unlocked ? (
                      <achievement.icon className="h-6 w-6 text-primary" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                      {achievement.category}
                    </Badge>
                    <span className="text-sm font-medium text-primary">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>
                
                <div>
                  <CardTitle className={achievement.unlocked ? '' : 'text-muted-foreground'}>
                    {achievement.title}
                  </CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent>
                {achievement.unlocked ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Unlocked!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {achievement.progress} / {achievement.total}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.total) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
              
              {achievement.unlocked && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}