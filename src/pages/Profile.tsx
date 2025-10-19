import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import { useProgressStats } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Flame, Trophy, Settings } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { data: stats } = useProgressStats();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            </CardHeader>
          </Card>
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
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">View your learning profile and achievements</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <div className="flex flex-col items-center">
              <AvatarUpload />
              <h3 className="text-xl font-semibold mt-4">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.role && (
                <Badge className="mt-2">{profile.role}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-4">
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalModulesCompleted}</div>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold flex items-center justify-center gap-1">
                      {stats.currentStreak}
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your learning journey at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Preferences</p>
                  <p className="font-medium">
                    {(profile?.learning_preferences as any)?.preferred_difficulty || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Study Pace</p>
                  <p className="font-medium">
                    {(profile?.learning_preferences as any)?.study_pace || 5} hrs/week
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Learning Style</p>
                  <p className="font-medium">
                    {(profile?.learning_preferences as any)?.learning_style || 'Visual'}
                  </p>
                </div>
              </div>
              
              <Button onClick={() => navigate('/settings')} className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile & Settings
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Complete your first course to see activity here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}