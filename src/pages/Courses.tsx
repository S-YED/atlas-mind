import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useModules, DifficultyLevel } from '@/hooks/use-modules';
import { useProgress } from '@/hooks/use-progress';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Clock, BookOpen, TrendingUp, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const difficultyColors = {
  beginner: 'bg-secondary text-secondary-foreground',
  intermediate: 'bg-primary text-primary-foreground',
  advanced: 'bg-accent text-accent-foreground',
};

export default function Courses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data: modules, isLoading } = useModules({
    level: selectedLevel === 'all' ? undefined : selectedLevel,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    searchQuery: debouncedSearch || undefined,
  });
  
  const { data: progressLogs } = useProgress();
  
  // Get unique tags from all modules
  const allTags = useMemo(() => {
    if (!modules) return [];
    const tags = modules.flatMap(m => m.ai_tags || []);
    return [...new Set(tags)];
  }, [modules]);
  
  // Calculate progress for each module
  const moduleProgress = useMemo(() => {
    if (!progressLogs) return {};
    const progress: Record<string, number> = {};
    progressLogs.forEach(log => {
      progress[log.module_id] = log.completion_score || 0;
    });
    return progress;
  }, [progressLogs]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedTags([]);
  };
  
  const hasFilters = searchQuery || selectedLevel !== 'all' || selectedTags.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Modules</h1>
          <p className="text-muted-foreground">Explore our curated courses and start learning</p>
        </div>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filter Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Difficulty Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Topics</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Module Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : !modules || modules.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No modules found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            {hasFilters && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modules.map(module => {
              const progress = moduleProgress[module.id] || 0;
              const isStarted = progress > 0;
              const isCompleted = progress >= 100;
              
              return (
                <motion.div key={module.id} variants={itemVariants}>
                  <Card 
                    className="h-full flex flex-col cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                    onClick={() => navigate(`/courses/${module.id}`)}
                  >
                    {/* Gradient thumbnail based on difficulty */}
                    <div className={`h-32 bg-gradient-to-br ${
                      module.level === 'beginner' ? 'from-secondary/80 to-secondary' :
                      module.level === 'intermediate' ? 'from-primary/80 to-primary' :
                      'from-accent/80 to-accent'
                    } rounded-t-lg flex items-center justify-center`}>
                      <TrendingUp className="h-12 w-12 text-white opacity-50" />
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                        <Badge className={difficultyColors[module.level]}>
                          {module.level}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {module.estimated_time_minutes} min
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {module.ai_tags && module.ai_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {module.ai_tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {module.ai_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{module.ai_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      {isStarted && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button className="w-full" variant={isCompleted ? 'outline' : 'default'}>
                        {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start Learning'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}