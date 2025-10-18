import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { useProgressStats } from '@/hooks/use-progress';
import { useModules } from '@/hooks/use-modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Save, CheckCircle2, Flame, Trophy, ChevronDown, Check } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { data: stats } = useProgressStats();
  const { data: modules } = useModules();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferences, setPreferences] = useState({
    preferred_difficulty: 'mixed',
    study_pace: 5,
    favorite_topics: [] as string[],
    learning_style: 'visual'
  });
  const [topicsOpen, setTopicsOpen] = useState(false);
  
  // Initialize form with profile data
  useState(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPreferences(prev => ({
        ...prev,
        ...(profile.learning_preferences as any || {})
      }));
    }
  });
  
  // Get all unique tags from modules
  const allTags = Array.from(new Set(modules?.flatMap(m => m.ai_tags || []) || []));
  
  const handleSavePersonalInfo = async () => {
    await updateProfile.mutateAsync({
      first_name: firstName,
      last_name: lastName,
    });
  };
  
  const handleSavePreferences = async () => {
    await updateProfile.mutateAsync({
      learning_preferences: preferences as any,
    });
  };
  
  const toggleTopic = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_topics: prev.favorite_topics.includes(tag)
        ? prev.favorite_topics.filter(t => t !== tag)
        : [...prev.favorite_topics, tag]
    }));
  };
  
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
        <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and learning preferences</p>
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
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button
                onClick={handleSavePersonalInfo}
                disabled={updateProfile.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
          
          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Difficulty */}
              <div className="space-y-3">
                <Label>Preferred Difficulty Level</Label>
                <RadioGroup
                  value={preferences.preferred_difficulty}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_difficulty: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="font-normal">Advanced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="font-normal">Mixed (All Levels)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              {/* Study Pace */}
              <div className="space-y-3">
                <Label>Study Pace (Hours per Week)</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-16">Slow</span>
                  <Slider
                    value={[preferences.study_pace]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, study_pace: value }))}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-16 text-right">Fast</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-medium">{preferences.study_pace} hours/week</span>
                </p>
              </div>
              
              <Separator />
              
              {/* Favorite Topics */}
              <div className="space-y-3">
                <Label>Favorite Topics</Label>
                <Popover open={topicsOpen} onOpenChange={setTopicsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={topicsOpen}
                      className="w-full justify-between"
                    >
                      {preferences.favorite_topics.length > 0
                        ? `${preferences.favorite_topics.length} topics selected`
                        : 'Select topics...'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search topics..." />
                      <CommandEmpty>No topics found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {allTags.map((tag) => (
                            <CommandItem
                              key={tag}
                              onSelect={() => toggleTopic(tag)}
                            >
                              <div className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                preferences.favorite_topics.includes(tag)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}>
                                <Check className="h-4 w-4" />
                              </div>
                              {tag}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {preferences.favorite_topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.favorite_topics.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Learning Style */}
              <div className="space-y-3">
                <Label>Learning Style</Label>
                <RadioGroup
                  value={preferences.learning_style}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, learning_style: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visual" id="visual" />
                    <Label htmlFor="visual" className="font-normal">Visual (Images, Diagrams)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auditory" id="auditory" />
                    <Label htmlFor="auditory" className="font-normal">Auditory (Listening, Discussion)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reading" id="reading" />
                    <Label htmlFor="reading" className="font-normal">Reading/Writing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kinesthetic" id="kinesthetic" />
                    <Label htmlFor="kinesthetic" className="font-normal">Kinesthetic (Hands-on)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button
                onClick={handleSavePreferences}
                disabled={updateProfile.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
          
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup value={theme} onValueChange={setTheme}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="font-normal">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="font-normal">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}