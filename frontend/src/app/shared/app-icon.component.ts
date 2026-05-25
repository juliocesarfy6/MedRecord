import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const ICONS: Record<string, string[]> = {
  hospital: ['M3 21h18', 'M5 21V7l8-4 6 3v15', 'M9 21v-6h6v6', 'M10 9h4', 'M12 7v4'],
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9 21v-6h6v6'],
  file: ['M6 3h9l3 3v15H6z', 'M15 3v4h4', 'M8 11h8', 'M8 15h8', 'M8 19h5'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.35-4.35'],
  calendar: ['M7 3v4', 'M17 3v4', 'M4 8h16', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'],
  key: ['M15 7a4 4 0 1 0 2.7 3.76L21 8.5V6h-2.5L17 7.5', 'M10.7 12.3 3 20v1h4v-2h2v-2h2l2.3-2.3'],
  lock: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5z'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  handshake: ['M8 12 5 9l-3 3 5 5 3-3', 'M16 12l3-3 3 3-5 5-3-3', 'M8 12l2-2a3 3 0 0 1 4 0l2 2', 'M10 16l4-4'],
  unlock: ['M7 11V7a5 5 0 0 1 9.6-2', 'M5 11h14v10H5z'],
  edit: ['M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z', 'M13 6l5 5'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  users: ['M17 21a5 5 0 0 0-10 0', 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21a4 4 0 0 0-5-4', 'M16 5a3 3 0 0 1 0 6'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16v-5', 'M12 16V8', 'M16 16v-8'],
  logout: ['M10 17l5-5-5-5', 'M15 12H3', 'M21 3v18h-7'],
  eye: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  'eye-off': ['M3 3l18 18', 'M10.6 10.6A3 3 0 0 0 13.4 13.4', 'M9.9 4.4A10.5 10.5 0 0 1 12 4c6 0 10 8 10 8a17.5 17.5 0 0 1-3.1 4.2', 'M6.6 6.6C3.8 8.4 2 12 2 12s4 8 10 8c1.7 0 3.2-.4 4.5-1'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'],
  check: ['M20 6 9 17l-5-5'],
  pin: ['M12 2v7', 'M8 9h8l-1 6 3 4H6l3-4-1-6Z'],
  folder: ['M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path *ngFor="let path of paths" [attr.d]="path"></path>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      color: currentColor;
    }
    svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `],
})
export class AppIconComponent {
  @Input() name = 'home';

  get paths() {
    return ICONS[this.name] || ICONS['home'];
  }
}
