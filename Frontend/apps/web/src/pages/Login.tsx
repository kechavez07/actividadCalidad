import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginSOAP = useAuth(s => s.loginSOAP);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginSOAP(usuario, password);
    setLoading(false);
    if (result.ok) {
      // Si viene de /pago (carrito checkout), redireccionar a /pre-aprobacion
      if (redirect === '/pago') {
        navigate('/pre-aprobacion');
      } else {
        navigate(redirect);
      }
    } else {
      setError(result.error ?? 'Credenciales inválidas');
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-fifa-navy border border-fifa-blue/30 rounded-2xl p-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Ingresar</h1>
          <p className="text-gray-400 text-sm mb-8">
            Credencial de prueba: <strong>MONSTER / MONSTER9</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                className="input-field"
                placeholder="usuario"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-fifa-gold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
