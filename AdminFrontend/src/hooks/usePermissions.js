import { usePermissions as usePermissionsContext } from '../context/PermissionsContext';

// Re-export for convenience
export const usePermissions = () => {
  return usePermissionsContext();
};

export default usePermissions;
