import { Link } from "react-router-dom";

export default function AuthBrand({ title, subtitle }) {
  return (
    <div className="auth-brand">
      <Link to="/" className="auth-logo">
        <img src="/logos/portafy.png" alt="PortaFy" className="auth-brand__logo" />
        Porta<span className="auth-brand__accent">Fy</span>
      </Link>
      {title || subtitle ? (
        <div className="auth-card__header auth-card__header--center">
          {title ? <h1 className="auth-card__title">{title}</h1> : null}
          {subtitle ? <p className="auth-card__sub">{subtitle}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
