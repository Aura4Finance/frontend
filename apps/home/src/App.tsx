import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;