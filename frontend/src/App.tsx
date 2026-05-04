import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      {/* Removi o padding e o container fixo daqui */}
      <div className="min-h-screen w-full">
        <nav className="p-4 bg-gray-100 dark:bg-gray-900 flex gap-4 shadow-sm">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
          <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">Agendamentos</Link>
        </nav>
        
        <main className="w-full">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;