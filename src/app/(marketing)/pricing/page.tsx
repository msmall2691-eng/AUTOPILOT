"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Clock,
  ChevronDown,
  Zap,
} from "lucide-react";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 50,
    annualPrice: 40,
    description: "Everything you need to get started and stay organized.",
    features: [
      "Up to 2 users",
      "CRM & contact management",
      "Scheduling & dispatching",
      "Invoicing & estimates",
      "Online booking widget",
      "Job tracking",
      "Basic reporting",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Standard",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Best value for growing home service businesses.",
    features: [
      "Up to 10 users",
      "Everything in Basic",
      "Built-in phone & SMS",
      "Call recording & tracking",
      "Marketing automation",
      "Payment processing (cards & ACH)",
      "Route optimization",
      "Recurring jobs",
      "Custom fields",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    monthlyPrice: 70,
    annualPrice: 56,
    description: "For established operations that need the full toolkit.",
    features: [
      "Unlimited users",
      "Everything in Standard",
      "Advanced analytics & reporting",
      "API access",
      "Custom integrations",
      "White-label booking page",
      "Multi-location support",
      "Automated review requests",
      "Dedicated account manager",
      "Phone, chat & email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const comparisonFeatures = [
  { category: "Core", features: [
    { name: "Users", basic: "2", standard: "10", pro: "Unlimited" },
    { name: "CRM & Contacts", basic: true, standard: true, pro: true },
    { name: "Scheduling & Dispatching", basic: true, standard: true, pro: true },
    { name: "Invoicing & Estimates", basic: true, standard: true, pro: true },
    { name: "Online Booking Widget", basic: true, standard: true, pro: true },
    { name: "Job Tracking", basic: true, standard: true, pro: true },
  ]},
  { category: "Communication", features: [
    { name: "Email Notifications", basic: true, standard: true, pro: true },
    { name: "Built-in Phone System", basic: false, standard: true, pro: true },
    { name: "SMS Messaging", basic: false, standard: true, pro: true },
    { name: "Call Recording", basic: false, standard: true, pro: true },
    { name: "VoIP Integration", basic: false, standard: true, pro: true },
  ]},
  { category: "Payments & Invoicing", features: [
    { name: "Invoice Generation", basic: true, standard: true, pro: true },
    { name: "Online Payments (Card)", basic: false, standard: true, pro: true },
    { name: "ACH Payments", basic: false, standard: true, pro: true },
    { name: "Recurring Invoicing", basic: false, standard: true, pro: true },
    { name: "Payment Reminders", basic: false, standard: true, pro: true },
  ]},
  { category: "Marketing & Growth", features: [
    { name: "Email Campaigns", basic: false, standard: true, pro: true },
    { name: "SMS Campaigns", basic: false, standard: true, pro: true },
    { name: "Automated Follow-ups", basic: false, standard: true, pro: true },
    { name: "Review Requests", basic: false, standard: false, pro: true },
    { name: "White-label Booking", basic: false, standard: false, pro: true },
  ]},
  { category: "Advanced", features: [
    { name: "Route Optimization", basic: false, standard: true, pro: true },
    { name: "Advanced Reporting", basic: false, standard: false, pro: true },
    { name: "API Access", basic: false, standard: false, pro: true },
    { name: "Custom Integrations", basic: false, standard: false, pro: true },
    { name: "Multi-location", basic: false, standard: false, pro: true },
  ]},
  { category: "Support", features: [
    { name: "Email Support", basic: true, standard: true, pro: true },
    { name: "Priority Support", basic: false, standard: true, pro: true },
    { name: "Phone Support", basic: false, standard: false, pro: true },
    { name: "Dedicated Account Manager", basic: false, standard: false, pro: true },
  ]},
];

const pricingFaqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card required to start.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle. If you upgrade mid-cycle, you will receive a prorated credit.",
  },
  {
    question: "Are there any setup fees or contracts?",
    answer:
      "No setup fees and no long-term contracts. Pay month-to-month or save 20% with annual billing. Cancel anytime.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex) and ACH bank transfers for annual plans.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "You will be prompted to choose a plan and enter payment info. If you do not subscribe, your account is paused (not deleted) so you can pick up where you left off anytime.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes, annual billing saves you 20% compared to monthly billing. That is baked into the annual prices shown above.",
  },
  {
    question: "Is there a limit on the number of jobs or invoices?",
    answer:
      "No. All plans include unlimited jobs, invoices, estimates, and contacts. We never charge per transaction.",
  },
  {
    question: "Can I add additional users?",
    answer:
      "The Basic plan supports up to 2 users, Standard up to 10, and Pro has unlimited users. If you need more users on Basic or Standard, consider upgrading to the next tier.",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold text-gray-900">{value}</span>;
  }
  return value ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
  ) : (
    <X className="w-5 h-5 text-gray-300 mx-auto" />
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. Start free for 14 days, then pick the plan that
            fits your business.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 inline-flex items-center gap-4 bg-gray-100 rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                !annual
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                annual
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24 -mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl p-8 flex flex-col ${
                    plan.popular
                      ? "border-2 border-indigo-500 shadow-xl shadow-indigo-100 md:scale-105 z-10"
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
                    <span className="text-5xl font-extrabold text-gray-900">${price}</span>
                    <span className="text-gray-500">/mo</span>
                    {annual && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">
                        Billed ${price * 12}/year
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-md shadow-indigo-200"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Compare Plans
            </h2>
            <p className="mt-3 text-gray-600">
              See exactly what is included in each plan.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-5 bg-gray-50 border-b border-gray-200">
              <div className="text-sm font-semibold text-gray-500">Feature</div>
              <div className="text-sm font-semibold text-gray-900 text-center">Basic</div>
              <div className="text-sm font-semibold text-indigo-600 text-center">Standard</div>
              <div className="text-sm font-semibold text-gray-900 text-center">Pro</div>
            </div>

            {comparisonFeatures.map((section) => (
              <div key={section.category}>
                <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {section.category}
                  </span>
                </div>
                {section.features.map((feature, i) => (
                  <div
                    key={feature.name}
                    className={`grid grid-cols-4 gap-4 px-6 py-4 items-center ${
                      i < section.features.length - 1 ? "border-b border-gray-100" : "border-b border-gray-200"
                    }`}
                  >
                    <div className="text-sm text-gray-700">{feature.name}</div>
                    <div className="text-center">
                      <FeatureValue value={feature.basic} />
                    </div>
                    <div className="text-center">
                      <FeatureValue value={feature.standard} />
                    </div>
                    <div className="text-center">
                      <FeatureValue value={feature.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Pricing Questions
            </h2>
            <p className="mt-3 text-gray-600">
              Have a question not listed here?{" "}
              <Link href="/faq" className="text-indigo-600 font-medium hover:text-indigo-700">
                Visit our full FAQ
              </Link>{" "}
              or contact us.
            </p>
          </div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl px-8 py-16 sm:px-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Start Your Free Trial Today
              </h2>
              <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
                Get full access to all features for 14 days. No credit card required.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 shadow-lg transition-all"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-indigo-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Cancel anytime
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
