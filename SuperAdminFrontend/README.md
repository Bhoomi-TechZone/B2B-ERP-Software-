# Super Admin Dashboard - B2B CRM Platform

A comprehensive Super Admin dashboard for managing a multi-tenant B2B CRM platform. This is a focused Super Admin panel with complete platform management capabilities.

## 🚀 Features

### Super Admin Dashboard
- **Dashboard Overview**: Real-time platform statistics, KPIs, and system health
- **Tenant Management**: Create, view, edit, suspend, and manage tenant organizations
- **User Management**: Manage users across all tenants with role-based controls
- **Plans Management**: Create and manage subscription plans with pricing
- **Billing & Revenue**: Monitor platform revenue, invoices, and payments
- **Leads Management**: Track and manage registration leads with conversion funnel
- **Platform Settings**: Configure platform-wide settings and preferences
- **System Health**: Monitor system status, services, and audit logs
- **Onboarding Management**: Track tenant onboarding progress

### Authentication & Security
- JWT-based authentication with secure token management
- Role-based access control for Super Admin roles
- Protected routes with automatic redirects
- Secure session management

### Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Interactive components with Lucide React icons
- Professional Royal Blue color scheme
- Mobile-friendly responsive layout
- Loading states and error handling

## 🛠️ Tech Stack

- **Frontend**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Routing**: React Router DOM 6.28.0
- **Styling**: Tailwind CSS 3.4.0
- **Animations**: Framer Motion (motion) 11.11.17
- **Icons**: Lucide React 0.468.0
- **Language**: JavaScript (ES6+)

## 📁 Project Structure

```
src/
├── SuperAdmin/              # Super Admin components
│   ├── SuperAdminDashboard.jsx      # Main dashboard
│   ├── SuperAdminTopBar.jsx         # Navigation header
│   ├── TenantManagementPage.jsx     # Tenant CRUD
│   ├── UserManagementPage.jsx       # User management
│   ├── PlansManagementPage.jsx      # Plans management
│   ├── BillingPage.jsx              # Billing & revenue
│   ├── LeadsManagementPage.jsx      # Leads tracking
│   ├── PlatformSettingsPage.jsx     # Platform config
│   └── ...
├── context/                 # React Context
│   └── AuthContext.jsx      # Authentication state
├── hooks/                   # Custom hooks
│   └── useAuth.js           # Auth hook
├── services/                # API services
│   ├── apiClient.js         # HTTP client
│   ├── authService.js       # Auth API
│   └── superAdminService.js # Super Admin API
├── config/                  # Configuration
│   ├── api.js              # API endpoints
│   └── roles.js            # Role definitions
├── utils/                   # Utilities
│   └── tokenHelper.js      # JWT helpers
├── SuperAdminLoginPage.jsx  # Login page
├── App.jsx                  # Main app with routing
└── main.jsx                # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd b2b-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Login Credentials (Demo)
- **Email**: admin@workmatrix.com
- **Password**: admin123

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Color Palette
- **Primary**: #1251C5 (Royal Blue)
- **Secondary**: #4f9cf9 (Light Blue)
- **Background**: #f0f5ff (Light Blue Background)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: Bold, tracking-tight
- **Body**: Regular, good line-height for readability

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly across:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Mobile-first navigation and interface

## 🔐 Authentication Flow

1. **Login**: User enters credentials on Super Admin login page
2. **Token Storage**: JWT tokens stored securely in localStorage
3. **Route Protection**: All routes protected with Super Admin role check
4. **Auto Refresh**: Automatic token refresh on API calls
5. **Logout**: Clean token removal and redirect to login

## 🏗️ Architecture

### Component Architecture
- **Page Components**: Full-page Super Admin views
- **Shared Components**: Reusable UI components
- **Context Providers**: Global authentication state
- **Service Layer**: API integration with error handling

### State Management
- **React Context**: Authentication and user state
- **Local State**: Component-specific state with useState
- **API State**: Service layer with proper error handling

### API Integration
- **Centralized Client**: Single API client with interceptors
- **Service Layer**: Super Admin specific API calls
- **Error Handling**: Consistent error handling across services
- **Token Management**: Automatic token refresh and retry logic

## 🚀 Super Admin Features

### Dashboard
- Platform KPIs and statistics
- Revenue charts and analytics
- System health monitoring
- Recent activity logs

### Tenant Management
- View all tenant organizations
- Create new tenants
- Edit tenant details
- Suspend/activate tenants
- Delete tenants (with confirmation)

### User Management
- View users across all tenants
- Filter by role and status
- User details and management
- Suspend/activate users

### Plans Management
- Create subscription plans
- Edit plan details and pricing
- Manage plan features
- Plan activation/deactivation

### Billing & Revenue
- Revenue overview and trends
- Invoice management
- Payment tracking
- Financial reporting

### Leads Management
- Track registration leads
- Lead conversion funnel
- Lead status management
- Lead analytics

### Platform Settings
- General platform configuration
- Security settings
- Email configuration
- API settings
- Notification preferences

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔮 Future Enhancements

- [ ] Real-time notifications and alerts
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced filtering and search
- [ ] Bulk operations for tenants/users
- [ ] Export functionality (CSV, PDF)
- [ ] Integration with external services
- [ ] Advanced audit logging
- [ ] Automated backup and recovery

---

Built with ❤️ for Super Admin platform management.
