declare global {
  var maintenanceState: {
    isEnabled: boolean;
    message: string;
    endTime: string | null;
    id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export {};