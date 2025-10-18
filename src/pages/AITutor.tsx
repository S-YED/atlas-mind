import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useModules } from '@/hooks/use-modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AITutor() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: recommendations, isLoading, refetch } = useRecommendations();
  const { data: modules } = useModules();

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  const getRecommendedModules = () => {
    if (!recommendations || !modules) return [];
    const latestRec = recommendations[0];
    if (!latestRec?.suggested_module_ids) return [];
    
    return latestRec.suggested_module_ids
      .map(id => modules.find(m => m.id === id))
      .filter(Boolean);
  };

  const recommendedModules = getRecommendedModules();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Learning Coach</h1>
        </div>
        <p className="text-muted-foreground">Get personalized learning recommendations powered by AI</p>
      </div>

      {/* Generate Recommendations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Our AI analyzes your progress and preferences to suggest the best learning path
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Get New Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendedModules.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recommended for You</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/courses/${module.id}`)}>
                  <div className={`h-32 bg-gradient-to-br ${
                    module.level === 'beginner' ? 'from-green-400 to-green-600' :
                    module.level === 'intermediate' ? 'from-blue-400 to-blue-600' :
                    'from-purple-400 to-purple-600'
                  } rounded-t-lg flex items-center justify-center`}>
                    <TrendingUp className="h-12 w-12 text-white opacity-80" />
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                      <Badge variant="secondary">{module.level}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {module.estimated_time_minutes} min
                      </div>
                    </div>
                    
                    {module.ai_tags && (
                      <div className="flex flex-wrap gap-1">
                        {module.ai_tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete a few modules first, then get personalized AI recommendations
          </p>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </Card>
      )}
    </motion.div>
  );
}