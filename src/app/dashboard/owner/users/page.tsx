"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "OWNER";
  lastLogin?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("/api/owner/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.lastLogin && (
                <p className="text-xs text-gray-400">Last login: {user.lastLogin}</p>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={() => alert(`Disable user ${user.name}`)}
            >
              Disable
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
