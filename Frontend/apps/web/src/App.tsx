import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import PreAprobacion from './pages/PreAprobacion';
import CupoDisponible from './pages/CupoDisponible';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import NotFound from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-fifa-dark">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/partidos" element={<Matches />} />
              <Route path="/partidos/:id" element={<MatchDetail />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/pre-aprobacion" element={<PreAprobacion />} />
              <Route path="/cupo-disponible" element={<CupoDisponible />} />
              <Route path="/pago" element={<Checkout />} />
              <Route path="/confirmacion" element={<Confirmation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
