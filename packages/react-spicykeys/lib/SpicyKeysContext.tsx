import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { HandlerRegistry } from "./HandlerRegistry";

// start with a handler map that will automatically listen for keyevents on the body
export const rootRegistry = new HandlerRegistry();
export const RegistryContext = createContext<HandlerRegistry>(rootRegistry);

export const useSpicyKeysRegistry = () => {
  return useContext(RegistryContext);
};

export const SpicyKeysContext = (props: { children: ReactNode } & JSX.IntrinsicElements["div"]) => {
  const map = useMemo(() => new HandlerRegistry(), []);
  return (
    <RegistryContext.Provider value={map}>
      <div {...props} ref={(element) => map.setRoot(element!)} />
    </RegistryContext.Provider>
  );
};
