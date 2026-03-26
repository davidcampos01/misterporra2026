import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#080811", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: "sans-serif" }}>
          <div style={{ fontSize: 48 }}>💥</div>
          <div style={{ color: "#f5c842", fontSize: 20, fontWeight: 700 }}>Error en la app</div>
          <div style={{ background: "rgba(255,107,107,.1)", border: "1px solid #ff6b6b", borderRadius: 10, padding: "12px 20px", color: "#ff8888", fontSize: 12, maxWidth: 400, wordBreak: "break-all" }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: "8px 20px", background: "#7b2fff", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
