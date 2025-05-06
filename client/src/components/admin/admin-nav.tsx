import { Link } from 'react-router-dom';

export function AdminNav() {
  return (
    <nav className="flex space-x-4 p-4 bg-gray-100">
      <Link href="/admin/dashboard" className="hover:text-blue-600">Dashboard</Link>
      <Link href="/admin/users" className="hover:text-blue-600">Users</Link>
      <Link href="/admin/content" className="hover:text-blue-600">Content</Link>
      <Link href="/admin/settings" className="hover:text-blue-600">Settings</Link>
    </nav>
  );
}
