import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maintenance - Law Firm Site',
  description: 'Site is currently under maintenance',
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}