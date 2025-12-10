import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        {/* Aquí puedes poner tu Logo real usando <Image /> */}
        <div className="mb-8 flex justify-center">
           <div className="h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
              US
           </div>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Universitas Services.
        </div>
      </div>
    </div>
  );
}