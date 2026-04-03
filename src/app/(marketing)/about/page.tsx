import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lightbulb,
  Heart,
  Users,
  Briefcase,
  Target,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Autopilot",
  description:
    "Learn about Autopilot, the all-in-one CRM and field service management platform built for home service businesses.",
};

const values = [
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We build honest software with transparent pricing. No hidden fees, no bait-and-switch, no dark patterns. What you see is what you get.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We obsess over making complex workflows simple. Every feature is designed to save you time and help you grow, not add complexity.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Heart,
    title: "Commitment",
    description:
      "Your success is our success. We are in this for the long haul. Our team is dedicated to making Autopilot the last CRM you ever need.",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

const stats = [
  { value: "400+", label: "Businesses Served", icon: Briefcase },
  { value: "50,000+", label: "Jobs Managed", icon: Target },
  { value: "$12M+", label: "Revenue Processed", icon: Zap },
  { value: "15+", label: "Industries Supported", icon: Users },
];

const milestones = [
  {
    year: "2021",
    title: "The Idea",
    description:
      "After years of running a junk removal business and struggling with clunky software, our founder set out to build something better.",
  },
  {
    year: "2022",
    title: "First Launch",
    description:
      "Autopilot launched with core CRM, scheduling, and invoicing. Our first 50 customers helped shape the product into what it is today.",
  },
  {
    year: "2023",
    title: "Rapid Growth",
    description:
      "Added built-in phone system, marketing automation, and online booking. Crossed 200 active businesses on the platform.",
  },
  {
    year: "2024",
    title: "Scaling Up",
    description:
      "Surpassed 400 businesses and 50,000 jobs managed. Launched route optimization, advanced reporting, and API access.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            About Autopilot
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We are building the operating system for home service businesses. One platform to book
            jobs, dispatch crews, invoice customers, and grow your business.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Our Mission
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Home service businesses are the backbone of every community. Yet most owners spend
                more time on paperwork, phone tag, and chasing payments than doing the work they
                love.
              </p>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Our mission is to give every home service professional the same powerful tools that
                big companies have, without the complexity, the enterprise price tag, or the steep
                learning curve. We want to make running your business as easy as flipping a switch.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-indigo-600 to-blue-500 rounded-full" />
                <blockquote className="text-lg font-medium text-gray-900 italic">
                  &ldquo;Every service pro deserves software that works as hard as they do.&rdquo;
                </blockquote>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
                      <stat.icon className="w-8 h-8 text-indigo-600 mb-3" />
                      <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Built by an Operator, for Operators
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                    A
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">The Founder&apos;s Story</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-4">Founder & CEO</p>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Autopilot was born out of frustration. After running a junk removal business for
                      years, our founder experienced firsthand the pain of juggling spreadsheets for
                      scheduling, separate apps for invoicing, and sticky notes for lead tracking.
                    </p>
                    <p>
                      Every CRM on the market was either too expensive, too complex, or built for a
                      completely different industry. The tools designed for field service were outdated
                      and clunky. Something had to change.
                    </p>
                    <p>
                      So the founder built Autopilot: a modern, all-in-one platform designed
                      specifically for home service businesses. Every feature was shaped by real
                      experience in the field, real conversations with business owners, and a deep
                      understanding of what it takes to run a service company day-to-day.
                    </p>
                    <p>
                      Today, Autopilot powers over 400 businesses and has managed more than 50,000 jobs.
                      But we are just getting started.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From a one-person side project to a platform trusted by hundreds.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-blue-200 to-indigo-200" />

              <div className="space-y-12">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="relative flex gap-8">
                    <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200 z-10">
                      {milestone.year}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                      <p className="mt-2 text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${value.color} rounded-2xl mb-6`}>
                  <value.icon className={`w-8 h-8 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl px-8 py-16 sm:px-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Join 400+ Growing Businesses?
              </h2>
              <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
                See why home service professionals are switching to Autopilot.
                Start your free 14-day trial today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 shadow-lg transition-all"
                >
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
