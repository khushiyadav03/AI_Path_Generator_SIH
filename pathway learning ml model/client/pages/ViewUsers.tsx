import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  username?: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: string;
  academicYear?: number;
  createdAt: string;
  lastLogin: string;
  passwordHash?: string | null;
}

export default function ViewUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/users");
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually means the API route is not found.`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch users" }));
        throw new Error(errorData.error || "Failed to fetch users");
      }
      
      const data = await response.json();
      // Transform the data to match the expected interface
      const transformedUsers = (data.users || []).map((user: any) => ({
        id: user.id?.toString() || "",
        username: user.name || "",
        email: user.email || "",
        displayName: user.name || user.email || "",
        photoURL: "",
        createdAt: user.created_at || new Date().toISOString(),
        lastLogin: "",
        passwordHash: null,
        role: user.role || "mentee",
      }));
      setUsers(transformedUsers);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 text-sm text-foreground/70">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6" />
                  User Database
                </CardTitle>
                <CardDescription className="mt-2">
                  View all registered users in the system
                </CardDescription>
              </div>
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {users.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>
                    Total users: {users.length} {users.length === 10 && "(Maximum reached)"}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.id}
                        </TableCell>
                        <TableCell className="font-medium">{user.displayName || user.username || "N/A"}</TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "admin" ? "default" : user.role === "mentor" ? "secondary" : "outline"}
                          >
                            {user.role || "mentee"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

