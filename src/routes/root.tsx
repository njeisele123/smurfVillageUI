import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Root() {

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <div id="sidebar" className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <nav>
          <Link to={`accounts`}>Accounts</Link>
          <Link to={`village`}>Village</Link>
        </nav>
      </div>
      <div id="detail" className="bg-white dark:bg-gray-800 text-black dark:text-white">
        <Outlet />
      </div>
    </>
  );
}
