import OAuthButton from "./OAuthButton";

export default function LinkedInButton({ role, ...props }) {
  return <OAuthButton provider="linkedin" role={role} {...props} />;
}
