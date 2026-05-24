'use client';

import { Star, Shield, Award, Users } from 'lucide-react';

const badges = [
  {
    icon: Star,
    title: '5-Star Rated',
    subtitle: 'Google Reviews',
    description: '50+ Happy Clients'
  },
  {
    icon: Shield,
    title: 'Veteran Owned',
    subtitle: 'Service & Integrity',
    description: 'Proudly Veteran-Owned'
  },
  {
    icon: Award,
    title: 'Certified Artist',
    subtitle: 'Professional Training',
    description: 'Top PMU Academies'
  },
  {
    icon: Users,
    title: '500+ Clients',
    subtitle: 'Trust & Experience',
    description: 'Years of Excellence'
  }
];

export default function TrustBadges() {
  return (
    <section className="py-8 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-6 h-6 text-[#AD6269]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.subtitle}</p>
                <p className="text-xs text-[#AD6269] font-medium">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
