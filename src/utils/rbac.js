/**
 * Role-Based Access Control (RBAC) definitions and helpers.
 * Supported core roles: 'admin', 'doctor', 'staff', 'patient'
 */

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  PATIENT: 'patient',
};

// Map sub-roles or employment types to standard core roles
const ROLE_ALIASES = {
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
  doctor: ROLES.DOCTOR,
  dentist: ROLES.DOCTOR,
  staff: ROLES.STAFF,
  nurse: ROLES.STAFF,
  receptionist: ROLES.STAFF,
  technician: ROLES.STAFF,
  billing: ROLES.STAFF,
  patient: ROLES.PATIENT,
  patients: ROLES.PATIENT,
};

/**
 * Safely extracts user object from localStorage
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data?.user || parsed?.user || parsed?.data || parsed;
  } catch {
    return null;
  }
};

/**
 * Normalizes user role string into a standard core role (admin, doctor, staff, patient)
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return ROLES.ADMIN; // default fallback
  const cleaned = role.trim().toLowerCase();
  return ROLE_ALIASES[cleaned] || cleaned;
};

/**
 * Returns the currently logged in user's normalized role
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  const rawRole = user?.role || user?.employment || 'admin';
  return normalizeRole(rawRole);
};

/**
 * Checks if a given role is in the allowed roles list
 */
export const isRoleAllowed = (role, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const current = normalizeRole(role);
  return allowedRoles.map(normalizeRole).includes(current);
};

/**
 * Route access permissions mapping by role
 */
export const ROUTE_PERMISSIONS = {
  '/dashboard': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF, ROLES.PATIENT],
  '/patients': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF],
  '/doctors': [ROLES.ADMIN],
  '/appointments': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF, ROLES.PATIENT],
  '/odontograms': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF],
  '/prescriptions': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT],
  '/follow-up': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF],
  '/enquiries': [ROLES.ADMIN, ROLES.STAFF],
  '/enquiry-follow-up': [ROLES.ADMIN, ROLES.STAFF],
  '/staff': [ROLES.ADMIN],
  '/billing': [ROLES.ADMIN, ROLES.STAFF],
  '/test-reports': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF, ROLES.PATIENT],
};

/**
 * Route to granular permission requirement for staff
 */
export const STAFF_ROUTE_PERMISSIONS = {
  '/patients': ['VIEW_PATIENT', 'CREATE_PATIENT', 'EDIT_PATIENT', 'DELETE_PATIENT'],
  '/appointments': ['VIEW_APPOINTMENT', 'CREATE_APPOINTMENT', 'EDIT_APPOINTMENT', 'CANCEL_APPOINTMENT'],
  '/enquiries': ['VIEW_ENQUIRY', 'MANAGE_ENQUIRY', 'EDIT_ENQUIRY', 'DELETE_ENQUIRY'],
  '/enquiry-follow-up': ['VIEW_ENQUIRY', 'MANAGE_ENQUIRY', 'EDIT_ENQUIRY', 'DELETE_ENQUIRY'],
  '/follow-up': ['MANAGE_FOLLOW_UP', 'EDIT_FOLLOW_UP', 'DELETE_FOLLOW_UP'],
  '/odontograms': ['VIEW_ODONTOGRAM', 'CREATE_ODONTOGRAM', 'EDIT_ODONTOGRAM', 'DELETE_ODONTOGRAM'],
  '/billing': ['PROCESS_BILLING'],
  '/staff': ['MANAGE_STAFF'],
  '/inventory': ['MANAGE_INVENTORY'],
  '/test-reports': ['VIEW_REPORTS'],
};

/**
 * Checks if a user has a specific granular permission.
 * - Admin always has all permissions.
 * - Doctor has standard clinical permissions.
 * - Staff checks their explicit currentUser.permissions array.
 */
export const hasPermission = (permission, user = getCurrentUser()) => {
  if (!user) return false;
  const role = normalizeRole(user?.role || user?.employment);
  
  if (role === ROLES.ADMIN) return true;
  
  if (role === ROLES.DOCTOR) {
    const doctorAllowed = [
      'VIEW_PATIENT', 'CREATE_PATIENT', 'EDIT_PATIENT',
      'VIEW_APPOINTMENT', 'CREATE_APPOINTMENT', 'EDIT_APPOINTMENT', 'CANCEL_APPOINTMENT',
      'VIEW_ODONTOGRAM', 'CREATE_ODONTOGRAM', 'EDIT_ODONTOGRAM',
      'MANAGE_FOLLOW_UP', 'EDIT_FOLLOW_UP', 'VIEW_REPORTS'
    ];
    return doctorAllowed.includes(permission);
  }

  if (role === ROLES.PATIENT) {
    return false;
  }

  // Staff: check assigned permissions from backend
  const staffPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return staffPermissions.includes(permission);
};

/**
 * Checks whether the current user can access a specific route path
 */
export const canAccessRoute = (path, role, user = getCurrentUser()) => {
  const currentRole = role || getUserRole();
  const basePath = '/' + (path.split('/')[1] || '');
  const allowed = ROUTE_PERMISSIONS[path] || ROUTE_PERMISSIONS[basePath];
  if (!allowed) return true;
  if (!isRoleAllowed(currentRole, allowed)) return false;

  // Granular check for Staff role based on assigned privileges
  if (currentRole === ROLES.STAFF) {
    const requiredPerms = STAFF_ROUTE_PERMISSIONS[path] || STAFF_ROUTE_PERMISSIONS[basePath];
    if (requiredPerms && requiredPerms.length > 0) {
      const hasAny = requiredPerms.some((perm) => hasPermission(perm, user));
      if (!hasAny) return false;
    }
  }

  return true;
};

/**
 * Styling and badge details for UI
 */
export const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    description: 'Full Clinic Management & System Access',
  },
  [ROLES.DOCTOR]: {
    label: 'Doctor',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Clinical Care, Appointments & Prescriptions',
  },
  [ROLES.STAFF]: {
    label: 'Staff',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
    description: 'Reception, Patient Intake & Operations',
  },
  [ROLES.PATIENT]: {
    label: 'Patient',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Personal Appointments, Records & History',
  },
};
