import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { apiCallCount$ } from "../scripts/apiTracker";

const MAX_API_CALLS_PER_MINUTE = 50;

export default function Root() {
  const [apiCallsCount, setApiCallsCount] = useState(0);

  useEffect(() => {
    // for enabling dark-mode
    document.documentElement.classList.add("dark");

    //
    apiCallCount$.subscribe((count) => {
      setApiCallsCount(count);
    });
  }, []);

  return (
    <>
      <div
        id="sidebar"
        className="bg-white dark:bg-gray-900 text-black dark:text-white"
      >
        <nav>
          <Link to={`accounts`}>Accounts</Link>
          <Link to={`village`}>Village</Link>
        </nav>
      </div>
      <div
        id="detail"
        className="bg-white dark:bg-gray-800 text-black dark:text-white"
      >
        <Outlet />
      </div>
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white">
        <div className=" mr-2 mt-2">
          Calls Per Minute: {apiCallsCount} / {MAX_API_CALLS_PER_MINUTE}
        </div>
      </div>
    </>
  );
}
