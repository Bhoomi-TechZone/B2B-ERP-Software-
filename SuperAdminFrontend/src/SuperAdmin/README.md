# Super Admin Module Structure

This folder contains all Super Admin related components organized in a clean, scalable structure.

## 📁 Folder Structure

```
src/SuperAdmin/
├── components/              # Shared components
│   ├── TopBar.jsx          # Main navigation bar
│   └── modals/             # Modal components
│       └── CreateTenantModal.jsx
├── pages/                  # Main page components
│   ├── Auth/               # Authentication pages
│   │   └── LoginPage.jsx   # Super Admin login
│   ├── Dashboard/          # Dashboard related pages
│   │   └── SuperAdminDashboard.jsx
│   ├── Tenants/           # Tenant management
│   │   ├── TenantManagementPage.jsx
│   │   └── TenantDetailPage.jsx
│   ├── Users/             # User management
│   │   ├── UserManagementPage.jsx
│   │   └── UserDetailPage.jsx
│   ├── Plans/             # Subscription plans
│   │   └── PlansManagementPage.jsx
│   ├── Billing/           # Billing & revenue
│   │   └── BillingPage.jsx
│   ├── Leads/             # Lead management
│   │   └── LeadsManagementPage.jsx
│   ├── Onboarding/        # Onboarding process
│   │   └── OnboardingManagementPage.jsx
│   ├── Team/              # Team management
│   │   └── SuperAdminTeamPage.jsx
│   └── Settings/          # Platform settings
│       └── PlatformSettingsPage.jsx
├── index.js               # Centralized exports
└── README.md              # This documentation
```

## 🚀 Usage

### Import Components

```javascript
// Import individual components
import { SuperAdminDashboard, SuperAdminLoginPage } from './SuperAdmin'

// Or import all at once
import * as SuperAdmin from './SuperAdmin'
```

### Adding New Components

1. **Auth Components**: Add to `pages/Auth/` folder
2. **Shared Components**: Add to `components/` folder
3. **Page Components**: Add to appropriate `pages/` subfolder
4. **Update Exports**: Add new component to `index.js`

### Naming Conventions

- **Components**: PascalCase (e.g., `SuperAdminDashboard.jsx`)
- **Folders**: PascalCase for feature folders (e.g., `Auth/`, `Tenants/`, `Users/`)
- **Files**: Always use `.jsx` extension for React components

## 🎯 Benefits

- **Organized**: Clear separation of concerns
- **Scalable**: Easy to add new features
- **Maintainable**: Logical grouping of related components
- **Clean Imports**: Centralized exports via index.js
- **Consistent**: Follows React best practices

## 🔧 Development

All components use:
- **React Hooks** for state management
- **React Router** for navigation
- **Motion/React** for animations
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **Royal Blue Theme** (#1251C5)

## 📝 Notes

- All components are properly typed and documented
- Import paths are relative and optimized
- Components follow consistent design patterns
- Error handling and loading states included
- Authentication flow properly implemented