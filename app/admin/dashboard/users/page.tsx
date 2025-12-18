"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, Phone, Mail, Cake, Fingerprint, Search } from "lucide-react"; 

export default function MembersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Search State
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("joinedAt", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        let usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Smart Sort: Birthdays First
        const today = new Date();
        const currentMonth = today.getMonth() + 1; 
        const currentDay = today.getDate();

        usersList.sort((a: any, b: any) => {
           const isBirthdayA = checkBirthday(a.birthDate, currentMonth, currentDay);
           const isBirthdayB = checkBirthday(b.birthDate, currentMonth, currentDay);

           if (isBirthdayA && !isBirthdayB) return -1; 
           if (!isBirthdayA && isBirthdayB) return 1;  
           return 0; 
        });

        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const checkBirthday = (dateString: string, month: number, day: number) => {
    if (!dateString) return false;
    const [_, bMonth, bDay] = dateString.split("-");
    return parseInt(bMonth) === month && parseInt(bDay) === day;
  };

  // --- NEW: Filter Logic ---
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || "").includes(term) ||
      (user.email?.toLowerCase() || "").includes(term) ||
      (user.memberId?.toLowerCase() || "").includes(term) ||
      (user.phone?.toLowerCase() || "").includes(term)
    );
  });
  // -------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Member Directory</h1>
          <p className="text-stone-500">Manage your club members and view upcoming birthdays.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="text-sm h-10 px-4">
             Total: {users.length}
           </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
             <CardTitle>Registered Members</CardTitle>
             
             {/* SEARCH BAR */}
             <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search name, ID, or phone..."
                  className="pl-9 bg-stone-50 border-stone-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-medium border-b">
                <tr>
                  <th className="p-4">Identity</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Birthday</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const today = new Date();
                    const isBirthday = checkBirthday(user.birthDate, today.getMonth() + 1, today.getDate());

                    return (
                      <tr key={user.id} className={`border-b last:border-0 transition-colors ${isBirthday ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-stone-50"}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-stone-200">
                              <AvatarFallback className="bg-stone-100 text-stone-600 font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="font-bold text-stone-900">{user.name || "Unknown"}</p>
                               <div className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                                 <Fingerprint className="w-3 h-3 text-stone-400" />
                                 {user.memberId ? (
                                   <span className="text-teal-600 font-medium">{user.memberId}</span>
                                 ) : (
                                   <span className="italic text-stone-300">--</span>
                                 )}
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-stone-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" /> {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {user.birthDate ? (
                            <div className={`flex items-center gap-2 ${isBirthday ? "text-amber-700 font-bold" : "text-stone-500"}`}>
                               <Cake className={`w-4 h-4 ${isBirthday ? "animate-bounce text-amber-500" : "text-stone-300"}`} />
                               <span>{user.birthDate}</span>
                               {isBirthday && <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] h-5 px-1.5">Today!</Badge>}
                            </div>
                          ) : (
                            <span className="text-stone-300 italic">--</span>
                          )}
                        </td>
                        <td className="p-4 text-stone-500">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`capitalize ${user.role === 'admin' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100'}`}>
                            {user.role || "Member"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400 italic">
                      No members matching "{searchTerm}" found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {users.length === 0 && !loading && (
              <div className="p-8 text-center text-stone-400 italic">
                No members found in database.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}