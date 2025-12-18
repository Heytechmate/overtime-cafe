"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"; // Changed to getDocs for cleaner list
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming Shadcn Table component
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Phone, Mail } from "lucide-react";

export default function MembersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("joinedAt", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Member Directory</h1>
          <p className="text-stone-500">View registered users and contact details.</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Total: {users.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {/* Note: If you don't have the Table component installed, you can use standard HTML table tags */}
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-medium border-b">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-stone-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-stone-900">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-stone-600">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <Phone className="w-3 h-3" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-stone-500">
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize bg-stone-100">
                        {user.role || "Member"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="p-8 text-center text-stone-400 italic">
                No members found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}