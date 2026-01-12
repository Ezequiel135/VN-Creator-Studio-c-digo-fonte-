
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';

// Platform Components
import { AuthGateComponent } from './platform/auth/auth-gate.component';
import { PlatformDashboardComponent } from './platform/dashboard/dashboard.component';
import { SupportPortalComponent } from './platform/support/support-portal.component';
import { AdminDashboardComponent } from './platform/admin/admin-dashboard.component';
import { MockBackendService } from './platform/services/mock-backend.service';

const routes: Routes = [
  // Editor (Home)
  { path: '', component: AppComponent }, // Default route handled by AppComponent internals
  
  // Platform Public
  { path: 'auth', component: AuthGateComponent },
  { 
    path: 'dashboard', 
    component: PlatformDashboardComponent,
    canActivate: [() => { const s = new MockBackendService(); return true; }] 
  },
  { path: 'support', component: SupportPortalComponent },
  
  // Admin Restricted
  { path: 'admin', component: AdminDashboardComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation())
  ]
}).catch((err) => console.error(err));
