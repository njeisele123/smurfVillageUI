import React, { createContext, useContext, useState } from "react";
import { AccountInfo, getAccounts } from "../clients/summonerClient";

interface AccountContext {
  accounts: AccountInfo[] | undefined;
  setAccounts: (acconts: AccountInfo[]) => void;
  loadAccounts: () => void;
  isLoadingAccounts: boolean;
}

const defaultContext = {
  accounts: undefined,
  setAccounts: () => {},
  loadAccounts: () => {},
  isLoadingAccounts: false
};

const AccountContext = createContext<AccountContext>(defaultContext);

export function useAccountContext() {
  return useContext(AccountContext);
}

export function AccountContextProvider({ children }: { children: any }) {
  const [accounts, setAccounts] = useState<AccountInfo[]>();
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    const userAccounts = await getAccounts();
    setAccounts(userAccounts);
    setIsLoadingAccounts(false);
  };

  return (
    <AccountContext.Provider value={{ accounts, setAccounts, loadAccounts, isLoadingAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}
