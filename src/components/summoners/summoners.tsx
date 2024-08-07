// TODO: add Google sign-in to keep in sync across devices
// IP is fine for now
// Fetches summoners for this IP on load
// There will be an add/delete button to configure this

import { useEffect, useState } from "react";
import {
  AccountInfo,
  addAccounts,
  deleteAccounts,
  getAccounts,
} from "../../clients/summonerClient";
import "../../index.css";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import Spinner from "../common/spinner";

const inputStyle = `w-64 
px-4
py-2
my-4
mr-2
rounded-lg
border
bg-white dark:bg-gray-700
text-gray-700 dark:text-gray-200
border-gray-300 dark:border-gray-600
focus:border-sky-300 dark:focus:border-sky-300
focus:outline-none
focus:ring-2
focus:ring-sky-300 dark:focus:ring-sky-300
placeholder-gray-400 dark:placeholder-gray-400`;

const plusStyle = `
mt-4
mx-auto
flex items-center justify-center
w-10 h-10
bg-blue-500 hover:bg-blue-600
text-white
rounded-full
focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
transition-colors duration-200
`;

const saveStyle = `
flex items-center justify-center
px-4 py-2
bg-green-500 hover:bg-green-600
text-white
rounded-lg
focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50
transition-colors duration-200`;

export function Accounts() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAccounts() {
    const userAccounts = await getAccounts();
    setAccounts(userAccounts);
    setLoading(false);
  }

  // TODO: move this to redux
  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 text-black dark:text-white"
      style={{ display: "inline-block" }}
    >
      <h1 className="text-2xl font-bold underline">Accounts</h1>
      {accounts?.map((acc, idx) => (
        <div key={idx} className="flex items-center">
          <input
            className={inputStyle}
            value={acc.summoner_name}
            onChange={(e) => {
              accounts[idx].summoner_name = e.target.value;
              setAccounts([...accounts]);
            }}
          />
          <input
            className={inputStyle}
            value={acc.tag_line}
            onChange={(e) => {
              accounts[idx].tag_line = e.target.value;
              setAccounts([...accounts]);
            }}
          />
          <div
            className="flex items-center justify-center w-10 h-10 ml-2"
            onClick={() => {
              accounts.splice(idx, 1);
              setAccounts([...accounts]);
            }}
          >
            <TrashIcon className="h-6 w-6 ml-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer" />{" "}
          </div>
        </div>
      ))}
      <div className="w-full">
        <button
          className={plusStyle}
          onClick={() => {
            setAccounts([...accounts, { summoner_name: "", tag_line: "" }]);
          }}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="w-full">
        <button
          className={saveStyle}
          style={{ float: "right" }}
          onClick={() => {
            // TODO: could do this more cleanly but easy to just delete all previous and add all new
            deleteAccounts();
            addAccounts(accounts);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
