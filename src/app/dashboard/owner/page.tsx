"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Owner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage all admins</p>
            <Link href="/dashboard/owner/admins">
              <Button className="mt-2">Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View all registered users & activity</p>
            <Link href="/dashboard/owner/users">
              <Button className="mt-2">Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Firm-wide settings & preferences</p>
            <Link href="/dashboard/owner/settings">
              <Button className="mt-2">Go</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
