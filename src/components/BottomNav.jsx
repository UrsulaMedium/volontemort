import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Склад', icon: '📦' },
  { to: '/shipments', label: 'Відправки', icon: '🚚' },
  { to: '/contacts', label: 'Контакти', icon: '👥' },
  { to: '/documents', label: 'Документи', icon: '📄' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-area-pb">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-xs gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
