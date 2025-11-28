import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

interface AffiliateNode {
  id: string;
  userId: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  code: string;
  activeReferrals: number;
  commission: number;
  conversions: number;
  isActive: boolean;
  children?: AffiliateNode[];
}

interface SubTreeChartProps {
  data?: AffiliateNode;
  width?: number;
  height?: number;
}

// Mock data for demonstration
const mockData: AffiliateNode = {
  id: '1',
  userId: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  tier: 'GOLD',
  code: 'JOHN2024',
  activeReferrals: 250,
  commission: 125000,
  conversions: 180,
  isActive: true,
  children: [
    {
      id: '2',
      userId: 'user-2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      tier: 'SILVER',
      code: 'SARAH2024',
      activeReferrals: 75,
      commission: 45000,
      conversions: 60,
      isActive: true,
      children: [
        {
          id: '4',
          userId: 'user-4',
          name: 'Mike Chen',
          email: 'mike@example.com',
          tier: 'BRONZE',
          code: 'MIKE2024',
          activeReferrals: 25,
          commission: 8000,
          conversions: 20,
          isActive: true,
          children: [],
        },
        {
          id: '5',
          userId: 'user-5',
          name: 'Emily Brown',
          email: 'emily@example.com',
          tier: 'BRONZE',
          code: 'EMILY2024',
          activeReferrals: 18,
          commission: 5500,
          conversions: 15,
          isActive: true,
          children: [],
        },
      ],
    },
    {
      id: '3',
      userId: 'user-3',
      name: 'David Wilson',
      email: 'david@example.com',
      tier: 'SILVER',
      code: 'DAVID2024',
      activeReferrals: 95,
      commission: 62000,
      conversions: 78,
      isActive: true,
      children: [
        {
          id: '6',
          userId: 'user-6',
          name: 'Lisa Anderson',
          email: 'lisa@example.com',
          tier: 'BRONZE',
          code: 'LISA2024',
          activeReferrals: 30,
          commission: 12000,
          conversions: 25,
          isActive: true,
          children: [],
        },
      ],
    },
  ],
};

export const SubTreeChart = ({ 
  data = mockData, 
  width = 1000, 
  height = 600 
}: SubTreeChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<AffiliateNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const tree = d3.tree<AffiliateNode>().size([innerHeight, innerWidth]);

    const root = d3.hierarchy(data);
    tree(root);

    // Tier color mapping
    const tierColors = {
      GOLD: 'hsl(var(--chart-1))',
      SILVER: 'hsl(var(--chart-2))',
      BRONZE: 'hsl(var(--chart-3))',
    };

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr(
        'd',
        d3
          .linkHorizontal<any, d3.HierarchyPointNode<AffiliateNode>>()
          .x((d) => d.y)
          .y((d) => d.x),
      );

    // Draw nodes
    const node = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', function (event, d) {
        setSelectedNode(d.data);
      })
      .on('mouseenter', function () {
        d3.select(this).select('circle').attr('r', 14).attr('stroke-width', 3);
      })
      .on('mouseleave', function () {
        d3.select(this).select('circle').attr('r', 10).attr('stroke-width', 2);
      });

    // Node circles
    node
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => tierColors[d.data.tier])
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2);

    // Node labels
    node
      .append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'hsl(var(--foreground))')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text((d) => d.data.name);

    // Tier badges
    node
      .append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .style('fill', 'hsl(var(--muted-foreground))')
      .style('font-size', '10px')
      .text((d) => d.data.tier);
  }, [data, width, height]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Affiliate Network Tree</h3>
            <p className="text-sm text-muted-foreground">
              3-level deep hierarchy visualization
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
              <span className="text-sm text-muted-foreground">Gold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
              <span className="text-sm text-muted-foreground">Silver</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
              <span className="text-sm text-muted-foreground">Bronze</span>
            </div>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </div>
      </Card>

      {selectedNode && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-foreground">{selectedNode.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedNode.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Code: {selectedNode.code}</p>
            </div>
            <Badge
              variant={
                selectedNode.tier === 'GOLD'
                  ? 'default'
                  : selectedNode.tier === 'SILVER'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {selectedNode.tier}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Referrals</p>
                <p className="text-sm font-bold text-foreground">
                  {selectedNode.activeReferrals}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-success/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-sm font-bold text-foreground">
                  {selectedNode.conversions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-chart-1/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Commission</p>
                <p className="text-sm font-bold text-foreground">
                  ₦{selectedNode.commission.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {selectedNode.tier === 'GOLD' && selectedNode.activeReferrals >= 200 && (
            <div className="mt-4 p-3 bg-success/20 border border-success/30 rounded-lg">
              <p className="text-xs font-semibold text-success">
                ✓ Daily Salary Eligible: ₦5,000/day
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
