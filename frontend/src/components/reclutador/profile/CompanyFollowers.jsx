// src/components/reclutador/profile/CompanySocial.jsx
import { useState }          from "react";
import { Users }             from "lucide-react";
import { useTranslation }    from "react-i18next";
import { useCompanyRelations } from "../../../hooks/useCompanyRelations";

export function CompanyFollowers({ company }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("followers");

  if (!company?.id_company) return null;

  return (
    <div className="company-social cinfo__card">
      <div className="company-social__top">
        <h3 className="company-social__title">{t("company.social.title")}</h3>
      </div>

      <div className="company-social__tabs">
        <button
          className={activeTab === "followers" ? "active" : ""}
          onClick={() => setActiveTab("followers")}
        >
          {t("company.social.tabs.followers")}
        </button>

        <button
          className={activeTab === "following" ? "active" : ""}
          onClick={() => setActiveTab("following")}
        >
          {t("company.social.tabs.following")}
        </button>
      </div>

      <CompanySocialList
        companyId={company.id_company}
        type={activeTab}
      />
    </div>
  );
}

function CompanySocialList({ companyId, type }) {
  const { t } = useTranslation();
  const { items, total, loading, error } = useCompanyRelations(companyId, type);

  const summaryKey = type === "following"
    ? "company.social.summary.following"
    : "company.social.summary.followers";

  return (
    <div className="company-social__content">
      <div className="company-social__summary">
        <Users size={16} />
        <span>{t(summaryKey, { count: total })}</span>
      </div>

      {loading && (
        <p className="company-social__empty">{t("company.social.states.loading")}</p>
      )}

      {error && (
        <p className="company-social__error">{error}</p>
      )}

      {!loading && items.length === 0 && (
        <p className="company-social__empty">{t("company.social.states.notFound")}</p>
      )}

      <div className="company-social__grid">
        {items.map((user) => (
          <button
            key={user.id_profile || user.user_id || user.id}
            type="button"
            className="company-social__user"
            onClick={() =>
              window.location.href = `/perfil-profesional?usuario=${user.user_id}`
            }
          >
            <img
              src={user.photo || user.photo_url || "/default-avatar.png"}
              alt={user.name || t("company.social.userFallback")}
            />

            <div>
              <strong>{user.name || user.full_name || t("company.social.userFallback")}</strong>

              {(user.headline || user.profession) && (
                <span>{user.headline || user.profession}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}