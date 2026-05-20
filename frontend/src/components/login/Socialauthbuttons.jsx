import GoogleButton from "../auth/GoogleButton";
import GitHubButton from "../auth/GithubButton";
import LinkedInButton from "../auth/LinkedInButton";

export default function SocialAuthButtons({
  disabled,
  role,
  onGoogleSuccess,
  onGitHubSuccess,
  onLinkedInSuccess,
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <GoogleButton
        disabled={disabled}
        role={role}
        {...(onGoogleSuccess && { onSuccess: onGoogleSuccess })}
      />
      <GitHubButton
        disabled={disabled}
        role={role}
        {...(onGitHubSuccess && { onSuccess: onGitHubSuccess })}
      />
      <LinkedInButton
        disabled={disabled}
        role={role}
        {...(onLinkedInSuccess && { onSuccess: onLinkedInSuccess })}
      />
    </div>
  );
}