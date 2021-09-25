import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { HandlerMap } from "./HandlerMap";

// start with a handler map that will automatically listen for keyevents on the body
const rootMap = new HandlerMap();
export const RootContext = createContext<HandlerMap>(rootMap);

export const useSpicyKeysMap = () => {
  return useContext(RootContext);
};

export const SpicyKeysContext = (props: { children: ReactNode } & JSX.IntrinsicElements["div"]) => {
  const map = useMemo(() => new HandlerMap(), []);
  return (
    <RootContext.Provider value={map}>
      <div {...props} ref={(element) => map.setRoot(element!)} />
    </RootContext.Provider>
  );
};
