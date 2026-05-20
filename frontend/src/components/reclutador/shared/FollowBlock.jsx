// src/components/company/CompanyFollowBlock.jsx
import { useState } from "react";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useCompanyFollowSystem } from "../../../hooks/useCompanyFollowSystem";
import { ConfirmUnfollowModal, RelationListModal } from "../../dashboard/profile/ProfileTrustModals";

/**
 * Props:
 *  companyId       number    ID de la empresa (requerido)
 *  initialMetrics  { followers, is_following }
 *  targetName      string    Para el modal de confirmación
 *  onOpenProfile   fn(user)  Al hacer click en un seguidor del modal
 *  readonly        bool      Si true, oculta botón de seguir
 */
export function CompanyFollowBlock({
  companyId,
  initialMetrics = {},
  targetName = "esta empresa",
  onOpenProfile = () => {},
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
      {/* Contador seguidores */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={fw.openRelations} style={counterStyle}>
          <Users size={14} />
          <strong>{fw.followers}</strong>
          <span>seguidores</span>
        </button>
        
        <button type="button" onClick={fw.openFollowing} style={counterStyle}>
            <strong>{fw.following}</strong>
            <span>siguiendo</span>
        </button>

        {/* Botón seguir / siguiendo */}
        {!readonly && (
          <button
            type="button"
            onClick={fw.toggle}
            disabled={fw.busy}
            style={fw.isFollowing ? unfollowBtnStyle : followBtnStyle}
          >
            {fw.isFollowing
              ? <><UserMinus size={14} /> Siguiendo</>
              : <><UserPlus size={14} /> Seguir empresa</>
            }
          </button>
        )}
      </div>

      {fw.error && (
        <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{fw.error}</p>
      )}

      {/* Modal lista seguidores */}
      {fw.relationModal && (
        <RelationListModal
          title="Seguidores"
          type="followers"
          readonly
          loading={fw.relationsLoading}
          items={fw.relations}
          onClose={fw.closeRelations}
          onFollow={() => {}}
          onAskUnfollow={() => {}}
          onOpenProfile={onOpenProfile}
        />
      )}

      {/* Modal confirmar dejar de seguir */}
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
  background: "none", border: "none", cursor: "pointer",
  fontSize: 13, color: "var(--color-text-secondary)",
  padding: "4px 6px", borderRadius: 8,
};

const followBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "7px 16px", borderRadius: 999,
  background: "#2563eb", color: "#fff",
  border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const unfollowBtnStyle = {
  ...followBtnStyle,
  background: "var(--color-background-secondary)",
  color: "var(--color-text-secondary)",
  border: "0.5px solid var(--color-border-tertiary)",
};