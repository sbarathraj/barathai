import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedThemeToggle } from '@/components/AnimatedThemeToggle';
import { UsageAnalytics } from '@/components/UsageAnalytics';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Settings, 
  Palette, 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

const SettingsDemo: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedDemo, setSelectedDemo] = useState<string>('theme');

  const demoSections = [
    {
      id: 'theme',
      title: 'Animated Theme Toggle',
      icon: Palette,
      description: 'Smooth theme transitions with animated icons'
    },
    {
      id: 'analytics',
      title: 'Real-time Analytics',
      icon: Activity,
      description: 'Live usage statistics with beautiful visualizations'
    },
    {
      id: 'responsive',
      title: 'Responsive Design',
      icon: Monitor,
      description: 'Adapts seamlessly across all device sizes'
    }
  ];

  const mockUsageData = {
    totalApiCalls: 1247,
    totalImages: 89,
    todayApiCalls: 23,
    todayImages: 4,
    thisWeekApiCalls: 156,
    thisWeekImages: 28,
    avgResponseTime: 234,
    successRate: 97,
    lastUpdated: new Date()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              Professional Settings Demo
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Experience our enterprise-grade settings system with animated dark mode, 
            real-time analytics, and responsive design
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {demoSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={selectedDemo === section.id ? "default" : "outline"}
                onClick={() => setSelectedDemo(section.id)}
                className={`flex items-center gap-2 ${
                  selectedDemo === section.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-white/80 dark:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.title}
              </Button>
            );
          })}
        </div>

        {/* Demo Content */}
        <div className="space-y-8">
          {/* Theme Toggle Demo */}
          {selectedDemo === 'theme' && (
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  Animated Theme Toggle Showcase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Try our smooth animated theme toggle with different sizes and variants
                  </p>
                </div>

                {/* Size Variants */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Size Variants</h3>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          size="sm"
                          variant="outline"
                        />
                        <p className="text-xs text-slate-500 mt-2">Small</p>
                      </div>
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          size="md"
                          variant="outline"
                        />
                        <p className="text-xs text-slate-500 mt-2">Medium</p>
                      </div>
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          size="lg"
                          variant="outline"
                        />
                        <p className="text-xs text-slate-500 mt-2">Large</p>
                      </div>
                    </div>
                  </div>

                  {/* Style Variants */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Style Variants</h3>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          variant="default"
                        />
                        <p className="text-xs text-slate-500 mt-2">Default</p>
                      </div>
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          variant="outline"
                        />
                        <p className="text-xs text-slate-500 mt-2">Outline</p>
                      </div>
                      <div className="text-center">
                        <AnimatedThemeToggle
                          darkMode={isDark}
                          onToggle={toggleTheme}
                          variant="ghost"
                        />
                        <p className="text-xs text-slate-500 mt-2">Ghost</p>
                      </div>
                    </div>
                  </div>

                  {/* With Label */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">With Label</h3>
                    <div className="flex justify-center">
                      <AnimatedThemeToggle
                        darkMode={isDark}
                        onToggle={toggleTheme}
                        showLabel={true}
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Animation Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Smooth icon transitions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Scale & rotation effects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Ripple animation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Color transitions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Demo */}
          {selectedDemo === 'analytics' && (
            <div className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Real-time Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Professional analytics dashboard with live data updates and beautiful visualizations
                  </p>
                  
                  {/* Mock Analytics - Compact View */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Compact View</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 sm:p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-bold mb-1">{mockUsageData.totalApiCalls.toLocaleString()}</div>
                          <div className="text-xs font-medium opacity-80">API Calls</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-bold mb-1">{mockUsageData.totalImages.toLocaleString()}</div>
                          <div className="text-xs font-medium opacity-80">Images</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-bold mb-1">{mockUsageData.avgResponseTime}ms</div>
                          <div className="text-xs font-medium opacity-80">Avg Time</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-bold mb-1">{mockUsageData.successRate}%</div>
                          <div className="text-xs font-medium opacity-80">Success Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Analytics Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm">Real-time data updates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Live Supabase subscriptions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Performance metrics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Color-coded statistics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Responsive Demo */}
          {selectedDemo === 'responsive' && (
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  Responsive Design Showcase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Our settings system adapts beautifully across all device sizes
                  </p>
                </div>

                {/* Device Previews */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mobile */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Smartphone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Mobile</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Single column layout with touch-optimized controls
                      </p>
                    </div>

                    {/* Tablet */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Tablet className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Tablet</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Two-column layout with expanded touch targets
                      </p>
                    </div>

                    {/* Desktop */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Monitor className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Desktop</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Three-column layout with full feature set
                      </p>
                    </div>
                  </div>

                  {/* Responsive Features */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Responsive Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">CSS Grid</Badge>
                        <span className="text-sm">Flexible grid layouts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Breakpoints</Badge>
                        <span className="text-sm">Mobile-first design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Touch</Badge>
                        <span className="text-sm">Touch-optimized controls</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Performance</Badge>
                        <span className="text-sm">Optimized rendering</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Experience Professional Settings?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Try our complete settings system with animated themes, real-time analytics, 
                and responsive design that adapts to any device.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Settings className="w-5 h-5 mr-2" />
                Open Settings Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsDemo;