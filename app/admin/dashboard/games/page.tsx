"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Plus, Gamepad2 } from "lucide-react";

export default function GamesPage() {
  const [games, setGames] = useState<string[]>([]);
  const [newGame, setNewGame] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "gaming"), (doc) => {
       if(doc.exists()) setGames(doc.data().titles || []);
    });
    return () => unsub();
  }, []);

  const addGame = async () => {
    if(!newGame) return;
    const updated = [...games, newGame];
    await setDoc(doc(db, "settings", "gaming"), { titles: updated }, { merge: true });
    setNewGame("");
  };

  const removeGame = async (gameToRemove: string) => {
    const updated = games.filter(g => g !== gameToRemove);
    await setDoc(doc(db, "settings", "gaming"), { titles: updated }, { merge: true });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Game Library</h1>
        <p className="text-stone-500">Add or remove titles shown on the public Gaming page.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5"/> Current Inventory</CardTitle>
          <CardDescription>These appear instantly on the website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter game title (e.g. Tekken 8)..." 
              value={newGame} 
              onChange={(e) => setNewGame(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGame()}
            />
            <Button onClick={addGame} className="bg-stone-900"><Plus className="w-4 h-4 mr-2"/> Add</Button>
          </div>

          <div className="space-y-2">
            {games.map((game) => (
              <div key={game} className="flex justify-between items-center p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-medium text-stone-700">{game}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeGame(game)}>
                  <Trash2 className="w-4 h-4"/>
                </Button>
              </div>
            ))}
            {games.length === 0 && <p className="text-sm text-stone-400 text-center">Library is empty.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}