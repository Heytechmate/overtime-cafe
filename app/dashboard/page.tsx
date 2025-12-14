import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Paintbrush, CalendarDays, Moon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* 1. Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Good Evening, John.</h1>
          <p className="text-stone-500 mt-1">Ready to get into the flow state?</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-stone-400">Current Location</p>
          <p className="text-stone-800 font-semibold">OverTime Café, Colombo 07</p>
        </div>
      </div>

      {/* 2. Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Session Card */}
        <Card className="md:col-span-2 bg-stone-900 text-white border-stone-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-yellow-400 w-5 h-5"/> Current Session
              </CardTitle>
              <Badge className="bg-green-500 hover:bg-green-600 text-black">Active</Badge>
            </div>
            <CardDescription className="text-stone-400">Deep Work Zone • Desk 14</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Elapsed</span>
                <span>1h 45m / 3h 00m</span>
              </div>
              <Progress value={58} className="h-2 bg-stone-700" />
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="text-black bg-white hover:bg-stone-200 border-none">Extend Time</Button>
              <Button variant="ghost" className="text-white hover:bg-stone-800">Order to Desk</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need a break?</CardTitle>
            <CardDescription>Book a resource instantly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-3 h-12">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Sleep Pod (45m)</span>
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12">
              <Paintbrush className="w-4 h-4 text-orange-500" />
              <span>Creative Station</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Secondary Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <CalendarDays className="w-5 h-5"/> Community Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0 border-stone-100">
                  <div className="bg-stone-100 p-2 rounded text-center min-w-[3.5rem]">
                    <span className="block text-xs uppercase text-stone-500">Dec</span>
                    <span className="block text-xl font-bold text-stone-800">{12 + i}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-800">Startup Founder Mixer</h4>
                    <p className="text-sm text-stone-500">6:00 PM • The Lounge</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productivity Stats (Gamification) */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Focus</CardTitle>
            <CardDescription>You are in the top 10% of members.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[180px]">
             {/* Placeholder for a Chart */}
             <div className="text-center space-y-2">
                <span className="text-5xl font-bold text-stone-800">12.5</span>
                <p className="text-stone-500">Hours Focused</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}