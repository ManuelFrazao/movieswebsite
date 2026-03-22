import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/admin");
    } catch (err) {
      alert("Login falhou");
    }
  };

  return (
    <div className="container">
      
      <button onClick={() => navigate("/")} className="backBtn">
        ← Voltar
      </button>

      <div className="card">
        <h1 className="title">Login</h1>

        <form onSubmit={handleLogin} className="form">
          
          <input
            type="email"
            placeholder="Email"
            className="input"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}