/*
  # Create Learning Platform Tables

  1. New Tables
    - `learning_modules` - Stores educational content
      - `id` (uuid, primary key)
      - `title` (text) - Module title
      - `description` (text) - Module description
      - `content` (jsonb) - Rich content structure
      - `level` (difficulty_level enum) - beginner/intermediate/advanced
      - `ai_tags` (text[]) - AI-generated tags for personalization
      - `estimated_time_minutes` (int) - Estimated completion time
      - `created_at`, `updated_at` (timestamptz)

    - `progress_logs` - Tracks user learning progress
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_id` (uuid, references learning_modules)
      - `completion_score` (decimal) - Score 0-100
      - `time_spent_minutes` (int) - Actual time spent
      - `completed_at`, `created_at` (timestamptz)

    - `ai_recommendations` - Stores AI-generated learning suggestions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `suggested_module_ids` (jsonb) - Array of module recommendations
      - `reasoning` (text) - AI explanation
      - `confidence_score` (decimal) - 0-1 confidence
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - Recommendations expire after 7 days

  2. Security
    - Enable RLS on all tables
    - learning_modules: Public read access
    - progress_logs: Users can only view/modify their own data
    - ai_recommendations: Users can only view/modify their own data

  3. Performance
    - Indexes on user_id, module_id, created_at for fast queries
    - Index on expires_at for recommendation cleanup

  4. Sample Data
    - 15 diverse learning modules covering programming, design, and methodology
*/

-- Create enum for difficulty levels (skip if exists)
DO $$ BEGIN
  CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create learning_modules table
CREATE TABLE IF NOT EXISTS public.learning_modules (
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
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  completion_score DECIMAL(5,2) CHECK (completion_score >= 0 AND completion_score <= 100),
  time_spent_minutes INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
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
DO $$ BEGIN
  CREATE POLICY "Anyone can view learning modules"
    ON public.learning_modules FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for progress_logs (user owns their data)
DO $$ BEGIN
  CREATE POLICY "Users can view their own progress"
    ON public.progress_logs FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own progress"
    ON public.progress_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own progress"
    ON public.progress_logs FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for ai_recommendations (user owns their data)
DO $$ BEGIN
  CREATE POLICY "Users can view their own recommendations"
    ON public.ai_recommendations FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own recommendations"
    ON public.ai_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Indexes for performance (skip if exist)
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON public.progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_module_id ON public.progress_logs(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_created_at ON public.progress_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);

-- Trigger for updated_at on learning_modules (skip if exists)
DO $$ BEGIN
  CREATE TRIGGER update_learning_modules_updated_at
    BEFORE UPDATE ON public.learning_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Seed learning_modules with sample data (only if table is empty)
INSERT INTO public.learning_modules (title, description, content, level, ai_tags, estimated_time_minutes)
SELECT * FROM (VALUES
  ('Introduction to Python', 'Learn the basics of Python programming language including syntax, variables, and data types.', 
    '{"sections": [{"title": "Getting Started", "body": "Python is a versatile programming language that is easy to learn and powerful to use. It was created by Guido van Rossum and first released in 1991. Python emphasizes code readability and simplicity, making it an excellent choice for beginners and experienced developers alike.\n\nKey features of Python:\n• Simple and readable syntax\n• Interpreted language\n• Cross-platform compatibility\n• Extensive standard library\n• Large community support"}, {"title": "Variables and Data Types", "body": "Variables in Python are used to store data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.\n\nExample:\n```python\nx = 5\nname = \"John\"\nprint(x)\nprint(name)\n```\n\nPython has several built-in data types:\n• int: Integer numbers\n• float: Decimal numbers\n• str: Text strings\n• bool: True/False values\n• list: Ordered collections\n• dict: Key-value pairs"}, {"title": "Your First Python Program", "body": "Let\'s write your first Python program! The traditional first program is \"Hello, World!\"\n\n```python\nprint(\"Hello, World!\")\n```\n\nThis simple program demonstrates:\n1. Using the print() function\n2. Working with strings\n3. Basic Python syntax\n\nTry modifying the message to print your own greeting!"}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['programming', 'python', 'basics'], 45),
  ('Advanced JavaScript Patterns', 'Master design patterns, async programming, and modern ES6+ features.',
    '{"sections": [{"title": "Design Patterns Overview", "body": "Design patterns are reusable solutions to commonly occurring problems in software design. In JavaScript, several patterns are particularly useful:\n\n1. **Module Pattern**: Encapsulates code and provides privacy\n2. **Observer Pattern**: Defines dependencies between objects\n3. **Factory Pattern**: Creates objects without specifying exact classes\n4. **Singleton Pattern**: Ensures only one instance exists\n\nThese patterns help create maintainable, scalable code."}, {"title": "Async/Await Deep Dive", "body": "Async/await is a syntax that makes it easier to work with promises in JavaScript. It allows you to write asynchronous code that looks and behaves more like synchronous code.\n\n```javascript\n// Promise-based approach\nfetch(\'https://api.example.com/data\')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\n// Async/await approach\nasync function fetchData() {\n  try {\n    const response = await fetch(\'https://api.example.com/data\');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error(error);\n  }\n}\n```"}, {"title": "Modern ES6+ Features", "body": "ES6 and later versions introduced many powerful features:\n\n**Arrow Functions:**\n```javascript\nconst add = (a, b) => a + b;\n```\n\n**Destructuring:**\n```javascript\nconst {name, age} = person;\nconst [first, second] = array;\n```\n\n**Template Literals:**\n```javascript\nconst message = `Hello, ${name}!`;\n```\n\n**Spread Operator:**\n```javascript\nconst newArray = [...oldArray, newItem];\n```\n\nThese features make JavaScript more expressive and concise."}]}'::jsonb,
    'advanced'::difficulty_level, ARRAY['javascript', 'patterns', 'async'], 90),
  ('Data Structures Fundamentals', 'Understanding arrays, linked lists, stacks, queues, and trees.',
    '{"sections": [{"title": "Arrays", "text": "Arrays are contiguous memory structures..."}, {"title": "Linked Lists", "text": "Dynamic data structures..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['algorithms', 'data-structures', 'computer-science'], 75),
  ('Web Accessibility Basics', 'Create inclusive web experiences with ARIA, semantic HTML, and WCAG guidelines.',
    '{"sections": [{"title": "ARIA Roles", "text": "Accessible Rich Internet Applications..."}, {"title": "Semantic HTML", "text": "Using proper HTML elements..."}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['accessibility', 'web-development', 'a11y'], 60),
  ('Machine Learning with Python', 'Introduction to ML algorithms, scikit-learn, and neural networks.',
    '{"sections": [{"title": "Supervised Learning", "text": "Classification and regression..."}, {"title": "Neural Networks", "text": "Deep learning fundamentals..."}]}'::jsonb,
    'advanced'::difficulty_level, ARRAY['machine-learning', 'python', 'ai'], 120),
  ('React Hooks Deep Dive', 'Master useState, useEffect, useContext, and custom hooks with practical examples.',
    '{"sections": [{"title": "useState", "text": "Managing component state..."}, {"title": "useEffect", "text": "Side effects and lifecycle..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['react', 'hooks', 'frontend'], 80),
  ('Database Design Principles', 'Learn normalization, indexing, and relational database best practices.',
    '{"sections": [{"title": "Normalization", "text": "Organizing data efficiently..."}, {"title": "Indexes", "text": "Improving query performance..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['database', 'sql', 'design'], 70),
  ('Git Version Control', 'Master Git workflows, branching strategies, and collaboration techniques.',
    '{"sections": [{"title": "Basic Commands", "text": "commit, push, pull..."}, {"title": "Branching", "text": "Feature branches and merging..."}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['git', 'version-control', 'collaboration'], 50),
  ('CSS Grid & Flexbox', 'Modern layout techniques for responsive web design.',
    '{"sections": [{"title": "Flexbox Basics", "text": "One-dimensional layouts..."}, {"title": "CSS Grid", "text": "Two-dimensional layouts..."}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['css', 'layout', 'responsive'], 55),
  ('TypeScript Advanced Types', 'Generics, conditional types, mapped types, and type inference.',
    '{"sections": [{"title": "Generics", "text": "Reusable type-safe components..."}, {"title": "Conditional Types", "text": "Type transformations..."}]}'::jsonb,
    'advanced'::difficulty_level, ARRAY['typescript', 'types', 'advanced'], 95),
  ('RESTful API Design', 'Build scalable APIs with REST principles, authentication, and versioning.',
    '{"sections": [{"title": "REST Principles", "text": "Stateless communication..."}, {"title": "Authentication", "text": "JWT and OAuth..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['api', 'rest', 'backend'], 85),
  ('Cybersecurity Fundamentals', 'Understanding common vulnerabilities, encryption, and secure coding practices.',
    '{"sections": [{"title": "OWASP Top 10", "text": "Common security risks..."}, {"title": "Encryption", "text": "Symmetric and asymmetric..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['security', 'cybersecurity', 'encryption'], 100),
  ('Docker & Containers', 'Containerization basics, Dockerfile, docker-compose, and orchestration.',
    '{"sections": [{"title": "Docker Basics", "text": "Images and containers..."}, {"title": "Docker Compose", "text": "Multi-container applications..."}]}'::jsonb,
    'intermediate'::difficulty_level, ARRAY['docker', 'devops', 'containers'], 90),
  ('UI/UX Design Principles', 'Learn visual hierarchy, color theory, typography, and user-centered design.',
    '{"sections": [{"title": "Visual Hierarchy", "text": "Guiding user attention..."}, {"title": "Color Theory", "text": "Psychology of colors..."}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['design', 'ui', 'ux'], 65),
  ('Agile & Scrum Methodology', 'Master sprint planning, daily standups, and agile project management.',
    '{"sections": [{"title": "Scrum Framework", "text": "Roles and ceremonies..."}, {"title": "Sprint Planning", "text": "Backlog refinement..."}]}'::jsonb,
    'beginner'::difficulty_level, ARRAY['agile', 'scrum', 'project-management'], 40)
) AS seed_data
WHERE NOT EXISTS (SELECT 1 FROM public.learning_modules LIMIT 1);