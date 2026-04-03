"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Search, MessageCircle } from "lucide-react";

type FaqCategory = "general" | "features" | "billing" | "technical";

const categories: { key: FaqCategory; label: string }[] = [
  { key: "general", label: "General" },
  { key: "features", label: "Features" },
  { key: "billing", label: "Billing" },
  { key: "technical", label: "Technical" },
];

const faqs: { category: FaqCategory; question: string; answer: string }[] = [
  // General
  {
    category: "general",
    question: "What is Autopilot?",
    answer:
      "Autopilot is an all-in-one CRM and field service management platform built specifically for home service businesses. It combines scheduling, dispatching, invoicing, payments, CRM, marketing automation, and a built-in phone system into a single platform so you can run your entire business from one place.",
  },
  {
    category: "general",
    question: "Who is Autopilot for?",
    answer:
      "Autopilot is built for home service businesses of all sizes, from solo operators to multi-crew companies. Our customers include junk removal, gutter cleaning, landscaping, pressure washing, HVAC, plumbing, electrical, cleaning services, pest control, roofing, moving companies, and more.",
  },
  {
    category: "general",
    question: "How is Autopilot different from other CRMs?",
    answer:
      "Unlike generic CRMs, Autopilot is purpose-built for field service businesses. We combine CRM, scheduling, dispatching, invoicing, phone system, and marketing automation in one platform. You do not need to piece together multiple tools or pay for expensive integrations. Everything works together out of the box.",
  },
  {
    category: "general",
    question: "Is there a free trial?",
    answer:
      "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card is required to start your trial. Simply sign up and start using Autopilot immediately.",
  },
  // Features
  {
    category: "features",
    question: "How does the scheduling and dispatching work?",
    answer:
      "Autopilot provides a drag-and-drop calendar where you can schedule jobs, assign crews, and manage your entire day at a glance. Crews receive real-time notifications on their mobile devices. Route optimization helps you plan the most efficient paths between jobs, saving time and fuel.",
  },
  {
    category: "features",
    question: "Can I accept payments through Autopilot?",
    answer:
      "Yes. Autopilot supports credit card and ACH payments on the Standard and Pro plans. You can send invoices with a pay-now link, accept payments on-site, or set up auto-charge for recurring services. Funds are deposited directly into your bank account.",
  },
  {
    category: "features",
    question: "How does the built-in phone system work?",
    answer:
      "Autopilot includes a full business phone system with a dedicated local or toll-free number. You get call tracking, call recording, SMS messaging, and voicemail, all built into the platform. Every call and text is automatically logged in your CRM so you never lose track of customer communications.",
  },
  {
    category: "features",
    question: "What marketing tools are included?",
    answer:
      "Autopilot includes email and SMS marketing automation. You can create drip campaigns to nurture leads, send targeted promotions to past customers, automate review requests after completed jobs, and set up follow-up sequences that run on autopilot. Templates are included to get you started quickly.",
  },
  {
    category: "features",
    question: "Does Autopilot have an online booking widget?",
    answer:
      "Yes. All plans include an embeddable booking widget that you can add to your website. Customers can select a service, pick a date and time, and book directly. The job appears on your calendar automatically, and both you and the customer receive confirmation notifications.",
  },
  // Billing
  {
    category: "billing",
    question: "What plans are available and how much do they cost?",
    answer:
      "We offer three plans: Basic at $50/month (up to 2 users), Standard at $49/month (up to 10 users), and Pro at $70/month (unlimited users). Annual billing saves you 20%. All plans include a 14-day free trial. Visit our pricing page for a full feature comparison.",
  },
  {
    category: "billing",
    question: "Are there any setup fees or long-term contracts?",
    answer:
      "No. There are no setup fees, no onboarding charges, and no long-term contracts. You pay month-to-month or save with annual billing. You can cancel at any time and your service will remain active through the end of your billing period.",
  },
  {
    category: "billing",
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely. You can change your plan at any time from your account settings. Upgrades take effect immediately with a prorated charge. Downgrades take effect at the start of your next billing cycle. Your data is never lost when changing plans.",
  },
  {
    category: "billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, Mastercard, and American Express. ACH bank transfers are available for annual plans. All payments are processed securely through Stripe.",
  },
  // Technical
  {
    category: "technical",
    question: "Is my data secure?",
    answer:
      "Yes. Autopilot uses industry-standard encryption (TLS/SSL) for all data in transit and AES-256 encryption for data at rest. We perform regular security audits, maintain SOC 2 compliance practices, and never sell your data. Your business information is yours.",
  },
  {
    category: "technical",
    question: "Does Autopilot work on mobile devices?",
    answer:
      "Yes. Autopilot is fully responsive and works on any device with a web browser. Your field crews can view their schedules, update job statuses, capture photos, collect signatures, and process payments right from their phones or tablets.",
  },
  {
    category: "technical",
    question: "Can I import my existing data?",
    answer:
      "Yes. You can import contacts, customer lists, and job history via CSV upload. Our onboarding team can also help with data migration from other platforms. We support imports from most popular CRM and field service tools.",
  },
  {
    category: "technical",
    question: "Does Autopilot integrate with other tools?",
    answer:
      "The Pro plan includes API access and custom integrations. Autopilot also integrates with popular tools like QuickBooks, Google Calendar, and Zapier. We are continuously adding new integrations based on customer requests.",
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Help Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Autopilot. Can&apos;t find what you&apos;re looking for?
            Reach out to our support team.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <button
              onClick={() => {
                setActiveCategory("all");
                setOpenIndex(null);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setOpenIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No questions match your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Clear filters
                </button>
              </div>
            )}
            {filteredFaqs.map((faq, index) => (
              <div
                key={`${faq.category}-${index}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                        faq.category === "general"
                          ? "bg-blue-50 text-blue-600"
                          : faq.category === "features"
                          ? "bg-emerald-50 text-emerald-600"
                          : faq.category === "billing"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {faq.category}
                    </span>
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 -mt-1">
                    <div className="pl-0 md:pl-[calc(2.5rem+0.75rem)]">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6">
              <MessageCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Still Have Questions?
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Our support team is here to help. Reach out and we will get back to you within a few
              hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@autopilotapp.io"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 shadow-md shadow-indigo-200 transition-all"
              >
                Email Support
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
              >
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
