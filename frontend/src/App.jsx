import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import EditEntry from "./pages/admin/EditEntry";
import Entry from "./pages/Entry";
import Episode from "./pages/Episode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route path="/admin/entries/:id" element={<EditEntry />} />

        <Route path="/entry/:slug" element={<Entry />} />
        <Route path="/episode/:id" element={<Episode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
