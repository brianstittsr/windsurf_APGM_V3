'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Star,
  Scissors,
  Gift,
  Settings,
  Palette,
  Calendar,
  ClipboardList,
  FileText,
  Zap,
  Bot,
  QrCode,
  Search,
  Gauge,
  MessageSquare,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mic,
  DollarSign,
  Target,
  Globe,
  Mail,
  Video,
  UserPlus,
  Percent,
  TrendingUp,
  MousePointerClick,
  Share2,
  Megaphone,
  ArrowLeftRight,
  ShieldCheck,
  HelpCircle,
  PenTool,
} from 'lucide-react';

// Navigation item types
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// Navigation structure with grouped items
const navigationGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ],
  },
  {
    id: 'clients',
    label: 'Clients & Bookings',
    icon: Users,
    items: [
      { id: 'users', label: 'Users', icon: ShieldCheck },
      { id: 'clients', label: 'Clients', icon: UserCheck },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'bookings', label: 'Bookings', icon: ClipboardList },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    id: 'services',
    label: 'Services & Artists',
    icon: Scissors,
    items: [
      { id: 'services', label: 'Services', icon: Scissors },
      { id: 'artists', label: 'Artists', icon: Palette },
      { id: 'availability', label: 'Availability', icon: Calendar },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing Hub',
    icon: Megaphone,
    items: [
      { id: 'paid-traffic', label: 'Paid Traffic', icon: DollarSign },
      { id: 'retargeting', label: 'Retargeting', icon: Target },
      { id: 'reputation', label: 'Reputation', icon: Star },
      { id: 'social-media', label: 'Social Media', icon: Share2 },
      { id: 'email-marketing', label: 'Email Marketing', icon: Mail },
      { id: 'video-marketing', label: 'Video Marketing', icon: Video },
      { id: 'lead-generation', label: 'Lead Generation', icon: UserPlus },
      { id: 'online-offers', label: 'Online Offers', icon: Percent },
      { id: 'ppc-campaigns', label: 'PPC Campaigns', icon: MousePointerClick },
    ],
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: Gift,
    items: [
      { id: 'coupons', label: 'Coupons & Gifts', icon: Gift },
      { id: 'loyalty', label: 'Loyalty Program', icon: Heart },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
      { id: 'google-reviews', label: 'Google Reviews', icon: Star },
      { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & Analytics',
    icon: Search,
    items: [
      { id: 'seo-competitor', label: 'Competitor Analysis', icon: Search },
      { id: 'seo-pagespeed', label: 'PageSpeed', icon: Gauge },
      { id: 'geo-competitors', label: 'Geo Analysis', icon: MapPin },
      { id: 'website-convert', label: 'Conversion Optimization', icon: TrendingUp },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Bot,
    items: [
      { id: 'marketing-automation', label: 'Marketing Automation', icon: Zap },
      { id: 'bmad-orchestrator', label: 'BMAD Orchestrator', icon: Bot },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Globe,
    items: [
      { id: 'gohighlevel', label: 'GoHighLevel', icon: Zap },
      { id: 'gohighlevel-mcp', label: 'GHL MCP', icon: Zap },
      { id: 'ghl-migration', label: 'GHL Migration', icon: ArrowLeftRight },
      { id: 'ghl-workflow-builder', label: 'AI Workflow Builder', icon: Bot },
      { id: 'boldsign', label: 'BoldSign Forms', icon: PenTool },
      { id: 'canva', label: 'Canva', icon: Palette },
      { id: 'alexa', label: 'Alexa Skills', icon: Mic },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { id: 'business', label: 'Business Settings', icon: Settings },
      { id: 'forms', label: 'Forms', icon: FileText },
      { id: 'faqs', label: 'FAQs & Help', icon: HelpCircle },
    ],
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  onCollapsedChange,
}: AdminSidebarProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(['overview', 'clients']);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupOpen = (groupId: string) => openGroups.includes(groupId);

  const handleCollapse = () => {
    onCollapsedChange?.(!collapsed);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ paddingTop: '0' }}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapse}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-2">
            {navigationGroups.map((group) => (
              <div key={group.id} className="mb-1">
                {collapsed ? (
                  // Collapsed view - show icons only with tooltips
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                              "w-full h-10",
                              activeTab === item.id && "bg-rose-100 text-rose-700 hover:bg-rose-100"
                            )}
                            onClick={() => onTabChange(item.id)}
                          >
                            <item.icon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {group.id !== 'settings' && <Separator className="my-2" />}
                  </div>
                ) : (
                  // Expanded view - show collapsible groups
                  <Collapsible
                    open={isGroupOpen(group.id)}
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between px-3 py-2 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <group.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{group.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isGroupOpen(group.id) && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-0.5">
                      {group.items.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-2 h-9 text-sm",
                            activeTab === item.id
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-100 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                          onClick={() => onTabChange(item.id)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}
