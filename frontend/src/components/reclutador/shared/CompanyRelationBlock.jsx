// src/components/company/shared/CompanyRelationBlock.jsx
import { Users } from "lucide-react";
import { useCompanyRelations } from "../../../hooks/useCompanyRelations";

export function CompanyRelationBlock({
  companyId,
  type = "followers",
  title,
  onOpenProfile = () => {},
}) {
  const {
    items,
    total,
    loading,
    error,
  } = useCompanyRelations(companyId, type);

  return (
    <div className="company-relations-block">
      {/* Header */}
      <div className="company-relations-block__header">
        <div className="company-relations-block__title">
          <Users size={16} />
          <span>{title}</span>
        </div>

        <strong>{total}</strong>
      </div>

      {/* Loading */}
      {loading && (
        <p className="company-relations-block__empty">
          Cargando...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="company-relations-block__error">
          {error}
        </p>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <p className="company-relations-block__empty">
          No hay usuarios.
        </p>
      )}

      {/* List */}
      <div className="company-relations-block__list">
        {items.map((user) => (
          <button
            key={user.id_profile || user.user_id}
            type="button"
            className="company-relations-user"
            onClick={() => onOpenProfile(user)}
          >
            <img
              src={user.avatar || "/default-avatar.png"}
              alt={user.name}
              className="company-relations-user__avatar"
            />

            <div className="company-relations-user__info">
              <strong>{user.name}</strong>

              {user.headline && (
                <span>{user.headline}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}