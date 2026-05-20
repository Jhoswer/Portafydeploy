import OAuthButton from "./OAuthButton";

export default function GoogleButton({ role, ...props }) {
  return <OAuthButton provider="google" role={role} {...props} />;
}

