import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/app-icon.component';


interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AppIconComponent],
  template: `
    <div class="dashboard-layout">
      <button
        class="mobile-menu-button"
        type="button"
        (click)="toggleSidebar()"
        [attr.aria-label]="sidebarCollapsed ? 'Abrir menú' : 'Cerrar menú'"
        [title]="sidebarCollapsed ? 'Abrir menú' : 'Cerrar menú'">
        {{ sidebarCollapsed ? '☰' : '×' }}
      </button>
      <div
        class="sidebar-backdrop"
        *ngIf="!sidebarCollapsed"
        (click)="toggleSidebar()">
      </div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <button
          class="sidebar-toggle"
          type="button"
          (click)="toggleSidebar()"
          [attr.aria-label]="sidebarCollapsed ? 'Mostrar menú' : 'Ocultar menú'"
          [title]="sidebarCollapsed ? 'Mostrar menú' : 'Ocultar menú'">
          {{ sidebarCollapsed ? '>' : '<' }}
        </button>

        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="logo-icon"><app-icon name="hospital"></app-icon></span>
            <span class="logo-text" *ngIf="!sidebarCollapsed">MedRecord</span>
          </div>
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
             [routerLinkActiveOptions]="{ exact: true }"
             class="nav-item"
             [title]="item.label">
            <span class="nav-icon"><app-icon [name]="item.icon"></app-icon></span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
            <span
              class="nav-badge"
              *ngIf="item.route === '/medico/notificaciones' && notificationUnreadCount > 0">
              {{ notificationUnreadCount > 9 ? '9+' : notificationUnreadCount }}
            </span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="logout()">
            <span class="nav-icon"><app-icon name="logout"></app-icon></span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
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
      overflow: visible;
    }
    .sidebar.collapsed { width: 72px; }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      overflow: hidden;
    }
    .sidebar:not(.collapsed) .sidebar-header { justify-content: flex-start; }
    .sidebar-logo { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .logo-icon { font-size: 28px; flex-shrink: 0; color: #E0F2FE; }
    .logo-text { font-size: 18px; font-weight: 800; color: white; white-space: nowrap; }
    .sidebar-toggle {
      position: absolute;
      top: 22px;
      right: -15px;
      z-index: 120;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.35);
      background: #2563EB;
      color: #FFFFFF;
      cursor: pointer;
      font-size: 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.24);
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .sidebar-toggle:hover { background: #1E40AF; transform: scale(1.05); }
    .sidebar-toggle:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.28); outline-offset: 3px; }
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      overflow: hidden;
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

    .sidebar-nav { flex: 1; padding: 12px 8px; overflow-x: hidden; overflow-y: auto; }
    .sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.1); overflow: hidden; }

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
    .nav-badge {
      margin-left: auto;
      padding: 0 6px;
      border-radius: 999px;
      background: #EF4444;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
    }
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
    .main-content {
      margin-left: 260px;
    }
    .main-content.sidebar-collapsed {
      margin-left: 72px;
    }
  `]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  navItems: NavItem[] = []; // <-- Ahora es una variable estática, ¡no un getter!
  notificationUnreadCount = 0;
  private notificationTimer?: number;
  private readonly notificationRefreshHandler = () => this.loadNotificationCount();

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    if (window.innerWidth <= 768) this.sidebarCollapsed = true;

    // Calculamos el menú UNA SOLA VEZ al iniciar el componente
    const role = this.auth.currentUser?.role;

    if (role === 'paciente') {
      this.navItems = [
        { label: 'Dashboard', icon: 'home', route: '/paciente/dashboard' },
        { label: 'Mi Historial', icon: 'file', route: '/paciente/historial' },
        { label: 'Buscar Médicos', icon: 'search', route: '/paciente/medicos' },
        { label: 'Agendar Cita', icon: 'calendar', route: '/paciente/citas/nueva' },
        { label: 'Mis Citas', icon: 'calendar', route: '/paciente/citas' },
        { label: 'Generar Token', icon: 'key', route: '/paciente/tokens/nuevo' },
        { label: 'Mis Tokens', icon: 'lock', route: '/paciente/tokens' },
        { label: 'Mi Perfil', icon: 'user', route: '/paciente/perfil' },
      ];
    } else if (role === 'medico') {
      this.navItems = [
        { label: 'Dashboard', icon: 'home', route: '/medico/dashboard' },
        { label: 'Agenda', icon: 'calendar', route: '/medico/citas' },
        { label: 'Disponibilidad', icon: 'clock', route: '/medico/disponibilidad' },
        { label: 'Notificaciones', icon: 'bell', route: '/medico/notificaciones' },
        { label: 'Solicitudes', icon: 'handshake', route: '/medico/solicitudes' },
        { label: 'Validar Token', icon: 'unlock', route: '/medico/validar-token' },
        { label: 'Registrar Consulta', icon: 'edit', route: '/medico/registrar-consulta' },
        { label: 'Mi Perfil', icon: 'user', route: '/medico/perfil' },
      ];
    } else if (role === 'admin') {
      this.navItems = [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
        { label: 'Usuarios', icon: 'users', route: '/admin/usuarios' },
        { label: 'Pacientes', icon: 'user', route: '/admin/pacientes' },
        { label: 'Citas', icon: 'calendar', route: '/admin/citas' },
        { label: 'Auditoría', icon: 'chart', route: '/admin/auditoria' },
      ];
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth <= 768) this.sidebarCollapsed = true;
        if (role === 'medico') this.loadNotificationCount();
      });

    if (role === 'medico') {
      this.loadNotificationCount();
      this.notificationTimer = window.setInterval(() => this.loadNotificationCount(), 60000);
      window.addEventListener('medrecord:notifications-updated', this.notificationRefreshHandler);
    }
  }

  ngOnDestroy() {
    if (this.notificationTimer) window.clearInterval(this.notificationTimer);
    window.removeEventListener('medrecord:notifications-updated', this.notificationRefreshHandler);
  }

  // Estos getters sí se pueden quedar porque devuelven texto simple (primitivos)
  get user() { return this.auth.currentUser; }

  get userInitials(): string {
    const name = this.auth.currentUser?.nombre || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  get roleLabel(): string {
    const roles: Record<string, string> = { paciente: 'Paciente', medico: 'Médico', admin: 'Admin' };
    return roles[this.auth.currentUser?.role || ''] || '';
  }

  get currentPageTitle(): string {
    const path = this.router.url.split('?')[0];
    const titles: Record<string, string> = {
      '/paciente/dashboard': 'Panel del Paciente',
      '/paciente/historial': 'Mi Historial',
      '/paciente/medicos': 'Buscar Médicos',
      '/paciente/citas/nueva': 'Agendar Cita',
      '/paciente/citas': 'Mis Citas',
      '/paciente/tokens/nuevo': 'Generar Token',
      '/paciente/tokens': 'Mis Tokens',
      '/paciente/perfil': 'Mi Perfil',
      '/medico/dashboard': 'Panel Médico',
      '/medico/citas': 'Agenda',
      '/medico/disponibilidad': 'Disponibilidad',
      '/medico/notificaciones': 'Notificaciones',
      '/medico/solicitudes': 'Solicitudes',
      '/medico/validar-token': 'Validar Token',
      '/medico/registrar-consulta': 'Registrar Consulta',
      '/medico/perfil': 'Mi Perfil',
      '/admin/dashboard': 'Administración',
      '/admin/usuarios': 'Usuarios',
      '/admin/pacientes': 'Pacientes',
      '/admin/citas': 'Citas',
      '/admin/auditoria': 'Auditoría',
    };

    if (path.startsWith('/medico/expediente/')) return 'Expediente Clínico';
    return titles[path] || 'MedRecord';
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  goToProfile() {
    const role = this.auth.currentUser?.role;
    if (role === 'paciente') this.router.navigate(['/paciente/perfil']);
    else if (role === 'medico') this.router.navigate(['/medico/perfil']);
    else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
  }

  logout() { this.auth.logout(); }

  private loadNotificationCount() {
    this.api.getUnreadNotificationsCount().subscribe({
      next: (res) => {
        this.notificationUnreadCount = res.count || 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationUnreadCount = 0;
        this.cdr.detectChanges();
      },
    });
  }
}
