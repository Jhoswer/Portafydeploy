import OAuthButton from "./OAuthButton";

export default function GitHubButton({ role, ...props }) {
  return <OAuthButton provider="github" role={role} {...props} />;
}

