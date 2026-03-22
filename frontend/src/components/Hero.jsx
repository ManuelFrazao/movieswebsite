import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Descobre Filmes e Séries 🎬</h1>
      <p>Explora, avalia e cria a tua watchlist</p>

      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px"
        }}
      >
        Começar
      </button>
    </div>
  );
}