import Link from "next/link";
import {
  CalendarCheck,
  FileText,
  Users,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Truck,
  CreditCard,
  Play,
  Shield,
  Clock,
  TrendingUp,
  Home,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autopilot | CRM & Field Service Management for Home Service Businesses",
  description:
    "The all-in-one CRM and field service management platform built for home service businesses. More jobs. Less admin. Faster pay.",
};

const features = [
  {
    icon: CalendarCheck,
    title: "Scheduling & Dispatching",
    description:
      "Drag-and-drop calendar, route optimization, and real-time crew tracking. Never double-book again.",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: FileText,
    title: "Invoicing & Payments",
    description:
      "Send professional invoices in one click. Accept credit cards, ACH, and get paid faster.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Users,
    title: "CRM & Lead Management",
    description:
      "Track every lead from first contact to repeat customer. Automated follow-ups keep your pipeline full.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Phone,
    title: "Built-in Phone System",
    description:
      "Business phone, SMS, and call tracking built right in. Record calls and never miss a lead.",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: Mail,
    title: "Marketing Automation",
    description:
      "Automated email and SMS campaigns to win back old customers and nurture new leads on autopilot.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: Globe,
    title: "Online Booking",
    description:
      "Embeddable booking widget for your website. Customers book, you get notified, jobs go on the calendar.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: Home,
    title: "Short-Term Rental Sync",
    description:
      "Auto-sync with Airbnb, VRBO, and Booking.com. Automatic turnover scheduling with property checklists & access codes.",
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
  },
];

const industries = [
  "Junk Removal",
  "Gutter Cleaning",
  "Landscaping",
  "Pressure Washing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Cleaning Services",
  "Pest Control",
  "Roofing",
  "Moving",
  "Pool Service",
  "Painting",
  "Handyman",
  "Carpet Cleaning",
  "Tree Service",
  "Short-Term Rental Cleaning",
  "Airbnb Turnover",
];

const steps = [
  {
    icon: Globe,
    number: "01",
    title: "Book",
    description:
      "Customers book online or you capture leads by phone. Jobs land on your calendar automatically.",
  },
  {
    icon: Truck,
    number: "02",
    title: "Dispatch",
    description:
      "Assign crews with one click. Optimized routes save time and fuel. Real-time tracking keeps everyone in sync.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Get Paid",
    description:
      "Invoice on-site or auto-send when the job is done. Accept cards, ACH, or cash. Money hits your account fast.",
  },
];

const plans = [
  {
    name: "Basic",
    price: 50,
    description: "Everything you need to get started",
    features: [
      "Up to 2 users",
      "CRM & lead management",
      "Scheduling & dispatching",
      "Invoicing",
      "Online booking widget",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Standard",
    price: 49,
    description: "Best value for growing businesses",
    features: [
      "Up to 10 users",
      "Everything in Basic",
      "Built-in phone & SMS",
      "Marketing automation",
      "Payment processing",
      "Route optimization",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: 70,
    description: "For established operations",
    features: [
      "Unlimited users",
      "Everything in Standard",
      "Advanced reporting",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Phone & chat support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const testimonials = [
  {
    quote:
      "Autopilot cut our admin time in half. We went from sticky notes and spreadsheets to a real system overnight. Revenue is up 40% since we switched.",
    name: "Marcus Johnson",
    role: "Owner, CleanSweep Junk Removal",
    rating: 5,
  },
  {
    quote:
      "The built-in phone system alone is worth the price. We track every call, never miss a lead, and the automated follow-ups close deals while I sleep.",
    name: "Sarah Chen",
    role: "Founder, Pristine Gutters",
    rating: 5,
  },
  {
    quote:
      "We tried three other CRMs before Autopilot. Nothing else was built for field service like this. Our crews actually use it, which says everything.",
    name: "David Rodriguez",
    role: "CEO, GreenScape Landscaping",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Trusted by <span className="text-indigo-600 font-bold">400+</span> businesses
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Run Your Business on{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Autopilot
                </span>
              </h1>

              <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl">
                More jobs. Less admin. Faster pay. Auto-sync your Airbnb &amp; VRBO turnovers.{" "}
                <span className="text-gray-500">
                  The all-in-one CRM and field service platform built for home service businesses.
                </span>
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all gap-2">
                  <Play className="w-5 h-5 text-indigo-600" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-10 flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No credit card required
                </div>
              </div>
            </div>

            {/* Right - Hero image placeholder */}
            <div className="relative lg:ml-4">
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  <div className="flex-1 h-5 bg-white/20 rounded-md max-w-xs" />
                </div>
                <div className="p-6 space-y-4">
                  {/* Dashboard mock */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Jobs Today", value: "12", trend: "+3" },
                      { label: "Revenue", value: "$4,280", trend: "+18%" },
                      { label: "Leads", value: "8", trend: "+5" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                  {/* Calendar mock */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Today&apos;s Schedule</span>
                      <span className="text-xs text-indigo-600 font-medium">View All</span>
                    </div>
                    {[
                      { time: "9:00 AM", job: "Gutter Cleaning - Smith", status: "bg-emerald-400" },
                      { time: "11:30 AM", job: "Junk Removal - Davis", status: "bg-blue-400" },
                      { time: "2:00 PM", job: "Pressure Wash - Wilson", status: "bg-amber-400" },
                    ].map((item) => (
                      <div key={item.time} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                        <div className={`w-2 h-2 rounded-full ${item.status}`} />
                        <span className="text-xs text-gray-500 w-16">{item.time}</span>
                        <span className="text-sm text-gray-700">{item.job}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment received</p>
                  <p className="text-sm font-bold text-gray-900">+$850.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full mb-4">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">All-in-One Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Stop juggling multiple tools. Autopilot brings scheduling, invoicing, CRM, marketing,
              and communications into one seamless platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bgColor} rounded-xl mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Short-Term Rental Cleaning */}
      <section className="py-24 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full mb-4">
              <Home className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-600">STR Cleaning Management</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Built for Short-Term Rental Cleaning
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Automatically sync guest checkouts from your rental platforms and dispatch cleaners
              without lifting a finger. Purpose-built for Airbnb, VRBO, and vacation rental turnovers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {[
              {
                icon: RefreshCw,
                number: "01",
                title: "Connect Calendar",
                description:
                  "Link your Airbnb, VRBO, Booking.com, Guesty, or Hospitable account. We auto-import all your properties and reservations.",
              },
              {
                icon: CalendarClock,
                number: "02",
                title: "Auto-Detect Checkouts",
                description:
                  "Autopilot monitors your calendars in real time and detects every checkout. Turnovers are created automatically with property-specific checklists and access codes.",
              },
              {
                icon: Truck,
                number: "03",
                title: "Cleaners Dispatched",
                description:
                  "Cleaning crews are assigned and notified instantly. They get the checklist, lockbox codes, and check-in time — all in one place.",
              },
            ].map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+3rem)] right-[calc(-50%+3rem)] h-0.5 bg-gradient-to-r from-teal-200 to-emerald-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-emerald-50 rounded-full" />
                  <div className="absolute inset-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-teal-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Integrates with{" "}
              <span className="font-semibold text-gray-700">Airbnb</span>,{" "}
              <span className="font-semibold text-gray-700">VRBO</span>,{" "}
              <span className="font-semibold text-gray-700">Booking.com</span>,{" "}
              <span className="font-semibold text-gray-700">Guesty</span>, and{" "}
              <span className="font-semibold text-gray-700">Hospitable</span>
            </p>
          </div>
        </div>
      </section>

      {/* Industry Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Built for Home Service Businesses
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Whether you run a one-truck operation or manage multiple crews, Autopilot scales with you.
              Purpose-built for the trades.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {industries.map((industry) => (
              <span
                key={industry}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default shadow-sm"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get up and running in minutes. Three simple steps to transform your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+3rem)] right-[calc(-50%+3rem)] h-0.5 bg-gradient-to-r from-indigo-200 to-blue-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full" />
                  <div className="absolute inset-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-indigo-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No hidden fees. No long-term contracts. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? "border-2 border-indigo-500 shadow-xl shadow-indigo-100 scale-105 z-10"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full text-xs font-bold text-white shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-md shadow-indigo-200"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Compare all features <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Loved by Service Pros
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join hundreds of home service businesses that run smoother with Autopilot.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "400+", label: "Businesses" },
              { value: "50k+", label: "Jobs Managed" },
              { value: "$12M+", label: "Revenue Processed" },
              { value: "4.9/5", label: "Customer Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-indigo-100 mt-1 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl px-8 py-16 sm:px-16 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Put Your Business on Autopilot?
              </h2>
              <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
                Join 400+ home service businesses that save 10+ hours a week with Autopilot.
                Start your free 14-day trial today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 shadow-lg transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
                >
                  View Pricing
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-indigo-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Setup in 5 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
