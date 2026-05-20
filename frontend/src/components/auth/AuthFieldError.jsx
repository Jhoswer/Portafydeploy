import { AlertCircle } from "lucide-react";

export default function AuthFieldError({ message, className = "auth-error" }) {
  if (!message) return null;

  return (
    <p className={className}>
      <AlertCircle size={11} />
      {message}
    </p>
  );
}
