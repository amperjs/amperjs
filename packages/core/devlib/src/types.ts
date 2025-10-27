import type { ResolvedType } from "tsuit";

export type PluginOptions = {
  generators?: Array<GeneratorConstructor>;
  formatters?: Array<FormatterConstructor>;

  /**
   * Name to use for custom runtime validation refinements.
   * @default "TRefine"
   * */
  refineTypeName?: string;
};

export type PluginOptionsResolved = {
  baseurl: string;
  apiurl: string;
  appRoot: string;
  sourceFolder: string;
  outDir: string;
  generators: Array<GeneratorConstructor>;
  formatters: Array<Formatter>;
  refineTypeName: string;
  watcher: {
    // waits this many milliseconds before reacting after a change is detected
    delay: number;
    // copying watch options from vite config and passing down to workers
    options?: import("vite").WatchOptions;
  };
} & Omit<PluginOptions, "generators" | "formatters" | "refineTypeName">;

export type PathToken = {
  orig: string;
  base: string;
  path: string;
  ext: string;
  param?: {
    name: string;
    const: string;
    isRequired?: boolean;
    isOptional?: boolean;
    isRest?: boolean;
  };
};

/**
 * route entry as found in file-system, before any processing
 * */
export type RouteEntry = {
  name: string;
  // root folder route defined in; either api or pages
  folder: string;
  // path to route file, relative to route folder
  file: string;
  fileFullpath: string;
  pathTokens: Array<PathToken>;
  importName: string;
  importPath: string;
};

export type ApiRoute = RouteEntry & {
  params: {
    id: string;
    schema: Array<Required<PathToken>["param"]>;
    resolvedType: ResolvedType | undefined;
  };
  numericParams: Array<string>;
  optionalParams: boolean;
  methods: Array<string>;
  typeDeclarations: Array<TypeDeclaration>;
  payloadTypes: Array<PayloadType>;
  responseTypes: Array<ResponseType>;
  // absolute path to referenced files
  referencedFiles: Array<string>;
};

export type PageRoute = RouteEntry & {
  params: {
    schema: Array<Required<PathToken>["param"]>;
  };
};

export type PayloadType = {
  id: string;
  // needed to make connection between PayloadType and ResponseType
  responseTypeId?: string | undefined;
  method: string;
  skipValidation: boolean;
  isOptional: boolean;
  resolvedType: ResolvedType | undefined;
};

export type ResponseType = {
  id: string;
  method: string;
  skipValidation: boolean;
  resolvedType: ResolvedType | undefined;
};

export type TypeDeclaration = {
  text: string;

  importDeclaration?: {
    name: string;
    alias?: string | undefined;
    path: string;
  };

  exportDeclaration?: {
    name: string;
    alias?: string | undefined;
    path?: string | undefined;
  };

  typeAliasDeclaration?: {
    name: string;
  };

  interfaceDeclaration?: {
    name: string;
  };

  enumDeclaration?: { name: string };
};

export type PathParams = {
  text: string;
  properties: Array<{ name: string; type: string }>;
};

export type RouteResolverEntry =
  | { kind: "api"; route: ApiRoute }
  | { kind: "page"; route: PageRoute };

export type RouteResolver = {
  name: string;
  handler: (updatedFile?: string) => Promise<RouteResolverEntry>;
};

export type WatcherEvent = {
  kind: "create" | "update" | "delete";
  file: string;
};

export type WatchHandler = (
  entries: Array<RouteResolverEntry>,
  event?: WatcherEvent,
) => Promise<void>;

type GeneratorFactoryReturn = {
  watchHandler: WatchHandler;
};

export type GeneratorFactory<T = undefined> = T extends undefined
  ? (options: PluginOptionsResolved) => Promise<GeneratorFactoryReturn>
  : (
      options: PluginOptionsResolved,
      extra: T,
    ) => Promise<GeneratorFactoryReturn>;

export type GeneratorConstructor = {
  /*
   * Used on core built-in generators to distinguish them from user-defined ones.
   * Core generators always run first, before any user generators.
   * User generators run in the order they were added.
   * */
  kind?: "api" | "fetch";

  name: string;

  /**
   * Specifies the module import path and provided config for worker thread imports.
   *
   * In development mode, generators run inside a worker thread.
   * Since functions cannot be directly passed to worker threads,
   * this provides the module assets for the worker to dynamically import the generator.
   * */
  moduleImport: string;
  moduleConfig: unknown;

  factory: GeneratorFactory;

  options?: {
    /**
     * Enables type resolution for generators that require fully resolved type information.
     *
     * When `true`, types are resolved to their flattened representations before
     * generator execution, making complete type data available.
     * */
    resolveTypes?: boolean;
  };
};

export type Formatter = (text: string, filePath: string) => string;

export type FormatterConstructor<
  ModuleConfig extends object | undefined = undefined,
> = {
  moduleImport: string;
  moduleConfig: ModuleConfig;
  formatter: Formatter;
};
