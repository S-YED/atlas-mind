import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Brain, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Progress', path: '/progress', icon: BarChart3 },
  { label: 'AI Coach', path: '/ai-tutor', icon: Brain },
  { label: 'Profile', path: '/profile', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={cn('h-5 w-5', isActive && 'fill-primary')} />
                <span className="font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}