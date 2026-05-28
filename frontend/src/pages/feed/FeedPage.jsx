import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/landing/Navbar";
import LeftSidebar from "../../components/feed2/LeftSidebar";
import FeedReal from "../../components/feed2/FeedReal";
import RightSidebar from "../../components/feed2/RightSidebar";

export default function FeedPage() {
  const location = useLocation();
  const initialFilter = location.pathname === "/tendencias" ? "tendencias" : "todos";
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    setActiveFilter(location.pathname === "/tendencias" ? "tendencias" : "todos");
  }, [location.pathname]);

  return (
    <div className="page-wrapper page-feed">
      <Navbar />
      <div className="layout">
        <LeftSidebar activeFilter={activeFilter} onFilter={setActiveFilter} />
        <FeedReal activeFilter={activeFilter} />
        <RightSidebar />
      </div>
    </div>
  );
}
