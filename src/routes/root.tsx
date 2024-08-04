import { Link, Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <nav>
          <Link to={`accounts`}>Accounts</Link>
          <Link to={`village`}>Village</Link>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
