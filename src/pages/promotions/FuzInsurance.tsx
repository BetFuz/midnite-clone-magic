import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle, TrendingUp, AlertCircle, DollarSign, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

const FuzInsurance = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [selections, setSelections] = useState(5);

  const calculateRefund = () => {
    const stake = parseFloat(stakeAmount) || 0;
    const maxRefund = 50000;
    return Math.min(stake, maxRefund);
  };

  const handleActivate = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }
    toast.success(`Fuz Insurance activated! You're protected up to ${formatCurrency(calculateRefund())}`);
  };

  const insuranceTiers = [
    {
      selections: "5-7",
      refund: "50%",
      maxAmount: 25000,
      color: "from-blue-500 to-cyan-500",
    },
    {
      selections: "8-10",
      refund: "75%",
      maxAmount: 37500,
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
    {
      selections: "11+",
      refund: "100%",
      maxAmount: 50000,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const faqs = [
    {
      question: "What is Fuz Insurance?",
      answer: "Fuz Insurance protects your accumulator bets. If one selection lets you down, we'll refund your stake up to ₦50,000 as a free bet."
    },
    {
      question: "How many selections do I need?",
      answer: "Minimum 5 selections required. Each selection must have odds of 1.30 or greater."
    },
    {
      question: "What happens if I lose 2 or more selections?",
      answer: "Fuz Insurance only covers single-selection losses. If 2+ selections lose, standard bet rules apply."
    },
    {
      question: "Can I combine this with other promotions?",
      answer: "Fuz Insurance cannot be combined with Acca Boost on the same bet slip, but can be used with other promotions."
    },
    {
      question: "When will I receive my refund?",
      answer: "Refunds are credited as free bets within 24 hours after your bet settles."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12">
                  <div className="relative z-10">
                    <Badge className="mb-4 bg-white/20 text-white border-white/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Risk Protection
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      Fuz Insurance
                    </h1>
                    <p className="text-lg text-white/90 mb-6 max-w-2xl">
                      One selection lets you down? We've got you covered. Get your stake back as a free bet up to ₦50,000!
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                        Activate Protection
                      </Button>
                      <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">How Fuz Insurance Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        {
                          step: 1,
                          title: "Place Your Accumulator",
                          description: "Build an accumulator with 5+ selections, each at odds 1.30+",
                          icon: Trophy,
                        },
                        {
                          step: 2,
                          title: "Activate Protection",
                          description: "Insurance automatically applies to qualifying accumulators",
                          icon: Shield,
                        },
                        {
                          step: 3,
                          title: "Get Refunded",
                          description: "If exactly 1 selection loses, get your stake back as a free bet",
                          icon: DollarSign,
                        },
                      ].map((item) => (
                        <div key={item.step} className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <item.icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Tiers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Protection Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {insuranceTiers.map((tier, idx) => (
                        <Card 
                          key={idx}
                          className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                            tier.popular ? "border-2 border-primary" : ""
                          }`}
                        >
                          {tier.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                              MOST POPULAR
                            </div>
                          )}
                          <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Selections</p>
                              <p className="text-2xl font-bold">{tier.selections}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Refund Amount</p>
                              <p className="text-3xl font-bold text-primary">{tier.refund}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Max Refund</p>
                              <p className="text-lg font-bold">{formatCurrency(tier.maxAmount)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Calculate Your Protection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Stake Amount (₦)</label>
                        <Input 
                          type="number"
                          placeholder="Enter stake amount"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Number of Selections</label>
                        <Input 
                          type="number"
                          placeholder="Minimum 5"
                          value={selections}
                          onChange={(e) => setSelections(parseInt(e.target.value) || 5)}
                          min={5}
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">Maximum Refund</span>
                        <span className="text-3xl font-bold text-primary">
                          {formatCurrency(calculateRefund())}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>Refund credited as a free bet within 24 hours if exactly one selection loses</p>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleActivate}>
                      <Shield className="h-5 w-5 mr-2" />
                      Activate Fuz Insurance
                    </Button>
                  </CardContent>
                </Card>

                {/* Terms */}
                <Card className="p-8 bg-muted/50 border-border">
                  <h3 className="text-xl font-bold text-foreground mb-4">Terms & Conditions</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Minimum 5 selections required, each at odds of 1.30 or greater</li>
                    <li>• Maximum refund of {formatCurrency(50000)} per qualifying bet slip</li>
                    <li>• Refund only applies if exactly one selection loses</li>
                    <li>• Refunds credited as free bets within 24 hours of settlement</li>
                    <li>• Free bets valid for 7 days and cannot be withdrawn as cash</li>
                    <li>• Fuz Insurance and Acca Boost cannot be combined on the same bet</li>
                    <li>• Available on pre-match bets only (in-play excluded)</li>
                    <li>• Betfuz reserves the right to void insurance if terms are breached</li>
                    <li>• 18+ BeGambleAware.org. Terms apply.</li>
                  </ul>
                </Card>

                {/* FAQ */}
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Add 8-10 selections for 75% refund protection</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Use insurance on high-odds accumulators</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Mix different sports for better coverage</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Check match stats before finalizing your picks</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FuzInsurance;
