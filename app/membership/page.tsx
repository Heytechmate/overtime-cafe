"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Shield } from "lucide-react";

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans py-12 px-6">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-8 inline-block">← Back to Hub</Link>
        <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-stone-50">
          Unlock Your Best Work.
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-400">
          Choose a plan that fits your flow. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Plan 1: Day Pass */}
        <PricingCard 
          title="Day Pass"
          price="LKR 2,500"
          frequency="/ day"
          desc="Perfect for the occasional deep work session."
          features={[
            "Access 8AM - 10PM",
            "Open Seating (Collab Zone)",
            "High-Speed WiFi",
            "1 Free Coffee"
          ]}
          buttonText="Get Pass"
          buttonVariant="outline"
        />

        {/* Plan 2: Pro Member (Highlighted) */}
        <div className="relative">
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </span>
          </div>
          <PricingCard 
            title="Pro Member"
            price="LKR 15,000"
            frequency="/ month"
            desc="For freelancers and creators who need consistency."
            features={[
              "24/7 Keycard Access",
              "Access to Silent Zone",
              "5 Guest Passes / mo",
              "Unlimited Coffee & Tea",
              "10% Off Gaming & Pods"
            ]}
            buttonText="Become a Member"
            buttonVariant="default"
            highlighted={true}
          />
        </div>

        {/* Plan 3: Dedicated */}
        <PricingCard 
          title="Dedicated Desk"
          price="LKR 35,000"
          frequency="/ month"
          desc="Your own permanent spot. Leave your monitor here."
          features={[
            "Everything in Pro",
            "Private Reserved Desk",
            "Locker Storage",
            "Mail Handling",
            "2 Hrs Meeting Room / day"
          ]}
          buttonText="Apply for Desk"
          buttonVariant="outline"
        />

      </div>

      {/* Corporate / Enterprise Banner */}
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-stone-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <Shield className="w-5 h-5"/>
            <span>Enterprise Solutions</span>
          </div>
          <h3 className="text-2xl font-bold">Need space for your team?</h3>
          <p className="text-stone-400 max-w-md">We offer custom private offices for teams of 4-12. Includes branding options and IT support.</p>
        </div>
        <Button className="bg-white text-stone-900 hover:bg-stone-200 whitespace-nowrap">
          Contact Sales
        </Button>
      </div>

    </div>
  );
}

// Components
function PricingCard({ title, price, frequency, desc, features, buttonText, buttonVariant, highlighted = false }: any) {
  return (
    <Card className={`flex flex-col h-full ${highlighted ? 'border-teal-500 shadow-xl ring-1 ring-teal-500' : 'border-stone-200 shadow-sm'} dark:bg-stone-900 dark:border-stone-800`}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="mt-2">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold text-stone-900 dark:text-white">{price}</span>
          <span className="text-stone-500">{frequency}</span>
        </div>
        <ul className="space-y-3">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300">
              <Check className={`w-5 h-5 shrink-0 ${highlighted ? 'text-teal-600' : 'text-stone-400'}`} />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/auth" className="w-full">
          <Button 
            className={`w-full h-12 ${highlighted ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
            variant={buttonVariant}
          >
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}