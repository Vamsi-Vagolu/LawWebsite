import { redirect } from 'next/navigation';
import MaintenancePage from "../../components/MaintenancePage";
import { prisma } from "../../lib/prisma";

async function getMaintenanceSettings() {
  try {
    const settings = await prisma.maintenanceSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    return settings;
  } catch (error) {
    console.error('Failed to fetch maintenance settings:', error);
    return null;
  }
}

export default async function MaintenanceRoute() {
  const settings = await getMaintenanceSettings();

  // ✅ If maintenance is OFF, redirect to home page
  if (!settings?.isEnabled) {
    redirect('/');
  }

  // ✅ Auto-disable if time has passed
  if (settings.endTime && new Date() > settings.endTime) {
    await prisma.maintenanceSettings.update({
      where: { id: settings.id },
      data: { isEnabled: false, endTime: null }
    });
    redirect('/');
  }

  return (
    <MaintenancePage 
      message={settings.message || "We're currently performing scheduled maintenance to improve your experience."}
      estimatedEndTime={settings.endTime?.toISOString()}
    />
  );
}