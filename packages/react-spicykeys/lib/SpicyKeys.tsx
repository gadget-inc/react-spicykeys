import { ActionHandlerMap, ActionKeyCombinationMap } from "./HandlerRegistry";
import { CallbackMap, useSpicyKeys } from "./useSpicyKeys";

export type SpicyKeysProps =
  | {
      keys: CallbackMap;
    }
  | {
      actions: ActionHandlerMap;
      keyMap: ActionKeyCombinationMap;
    };

export const SpicyKeys: React.FunctionComponent<SpicyKeysProps> = (props) => {
  if ("keys" in props) {
    useSpicyKeys(props.keys);
  } else {
    useSpicyKeys(props.actions, props.keyMap);
  }

  return <>{props.children}</>;
};
