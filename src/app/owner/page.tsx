"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SystemStatus from '@/components/SystemStatus';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface MaintenanceSettings {
  id: string;
  isEnabled: boolean;
  message: string | null;
  startTime: string | null;
  endTime: string | null;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalNotes: number;
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalNotes: 0,
  });
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    id: "",
    isEnabled: false,
    message: "",
    startTime: null,
    endTime: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [endTime, setEndTime] = useState("");
  const [autoDisable, setAutoDisable] = useState("manual");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [environmentDisabled, setEnvironmentDisabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "OWNER") {
      router.push("/");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [statsRes, maintenanceRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch("/api/maintenance"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        setMaintenance(maintenanceData);
        setMessage(maintenanceData.message || "");
        setEndTime(maintenanceData.endTime || "");
        setEnvironmentDisabled(maintenanceData.environmentDisabled || false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = () => {
    if (!maintenance.isEnabled && environmentDisabled) {
      // Show warning dialog when trying to enable maintenance while environment disabled
      setShowConfirmDialog(true);
    } else {
      // Direct toggle for normal operation or disabling maintenance
      performMaintenanceToggle();
    }
  };

  const performMaintenanceToggle = async () => {
    setIsToggling(true);
    try {
      const payload = {
        isEnabled: !maintenance.isEnabled,
        message:
          message ||
          "We're currently performing scheduled maintenance. Please check back soon!",
        endTime:
          autoDisable === "scheduled" && endTime
            ? new Date(endTime).toISOString()
            : null,
      };

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenance(data);

        // Update storage event
        if (typeof window !== "undefined") {
          window.localStorage.setItem("maintenance-toggle", Date.now().toString());
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "maintenance-toggle",
              newValue: Date.now().toString(),
            })
          );
        }

        // Close dialog if it was open
        setShowConfirmDialog(false);
      } else {
        console.error("Failed to toggle maintenance:", response.status);
      }
    } catch (error) {
      console.error("Error toggling maintenance:", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-300 h-32 rounded-xl"></div>
              <div className="bg-gray-300 h-32 rounded-xl"></div>
              <div className="bg-gray-300 h-32 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your law firm's system</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Environment Status Alert - Make it dynamic */}
        <div className="mb-6">
          {maintenance.isEnabled ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  Maintenance mode active!
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Site is online and running normally
                </span>
              </div>
            </div>
          )}
        </div>

        {/* System Status Card */}
        <SystemStatus />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Total Users</h3>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Total Admins</h3>
                <p className="text-3xl font-bold">{stats.totalAdmins}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Total Notes</h3>
                <p className="text-3xl font-bold">{stats.totalNotes}</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 3a1 1 0 000 2h6a1 1 0 100-2H9zm0 4a1 1 0 100 2h6a1 1 0 100-2H9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Admins
                </h3>
                <p className="text-sm text-gray-600">
                  Add, view, and manage admin users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Users
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage regular users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM15 4a1 1 0 10-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  System Settings
                </h3>
                <p className="text-sm text-gray-600">Configure firm settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Maintenance Mode</h2>
          </div>

          {/* Status Indicator - Make it dynamic */}
          <div className="mb-6">
            <div className="flex items-center">
              {maintenance.isEnabled ? (
                <>
                  <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-3 animate-pulse"></span>
                  <span className="text-lg font-medium text-red-600">
                    Maintenance Active
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                  <span className="text-lg font-medium text-green-600">
                    Site Online
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Custom Message (Optional)
              </label>
              <textarea
                id="message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="We're currently performing scheduled maintenance. Please check back soon!"
              />
            </div>

            <div>
              <label
                htmlFor="autoDisable"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Auto-Disable After (Optional)
              </label>
              <select
                id="autoDisable"
                value={autoDisable}
                onChange={(e) => setAutoDisable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual control only</option>
                <option value="scheduled">Set scheduled end time</option>
              </select>
            </div>

            {autoDisable === "scheduled" && (
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Updated Button with Warning Logic */}
            <button
              onClick={handleMaintenanceToggle}
              disabled={loading || isToggling}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                maintenance.isEnabled
                  ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white"
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white"
              }`}
            >
              {isToggling ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {maintenance.isEnabled ? "Disabling..." : "Enabling..."}
                </div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {maintenance.isEnabled ? (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  {maintenance.isEnabled ? "Disable Maintenance" : "Enable Maintenance"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={performMaintenanceToggle}
        loading={isToggling}
        type="warning"
        title="⚠️ Maintenance System Disabled"
        message={`The maintenance system is currently disabled via environment variable (DISABLE_MAINTENANCE_CHECKING=true).

Even if you enable maintenance mode here, it will NOT work because:
• The environment variable overrides all maintenance functionality
• Users will continue to access the site normally
• Maintenance redirects will be bypassed

To make maintenance work:
1. Remove DISABLE_MAINTENANCE_CHECKING from .env.local
2. Restart the server
3. Then enable maintenance mode

Do you still want to enable maintenance mode? (It won't actually work until environment is changed)`}
        confirmText="Enable Anyway"
        cancelText="Cancel"
      />
    </div>
  );
}
