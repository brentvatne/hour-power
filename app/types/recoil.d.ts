declare module "recoil" {
  // @include state.d.ts
  type NodeKey = string;
  type AtomValues = Map<NodeKey, Loadable<any>>;
  type ComponentCallback = (state: TreeState) => void;
  type TreeState = Readonly<{
    isSnapshot: boolean;
    transactionMetadata: object;
    dirtyAtoms: Set<NodeKey>;
    atomValues: AtomValues;
    nonvalidatedAtoms: Map<NodeKey, unknown>;
    nodeDeps: Map<NodeKey, Set<NodeKey>>;
    nodeToNodeSubscriptions: Map<NodeKey, Set<NodeKey>>;
    nodeToComponentSubscriptions: Map<
      NodeKey,
      Map<number, [string, ComponentCallback]>
    >;
  }>;

  // @include node.d.ts
  class DefaultValue {}

  // @include recoilRoot.d.ts
  import * as React from "react";
  interface RecoilRootProps {
    initializeState?: (options: {
      set: <T>(recoilVal: RecoilState<T>, newVal: T) => void;
      setUnvalidatedAtomValues: (atomMap: Map<string, unknown>) => void;
    }) => void;
  }
  const RecoilRoot: React.FC<RecoilRootProps>;

  // @include atom.d.ts
  interface AtomOptions<T> {
    key: NodeKey;
    default: RecoilValue<T> | Promise<T> | T;
    dangerouslyAllowMutability?: boolean;
  }
  /**
   * Creates an atom, which represents a piece of writeable state
   */
  function atom<T>(options: AtomOptions<T>): RecoilState<T>;

  // @include selector.d.ts
  type GetRecoilValue = <T>(recoilVal: RecoilValue<T>) => T;
  type SetRecoilState = <T>(
    recoilVal: RecoilState<T>,
    newVal: T | DefaultValue | ((prevValue: T) => T | DefaultValue)
  ) => void;
  type ResetRecoilState = (recoilVal: RecoilState<any>) => void;
  interface ReadOnlySelectorOptions<T> {
    key: string;
    get: (opts: { get: GetRecoilValue }) => Promise<T> | RecoilValue<T> | T;
    dangerouslyAllowMutability?: boolean;
  }
  interface ReadWriteSelectorOptions<T> extends ReadOnlySelectorOptions<T> {
    set: (
      opts: {
        set: SetRecoilState;
        get: GetRecoilValue;
        reset: ResetRecoilState;
      },
      newValue: T | DefaultValue
    ) => void;
  }
  function selector<T>(options: ReadWriteSelectorOptions<T>): RecoilState<T>;
  function selector<T>(
    options: ReadOnlySelectorOptions<T>
  ): RecoilValueReadOnly<T>;

  // @include hooks.d.ts
  type SetterOrUpdater<T> = (valOrUpdater: ((currVal: T) => T) | T) => void;
  type Resetter = () => void;
  type CallbackInterface = Readonly<{
    getPromise: <T>(recoilVal: RecoilValue<T>) => Promise<T>;
    getLoadable: <T>(recoilVal: RecoilValue<T>) => Loadable<T>;
    set: <T>(
      recoilVal: RecoilState<T>,
      valOrUpdater: ((currVal: T) => T) | T
    ) => void;
    reset: (recoilVal: RecoilState<any>) => void;
  }>;
  /**
   * Returns the value of an atom or selector (readonly or writeable) and
   * subscribes the components to future updates of that state.
   */
  function useRecoilValue<T>(recoilValue: RecoilValue<T>): T;
  /**
   * Returns a Loadable representing the status of the given Recoil state
   * and subscribes the component to future updates of that state. Useful
   * for working with async selectors.
   */
  function useRecoilValueLoadable<T>(recoilValue: RecoilValue<T>): Loadable<T>;
  /**
   * Returns a tuple where the first element is the value of the recoil state
   * and the second is a setter to update that state. Subscribes component
   * to updates of the given state.
   */
  function useRecoilState<T>(
    recoilState: RecoilState<T>
  ): [T, SetterOrUpdater<T>];
  /**
   * Returns a tuple where the first element is a Loadable and the second
   * element is a setter function to update the given state. Subscribes
   * component to updates of the given state.
   */
  function useRecoilStateLoadable<T>(
    recoilState: RecoilState<T>
  ): [Loadable<T>, SetterOrUpdater<T>];
  /**
   * Returns a setter function for updating Recoil state. Does not subscribe
   * the component to the given state.
   */
  function useSetRecoilState<T>(
    recoilState: RecoilState<T>
  ): SetterOrUpdater<T>;
  /**
   * Returns a function that will reset the given state to its default value.
   */
  function useResetRecoilState(recoilState: RecoilState<any>): Resetter;
  /**
   * Returns a function that will run the callback that was passed when
   * calling this hook. Useful for accessing Recoil state in response to
   * events.
   */
  function useRecoilCallback<Args extends ReadonlyArray<unknown>, Return>(
    fn: (interface: CallbackInterface, ...args: Args) => Return,
    deps?: ReadonlyArray<unknown>
  ): (...args: Args) => Return;

  // @include loadable.d.ts
  type ResolvedLoadablePromiseInfo<T> = Readonly<{
    value: T;
    upstreamState__INTERNAL_DO_NOT_USE?: TreeState;
  }>;
  type LoadablePromise<T> = Promise<ResolvedLoadablePromiseInfo<T>>;
  type Loadable<T> =
    | Readonly<{
        state: "hasValue";
        contents: T;
      }>
    | Readonly<{
        state: "hasError";
        contents: Error;
      }>
    | Readonly<{
        state: "loading";
        contents: LoadablePromise<T>;
      }>;

  // @include recoilValue.d.ts
  class AbstractRecoilValue<T> {
    tag: "Writeable";
    valTag: T;
    key: NodeKey;
    constructor(newKey: NodeKey);
  }
  class AbstractRecoilValueReadonly<T> {
    tag: "Readonly";
    valTag: T;
    key: NodeKey;
    constructor(newKey: NodeKey);
  }
  class RecoilState<T> extends AbstractRecoilValue<T> {}
  class RecoilValueReadOnly<T> extends AbstractRecoilValueReadonly<T> {}
  type RecoilValue<T> = RecoilValueReadOnly<T> | RecoilState<T>;
  function isRecoilValue(val: unknown): val is RecoilValue<any>;
}
