export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Shield, TrendingUp, Star, ArrowRight,
  Building2, Home, MapPin, BedDouble, Users, CheckCircle,
  ChevronRight, Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deserializeProperty } from "@/lib/db";
import PropertyCard from "@/components/PropertyCard";
import { formatPrice, INDIAN_CITIES } from "@/lib/utils";
import type { Property } from "@/types";
import SearchBar from "@/components/SearchBar";
import { brand, pageTitleWithTagline } from "@/lib/brand";
import HeroBackground from "@/components/HeroBackground";

export const metadata: Metadata = {
  title: pageTitleWithTagline(),
};

async function getFeaturedProperties() {
  try {
    const props = await prisma.property.findMany({
      where: { status: "APPROVED", featured: true },
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return props.map(deserializeProperty);
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [properties, users] = await Promise.all([
      prisma.property.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
    ]);
    return { properties, users };
  } catch {
    return { properties: 10000, users: 50000 };
  }
}

const PROPERTY_CATEGORIES = [
  { icon: Building2, label: "Apartment", type: "APARTMENT", color: "bg-blue-100 text-blue-700", count: "2.4K+" },
  { icon: Home, label: "Villa", type: "VILLA", color: "bg-orange-100 text-orange-700", count: "890+" },
  { icon: Home, label: "Independent House", type: "INDEPENDENT_HOUSE", color: "bg-emerald-100 text-emerald-700", count: "1.2K+" },
  { icon: MapPin, label: "Plot", type: "PLOT", color: "bg-purple-100 text-purple-700", count: "3.1K+" },
  { icon: Building2, label: "Commercial", type: "COMMERCIAL", color: "bg-red-100 text-red-700", count: "560+" },
  { icon: Users, label: "PG / Co-living", type: "PG", color: "bg-teal-100 text-teal-700", count: "4.5K+" },
];

const TOP_CITIES = [
  { name: "Mumbai", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80", listings: "12K+" },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80", listings: "9.4K+" },
  { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80", listings: "11K+" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1569596082827-c5e4df3e4d3b?w=400&q=80", listings: "7.2K+" },
  { name: "Pune", image: "https://images.unsplash.com/photo-1580581096469-10c7a77cb8b5?w=400&q=80", listings: "6.8K+" },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80", listings: "5.3K+" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search & Filter",
    desc: "Use our smart search to find properties matching your exact needs — BHK, budget, locality.",
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    step: "02",
    title: "Explore & Compare",
    desc: "View detailed listings with photos, virtual tours, maps, and neighbourhood insights.",
    color: "bg-orange-100",
    textColor: "text-orange-700",
  },
  {
    step: "03",
    title: "Connect & Close",
    desc: "Chat with verified sellers directly. Schedule visits and close deals with confidence.",
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
];

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedProperties(), getStats()]);

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>AI-powered property recommendations</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your{" "}
              <span className="text-yellow-300">Dream Home</span>
              <br />
              in India
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
              {stats.properties.toLocaleString("en-IN")}+ verified properties across 50+ cities.
              Buy, rent, or sell with complete transparency.
            </p>
          </div>

          {/* Search */}
          <SearchBar />

          {/* Quick Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: `${(stats.properties / 1000).toFixed(0)}K+`, label: "Active Listings" },
              { value: "50+", label: "Cities Covered" },
              { value: `${(stats.users / 1000).toFixed(0)}K+`, label: "Happy Customers" },
              { value: "100%", label: "Verified Properties" },
            ].map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Browse by Property Type</h2>
            <p className="section-subtitle">Find the perfect type of property for you</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/properties?propertyType=${cat.type}`}
              className="card p-4 text-center hover:border-primary-200 border border-transparent transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                {cat.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.count} listings</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-subtitle">Hand-picked premium listings</p>
            </div>
            <Link
              href="/properties?featured=true"
              className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:text-primary-900 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property as any} />
            ))}
          </div>
        </section>
      )}

      {/* Top Cities */}
      <section className="py-14 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Explore Top Cities</h2>
              <p className="section-subtitle">India's most sought-after real estate markets</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOP_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/properties?city=${city.name}`}
                className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm">{city.name}</p>
                  <p className="text-white/70 text-xs">{city.listings} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title">How {brand.name} works</h2>
          <p className="section-subtitle">Simple, transparent, trusted</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="text-center relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 border-t-2 border-dashed border-slate-200 -translate-x-8" />
              )}
              <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                <span className={`text-2xl font-black ${step.textColor}`}>{step.step}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-14 bg-primary-950 text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: "100% Verified", desc: "Every listing is manually verified by our team before going live." },
              { icon: Star, title: "4.8/5 Rating", desc: "Trusted by over 50,000 home buyers and sellers across India." },
              { icon: TrendingUp, title: "Best Price Guarantee", desc: "We ensure you get the most transparent and competitive pricing." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-blue-200 text-sm max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-brand-orange to-orange-500 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              List Your Property for Free
            </h2>
            <p className="text-orange-100 max-w-md">
              Reach 50,000+ active buyers and renters. Post your property in minutes
              and get inquiries from verified buyers.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {["Free listing", "Verified buyers", "AI-powered matching", "Direct chat"].map((f) => (
                <span key={f} className="flex items-center gap-1 text-sm text-orange-100">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {f}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/register?role=SELLER"
            className="bg-white text-brand-orange font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            Post Property Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
