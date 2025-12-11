import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, BookOpen, Paintbrush, Moon } from "lucide-react"; // Icons

// Mock Data (Later we fetch this from Firebase)
const MENU_ITEMS = [
  {
    id: 1,
    name: "Ceylon Cold Brew",
    category: "Beverage",
    price: "LKR 850",
    description: "Slow-steeped hill country beans with a hint of cinnamon.",
    tags: ["Caffeine", "Sugar-free"],
  },
  {
    id: 2,
    name: "Avocado Toast on Sourdough",
    category: "Snack",
    price: "LKR 1200",
    description: "Creamy avocado, chili flakes, poached egg on local sourdough.",
    tags: ["Vegetarian", "Popular"],
  },
  {
    id: 3,
    name: "Focus Elixir",
    category: "Productivity",
    price: "LKR 950",
    description: "Matcha green tea with Lion's Mane mushroom for brain power.",
    tags: ["Nootropic", "Vegan"],
  },
  {
    id: 4,
    name: "Artist's Palette Platter",
    category: "Creative",
    price: "LKR 2500",
    description: "Finger foods designed to be eaten while painting. Won't mess your canvas.",
    tags: ["Sharable"],
  },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">The Menu</h1>
          <p className="text-stone-500 mt-2">Fuel for your work, art, and rest.</p>
        </div>
        <Button className="bg-stone-900">My Order</Button>
      </header>

      {/* Categories / Filter (Visual only for now) */}
      <div className="flex gap-4 mb-8 max-w-6xl mx-auto overflow-x-auto pb-2">
        <Button variant="secondary" className="rounded-full"><Coffee className="w-4 h-4 mr-2"/> All</Button>
        <Button variant="ghost" className="rounded-full"><BookOpen className="w-4 h-4 mr-2"/> Study Snacks</Button>
        <Button variant="ghost" className="rounded-full"><Paintbrush className="w-4 h-4 mr-2"/> Creative</Button>
        <Button variant="ghost" className="rounded-full"><Moon className="w-4 h-4 mr-2"/> Sleep/Calm</Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {MENU_ITEMS.map((item) => (
          <Card key={item.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Imagine an Image component here */}
            <div className="h-48 bg-stone-200 w-full object-cover group-hover:scale-105 transition-transform duration-500" /> 
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <span className="font-bold text-stone-700">{item.price}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {item.tags.map(tag => (
                   <Badge key={tag} variant="secondary" className="text-xs bg-stone-100 text-stone-600">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-stone-800 text-white hover:bg-stone-700">Add to Order</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}