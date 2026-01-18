import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEventPredictions, useEventInsight } from '@/hooks/useEventPredictions';
import EventPredictionCard from './EventPredictionCard';
import KalshiInspiredInsightCard from './KalshiInspiredInsightCard';
import { TrendingUp, Vote, DollarSign, Bitcoin, Film, Users } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Markets', icon: TrendingUp },
  { value: 'sports', label: 'Sports', icon: TrendingUp },
  { value: 'politics', label: 'Politics', icon: Vote },
  { value: 'economy', label: 'Economy', icon: DollarSign },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'social', label: 'Social', icon: Users },
];

const EventPredictionsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const { data: events, isLoading } = useEventPredictions(selectedCategory);
  const { data: insight } = useEventInsight(selectedEventId || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Predictions</h2>
          <p className="text-muted-foreground">Bet on real-world events with AI-powered insights</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          {events?.length || 0} Active Markets
        </Badge>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {cat.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events?.map(event => (
                <div key={event.id} className="space-y-3">
                  <div 
                    onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                    className="cursor-pointer"
                  >
                    <EventPredictionCard event={event} showInsights={true} />
                  </div>
                  
                  {/* Show insight card when event is selected */}
                  {selectedEventId === event.id && insight && (
                    <KalshiInspiredInsightCard insight={insight} className="animate-in fade-in slide-in-from-top-2" />
                  )}
                </div>
              ))}
              
              {events?.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  No markets available in this category
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventPredictionsSection;
