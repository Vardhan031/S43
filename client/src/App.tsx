import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TournamentDetails from "./pages/TournamentDetails";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { AlertProvider } from "./context/AlertContext";

export default function App() {
  return (
    <Router>
      <AlertProvider>
        <div className="min-h-screen flex flex-col bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden">
          <Navbar />
          <main className="flex-grow flex flex-col min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments/:id" element={<TournamentDetails />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AlertProvider>
    </Router>
  );
}
