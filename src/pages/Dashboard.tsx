import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Clock, 
  Trophy, 
  TrendingUp,
  Play,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.user_metadata?.first_name || 'Student';

  const courses = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      progress: 68,
      nextLesson: "Async/Await Patterns",
      difficulty: "Intermediate",
      estimatedTime: "45 min"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      progress: 32,
      nextLesson: "Linear Regression",
      difficulty: "Beginner",
      estimatedTime: "30 min"
    },
    {
      id: 3,
      title: "React Performance Optimization",
      progress: 85,
      nextLesson: "Memoization Strategies",
      difficulty: "Advanced",
      estimatedTime: "60 min"
    }
  ];

  const achievements = [
    { name: "7-Day Streak", icon: "🔥", unlocked: true },
    { name: "Quick Learner", icon: "⚡", unlocked: true },
    { name: "First Course", icon: "🎯", unlocked: true },
    { name: "AI Assistant", icon: "🤖", unlocked: false },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your learning journey? Let's make today count!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 Days</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Active</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 near completion</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Brain className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Continue Learning
              </CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{course.title}</h3>
                      <Badge variant={
                        course.difficulty === 'Beginner' ? 'secondary' :
                        course.difficulty === 'Intermediate' ? 'default' : 'destructive'
                      }>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Next: {course.nextLesson}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.estimatedTime}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                  <Button className="ml-4">
                    Continue
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on your learning pattern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-sm">Focus on JavaScript debugging techniques - you're 23% faster than average</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm">Consider adding Python to your learning path for ML course synergy</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="text-sm">Schedule 20-minute review sessions for better retention</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-center space-y-1 ${
                      achievement.unlocked 
                        ? 'bg-muted/50 border-primary/20' 
                        : 'bg-muted/20 border-muted opacity-50'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <p className="text-xs font-medium">{achievement.name}</p>
                    {achievement.unlocked && (
                      <CheckCircle className="h-3 w-3 text-primary mx-auto" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                Ask AI Tutor
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="mr-2 h-4 w-4" />
                Rate Last Lesson
              </Button>
            </CardContent>
          </Card>

          {/* Learning Goal */}
          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-base">Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>5 hours of study</span>
                  <span>2.4h / 5h</span>
                </div>
                <Progress value={48} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Great progress! 2.6 hours left to reach your goal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}