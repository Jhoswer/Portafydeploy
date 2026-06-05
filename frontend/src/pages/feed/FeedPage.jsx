import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/landing/Navbar";
import LeftSidebar from "../../components/feed2/LeftSidebar";
import FeedReal from "../../components/feed2/FeedReal";
import RightSidebar from "../../components/feed2/RightSidebar";
import { useAuth } from "../../context/useAuth";
import { EXPLORE_FILTER_ITEMS, NAV_ITEMS } from "../../components/feed2/feedSidebarConfig";

export default function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const activeFilter = location.pathname === "/tendencias" ? "tendencias" : selectedFilter;

  const activePage = Object.values(NAV_ITEMS)
    .flat()
    .find((item) => item.route === location.pathname)?.page ?? "home";

  const openFeedRoute = useCallback((item) => {
    if (item.page === "tendencias") setSelectedFilter("tendencias");
    navigate(item.route);
  }, [navigate]);

  const applyExploreFilter = useCallback((item) => {
    if (location.pathname === "/tendencias") navigate("/feed");
    setSelectedFilter(item.filter);
  }, [location.pathname, navigate]);

  const mobileNavGroups = useMemo(() => [
    {
      title: t("appI18n.feed.left.panel"),
      items: NAV_ITEMS.panel
        .filter((item) => item.page !== "dashboard" || user)
        .map((item) => ({
          key: item.page,
          label: t(`appI18n.feed.left.${item.labelKey}`),
          icon: item.icon,
          active: activePage === item.page,
          onClick: () => openFeedRoute(item),
        })),
    },
    {
      title: t("appI18n.feed.left.explore"),
      items: EXPLORE_FILTER_ITEMS.map((item) => ({
        key: item.filter,
        label: t(`appI18n.feed.left.${item.labelKey}`),
        icon: item.icon,
        active: activeFilter === item.filter && location.pathname !== "/tendencias",
        onClick: () => applyExploreFilter(item),
      })),
    },
    {
      title: t("appI18n.feed.left.activity"),
      items: NAV_ITEMS.actividad.map((item) => ({
        key: item.page,
        label: t(`appI18n.feed.left.${item.labelKey}`),
        icon: item.icon,
        active: activePage === item.page || activeFilter === item.page,
        onClick: () => openFeedRoute(item),
      })),
    },
  ], [activeFilter, activePage, applyExploreFilter, location.pathname, openFeedRoute, t, user]);

  return (
    <div className="page-wrapper page-feed">
      <Navbar mobileNavGroups={mobileNavGroups} />
      <div className="layout">
        <LeftSidebar activeFilter={activeFilter} onFilter={setSelectedFilter} />
        <FeedReal activeFilter={activeFilter} />
        <RightSidebar />
      </div>
    </div>
  );
}
