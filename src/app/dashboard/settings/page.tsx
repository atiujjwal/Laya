"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Avatar } from "@/components/atoms/Avatar";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile Card */}
      <div className="p-6 border rounded-xl bg-card flex items-center gap-6">
        <Avatar
          src={session?.user?.image}
          fallback={session?.user?.name || "U"}
          size="lg"
        />
        <div>
          <h3 className="font-bold text-lg">{session?.user?.name}</h3>
          <p className="text-muted-foreground">{session?.user?.email}</p>
        </div>
        <Button variant="outline" className="ml-auto">
          Change Avatar
        </Button>
      </div>

      {/* Preferences Form */}
      <div className="space-y-4 p-6 border rounded-xl bg-card">
        <h3 className="font-semibold">Preferences</h3>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Timezone</label>
          <Input
            defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </div>

        <div className="pt-4">
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Data Export (Phase 5 Requirement) */}
      <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-xl">
        <h3 className="font-semibold text-destructive mb-2">
          Data Sovereignty
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download a complete copy of your habit history and logs.
        </p>
        <Button
          variant="destructive"
          onClick={() => window.open("/api/export", "_blank")}
        >
          Download All Data (CSV)
        </Button>
      </div>
    </div>
  );
}
