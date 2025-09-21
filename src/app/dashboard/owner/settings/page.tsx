"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Owner Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Firm Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Update firm details, contact info, and other preferences here.</p>
          <Button className="mt-2">Edit Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
