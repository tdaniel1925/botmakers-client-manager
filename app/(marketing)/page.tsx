/**
 * ClientFlow Landing Page
 * SORA-Inspired Clean Minimal Aesthetic
 */
import { Button } from "@/components/ui/button";
import { Check, Phone, Wand2, Paperclip, Figma, ArrowUp, Calendar, ArrowRight, Sparkles, Users, TrendingUp, Star, MessageSquare, Bot } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-white antialiased">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-neutral-900 font-['Geist',sans-serif] tracking-tight">ClientFlow</span>
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium font-['Geist',sans-serif]">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900 rounded-full font-['Geist',sans-serif]">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-['Geist',sans-serif] font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="leading-tight text-5xl sm:text-7xl lg:text-[96px] max-w-5xl mx-auto font-['Geist',sans-serif] font-light tracking-tighter text-neutral-900">
              AI Voice Agents for Every Business
            </h1>

            <p className="text-base sm:text-xl font-normal text-gray-600 max-w-2xl mx-auto mt-6 font-['Geist',sans-serif]">
              Deploy intelligent AI agents that handle calls 24/7. From lead qualification to appointment booking—all powered by GPT-4o.
            </p>

            {/* Prompt Composer */}
            <div className="w-full max-w-2xl mx-auto mt-12">
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm">
                <textarea
                  className="w-full resize-none border-0 outline-none focus:ring-0 bg-transparent text-base sm:text-lg leading-relaxed text-gray-800 placeholder-gray-400 rounded-2xl p-4 sm:p-6 pr-16 pb-20 min-h-[140px] font-['Geist',sans-serif]"
                  placeholder="Describe your ideal AI voice agent..."
                  readOnly
                />

                {/* Toolbar */}
                <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 flex flex-wrap items-center gap-2 sm:gap-3">
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 font-['Geist',sans-serif]">
                    <Wand2 className="w-4 h-4" />
                    Prompt Builder
                  </button>
                  
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 font-['Geist',sans-serif]">
                    <Paperclip className="w-4 h-4" />
                    Attach
                  </button>
                  
                  <button className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

                {/* Send Button */}
                <button className="absolute right-4 sm:right-6 bottom-4 sm:bottom-6 h-10 w-10 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm flex items-center justify-center">
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section with Dashed Separators */}
        <div className="border-dashed border-neutral-200 border-t mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="grid grid-cols-1 divide-y divide-neutral-200 border-y border-dashed sm:grid-cols-4 sm:divide-y-0 sm:divide-x border-neutral-200">
              <div className="px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-cyan-600" />
                  <p className="text-3xl font-['Geist',sans-serif] font-light tracking-tighter text-neutral-900">2,000+</p>
                </div>
                <p className="text-sm text-neutral-600 font-['Geist',sans-serif]">Active businesses worldwide</p>
              </div>

              <div className="px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <p className="text-3xl font-['Geist',sans-serif] font-light tracking-tighter text-neutral-900">50k+</p>
                </div>
                <p className="text-sm text-neutral-600 font-['Geist',sans-serif]">Calls handled this month</p>
              </div>

              <div className="px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <p className="text-3xl font-['Geist',sans-serif] font-light tracking-tighter text-neutral-900">4.8</p>
                </div>
                <p className="text-sm text-neutral-600 font-['Geist',sans-serif]">Average customer satisfaction</p>
              </div>

              <div className="px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <p className="text-3xl font-['Geist',sans-serif] font-light tracking-tighter text-neutral-900">94%</p>
                </div>
                <p className="text-sm text-neutral-600 font-['Geist',sans-serif]">Success rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="border-dashed border-neutral-200 border-t mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 font-['Geist',sans-serif] max-w-2xl mx-auto">
                Deploy your AI voice agent in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-['Geist',sans-serif] font-semibold text-xl mb-4">
                  1
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Configure Your Agent</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  Choose a template or describe your ideal agent. Customize the voice, personality, and conversation flow.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 font-['Geist',sans-serif] font-semibold text-xl mb-4">
                  2
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Connect & Integrate</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  Link your CRM, calendar, and other tools. Set up webhooks and customize data flows.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 text-violet-600 font-['Geist',sans-serif] font-semibold text-xl mb-4">
                  3
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Launch & Monitor</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  Deploy your agent and monitor performance in real-time. Refine and optimize based on analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="border-dashed border-neutral-200 border-t mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900 mb-4">
                Built for Every Industry
              </h2>
              <p className="text-lg text-gray-600 font-['Geist',sans-serif] max-w-2xl mx-auto">
                From healthcare to real estate—AI agents that understand your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Sales & Lead Gen</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">Qualify leads, book demos, follow up automatically</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Appointment Booking</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">Schedule, reschedule, and send reminders 24/7</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Customer Support</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">Answer FAQs, resolve issues, escalate when needed</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Geist',sans-serif]">Market Research</h3>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">Conduct surveys, gather feedback, analyze responses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="border-dashed border-neutral-200 border-t mt-24" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 - AI Conversation */}
              <article className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[300px] flex flex-col gap-2 overflow-y-auto">
                  <div className="self-start max-w-[75%] bg-white rounded-xl px-4 py-2 text-gray-800 font-medium text-sm leading-relaxed shadow-sm border border-gray-100 font-['Geist',sans-serif]">
                    Hello! I'm calling to schedule a consultation. Is this a good time?
                  </div>
                  <div className="self-end max-w-[75%] bg-neutral-900 rounded-xl px-4 py-2 text-white font-medium text-sm leading-relaxed shadow-sm font-['Geist',sans-serif]">
                    Yes, I'd love to learn more about your services.
                  </div>
                  <div className="self-start max-w-[75%] bg-white rounded-xl px-4 py-2 text-gray-800 font-medium text-sm leading-relaxed shadow-sm border border-gray-100 font-['Geist',sans-serif]">
                    Perfect! I have availability this Thursday at 2 PM or Friday at 10 AM. Which works better for you?
                  </div>
                  <div className="self-end max-w-[75%] bg-neutral-900 rounded-xl px-4 py-2 text-white font-medium text-sm leading-relaxed shadow-sm font-['Geist',sans-serif]">
                    Thursday at 2 PM works great!
                  </div>
                  <div className="self-start max-w-[75%] bg-white rounded-xl px-4 py-2 text-gray-800 font-medium text-sm leading-relaxed shadow-sm border border-gray-100 font-['Geist',sans-serif]">
                    Excellent! I've booked you for Thursday at 2 PM. You'll receive a confirmation email shortly.
                  </div>
                </div>

                <h4 className="text-xl font-medium text-gray-900 font-['Geist',sans-serif]">Natural Conversations</h4>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  AI agents that understand context, handle objections, and book appointments—all in natural, human-like conversations.
                </p>
              </article>

              {/* Card 2 - Template Library */}
              <article className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 bg-gradient-to-br from-cyan-50 to-teal-50 border border-gray-200 rounded-xl p-4 min-h-[300px] flex flex-col justify-center items-center gap-4">
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg mb-2 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg mb-2 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg mb-2 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg mb-2 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                <h4 className="text-xl font-medium text-gray-900 font-['Geist',sans-serif]">Pre-Built Templates</h4>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  Choose from 50+ industry-specific templates. From sales outreach to customer support—start in minutes.
                </p>
              </article>

              {/* Card 3 - Integration */}
              <article className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 bg-neutral-950 border border-gray-800 rounded-xl p-4 min-h-[300px] overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-3">
                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                    <span className="text-xs text-gray-500 ml-2 font-['Geist',sans-serif]">api-integration.js</span>
                  </div>
                  <pre className="text-xs leading-relaxed text-gray-300 font-['Geist',sans-serif]">
{`const clientflow = require('clientflow');

const agent = await clientflow.create({
  name: 'Sales Agent',
  voice: 'professional',
  prompt: 'Qualify leads...',
});

await agent.dial('+1234567890');
console.log('✓ Call initiated');`}
                  </pre>
                </div>

                <h4 className="text-xl font-medium text-gray-900 font-['Geist',sans-serif]">Easy Integration</h4>
                <p className="text-sm text-gray-600 font-['Geist',sans-serif]">
                  Deploy with a few lines of code. Integrate with your CRM, calendar, and tools via webhooks and API.
                </p>
              </article>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="border-dashed border-neutral-200 border-t mt-24" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 font-['Geist',sans-serif]">
                Start automating your voice operations today
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">Starter</h3>
                <p className="text-sm text-gray-600 mt-2 font-['Geist',sans-serif]">Perfect for trying out AI voice agents</p>
                <div className="flex items-end gap-2 mt-6">
                  <span className="text-4xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">$0</span>
                  <span className="text-sm text-gray-600 mb-1 font-['Geist',sans-serif]">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    100 minutes / month
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    1 AI agent
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Basic templates
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Community support
                  </li>
                </ul>

                <Link href="/signup">
                  <Button className="w-full mt-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-['Geist',sans-serif]">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white border-2 border-neutral-900 rounded-2xl p-8 shadow-lg relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-neutral-900 text-white px-4 py-1 rounded-full text-xs font-medium font-['Geist',sans-serif]">Most Popular</span>
                </div>

                <h3 className="text-2xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">Pro</h3>
                <p className="text-sm text-gray-600 mt-2 font-['Geist',sans-serif]">For growing businesses</p>
                <div className="flex items-end gap-2 mt-6">
                  <span className="text-4xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">$99</span>
                  <span className="text-sm text-gray-600 mb-1 font-['Geist',sans-serif]">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    2,000 minutes / month
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    5 AI agents
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    All templates
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    API access
                  </li>
                </ul>

                <Link href="/signup">
                  <Button className="w-full mt-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-['Geist',sans-serif]">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">Enterprise</h3>
                <p className="text-sm text-gray-600 mt-2 font-['Geist',sans-serif]">For large organizations</p>
                <div className="flex items-end gap-2 mt-6">
                  <span className="text-4xl font-['Geist',sans-serif] font-light tracking-tighter text-gray-900">Custom</span>
                </div>

                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Unlimited minutes
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Unlimited agents
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Custom integrations
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Dedicated support
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 font-['Geist',sans-serif]">
                    <Check className="w-4 h-4 text-emerald-500" />
                    SLA guarantee
                  </li>
                </ul>

                <Link href="/contact">
                  <Button variant="outline" className="w-full mt-8 border-neutral-900 text-neutral-900 rounded-full font-['Geist',sans-serif]">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-dashed border-neutral-200 border-t mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-16 pb-16">
              {/* Brand */}
              <div className="lg:col-span-2">
                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-neutral-900 font-['Geist',sans-serif] tracking-tight">ClientFlow</span>
                </Link>
                <p className="text-sm text-neutral-600 max-w-md leading-relaxed mb-6 font-['Geist',sans-serif]">
                  AI-powered voice agents that handle calls 24/7. Automate lead qualification, appointment booking, and customer support with intelligent conversations.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 font-['Geist',sans-serif]">Product</h3>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Features</a></li>
                  <li><a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Pricing</a></li>
                  <li><a href="/signup" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Get Started</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 font-['Geist',sans-serif]">Resources</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Documentation</a></li>
                  <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Support</a></li>
                  <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Contact</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-dashed flex flex-col sm:flex-row gap-4 border-neutral-200 border-t pt-8 pb-8 items-center justify-between">
              <p className="text-sm text-neutral-600 font-['Geist',sans-serif]">© {new Date().getFullYear()} ClientFlow. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-neutral-600 items-center">
                <Link href="/privacy" className="hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Privacy</Link>
                <Link href="/terms" className="hover:text-neutral-900 transition-colors font-['Geist',sans-serif]">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
