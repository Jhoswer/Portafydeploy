import { useState } from "react";
import { Users } from "lucide-react";
import { useCompanyFollowSystem } from "../../../hooks/useCompanyFollowSystem";
import { ConfirmUnfollowModal } from "../../dashboard/profile/ProfileTrustModals";

export function CompanyFollowBlock({
  companyId,
  initialMetrics = {},
  targetName = "esta empresa",
  readonly = false,
}) {
  const fw = useCompanyFollowSystem(companyId);

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    fw.init(initialMetrics);
    setInitialized(true);
  }

  return (
    <>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={counterStyle}>
          <Users size={14} />
          <strong>{fw.followers}</strong>
          <span>seguidores</span>
        </span>
        <span style={counterStyle}>
          <strong>{fw.following}</strong>
          <span>siguiendo</span>
        </span>
      </div>

      {fw.error && (
        <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{fw.error}</p>
      )}

      {fw.unfollowOpen && (
        <ConfirmUnfollowModal
          user={{ name: targetName }}
          busy={fw.busy}
          error={fw.error}
          onCancel={fw.cancelUnfollow}
          onConfirm={fw.confirmUnfollow}
        />
      )}
    </>
  );
}

const counterStyle = {
  display: "inline-flex", alignItems: "center", gap: 5,
  fontSize: 13, color: "var(--color-text-secondary)",
  padding: "4px 6px",
};