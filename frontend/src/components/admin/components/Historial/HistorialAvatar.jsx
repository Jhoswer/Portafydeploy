import { useEffect, useState } from "react";
import { User } from "lucide-react";
import {
  avatarColor,
  getHistorialFullName,
  getHistorialInitials,
  getHistorialPhoto,
} from "./historialUtils";

export default function HistorialAvatar({
  usuario,
  size = 56,
  radius = 14,
  borderWidth = 3,
  shadow = "0 4px 14px rgba(0,0,0,.12)",
  className = "",
  style = {},
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const photo = getHistorialPhoto(usuario);
  const fullName = getHistorialFullName(usuario);
  const initials = getHistorialInitials(usuario);
  const { bg, fg } = avatarColor(fullName);

  useEffect(() => {
    setImageFailed(false);
  }, [photo]);

  const showPhoto = !!photo && !imageFailed;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: showPhoto ? "transparent" : `linear-gradient(135deg, ${bg}, ${bg})`,
        color: fg,
        overflow: "hidden",
        flexShrink: 0,
        border: `${borderWidth}px solid var(--card, #fff)`,
        boxShadow: shadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(14, Math.round(size * 0.32)),
        fontWeight: 800,
        ...style,
      }}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt={fullName || "Usuario"}
          onError={() => setImageFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        initials || <User size={Math.max(18, Math.round(size * 0.4))} />
      )}
    </div>
  );
}
