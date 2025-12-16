// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/LoginForm'; // Ajusta la ruta si es necesario

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <div className="h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
          US
        </div>
      </div>
      
      <LoginForm />
    </div>
  );
}