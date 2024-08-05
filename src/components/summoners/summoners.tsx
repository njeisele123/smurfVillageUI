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

export function Accounts() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);

  async function loadAccounts() {
    const userAccounts = await getAccounts();
    setAccounts(userAccounts);
  }

  // TODO: move this to redux
  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div style={{ color: "white" }}>
      {accounts?.map((acc, idx) => (
        <div key={idx}>
          <input
            value={acc.summoner_name}
            onChange={(e) => {
              accounts[idx].summoner_name = e.target.value;
              setAccounts([...accounts]);
            }}
          />
          <input
            value={acc.tag_line}
            onChange={(e) => {
              accounts[idx].tag_line = e.target.value;
              setAccounts([...accounts]);
            }}
          />
          <button
            onClick={() => {
              accounts.splice(idx, 1);
              setAccounts([...accounts]);
            }}
          >
            -
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          setAccounts([...accounts, { summoner_name: "", tag_line: "" }]);
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          // TODO: could do this more cleanly but easy to just delete all previous and add all new
          deleteAccounts();
          addAccounts(accounts);
        }}
      >
        Save
      </button>
    </div>
  );
}
