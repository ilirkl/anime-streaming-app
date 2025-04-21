'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, TrendingUp, Clock } from 'lucide-react'; // Removed User
import { cn } from '@/lib/utils';

export function BottomNavbar() { // Removed isAuthenticated prop
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Browse',
      href: '/browse',
      icon: Compass,
    },
    {
      name: 'Trending',
      href: '/browse/trending',
      icon: TrendingUp,
    },
    {
      name: 'Latest',
      href: '/browse/latest',
      icon: Clock,
    },
    
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="container max-w-full flex items-center justify-around h-16 app-padding">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-xs',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
