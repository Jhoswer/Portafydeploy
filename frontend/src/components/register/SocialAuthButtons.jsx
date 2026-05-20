import GoogleButton from "../auth/GoogleButton";
import GitHubButton from "../auth/GithubButton";
import LinkedInButton from "../auth/LinkedInButton";

export default function SocialAuthButtons({ disabled, role }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <GoogleButton disabled={disabled} role={role} />
      <GitHubButton disabled={disabled} role={role} />
      <LinkedInButton disabled={disabled} role={role} />
    </div>
  );
}

