/**
 * ClientFlow Landing Page
 * AI-Powered Multi-Tenant CRM with Voice Campaign Management
 * Styled inspired by Entrepedia's clean, professional design
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Phone, Building2, Zap, BarChart3, Shield, Users, Bot, Sparkles, TrendingUp, MessageSquare, Calendar, Star } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Phone,
    title: "AI Voice Campaigns",
    description: "Create intelligent inbound & outbound calling campaigns with GPT-4o powered AI agents.",
  },
  {
    icon: Bot,
    title: "Smart AI Agents",
    description: "Context-aware agents that adapt greetings based on inbound vs outbound scenarios.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant CRM",
    description: "Manage multiple client organizations from one platform with complete isolation.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Trigger tasks, emails, and SMS automatically based on call outcomes.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track call volume, sentiment, duration, and conversion rates in real-time.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Full audit trail, admin impersonation for support, and compliance-ready.",
  }
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    title: "Operations Director",
    company: "TechStart Inc",
    content: "ClientFlow reduced our call handling time by 60%. The AI agents are incredibly natural.",
    rating: 5,
    avatar: "SM"
  },
  {
    name: "Michael Chen",
    title: "Sales Manager",
    company: "Growth Labs",
    content: "We're processing 10x more leads with the same team size. Game-changer for outbound.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    title: "Founder",
    company: "CustomerFirst",
    content: "The multi-tenant setup is perfect for our agency. Managing 50+ clients is now effortless.",
    rating: 5,
    avatar: "ER"
  },
  {
    name: "David Park",
    title: "CTO",
    company: "ScaleUp Solutions",
    content: "Best ROI we've seen on any tool. Paid for itself in the first month.",
    rating: 5,
    avatar: "DP"
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing",
    features: [
      "100 minutes/month",
      "1 active campaign",
      "Basic analytics",
      "Email support"
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "$99",
    description: "For growing businesses",
    features: [
      "1,000 minutes/month",
      "5 active campaigns",
      "Advanced analytics",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Professional",
    price: "$299",
    description: "For scaling teams",
    features: [
      "3,000 minutes/month",
      "20 active campaigns",
      "Real-time dashboards",
      "Custom integrations"
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "$999",
    description: "Custom solutions",
    features: [
      "10,000 minutes/month",
      "Unlimited campaigns",
      "Dedicated manager",
      "SLA guarantee"
    ],
    cta: "Contact Sales",
    popular: false,
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">ClientFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-6 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 border-0">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">Powered by GPT-4o & Vapi</span>
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              AI Voice Agents for
              <br />
              Modern Businesses
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create intelligent calling campaigns in minutes. AI agents handle calls, qualify leads, 
              and book appointments automatically—no coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 h-12 text-base">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">SM</div>
                  <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">MC</div>
                  <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">ER</div>
                  <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">DP</div>
                </div>
                <span className="font-medium">Trusted by 2,000+ businesses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600 mt-1">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">&lt;200ms</div>
              <div className="text-sm text-gray-600 mt-1">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">50k+</div>
              <div className="text-sm text-gray-600 mt-1">Calls Handled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">4.8/5</div>
              <div className="text-sm text-gray-600 mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-gray-600">
              A complete platform for managing AI voice campaigns and client organizations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg bg-white">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:py-28 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Launch in 3 simple steps
            </h2>
            <p className="text-lg text-gray-600">
              Get your AI voice agent up and running in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Campaign",
                description: "Answer a few questions about your business goals and choose your agent's personality.",
                icon: MessageSquare
              },
              {
                step: "02",
                title: "AI Generates",
                description: "GPT-4o creates natural conversation scripts optimized for your campaign type.",
                icon: Bot
              },
              {
                step: "03",
                title: "Go Live",
                description: "Get a phone number and start handling calls automatically. Track everything in real-time.",
                icon: Zap
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-yellow-50 text-yellow-700 border-0">
              <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500 text-yellow-500" />
              Rated 4.8/5
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by businesses worldwide
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                      <div className="text-sm text-gray-500">{testimonial.company}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 md:py-28 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Pay for what you use. No hidden fees. Cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.popular ? 'border-blue-600 shadow-xl' : 'border-gray-200'} bg-white`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white border-0 px-4">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-12">
            All plans include automatic overage billing • Multi-provider support • 30-day rolling cycles
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:py-28 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your calling?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using AI to handle calls automatically
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 h-12 text-base font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-blue-100">
            No credit card required • 100 free minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">ClientFlow</span>
              </div>
              <p className="text-gray-600 max-w-md mb-6 leading-relaxed">
                AI-powered voice campaigns and CRM for modern businesses. Automate calls, qualify leads, 
                and scale operations with intelligent AI agents.
              </p>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                Powered by GPT-4o & Vapi
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Documentation</Link></li>
                <li><Link href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Contact</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} ClientFlow. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms</Link>
              <Link href="/security" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}