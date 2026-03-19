import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="logo-icon">🏥</span>
            <span class="logo-text">MedRecord</span>
          </div>
          <button class="sidebar-toggle" (click)="sidebarCollapsed = !sidebarCollapsed">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>

        <div class="sidebar-user">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info" *ngIf="!sidebarCollapsed">
            <p class="user-name">{{ user?.nombre }}</p>
            <span class="role-badge" [class]="'role-' + user?.role">{{ roleLabel }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [title]="item.label">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content" [style.margin-left]="sidebarCollapsed ? '72px' : '260px'">
        <!-- Navbar -->
        <header class="topbar">
          <div class="topbar-left">
            <h2 class="topbar-title">{{ currentPageTitle }}</h2>
          </div>
          <div class="topbar-right">
            <div class="topbar-user" (click)="goToProfile()">
              <div class="user-avatar-sm">{{ userInitials }}</div>
              <span class="user-email" *ngIf="user">{{ user.email }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: 260px;
      background: linear-gradient(180deg, #1E3A8A 0%, #1e40af 100%);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width 0.3s ease;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 18px; font-weight: 800; color: white; white-space: nowrap; }
    .sidebar-toggle {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      width: 28px; height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .sidebar-toggle:hover { background: rgba(255,255,255,0.2); }
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .user-avatar {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.2);
      color: white;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-info { overflow: hidden; }
    .user-name { color: white; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .role-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .role-paciente { background: rgba(16,185,129,0.25); color: #6ee7b7; }
    .role-medico { background: rgba(6,182,212,0.25); color: #67e8f9; }
    .role-admin { background: rgba(245,158,11,0.25); color: #fcd34d; }

    .sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
    .sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.1); }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 10px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s;
      margin-bottom: 4px;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
    }
    .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
    .nav-item.active { background: rgba(255,255,255,0.15); color: white; font-weight: 700; }
    .nav-item.active .nav-icon { filter: none; }
    .nav-icon { font-size: 20px; width: 24px; display: flex; justify-content: center; flex-shrink: 0; }
    .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .logout-btn:hover { background: rgba(239,68,68,0.3); color: #fca5a5; }

    .topbar {
      height: 64px;
      background: white;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .topbar-title { font-size: 18px; font-weight: 700; color: #0F172A; }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .topbar-user {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .topbar-user:hover { background: #F1F5F9; }
    .user-avatar-sm {
      width: 34px; height: 34px;
      border-radius: 8px;
      background: #2563EB;
      color: white;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-email { font-size: 13px; color: #64748B; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class DashboardLayoutComponent {
  sidebarCollapsed = false;

  constructor(private auth: AuthService, private router: Router) {}

  get user() { return this.auth.currentUser; }

  get userInitials(): string {
    const name = this.auth.currentUser?.nombre || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  get roleLabel(): string {
    const roles: Record<string, string> = { paciente: 'Paciente', medico: 'Médico', admin: 'Admin' };
    return roles[this.auth.currentUser?.role || ''] || '';
  }

  get currentPageTitle(): string { return ''; }

  get navItems(): NavItem[] {
    const role = this.auth.currentUser?.role;
    if (role === 'paciente') return [
      { label: 'Dashboard', icon: '🏠', route: '/paciente/dashboard' },
      { label: 'Mi Historial', icon: '📋', route: '/paciente/historial' },
      { label: 'Generar Token', icon: '🔑', route: '/paciente/tokens/nuevo' },
      { label: 'Mis Tokens', icon: '🔐', route: '/paciente/tokens' },
      { label: 'Auditoría', icon: '📊', route: '/paciente/auditoria' },
      { label: 'Mi Perfil', icon: '👤', route: '/paciente/perfil' },
    ];
    if (role === 'medico') return [
      { label: 'Dashboard', icon: '🏠', route: '/medico/dashboard' },
      { label: 'Validar Token', icon: '🔓', route: '/medico/validar-token' },
      { label: 'Registrar Consulta', icon: '✏️', route: '/medico/registrar-consulta' },
      { label: 'Mi Perfil', icon: '👤', route: '/medico/perfil' },
    ];
    if (role === 'admin') return [
      { label: 'Dashboard', icon: '🏠', route: '/admin/dashboard' },
      { label: 'Usuarios', icon: '👥', route: '/admin/usuarios' },
      { label: 'Pacientes', icon: '🧑‍⚕️', route: '/admin/pacientes' },
      { label: 'Auditoría', icon: '📊', route: '/admin/auditoria' },
    ];
    return [];
  }

  goToProfile() {
    const role = this.auth.currentUser?.role;
    if (role === 'paciente') this.router.navigate(['/paciente/perfil']);
    else if (role === 'medico') this.router.navigate(['/medico/perfil']);
  }

  logout() { this.auth.logout(); }
}
