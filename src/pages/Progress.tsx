import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProgress, useProgressStats } from '@/hooks/use-progress';
import { useModules } from '@/hooks/use-modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Clock, Flame, Star, Award, CheckCircle2, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Progress() {
  const { data: progressLogs, isLoading: progressLoading } = useProgress();
  const { data: stats, isLoading: statsLoading } = useProgressStats();
  const { data: modules } = useModules();
  
  // Prepare data for charts
  const { studyTimeData, weeklyModulesData, difficultyData } = useMemo(() => {
    if (!progressLogs) return { studyTimeData: [], weeklyModulesData: [], difficultyData: [] };
    
    // Study time over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: 0
      };
    });
    
    progressLogs.forEach(log => {
      const logDate = new Date(log.completed_at || log.created_at).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.date === logDate);
      if (dayData) {
        dayData.minutes += log.time_spent_minutes || 0;
      }
    });
    
    // Modules completed per week (last 8 weeks)
    const weeklyData = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${8 - i}`,
      modules: 0
    }));
    
    progressLogs.forEach(log => {
      const weekAgo = Math.floor((Date.now() - new Date(log.completed_at || log.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weekAgo >= 0 && weekAgo < 8) {
        weeklyData[7 - weekAgo].modules += 1;
      }
    });
    
    // Time by difficulty
    const difficultyMap: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    
    progressLogs.forEach(log => {
      const module = modules?.find(m => m.id === log.module_id);
      if (module) {
        difficultyMap[module.level] += log.time_spent_minutes || 0;
      }
    });
    
    const difficultyData = [
      { name: 'Beginner', value: difficultyMap.beginner, color: '#10B981' },
      { name: 'Intermediate', value: difficultyMap.intermediate, color: '#1E3A8A' },
      { name: 'Advanced', value: difficultyMap.advanced, color: '#8B5CF6' }
    ].filter(d => d.value > 0);
    
    return { studyTimeData: last30Days, weeklyModulesData: weeklyData, difficultyData };
  }, [progressLogs, modules]);
  
  // Achievement logic
  const achievements = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        icon: Target,
        title: 'First Steps',
        description: 'Complete your first module',
        unlocked: stats.totalModulesCompleted >= 1,
        progress: Math.min(stats.totalModulesCompleted, 1),
        total: 1
      },
      {
        icon: Trophy,
        title: 'Course Master',
        description: 'Complete 5 modules',
        unlocked: stats.totalModulesCompleted >= 5,
        progress: Math.min(stats.totalModulesCompleted, 5),
        total: 5
      },
      {
        icon: Flame,
        title: '7-Day Streak',
        description: 'Study for 7 consecutive days',
        unlocked: stats.currentStreak >= 7,
        progress: Math.min(stats.currentStreak, 7),
        total: 7
      },
      {
        icon: Star,
        title: 'Perfect Score',
        description: 'Get 100% on a module',
        unlocked: progressLogs?.some(log => log.completion_score === 100) || false,
        progress: progressLogs?.some(log => log.completion_score === 100) ? 1 : 0,
        total: 1
      },
      {
        icon: Award,
        title: 'Dedicated Learner',
        description: 'Complete 10 modules',
        unlocked: stats.totalModulesCompleted >= 10,
        progress: Math.min(stats.totalModulesCompleted, 10),
        total: 10
      },
      {
        icon: Clock,
        title: 'Time Master',
        description: 'Study for 10 hours total',
        unlocked: stats.totalStudyTime >= 600,
        progress: Math.min(stats.totalStudyTime, 600),
        total: 600
      }
    ];
  }, [stats, progressLogs]);
  
  if (progressLoading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modules Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalModulesCompleted || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.averageScore || 0}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((stats?.totalStudyTime || 0) / 60)}h</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalStudyTime || 0} minutes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Study Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Study Time (Last 30 Days)</CardTitle>
            <CardDescription>Minutes spent learning each day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="displayDate" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Weekly Modules Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Modules Completed (Last 8 Weeks)</CardTitle>
            <CardDescription>Number of modules finished per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyModulesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="modules" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Difficulty Distribution */}
      {difficultyData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Time Distribution by Difficulty</CardTitle>
            <CardDescription>Study time breakdown across difficulty levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Unlock badges as you progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? 'bg-card border-primary/50 shadow-sm'
                    : 'bg-muted/30 border-muted grayscale opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {achievement.unlocked ? (
                      <achievement.icon className="h-6 w-6 text-primary" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="text-xs text-muted-foreground">
                        Progress: {achievement.progress} / {achievement.total}
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle2 className="h-5 w-5 text-primary absolute top-4 right-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest completed modules</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLogs && progressLogs.length > 0 ? (
            <div className="space-y-4">
              {progressLogs.slice(0, 10).map((log, index) => {
                const module = modules?.find(m => m.id === log.module_id);
                return (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">{module?.title || 'Unknown Module'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.completed_at || log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.completion_score === 100 ? 'default' : 'secondary'}>
                      {log.completion_score}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Complete your first module to see your progress here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}