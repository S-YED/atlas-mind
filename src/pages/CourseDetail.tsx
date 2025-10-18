import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useModules } from '@/hooks/use-modules';
import { useLogProgress } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { CompletionCelebration } from '@/components/CompletionCelebration';

const difficultyColors = {
  beginner: 'bg-secondary text-secondary-foreground',
  intermediate: 'bg-primary text-primary-foreground',
  advanced: 'bg-accent text-accent-foreground',
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: modules, isLoading } = useModules();
  const logProgress = useLogProgress();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const startTimeRef = useRef(Date.now());
  
  const module = modules?.find(m => m.id === id);
  const sections = module?.content?.sections || [];
  const totalSections = sections.length;
  const progressPercent = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;
  
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [id]);
  
  const handleComplete = async () => {
    if (!module) return;
    
    const timeSpentMinutes = Math.floor((Date.now() - startTimeRef.current) / 60000);
    
    try {
      await logProgress.mutateAsync({
        moduleId: module.id,
        completionScore: 100,
        timeSpentMinutes: Math.max(1, timeSpentMinutes),
      });
      
      setShowCelebration(true);
    } catch (error) {
      console.error('Error logging progress:', error);
    }
  };
  
  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Module not found</h3>
          <p className="text-muted-foreground mb-4">
            The module you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate('/courses')}>
            Browse Modules
          </Button>
        </Card>
      </div>
    );
  }
  
  const currentSectionData = sections[currentSection];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/courses')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Modules
      </Button>
      
      {/* Hero Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{module.title}</CardTitle>
              <CardDescription className="text-base">{module.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={difficultyColors[module.level]}>
                {module.level}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {module.estimated_time_minutes} min
              </Badge>
            </div>
          </div>
          
          {/* Tags */}
          {module.ai_tags && module.ai_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {module.ai_tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Progress */}
          {totalSections > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>
      
      {/* Content Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          {totalSections > 0 ? (
            <>
              {/* Section Navigation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Section {currentSection + 1} of {totalSections}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentSection === totalSections - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              {/* Current Section Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{currentSectionData?.title || `Section ${currentSection + 1}`}</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{currentSectionData?.body || 'No content available for this section.'}</div>
                  
                  {currentSectionData?.type === 'code' && (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mt-4">
                      <code>{currentSectionData.body}</code>
                    </pre>
                  )}
                </CardContent>
              </Card>
              
              {/* Complete Button (only on last section) */}
              {currentSection === totalSections - 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Ready to Complete?</h3>
                      <p className="text-muted-foreground mb-6">
                        Congratulations on reaching the end of this module!
                      </p>
                      <Button
                        size="lg"
                        onClick={handleComplete}
                        disabled={logProgress.isPending}
                        className="min-w-[200px]"
                      >
                        {logProgress.isPending ? 'Completing...' : 'Complete Module'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No content available</h3>
              <p className="text-muted-foreground">
                This module doesn't have any sections yet
              </p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>Supplementary materials to enhance your learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Official Documentation</p>
                    <p className="text-sm text-muted-foreground">Learn more from the docs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Video Tutorial</p>
                    <p className="text-sm text-muted-foreground">Watch a step-by-step guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Practice Exercises</p>
                    <p className="text-sm text-muted-foreground">Test your knowledge</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>Connect with other learners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Discussion features will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CompletionCelebration
        open={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          navigate('/progress');
        }}
        moduleName={module.title}
        score={100}
      />
    </motion.div>
  );
}