import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, Trophy, BarChart3, Users, Zap, ArrowRight, Star, CheckCircle2, Sparkles, Globe, Cpu, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { useRef, useEffect, useState } from 'react';
import '../styles/landing.css';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Get personalized course recommendations based on your progress and preferences'
  },
  {
    icon: BookOpen,
    title: 'Interactive Courses',
    description: 'Engage with hands-on content designed by industry experts'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and insights'
  },
  {
    icon: Trophy,
    title: 'Achievement System',
    description: 'Unlock badges and rewards as you complete courses and reach milestones'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Open Source Contributor',
    content: 'Contributing to Atlas Mind has been amazing! The codebase is well-structured and the community is welcoming.',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Full Stack Developer',
    content: 'Love the AI-powered features and the fact that it\'s completely open source. Great project to learn from!',
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    role: 'ML Engineer',
    content: 'The AI recommendation system is impressive. Excited to contribute to the machine learning components!',
    rating: 5
  }
];

const stats = [
  { label: 'Open Source', value: '100%' },
  { label: 'Contributors Welcome', value: 'Always' },
  { label: 'Learning Modules', value: '15+' },
  { label: 'AI Powered', value: 'Yes' }
];

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = (e.clientX - centerX) / rect.width;
        const mouseY = (e.clientY - centerY) / rect.height;
        
        setMousePosition({ x: mouseX, y: mouseY });
        x.set(mouseX * 20);
        rotateX.set(mouseY * 10);
        rotateY.set(mouseX * 10);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, rotateX, rotateY]);

  return (
    <>
      <SEO />
      <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`
            }}
          />
          {/* Floating particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random()
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [null, Math.random()]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>
        {/* Header */}
        <motion.header 
          className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Atlas Mind
              </span>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative z-10 py-32 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              style={{ y, opacity, scale }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Next-Generation AI Learning
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Learn
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Smarter
                </span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  with AI
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Open source AI-powered learning platform. Contribute to the future of education 
                with personalized tutoring, adaptive learning paths, and collaborative development.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="text-lg px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
                >
                  Try the Platform
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-12 py-6 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => window.open('https://github.com/S-YED/atlas-mind', '_blank')}
                >
                  <Star className="mr-2 h-6 w-6" />
                  Star on GitHub
                </Button>
              </motion.div>
            </motion.div>
            
            {/* 3D Floating Elements */}
            <motion.div 
              className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl backdrop-blur-sm border border-white/10"
              style={{ rotateX, rotateY }}
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl backdrop-blur-sm border border-white/10"
              style={{ rotateX: rotateX, rotateY: rotateY }}
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -180, -360]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Cpu className="h-6 w-6 text-purple-400" />
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-pink-500/30 to-blue-500/30 rounded-full backdrop-blur-sm border border-white/10"
              animate={{ 
                x: [0, 30, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-pink-400" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-xl border-y border-white/10">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <motion.div 
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Open Source Section */}
        <section className="relative z-10 py-20 bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-xl border-y border-white/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-300 text-lg">
                <Globe className="h-5 w-5 mr-2" />
                100% Open Source
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Built by Developers, for Developers
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Atlas Mind is completely open source and welcomes contributors of all skill levels. 
                Join our community and help build the future of AI-powered education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 border-green-500/30 text-green-300 hover:bg-green-500/10"
                  onClick={() => window.open('https://github.com/S-YED/atlas-mind', '_blank')}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Star on GitHub
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  onClick={() => window.open('https://github.com/S-YED/atlas-mind/blob/main/CONTRIBUTING.md', '_blank')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Contribute
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 py-32 px-4">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Atlas Mind?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Open source learning platform built by the community, for the community. 
                Contribute code, ideas, and help shape the future of AI-powered education.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                    <CardHeader className="pb-4">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="h-8 w-8 text-blue-400" />
                      </motion.div>
                      <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10 py-32 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black/50 backdrop-blur-xl px-4">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Loved by Learners
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                See what contributors and early adopters are saying about Atlas Mind
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                    <CardContent className="pt-8">
                      <div className="flex mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="mb-6 text-gray-300 italic text-lg leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-400">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-32 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
              
              <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-16">
                <motion.h2 
                  className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Ready to Transform
                  <br />
                  Your Learning?
                </motion.h2>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Join our open source community and help build the future of AI-powered education.
                  Contribute code, report issues, or suggest new features.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')} 
                    className="text-xl px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
                  >
                    Try the Platform
                    <CheckCircle2 className="ml-3 h-6 w-6" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-xl px-12 py-6 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => window.open('https://github.com/S-YED/atlas-mind', '_blank')}
                  >
                    <BookOpen className="mr-3 h-6 w-6" />
                    View Documentation
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-16 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Atlas Mind
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  AI-powered learning platform for the modern learner.
                  Transform your skills with personalized education.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-6 text-white">Product</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                  <li className="hover:text-white transition-colors cursor-pointer">API</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Contributing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-6 text-white">Company</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">About</li>
                  <li className="hover:text-white transition-colors cursor-pointer">GitHub</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Contributors</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Roadmap</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-6 text-white">Support</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">Issues</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Discussions</li>
                  <li className="hover:text-white transition-colors cursor-pointer">License</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Code of Conduct</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                &copy; 2024 Atlas Mind. Open Source Project. Built with ❤️ by the community, for the community.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}