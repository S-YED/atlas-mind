-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create learning_modules table
CREATE TABLE public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  level difficulty_level NOT NULL DEFAULT 'beginner',
  ai_tags TEXT[] DEFAULT '{}',
  estimated_time_minutes INT NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create progress_logs table
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  completion_score DECIMAL(5,2) CHECK (completion_score >= 0 AND completion_score <= 100),
  time_spent_minutes INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ai_recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggested_module_ids JSONB NOT NULL DEFAULT '[]',
  reasoning TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_modules (public read)
CREATE POLICY "Anyone can view learning modules"
  ON public.learning_modules FOR SELECT
  USING (true);

-- RLS Policies for progress_logs (user owns their data)
CREATE POLICY "Users can view their own progress"
  ON public.progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_recommendations (user owns their data)
CREATE POLICY "Users can view their own recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
  ON public.ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_progress_logs_user_id ON public.progress_logs(user_id);
CREATE INDEX idx_progress_logs_module_id ON public.progress_logs(module_id);
CREATE INDEX idx_progress_logs_created_at ON public.progress_logs(created_at DESC);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);

-- Trigger for updated_at on learning_modules
CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed learning_modules with sample data
INSERT INTO public.learning_modules (title, description, content, level, ai_tags, estimated_time_minutes) VALUES
('Introduction to Python', 'Learn the basics of Python programming language including syntax, variables, and data types.', 
  '{"sections": [{"title": "Getting Started", "text": "Python is a versatile programming language..."}, {"title": "Variables", "text": "Variables store data values..."}]}',
  'beginner', ARRAY['programming', 'python', 'basics'], 45),
  
('Advanced JavaScript Patterns', 'Master design patterns, async programming, and modern ES6+ features.',
  '{"sections": [{"title": "Design Patterns", "text": "Common patterns in JavaScript..."}, {"title": "Async/Await", "text": "Handle asynchronous operations..."}]}',
  'advanced', ARRAY['javascript', 'patterns', 'async'], 90),
  
('Data Structures Fundamentals', 'Understanding arrays, linked lists, stacks, queues, and trees.',
  '{"sections": [{"title": "Arrays", "text": "Arrays are contiguous memory structures..."}, {"title": "Linked Lists", "text": "Dynamic data structures..."}]}',
  'intermediate', ARRAY['algorithms', 'data-structures', 'computer-science'], 75),
  
('Web Accessibility Basics', 'Create inclusive web experiences with ARIA, semantic HTML, and WCAG guidelines.',
  '{"sections": [{"title": "ARIA Roles", "text": "Accessible Rich Internet Applications..."}, {"title": "Semantic HTML", "text": "Using proper HTML elements..."}]}',
  'beginner', ARRAY['accessibility', 'web-development', 'a11y'], 60),
  
('Machine Learning with Python', 'Introduction to ML algorithms, scikit-learn, and neural networks.',
  '{"sections": [{"title": "Supervised Learning", "text": "Classification and regression..."}, {"title": "Neural Networks", "text": "Deep learning fundamentals..."}]}',
  'advanced', ARRAY['machine-learning', 'python', 'ai'], 120),
  
('React Hooks Deep Dive', 'Master useState, useEffect, useContext, and custom hooks with practical examples.',
  '{"sections": [{"title": "useState", "text": "Managing component state..."}, {"title": "useEffect", "text": "Side effects and lifecycle..."}]}',
  'intermediate', ARRAY['react', 'hooks', 'frontend'], 80),
  
('Database Design Principles', 'Learn normalization, indexing, and relational database best practices.',
  '{"sections": [{"title": "Normalization", "text": "Organizing data efficiently..."}, {"title": "Indexes", "text": "Improving query performance..."}]}',
  'intermediate', ARRAY['database', 'sql', 'design'], 70),
  
('Git Version Control', 'Master Git workflows, branching strategies, and collaboration techniques.',
  '{"sections": [{"title": "Basic Commands", "text": "commit, push, pull..."}, {"title": "Branching", "text": "Feature branches and merging..."}]}',
  'beginner', ARRAY['git', 'version-control', 'collaboration'], 50),
  
('CSS Grid & Flexbox', 'Modern layout techniques for responsive web design.',
  '{"sections": [{"title": "Flexbox Basics", "text": "One-dimensional layouts..."}, {"title": "CSS Grid", "text": "Two-dimensional layouts..."}]}',
  'beginner', ARRAY['css', 'layout', 'responsive'], 55),
  
('TypeScript Advanced Types', 'Generics, conditional types, mapped types, and type inference.',
  '{"sections": [{"title": "Generics", "text": "Reusable type-safe components..."}, {"title": "Conditional Types", "text": "Type transformations..."}]}',
  'advanced', ARRAY['typescript', 'types', 'advanced'], 95),
  
('RESTful API Design', 'Build scalable APIs with REST principles, authentication, and versioning.',
  '{"sections": [{"title": "REST Principles", "text": "Stateless communication..."}, {"title": "Authentication", "text": "JWT and OAuth..."}]}',
  'intermediate', ARRAY['api', 'rest', 'backend'], 85),
  
('Cybersecurity Fundamentals', 'Understanding common vulnerabilities, encryption, and secure coding practices.',
  '{"sections": [{"title": "OWASP Top 10", "text": "Common security risks..."}, {"title": "Encryption", "text": "Symmetric and asymmetric..."}]}',
  'intermediate', ARRAY['security', 'cybersecurity', 'encryption'], 100),
  
('Docker & Containers', 'Containerization basics, Dockerfile, docker-compose, and orchestration.',
  '{"sections": [{"title": "Docker Basics", "text": "Images and containers..."}, {"title": "Docker Compose", "text": "Multi-container applications..."}]}',
  'intermediate', ARRAY['docker', 'devops', 'containers'], 90),
  
('UI/UX Design Principles', 'Learn visual hierarchy, color theory, typography, and user-centered design.',
  '{"sections": [{"title": "Visual Hierarchy", "text": "Guiding user attention..."}, {"title": "Color Theory", "text": "Psychology of colors..."}]}',
  'beginner', ARRAY['design', 'ui', 'ux'], 65),
  
('Agile & Scrum Methodology', 'Master sprint planning, daily standups, and agile project management.',
  '{"sections": [{"title": "Scrum Framework", "text": "Roles and ceremonies..."}, {"title": "Sprint Planning", "text": "Backlog refinement..."}]}',
  'beginner', ARRAY['agile', 'scrum', 'project-management'], 40);