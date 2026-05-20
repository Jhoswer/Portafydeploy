import { useState } from "react";
import Navbar from "../../components/landing/Navbar";
import LeftSidebar from "../../components/feed2/LeftSidebar";
import FeedReal from "../../components/feed2/FeedReal";
import RightSidebar from "../../components/feed2/RightSidebar";

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("todos");

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
