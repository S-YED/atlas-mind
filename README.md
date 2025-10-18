# 🧠 Atlas Mind - AI-Powered Learning Platform

> **Personalized learning experience powered by AI. Master new skills with adaptive courses, progress tracking, and intelligent recommendations.**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/atlas-mind)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/atlas-mind)

## ✨ Features

### 🎯 Core Learning Features
- **AI-Powered Recommendations** - Personalized course suggestions based on your progress
- **Interactive Courses** - Rich content with sections, code examples, and resources
- **Progress Tracking** - Detailed analytics with charts and insights
- **Achievement System** - Unlock badges and earn points as you learn
- **Adaptive Learning Paths** - AI adjusts difficulty based on your performance

### 🚀 Technical Features
- **Progressive Web App (PWA)** - Install as native app on mobile/desktop
- **Offline Support** - Continue learning without internet connection
- **Real-time Sync** - Progress synced across all devices
- **Mobile Responsive** - Optimized for all screen sizes
- **Dark/Light Theme** - Comfortable learning in any environment

### 🔧 Developer Features
- **TypeScript** - Full type safety
- **Modern React** - Hooks, Suspense, Error Boundaries
- **Supabase Backend** - Authentication, database, edge functions
- **OpenAI Integration** - GPT-4 powered recommendations
- **Framer Motion** - Smooth animations and transitions

## 🏗️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- Framer Motion (Animations)
- React Query (State management)
- React Router (Navigation)
- Recharts (Data visualization)

**Backend:**
- Supabase (Database + Auth)
- PostgreSQL (Database)
- Edge Functions (Serverless)
- OpenAI API (AI recommendations)
- Row Level Security (RLS)

**Deployment:**
- Netlify / Vercel (Frontend)
- Supabase (Backend)
- PWA Support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key (optional, for AI features)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/atlas-mind.git
cd atlas-mind
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the migrations in `/supabase/migrations/`
3. Set up the AI edge function (optional)

### 4. Development
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## 📦 Deployment

### Netlify (Recommended)
1. Connect your GitHub repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main

### Vercel
1. Import project to Vercel
2. Set environment variables
3. Deploy

### Manual Build
```bash
npm run build
npm run preview
```

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profiles and preferences
- `learning_modules` - Course content and metadata
- `progress_logs` - User progress tracking
- `ai_recommendations` - AI-generated suggestions

### Key Features
- Row Level Security (RLS) enabled
- Real-time subscriptions
- Automatic timestamps
- JSON fields for flexible content

## 🤖 AI Integration

The platform uses OpenAI GPT-4 for:
- Personalized course recommendations
- Learning path optimization
- Content difficulty assessment
- Progress analysis

**Edge Function:** `/supabase/functions/ai-personalize/`

## 📱 PWA Features

- **Installable** - Add to home screen
- **Offline Support** - Service worker caching
- **Push Notifications** - Learning reminders
- **Background Sync** - Sync when online

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliant
- **Dark/Light Theme** - System preference detection
- **Smooth Animations** - Framer Motion powered
- **Loading States** - Skeleton screens
- **Error Boundaries** - Graceful error handling

## 📊 Analytics & Monitoring

- **User Analytics** - Learning behavior tracking
- **Performance Monitoring** - Core Web Vitals
- **Error Tracking** - Production error monitoring
- **A/B Testing** - Feature experimentation

## 🔒 Security

- **Authentication** - Supabase Auth
- **Authorization** - Row Level Security
- **Data Validation** - Zod schemas
- **HTTPS Only** - Secure connections
- **Content Security Policy** - XSS protection

## 🧪 Testing

```bash
# Run tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Performance

- **Code Splitting** - Lazy loading
- **Image Optimization** - WebP format
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching Strategy** - Service worker + CDN
- **Core Web Vitals** - Optimized for performance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [OpenAI](https://openai.com) - AI recommendations
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Lucide](https://lucide.dev) - Icons
- [Recharts](https://recharts.org) - Data visualization

## 📞 Support

- 📧 Email: support@atlas-mind.app
- 💬 Discord: [Join our community](https://discord.gg/atlas-mind)
- 📖 Docs: [Documentation](https://docs.atlas-mind.app)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/atlas-mind/issues)

---

**Built with ❤️ for learners everywhere**
