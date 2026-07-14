/**
 * Client
 **/

import * as runtime from "./runtime/library.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Payment
 *
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>;
/**
 * Model UserSettings
 *
 */
export type UserSettings = $Result.DefaultSelection<Prisma.$UserSettingsPayload>;
/**
 * Model Device
 *
 */
export type Device = $Result.DefaultSelection<Prisma.$DevicePayload>;
/**
 * Model WatchlistItem
 *
 */
export type WatchlistItem = $Result.DefaultSelection<Prisma.$WatchlistItemPayload>;
/**
 * Model ContinueWatching
 *
 */
export type ContinueWatching = $Result.DefaultSelection<Prisma.$ContinueWatchingPayload>;
/**
 * Model WatchedEpisode
 *
 */
export type WatchedEpisode = $Result.DefaultSelection<Prisma.$WatchedEpisodePayload>;
/**
 * Model AuditLog
 *
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>;
/**
 * Model AnalyticsEvent
 *
 */
export type AnalyticsEvent = $Result.DefaultSelection<Prisma.$AnalyticsEventPayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
    USER: "USER";
    MODERATOR: "MODERATOR";
    CONTENT_MANAGER: "CONTENT_MANAGER";
    SUPPORT: "SUPPORT";
    ADMIN: "ADMIN";
    DEVELOPER: "DEVELOPER";
    OWNER: "OWNER";
  };

  export type Role = (typeof Role)[keyof typeof Role];

  export const SubscriptionTier: {
    FREE: "FREE";
    PRO: "PRO";
  };

  export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];
}

export type Role = $Enums.Role;

export const Role: typeof $Enums.Role;

export type SubscriptionTier = $Enums.SubscriptionTier;

export const SubscriptionTier: typeof $Enums.SubscriptionTier;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent) => void
  ): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel }
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Payments
   * const payments = await prisma.payment.findMany()
   * ```
   */
  get payment(): Prisma.PaymentDelegate<ExtArgs>;

  /**
   * `prisma.userSettings`: Exposes CRUD operations for the **UserSettings** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more UserSettings
   * const userSettings = await prisma.userSettings.findMany()
   * ```
   */
  get userSettings(): Prisma.UserSettingsDelegate<ExtArgs>;

  /**
   * `prisma.device`: Exposes CRUD operations for the **Device** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Devices
   * const devices = await prisma.device.findMany()
   * ```
   */
  get device(): Prisma.DeviceDelegate<ExtArgs>;

  /**
   * `prisma.watchlistItem`: Exposes CRUD operations for the **WatchlistItem** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more WatchlistItems
   * const watchlistItems = await prisma.watchlistItem.findMany()
   * ```
   */
  get watchlistItem(): Prisma.WatchlistItemDelegate<ExtArgs>;

  /**
   * `prisma.continueWatching`: Exposes CRUD operations for the **ContinueWatching** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ContinueWatchings
   * const continueWatchings = await prisma.continueWatching.findMany()
   * ```
   */
  get continueWatching(): Prisma.ContinueWatchingDelegate<ExtArgs>;

  /**
   * `prisma.watchedEpisode`: Exposes CRUD operations for the **WatchedEpisode** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more WatchedEpisodes
   * const watchedEpisodes = await prisma.watchedEpisode.findMany()
   * ```
   */
  get watchedEpisode(): Prisma.WatchedEpisodeDelegate<ExtArgs>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more AuditLogs
   * const auditLogs = await prisma.auditLog.findMany()
   * ```
   */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs>;

  /**
   * `prisma.analyticsEvent`: Exposes CRUD operations for the **AnalyticsEvent** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more AnalyticsEvents
   * const analyticsEvents = await prisma.analyticsEvent.findMany()
   * ```
   */
  get analyticsEvent(): Prisma.AnalyticsEventDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;
  export import NotFoundError = runtime.NotFoundError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object ? (U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U) : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ? (K extends keyof O ? { [P in K]: O[P] } & O : O) | ({ [P in keyof O as P extends K ? K : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">> = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<"OR", K>, Extends<"AND", K>>, Extends<"NOT", K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;

  export const ModelName: {
    User: "User";
    Payment: "Payment";
    UserSettings: "UserSettings";
    Device: "Device";
    WatchlistItem: "WatchlistItem";
    ContinueWatching: "ContinueWatching";
    WatchedEpisode: "WatchedEpisode";
    AuditLog: "AuditLog";
    AnalyticsEvent: "AnalyticsEvent";
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs; clientOptions: PrismaClientOptions },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<this["params"]["extArgs"], this["params"]["clientOptions"]>;
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps:
        | "user"
        | "payment"
        | "userSettings"
        | "device"
        | "watchlistItem"
        | "continueWatching"
        | "watchedEpisode"
        | "auditLog"
        | "analyticsEvent";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>;
        fields: Prisma.PaymentFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[];
          };
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[];
          };
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>;
          };
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePayment>;
          };
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PaymentGroupByOutputType>[];
          };
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>;
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number;
          };
        };
      };
      UserSettings: {
        payload: Prisma.$UserSettingsPayload<ExtArgs>;
        fields: Prisma.UserSettingsFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserSettingsFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserSettingsFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          findFirst: {
            args: Prisma.UserSettingsFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserSettingsFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          findMany: {
            args: Prisma.UserSettingsFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>[];
          };
          create: {
            args: Prisma.UserSettingsCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          createMany: {
            args: Prisma.UserSettingsCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserSettingsCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>[];
          };
          delete: {
            args: Prisma.UserSettingsDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          update: {
            args: Prisma.UserSettingsUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          deleteMany: {
            args: Prisma.UserSettingsDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserSettingsUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.UserSettingsUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>;
          };
          aggregate: {
            args: Prisma.UserSettingsAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUserSettings>;
          };
          groupBy: {
            args: Prisma.UserSettingsGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserSettingsGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserSettingsCountArgs<ExtArgs>;
            result: $Utils.Optional<UserSettingsCountAggregateOutputType> | number;
          };
        };
      };
      Device: {
        payload: Prisma.$DevicePayload<ExtArgs>;
        fields: Prisma.DeviceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DeviceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DeviceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          findFirst: {
            args: Prisma.DeviceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DeviceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          findMany: {
            args: Prisma.DeviceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>[];
          };
          create: {
            args: Prisma.DeviceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          createMany: {
            args: Prisma.DeviceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DeviceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>[];
          };
          delete: {
            args: Prisma.DeviceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          update: {
            args: Prisma.DeviceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          deleteMany: {
            args: Prisma.DeviceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DeviceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.DeviceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DevicePayload>;
          };
          aggregate: {
            args: Prisma.DeviceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDevice>;
          };
          groupBy: {
            args: Prisma.DeviceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DeviceGroupByOutputType>[];
          };
          count: {
            args: Prisma.DeviceCountArgs<ExtArgs>;
            result: $Utils.Optional<DeviceCountAggregateOutputType> | number;
          };
        };
      };
      WatchlistItem: {
        payload: Prisma.$WatchlistItemPayload<ExtArgs>;
        fields: Prisma.WatchlistItemFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WatchlistItemFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WatchlistItemFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          findFirst: {
            args: Prisma.WatchlistItemFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WatchlistItemFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          findMany: {
            args: Prisma.WatchlistItemFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>[];
          };
          create: {
            args: Prisma.WatchlistItemCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          createMany: {
            args: Prisma.WatchlistItemCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WatchlistItemCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>[];
          };
          delete: {
            args: Prisma.WatchlistItemDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          update: {
            args: Prisma.WatchlistItemUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          deleteMany: {
            args: Prisma.WatchlistItemDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WatchlistItemUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.WatchlistItemUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistItemPayload>;
          };
          aggregate: {
            args: Prisma.WatchlistItemAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWatchlistItem>;
          };
          groupBy: {
            args: Prisma.WatchlistItemGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WatchlistItemGroupByOutputType>[];
          };
          count: {
            args: Prisma.WatchlistItemCountArgs<ExtArgs>;
            result: $Utils.Optional<WatchlistItemCountAggregateOutputType> | number;
          };
        };
      };
      ContinueWatching: {
        payload: Prisma.$ContinueWatchingPayload<ExtArgs>;
        fields: Prisma.ContinueWatchingFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ContinueWatchingFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ContinueWatchingFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          findFirst: {
            args: Prisma.ContinueWatchingFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ContinueWatchingFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          findMany: {
            args: Prisma.ContinueWatchingFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>[];
          };
          create: {
            args: Prisma.ContinueWatchingCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          createMany: {
            args: Prisma.ContinueWatchingCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ContinueWatchingCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>[];
          };
          delete: {
            args: Prisma.ContinueWatchingDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          update: {
            args: Prisma.ContinueWatchingUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          deleteMany: {
            args: Prisma.ContinueWatchingDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ContinueWatchingUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.ContinueWatchingUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContinueWatchingPayload>;
          };
          aggregate: {
            args: Prisma.ContinueWatchingAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateContinueWatching>;
          };
          groupBy: {
            args: Prisma.ContinueWatchingGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ContinueWatchingGroupByOutputType>[];
          };
          count: {
            args: Prisma.ContinueWatchingCountArgs<ExtArgs>;
            result: $Utils.Optional<ContinueWatchingCountAggregateOutputType> | number;
          };
        };
      };
      WatchedEpisode: {
        payload: Prisma.$WatchedEpisodePayload<ExtArgs>;
        fields: Prisma.WatchedEpisodeFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WatchedEpisodeFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WatchedEpisodeFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          findFirst: {
            args: Prisma.WatchedEpisodeFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WatchedEpisodeFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          findMany: {
            args: Prisma.WatchedEpisodeFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>[];
          };
          create: {
            args: Prisma.WatchedEpisodeCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          createMany: {
            args: Prisma.WatchedEpisodeCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WatchedEpisodeCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>[];
          };
          delete: {
            args: Prisma.WatchedEpisodeDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          update: {
            args: Prisma.WatchedEpisodeUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          deleteMany: {
            args: Prisma.WatchedEpisodeDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WatchedEpisodeUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.WatchedEpisodeUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchedEpisodePayload>;
          };
          aggregate: {
            args: Prisma.WatchedEpisodeAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWatchedEpisode>;
          };
          groupBy: {
            args: Prisma.WatchedEpisodeGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WatchedEpisodeGroupByOutputType>[];
          };
          count: {
            args: Prisma.WatchedEpisodeCountArgs<ExtArgs>;
            result: $Utils.Optional<WatchedEpisodeCountAggregateOutputType> | number;
          };
        };
      };
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>;
        fields: Prisma.AuditLogFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
          };
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
          };
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAuditLog>;
          };
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AuditLogGroupByOutputType>[];
          };
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>;
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number;
          };
        };
      };
      AnalyticsEvent: {
        payload: Prisma.$AnalyticsEventPayload<ExtArgs>;
        fields: Prisma.AnalyticsEventFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AnalyticsEventFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          findFirst: {
            args: Prisma.AnalyticsEventFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AnalyticsEventFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          findMany: {
            args: Prisma.AnalyticsEventFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[];
          };
          create: {
            args: Prisma.AnalyticsEventCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          createMany: {
            args: Prisma.AnalyticsEventCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AnalyticsEventCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[];
          };
          delete: {
            args: Prisma.AnalyticsEventDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          update: {
            args: Prisma.AnalyticsEventUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          deleteMany: {
            args: Prisma.AnalyticsEventDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AnalyticsEventUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.AnalyticsEventUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>;
          };
          aggregate: {
            args: Prisma.AnalyticsEventAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAnalyticsEvent>;
          };
          groupBy: {
            args: Prisma.AnalyticsEventGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AnalyticsEventGroupByOutputType>[];
          };
          count: {
            args: Prisma.AnalyticsEventCountArgs<ExtArgs>;
            result: $Utils.Optional<AnalyticsEventCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
  }

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition
    ? T["emit"] extends "event"
      ? T["level"]
      : never
    : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    devices: number;
    watchlist: number;
    continueWatching: number;
    watchedEpisodes: number;
    auditLogs: number;
    analyticsEvents: number;
    payments: number;
  };

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devices?: boolean | UserCountOutputTypeCountDevicesArgs;
    watchlist?: boolean | UserCountOutputTypeCountWatchlistArgs;
    continueWatching?: boolean | UserCountOutputTypeCountContinueWatchingArgs;
    watchedEpisodes?: boolean | UserCountOutputTypeCountWatchedEpisodesArgs;
    auditLogs?: boolean | UserCountOutputTypeCountAuditLogsArgs;
    analyticsEvents?: boolean | UserCountOutputTypeCountAnalyticsEventsArgs;
    payments?: boolean | UserCountOutputTypeCountPaymentsArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: DeviceWhereInput;
    };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWatchlistArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WatchlistItemWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountContinueWatchingArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ContinueWatchingWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWatchedEpisodesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WatchedEpisodeWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditLogsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AuditLogWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAnalyticsEventsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AnalyticsEventWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: PaymentWhereInput;
    };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: $Enums.Role | null;
    isVerified: boolean | null;
    authUserId: string | null;
    subscriptionTier: $Enums.SubscriptionTier | null;
    subscriptionExpiry: Date | null;
    currencyPreference: string | null;
    trialStartDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: $Enums.Role | null;
    isVerified: boolean | null;
    authUserId: string | null;
    subscriptionTier: $Enums.SubscriptionTier | null;
    subscriptionExpiry: Date | null;
    currencyPreference: string | null;
    trialStartDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    username: number;
    displayName: number;
    bio: number;
    avatarUrl: number;
    role: number;
    isVerified: number;
    authUserId: number;
    subscriptionTier: number;
    subscriptionExpiry: number;
    currencyPreference: number;
    trialStartDate: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    displayName?: true;
    bio?: true;
    avatarUrl?: true;
    role?: true;
    isVerified?: true;
    authUserId?: true;
    subscriptionTier?: true;
    subscriptionExpiry?: true;
    currencyPreference?: true;
    trialStartDate?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    displayName?: true;
    bio?: true;
    avatarUrl?: true;
    role?: true;
    isVerified?: true;
    authUserId?: true;
    subscriptionTier?: true;
    subscriptionExpiry?: true;
    currencyPreference?: true;
    trialStartDate?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    displayName?: true;
    bio?: true;
    avatarUrl?: true;
    role?: true;
    isVerified?: true;
    authUserId?: true;
    subscriptionTier?: true;
    subscriptionExpiry?: true;
    currencyPreference?: true;
    trialStartDate?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput;
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
    by: UserScalarFieldEnum[] | UserScalarFieldEnum;
    having?: UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
  };

  export type UserGroupByOutputType = {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: $Enums.Role;
    isVerified: boolean;
    authUserId: string;
    subscriptionTier: $Enums.SubscriptionTier;
    subscriptionExpiry: Date | null;
    currencyPreference: string;
    trialStartDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      username?: boolean;
      displayName?: boolean;
      bio?: boolean;
      avatarUrl?: boolean;
      role?: boolean;
      isVerified?: boolean;
      authUserId?: boolean;
      subscriptionTier?: boolean;
      subscriptionExpiry?: boolean;
      currencyPreference?: boolean;
      trialStartDate?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      settings?: boolean | User$settingsArgs<ExtArgs>;
      devices?: boolean | User$devicesArgs<ExtArgs>;
      watchlist?: boolean | User$watchlistArgs<ExtArgs>;
      continueWatching?: boolean | User$continueWatchingArgs<ExtArgs>;
      watchedEpisodes?: boolean | User$watchedEpisodesArgs<ExtArgs>;
      auditLogs?: boolean | User$auditLogsArgs<ExtArgs>;
      analyticsEvents?: boolean | User$analyticsEventsArgs<ExtArgs>;
      payments?: boolean | User$paymentsArgs<ExtArgs>;
      _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        email?: boolean;
        username?: boolean;
        displayName?: boolean;
        bio?: boolean;
        avatarUrl?: boolean;
        role?: boolean;
        isVerified?: boolean;
        authUserId?: boolean;
        subscriptionTier?: boolean;
        subscriptionExpiry?: boolean;
        currencyPreference?: boolean;
        trialStartDate?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
      },
      ExtArgs["result"]["user"]
    >;

  export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    username?: boolean;
    displayName?: boolean;
    bio?: boolean;
    avatarUrl?: boolean;
    role?: boolean;
    isVerified?: boolean;
    authUserId?: boolean;
    subscriptionTier?: boolean;
    subscriptionExpiry?: boolean;
    currencyPreference?: boolean;
    trialStartDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    settings?: boolean | User$settingsArgs<ExtArgs>;
    devices?: boolean | User$devicesArgs<ExtArgs>;
    watchlist?: boolean | User$watchlistArgs<ExtArgs>;
    continueWatching?: boolean | User$continueWatchingArgs<ExtArgs>;
    watchedEpisodes?: boolean | User$watchedEpisodesArgs<ExtArgs>;
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>;
    analyticsEvents?: boolean | User$analyticsEventsArgs<ExtArgs>;
    payments?: boolean | User$paymentsArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {};

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User";
    objects: {
      settings: Prisma.$UserSettingsPayload<ExtArgs> | null;
      devices: Prisma.$DevicePayload<ExtArgs>[];
      watchlist: Prisma.$WatchlistItemPayload<ExtArgs>[];
      continueWatching: Prisma.$ContinueWatchingPayload<ExtArgs>[];
      watchedEpisodes: Prisma.$WatchedEpisodePayload<ExtArgs>[];
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[];
      analyticsEvents: Prisma.$AnalyticsEventPayload<ExtArgs>[];
      payments: Prisma.$PaymentPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        email: string;
        username: string;
        displayName: string | null;
        bio: string | null;
        avatarUrl: string | null;
        role: $Enums.Role;
        isVerified: boolean;
        authUserId: string;
        subscriptionTier: $Enums.SubscriptionTier;
        subscriptionExpiry: Date | null;
        currencyPreference: string;
        trialStartDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["user"]
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<
    Prisma.$UserPayload,
    S
  >;

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["User"]; meta: { name: "User" } };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
    ): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs["orderBy"] }
        : { orderBy?: UserGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    settings<T extends User$settingsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$settingsArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<
      $Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null,
      null,
      ExtArgs
    >;
    devices<T extends User$devicesArgs<ExtArgs> = {}>(
      args?: Subset<T, User$devicesArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findMany"> | Null>;
    watchlist<T extends User$watchlistArgs<ExtArgs> = {}>(
      args?: Subset<T, User$watchlistArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findMany"> | Null>;
    continueWatching<T extends User$continueWatchingArgs<ExtArgs> = {}>(
      args?: Subset<T, User$continueWatchingArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findMany"> | Null>;
    watchedEpisodes<T extends User$watchedEpisodesArgs<ExtArgs> = {}>(
      args?: Subset<T, User$watchedEpisodesArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findMany"> | Null>;
    auditLogs<T extends User$auditLogsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$auditLogsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany"> | Null>;
    analyticsEvents<T extends User$analyticsEventsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$analyticsEventsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findMany"> | Null>;
    payments<T extends User$paymentsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$paymentsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany"> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", "String">;
    readonly email: FieldRef<"User", "String">;
    readonly username: FieldRef<"User", "String">;
    readonly displayName: FieldRef<"User", "String">;
    readonly bio: FieldRef<"User", "String">;
    readonly avatarUrl: FieldRef<"User", "String">;
    readonly role: FieldRef<"User", "Role">;
    readonly isVerified: FieldRef<"User", "Boolean">;
    readonly authUserId: FieldRef<"User", "String">;
    readonly subscriptionTier: FieldRef<"User", "SubscriptionTier">;
    readonly subscriptionExpiry: FieldRef<"User", "DateTime">;
    readonly currencyPreference: FieldRef<"User", "String">;
    readonly trialStartDate: FieldRef<"User", "DateTime">;
    readonly createdAt: FieldRef<"User", "DateTime">;
    readonly updatedAt: FieldRef<"User", "DateTime">;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
  };

  /**
   * User.settings
   */
  export type User$settingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    where?: UserSettingsWhereInput;
  };

  /**
   * User.devices
   */
  export type User$devicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    where?: DeviceWhereInput;
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[];
    cursor?: DeviceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[];
  };

  /**
   * User.watchlist
   */
  export type User$watchlistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    where?: WatchlistItemWhereInput;
    orderBy?: WatchlistItemOrderByWithRelationInput | WatchlistItemOrderByWithRelationInput[];
    cursor?: WatchlistItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: WatchlistItemScalarFieldEnum | WatchlistItemScalarFieldEnum[];
  };

  /**
   * User.continueWatching
   */
  export type User$continueWatchingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    where?: ContinueWatchingWhereInput;
    orderBy?: ContinueWatchingOrderByWithRelationInput | ContinueWatchingOrderByWithRelationInput[];
    cursor?: ContinueWatchingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ContinueWatchingScalarFieldEnum | ContinueWatchingScalarFieldEnum[];
  };

  /**
   * User.watchedEpisodes
   */
  export type User$watchedEpisodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    where?: WatchedEpisodeWhereInput;
    orderBy?: WatchedEpisodeOrderByWithRelationInput | WatchedEpisodeOrderByWithRelationInput[];
    cursor?: WatchedEpisodeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: WatchedEpisodeScalarFieldEnum | WatchedEpisodeScalarFieldEnum[];
  };

  /**
   * User.auditLogs
   */
  export type User$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    where?: AuditLogWhereInput;
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[];
    cursor?: AuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * User.analyticsEvents
   */
  export type User$analyticsEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    where?: AnalyticsEventWhereInput;
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[];
    cursor?: AnalyticsEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[];
  };

  /**
   * User.payments
   */
  export type User$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    where?: PaymentWhereInput;
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[];
    cursor?: PaymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
  };

  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null;
    _avg: PaymentAvgAggregateOutputType | null;
    _sum: PaymentSumAggregateOutputType | null;
    _min: PaymentMinAggregateOutputType | null;
    _max: PaymentMaxAggregateOutputType | null;
  };

  export type PaymentAvgAggregateOutputType = {
    amount: number | null;
  };

  export type PaymentSumAggregateOutputType = {
    amount: number | null;
  };

  export type PaymentMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    orderId: string | null;
    amount: number | null;
    currency: string | null;
    status: string | null;
    paymentId: string | null;
    method: string | null;
    createdAt: Date | null;
  };

  export type PaymentMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    orderId: string | null;
    amount: number | null;
    currency: string | null;
    status: string | null;
    paymentId: string | null;
    method: string | null;
    createdAt: Date | null;
  };

  export type PaymentCountAggregateOutputType = {
    id: number;
    userId: number;
    orderId: number;
    amount: number;
    currency: number;
    status: number;
    paymentId: number;
    method: number;
    createdAt: number;
    _all: number;
  };

  export type PaymentAvgAggregateInputType = {
    amount?: true;
  };

  export type PaymentSumAggregateInputType = {
    amount?: true;
  };

  export type PaymentMinAggregateInputType = {
    id?: true;
    userId?: true;
    orderId?: true;
    amount?: true;
    currency?: true;
    status?: true;
    paymentId?: true;
    method?: true;
    createdAt?: true;
  };

  export type PaymentMaxAggregateInputType = {
    id?: true;
    userId?: true;
    orderId?: true;
    amount?: true;
    currency?: true;
    status?: true;
    paymentId?: true;
    method?: true;
    createdAt?: true;
  };

  export type PaymentCountAggregateInputType = {
    id?: true;
    userId?: true;
    orderId?: true;
    amount?: true;
    currency?: true;
    status?: true;
    paymentId?: true;
    method?: true;
    createdAt?: true;
    _all?: true;
  };

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Payments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Payments
     **/
    _count?: true | PaymentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PaymentAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PaymentSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PaymentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PaymentMaxAggregateInputType;
  };

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
    [P in keyof T & keyof AggregatePayment]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>;
  };

  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput;
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[];
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum;
    having?: PaymentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PaymentCountAggregateInputType | true;
    _avg?: PaymentAvgAggregateInputType;
    _sum?: PaymentSumAggregateInputType;
    _min?: PaymentMinAggregateInputType;
    _max?: PaymentMaxAggregateInputType;
  };

  export type PaymentGroupByOutputType = {
    id: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentId: string | null;
    method: string | null;
    createdAt: Date;
    _count: PaymentCountAggregateOutputType | null;
    _avg: PaymentAvgAggregateOutputType | null;
    _sum: PaymentSumAggregateOutputType | null;
    _min: PaymentMinAggregateOutputType | null;
    _max: PaymentMaxAggregateOutputType | null;
  };

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof PaymentGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
          : GetScalarType<T[P], PaymentGroupByOutputType[P]>;
      }
    >
  >;

  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      orderId?: boolean;
      amount?: boolean;
      currency?: boolean;
      status?: boolean;
      paymentId?: boolean;
      method?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["payment"]
  >;

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        orderId?: boolean;
        amount?: boolean;
        currency?: boolean;
        status?: boolean;
        paymentId?: boolean;
        method?: boolean;
        createdAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["payment"]
    >;

  export type PaymentSelectScalar = {
    id?: boolean;
    userId?: boolean;
    orderId?: boolean;
    amount?: boolean;
    currency?: boolean;
    status?: boolean;
    paymentId?: boolean;
    method?: boolean;
    createdAt?: boolean;
  };

  export type PaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type PaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        paymentId: string | null;
        method: string | null;
        createdAt: Date;
      },
      ExtArgs["result"]["payment"]
    >;
    composites: {};
  };

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<
    Prisma.$PaymentPayload,
    S
  >;

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    PaymentFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: PaymentCountAggregateInputType | true;
  };

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["Payment"]; meta: { name: "Payment" } };
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(
      args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>;

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PaymentClient<
      $Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(
      args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>;

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>;

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     *
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PaymentFindManyArgs>(
      args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     *
     */
    create<T extends PaymentCreateArgs>(
      args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create">, never, ExtArgs>;

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PaymentCreateManyArgs>(
      args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     *
     */
    delete<T extends PaymentDeleteArgs>(
      args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete">, never, ExtArgs>;

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PaymentUpdateArgs>(
      args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update">, never, ExtArgs>;

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PaymentDeleteManyArgs>(
      args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PaymentUpdateManyArgs>(
      args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(
      args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>
    ): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>;

    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
     **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], PaymentCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PaymentAggregateArgs>(
      args: Subset<T, PaymentAggregateArgs>
    ): Prisma.PrismaPromise<GetPaymentAggregateType<T>>;

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs["orderBy"] }
        : { orderBy?: PaymentGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Payment model
     */
    readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Payment model
   */
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", "String">;
    readonly userId: FieldRef<"Payment", "String">;
    readonly orderId: FieldRef<"Payment", "String">;
    readonly amount: FieldRef<"Payment", "Float">;
    readonly currency: FieldRef<"Payment", "String">;
    readonly status: FieldRef<"Payment", "String">;
    readonly paymentId: FieldRef<"Payment", "String">;
    readonly method: FieldRef<"Payment", "String">;
    readonly createdAt: FieldRef<"Payment", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput;
  };

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput;
  };

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Payments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[];
  };

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Payments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[];
  };

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Payments.
     */
    skip?: number;
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[];
  };

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>;
  };

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>;
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput;
  };

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>;
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput;
  };

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput;
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>;
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>;
  };

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput;
  };

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput;
  };

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null;
  };

  /**
   * Model UserSettings
   */

  export type AggregateUserSettings = {
    _count: UserSettingsCountAggregateOutputType | null;
    _min: UserSettingsMinAggregateOutputType | null;
    _max: UserSettingsMaxAggregateOutputType | null;
  };

  export type UserSettingsMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    language: string | null;
    autoplay: boolean | null;
    preferredProvider: string | null;
    subtitleLang: string | null;
    quality: string | null;
    notifications: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserSettingsMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    language: string | null;
    autoplay: boolean | null;
    preferredProvider: string | null;
    subtitleLang: string | null;
    quality: string | null;
    notifications: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserSettingsCountAggregateOutputType = {
    id: number;
    userId: number;
    language: number;
    autoplay: number;
    preferredProvider: number;
    subtitleLang: number;
    quality: number;
    notifications: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type UserSettingsMinAggregateInputType = {
    id?: true;
    userId?: true;
    language?: true;
    autoplay?: true;
    preferredProvider?: true;
    subtitleLang?: true;
    quality?: true;
    notifications?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserSettingsMaxAggregateInputType = {
    id?: true;
    userId?: true;
    language?: true;
    autoplay?: true;
    preferredProvider?: true;
    subtitleLang?: true;
    quality?: true;
    notifications?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserSettingsCountAggregateInputType = {
    id?: true;
    userId?: true;
    language?: true;
    autoplay?: true;
    preferredProvider?: true;
    subtitleLang?: true;
    quality?: true;
    notifications?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type UserSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSettings to aggregate.
     */
    where?: UserSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserSettings
     **/
    _count?: true | UserSettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserSettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserSettingsMaxAggregateInputType;
  };

  export type GetUserSettingsAggregateType<T extends UserSettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateUserSettings]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSettings[P]>
      : GetScalarType<T[P], AggregateUserSettings[P]>;
  };

  export type UserSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSettingsWhereInput;
    orderBy?: UserSettingsOrderByWithAggregationInput | UserSettingsOrderByWithAggregationInput[];
    by: UserSettingsScalarFieldEnum[] | UserSettingsScalarFieldEnum;
    having?: UserSettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserSettingsCountAggregateInputType | true;
    _min?: UserSettingsMinAggregateInputType;
    _max?: UserSettingsMaxAggregateInputType;
  };

  export type UserSettingsGroupByOutputType = {
    id: string;
    userId: string;
    language: string;
    autoplay: boolean;
    preferredProvider: string | null;
    subtitleLang: string | null;
    quality: string | null;
    notifications: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: UserSettingsCountAggregateOutputType | null;
    _min: UserSettingsMinAggregateOutputType | null;
    _max: UserSettingsMaxAggregateOutputType | null;
  };

  type GetUserSettingsGroupByPayload<T extends UserSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSettingsGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserSettingsGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserSettingsGroupByOutputType[P]>
          : GetScalarType<T[P], UserSettingsGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        language?: boolean;
        autoplay?: boolean;
        preferredProvider?: boolean;
        subtitleLang?: boolean;
        quality?: boolean;
        notifications?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["userSettings"]
    >;

  export type UserSettingsSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      language?: boolean;
      autoplay?: boolean;
      preferredProvider?: boolean;
      subtitleLang?: boolean;
      quality?: boolean;
      notifications?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["userSettings"]
  >;

  export type UserSettingsSelectScalar = {
    id?: boolean;
    userId?: boolean;
    language?: boolean;
    autoplay?: boolean;
    preferredProvider?: boolean;
    subtitleLang?: boolean;
    quality?: boolean;
    notifications?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type UserSettingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type UserSettingsIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $UserSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSettings";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        language: string;
        autoplay: boolean;
        preferredProvider: string | null;
        subtitleLang: string | null;
        quality: string | null;
        notifications: boolean;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["userSettings"]
    >;
    composites: {};
  };

  type UserSettingsGetPayload<S extends boolean | null | undefined | UserSettingsDefaultArgs> = $Result.GetResult<
    Prisma.$UserSettingsPayload,
    S
  >;

  type UserSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserSettingsFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: UserSettingsCountAggregateInputType | true;
  };

  export interface UserSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["UserSettings"]; meta: { name: "UserSettings" } };
    /**
     * Find zero or one UserSettings that matches the filter.
     * @param {UserSettingsFindUniqueArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSettingsFindUniqueArgs>(
      args: SelectSubset<T, UserSettingsFindUniqueArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<
      $Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one UserSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserSettingsFindUniqueOrThrowArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSettingsFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserSettingsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<
      $Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first UserSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindFirstArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSettingsFindFirstArgs>(
      args?: SelectSubset<T, UserSettingsFindFirstArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<
      $Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first UserSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindFirstOrThrowArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSettingsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserSettingsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<
      $Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more UserSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSettings
     * const userSettings = await prisma.userSettings.findMany()
     *
     * // Get first 10 UserSettings
     * const userSettings = await prisma.userSettings.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userSettingsWithIdOnly = await prisma.userSettings.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserSettingsFindManyArgs>(
      args?: SelectSubset<T, UserSettingsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a UserSettings.
     * @param {UserSettingsCreateArgs} args - Arguments to create a UserSettings.
     * @example
     * // Create one UserSettings
     * const UserSettings = await prisma.userSettings.create({
     *   data: {
     *     // ... data to create a UserSettings
     *   }
     * })
     *
     */
    create<T extends UserSettingsCreateArgs>(
      args: SelectSubset<T, UserSettingsCreateArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "create">, never, ExtArgs>;

    /**
     * Create many UserSettings.
     * @param {UserSettingsCreateManyArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSettings = await prisma.userSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserSettingsCreateManyArgs>(
      args?: SelectSubset<T, UserSettingsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many UserSettings and returns the data saved in the database.
     * @param {UserSettingsCreateManyAndReturnArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSettings = await prisma.userSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserSettings and only return the `id`
     * const userSettingsWithIdOnly = await prisma.userSettings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserSettingsCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserSettingsCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a UserSettings.
     * @param {UserSettingsDeleteArgs} args - Arguments to delete one UserSettings.
     * @example
     * // Delete one UserSettings
     * const UserSettings = await prisma.userSettings.delete({
     *   where: {
     *     // ... filter to delete one UserSettings
     *   }
     * })
     *
     */
    delete<T extends UserSettingsDeleteArgs>(
      args: SelectSubset<T, UserSettingsDeleteArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "delete">, never, ExtArgs>;

    /**
     * Update one UserSettings.
     * @param {UserSettingsUpdateArgs} args - Arguments to update one UserSettings.
     * @example
     * // Update one UserSettings
     * const userSettings = await prisma.userSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserSettingsUpdateArgs>(
      args: SelectSubset<T, UserSettingsUpdateArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "update">, never, ExtArgs>;

    /**
     * Delete zero or more UserSettings.
     * @param {UserSettingsDeleteManyArgs} args - Arguments to filter UserSettings to delete.
     * @example
     * // Delete a few UserSettings
     * const { count } = await prisma.userSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserSettingsDeleteManyArgs>(
      args?: SelectSubset<T, UserSettingsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSettings
     * const userSettings = await prisma.userSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserSettingsUpdateManyArgs>(
      args: SelectSubset<T, UserSettingsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one UserSettings.
     * @param {UserSettingsUpsertArgs} args - Arguments to update or create a UserSettings.
     * @example
     * // Update or create a UserSettings
     * const userSettings = await prisma.userSettings.upsert({
     *   create: {
     *     // ... data to create a UserSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSettings we want to update
     *   }
     * })
     */
    upsert<T extends UserSettingsUpsertArgs>(
      args: SelectSubset<T, UserSettingsUpsertArgs<ExtArgs>>
    ): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>;

    /**
     * Count the number of UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsCountArgs} args - Arguments to filter UserSettings to count.
     * @example
     * // Count the number of UserSettings
     * const count = await prisma.userSettings.count({
     *   where: {
     *     // ... the filter for the UserSettings we want to count
     *   }
     * })
     **/
    count<T extends UserSettingsCountArgs>(
      args?: Subset<T, UserSettingsCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserSettingsCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserSettingsAggregateArgs>(
      args: Subset<T, UserSettingsAggregateArgs>
    ): Prisma.PrismaPromise<GetUserSettingsAggregateType<T>>;

    /**
     * Group by UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserSettingsGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: UserSettingsGroupByArgs["orderBy"] }
        : { orderBy?: UserSettingsGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, UserSettingsGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetUserSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserSettings model
     */
    readonly fields: UserSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSettingsClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the UserSettings model
   */
  interface UserSettingsFieldRefs {
    readonly id: FieldRef<"UserSettings", "String">;
    readonly userId: FieldRef<"UserSettings", "String">;
    readonly language: FieldRef<"UserSettings", "String">;
    readonly autoplay: FieldRef<"UserSettings", "Boolean">;
    readonly preferredProvider: FieldRef<"UserSettings", "String">;
    readonly subtitleLang: FieldRef<"UserSettings", "String">;
    readonly quality: FieldRef<"UserSettings", "String">;
    readonly notifications: FieldRef<"UserSettings", "Boolean">;
    readonly createdAt: FieldRef<"UserSettings", "DateTime">;
    readonly updatedAt: FieldRef<"UserSettings", "DateTime">;
  }

  // Custom InputTypes
  /**
   * UserSettings findUnique
   */
  export type UserSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where: UserSettingsWhereUniqueInput;
  };

  /**
   * UserSettings findUniqueOrThrow
   */
  export type UserSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where: UserSettingsWhereUniqueInput;
  };

  /**
   * UserSettings findFirst
   */
  export type UserSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[];
  };

  /**
   * UserSettings findFirstOrThrow
   */
  export type UserSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[];
  };

  /**
   * UserSettings findMany
   */
  export type UserSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[];
  };

  /**
   * UserSettings create
   */
  export type UserSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * The data needed to create a UserSettings.
     */
    data: XOR<UserSettingsCreateInput, UserSettingsUncheckedCreateInput>;
  };

  /**
   * UserSettings createMany
   */
  export type UserSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSettings.
     */
    data: UserSettingsCreateManyInput | UserSettingsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * UserSettings createManyAndReturn
   */
  export type UserSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the UserSettings
       */
      select?: UserSettingsSelectCreateManyAndReturn<ExtArgs> | null;
      /**
       * The data used to create many UserSettings.
       */
      data: UserSettingsCreateManyInput | UserSettingsCreateManyInput[];
      skipDuplicates?: boolean;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserSettingsIncludeCreateManyAndReturn<ExtArgs> | null;
    };

  /**
   * UserSettings update
   */
  export type UserSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * The data needed to update a UserSettings.
     */
    data: XOR<UserSettingsUpdateInput, UserSettingsUncheckedUpdateInput>;
    /**
     * Choose, which UserSettings to update.
     */
    where: UserSettingsWhereUniqueInput;
  };

  /**
   * UserSettings updateMany
   */
  export type UserSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSettings.
     */
    data: XOR<UserSettingsUpdateManyMutationInput, UserSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which UserSettings to update
     */
    where?: UserSettingsWhereInput;
  };

  /**
   * UserSettings upsert
   */
  export type UserSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * The filter to search for the UserSettings to update in case it exists.
     */
    where: UserSettingsWhereUniqueInput;
    /**
     * In case the UserSettings found by the `where` argument doesn't exist, create a new UserSettings with this data.
     */
    create: XOR<UserSettingsCreateInput, UserSettingsUncheckedCreateInput>;
    /**
     * In case the UserSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSettingsUpdateInput, UserSettingsUncheckedUpdateInput>;
  };

  /**
   * UserSettings delete
   */
  export type UserSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
    /**
     * Filter which UserSettings to delete.
     */
    where: UserSettingsWhereUniqueInput;
  };

  /**
   * UserSettings deleteMany
   */
  export type UserSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSettings to delete
     */
    where?: UserSettingsWhereInput;
  };

  /**
   * UserSettings without action
   */
  export type UserSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingsInclude<ExtArgs> | null;
  };

  /**
   * Model Device
   */

  export type AggregateDevice = {
    _count: DeviceCountAggregateOutputType | null;
    _min: DeviceMinAggregateOutputType | null;
    _max: DeviceMaxAggregateOutputType | null;
  };

  export type DeviceMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    deviceId: string | null;
    deviceName: string | null;
    platform: string | null;
    browser: string | null;
    appVersion: string | null;
    lastActive: Date | null;
    lastIp: string | null;
    createdAt: Date | null;
  };

  export type DeviceMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    deviceId: string | null;
    deviceName: string | null;
    platform: string | null;
    browser: string | null;
    appVersion: string | null;
    lastActive: Date | null;
    lastIp: string | null;
    createdAt: Date | null;
  };

  export type DeviceCountAggregateOutputType = {
    id: number;
    userId: number;
    deviceId: number;
    deviceName: number;
    platform: number;
    browser: number;
    appVersion: number;
    lastActive: number;
    lastIp: number;
    createdAt: number;
    _all: number;
  };

  export type DeviceMinAggregateInputType = {
    id?: true;
    userId?: true;
    deviceId?: true;
    deviceName?: true;
    platform?: true;
    browser?: true;
    appVersion?: true;
    lastActive?: true;
    lastIp?: true;
    createdAt?: true;
  };

  export type DeviceMaxAggregateInputType = {
    id?: true;
    userId?: true;
    deviceId?: true;
    deviceName?: true;
    platform?: true;
    browser?: true;
    appVersion?: true;
    lastActive?: true;
    lastIp?: true;
    createdAt?: true;
  };

  export type DeviceCountAggregateInputType = {
    id?: true;
    userId?: true;
    deviceId?: true;
    deviceName?: true;
    platform?: true;
    browser?: true;
    appVersion?: true;
    lastActive?: true;
    lastIp?: true;
    createdAt?: true;
    _all?: true;
  };

  export type DeviceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Device to aggregate.
     */
    where?: DeviceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DeviceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Devices.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Devices
     **/
    _count?: true | DeviceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DeviceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DeviceMaxAggregateInputType;
  };

  export type GetDeviceAggregateType<T extends DeviceAggregateArgs> = {
    [P in keyof T & keyof AggregateDevice]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDevice[P]>
      : GetScalarType<T[P], AggregateDevice[P]>;
  };

  export type DeviceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceWhereInput;
    orderBy?: DeviceOrderByWithAggregationInput | DeviceOrderByWithAggregationInput[];
    by: DeviceScalarFieldEnum[] | DeviceScalarFieldEnum;
    having?: DeviceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DeviceCountAggregateInputType | true;
    _min?: DeviceMinAggregateInputType;
    _max?: DeviceMaxAggregateInputType;
  };

  export type DeviceGroupByOutputType = {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string | null;
    platform: string | null;
    browser: string | null;
    appVersion: string | null;
    lastActive: Date;
    lastIp: string | null;
    createdAt: Date;
    _count: DeviceCountAggregateOutputType | null;
    _min: DeviceMinAggregateOutputType | null;
    _max: DeviceMaxAggregateOutputType | null;
  };

  type GetDeviceGroupByPayload<T extends DeviceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeviceGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof DeviceGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DeviceGroupByOutputType[P]>
          : GetScalarType<T[P], DeviceGroupByOutputType[P]>;
      }
    >
  >;

  export type DeviceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      deviceId?: boolean;
      deviceName?: boolean;
      platform?: boolean;
      browser?: boolean;
      appVersion?: boolean;
      lastActive?: boolean;
      lastIp?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["device"]
  >;

  export type DeviceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        deviceId?: boolean;
        deviceName?: boolean;
        platform?: boolean;
        browser?: boolean;
        appVersion?: boolean;
        lastActive?: boolean;
        lastIp?: boolean;
        createdAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["device"]
    >;

  export type DeviceSelectScalar = {
    id?: boolean;
    userId?: boolean;
    deviceId?: boolean;
    deviceName?: boolean;
    platform?: boolean;
    browser?: boolean;
    appVersion?: boolean;
    lastActive?: boolean;
    lastIp?: boolean;
    createdAt?: boolean;
  };

  export type DeviceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type DeviceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $DevicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Device";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        deviceId: string;
        deviceName: string | null;
        platform: string | null;
        browser: string | null;
        appVersion: string | null;
        lastActive: Date;
        lastIp: string | null;
        createdAt: Date;
      },
      ExtArgs["result"]["device"]
    >;
    composites: {};
  };

  type DeviceGetPayload<S extends boolean | null | undefined | DeviceDefaultArgs> = $Result.GetResult<
    Prisma.$DevicePayload,
    S
  >;

  type DeviceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    DeviceFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: DeviceCountAggregateInputType | true;
  };

  export interface DeviceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["Device"]; meta: { name: "Device" } };
    /**
     * Find zero or one Device that matches the filter.
     * @param {DeviceFindUniqueArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeviceFindUniqueArgs>(
      args: SelectSubset<T, DeviceFindUniqueArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>;

    /**
     * Find one Device that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeviceFindUniqueOrThrowArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeviceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DeviceFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>;

    /**
     * Find the first Device that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindFirstArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeviceFindFirstArgs>(
      args?: SelectSubset<T, DeviceFindFirstArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>;

    /**
     * Find the first Device that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindFirstOrThrowArgs} args - Arguments to find a Device
     * @example
     * // Get one Device
     * const device = await prisma.device.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeviceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DeviceFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>;

    /**
     * Find zero or more Devices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Devices
     * const devices = await prisma.device.findMany()
     *
     * // Get first 10 Devices
     * const devices = await prisma.device.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const deviceWithIdOnly = await prisma.device.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DeviceFindManyArgs>(
      args?: SelectSubset<T, DeviceFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a Device.
     * @param {DeviceCreateArgs} args - Arguments to create a Device.
     * @example
     * // Create one Device
     * const Device = await prisma.device.create({
     *   data: {
     *     // ... data to create a Device
     *   }
     * })
     *
     */
    create<T extends DeviceCreateArgs>(
      args: SelectSubset<T, DeviceCreateArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "create">, never, ExtArgs>;

    /**
     * Create many Devices.
     * @param {DeviceCreateManyArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const device = await prisma.device.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DeviceCreateManyArgs>(
      args?: SelectSubset<T, DeviceCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Devices and returns the data saved in the database.
     * @param {DeviceCreateManyAndReturnArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const device = await prisma.device.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Devices and only return the `id`
     * const deviceWithIdOnly = await prisma.device.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DeviceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DeviceCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a Device.
     * @param {DeviceDeleteArgs} args - Arguments to delete one Device.
     * @example
     * // Delete one Device
     * const Device = await prisma.device.delete({
     *   where: {
     *     // ... filter to delete one Device
     *   }
     * })
     *
     */
    delete<T extends DeviceDeleteArgs>(
      args: SelectSubset<T, DeviceDeleteArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "delete">, never, ExtArgs>;

    /**
     * Update one Device.
     * @param {DeviceUpdateArgs} args - Arguments to update one Device.
     * @example
     * // Update one Device
     * const device = await prisma.device.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DeviceUpdateArgs>(
      args: SelectSubset<T, DeviceUpdateArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "update">, never, ExtArgs>;

    /**
     * Delete zero or more Devices.
     * @param {DeviceDeleteManyArgs} args - Arguments to filter Devices to delete.
     * @example
     * // Delete a few Devices
     * const { count } = await prisma.device.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DeviceDeleteManyArgs>(
      args?: SelectSubset<T, DeviceDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Devices
     * const device = await prisma.device.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DeviceUpdateManyArgs>(
      args: SelectSubset<T, DeviceUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Device.
     * @param {DeviceUpsertArgs} args - Arguments to update or create a Device.
     * @example
     * // Update or create a Device
     * const device = await prisma.device.upsert({
     *   create: {
     *     // ... data to create a Device
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Device we want to update
     *   }
     * })
     */
    upsert<T extends DeviceUpsertArgs>(
      args: SelectSubset<T, DeviceUpsertArgs<ExtArgs>>
    ): Prisma__DeviceClient<$Result.GetResult<Prisma.$DevicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>;

    /**
     * Count the number of Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceCountArgs} args - Arguments to filter Devices to count.
     * @example
     * // Count the number of Devices
     * const count = await prisma.device.count({
     *   where: {
     *     // ... the filter for the Devices we want to count
     *   }
     * })
     **/
    count<T extends DeviceCountArgs>(
      args?: Subset<T, DeviceCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], DeviceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Device.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DeviceAggregateArgs>(
      args: Subset<T, DeviceAggregateArgs>
    ): Prisma.PrismaPromise<GetDeviceAggregateType<T>>;

    /**
     * Group by Device.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DeviceGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: DeviceGroupByArgs["orderBy"] }
        : { orderBy?: DeviceGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, DeviceGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetDeviceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Device model
     */
    readonly fields: DeviceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Device.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeviceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Device model
   */
  interface DeviceFieldRefs {
    readonly id: FieldRef<"Device", "String">;
    readonly userId: FieldRef<"Device", "String">;
    readonly deviceId: FieldRef<"Device", "String">;
    readonly deviceName: FieldRef<"Device", "String">;
    readonly platform: FieldRef<"Device", "String">;
    readonly browser: FieldRef<"Device", "String">;
    readonly appVersion: FieldRef<"Device", "String">;
    readonly lastActive: FieldRef<"Device", "DateTime">;
    readonly lastIp: FieldRef<"Device", "String">;
    readonly createdAt: FieldRef<"Device", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Device findUnique
   */
  export type DeviceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter, which Device to fetch.
     */
    where: DeviceWhereUniqueInput;
  };

  /**
   * Device findUniqueOrThrow
   */
  export type DeviceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter, which Device to fetch.
     */
    where: DeviceWhereUniqueInput;
  };

  /**
   * Device findFirst
   */
  export type DeviceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter, which Device to fetch.
     */
    where?: DeviceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Devices.
     */
    cursor?: DeviceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Devices.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Devices.
     */
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[];
  };

  /**
   * Device findFirstOrThrow
   */
  export type DeviceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter, which Device to fetch.
     */
    where?: DeviceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Devices.
     */
    cursor?: DeviceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Devices.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Devices.
     */
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[];
  };

  /**
   * Device findMany
   */
  export type DeviceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter, which Devices to fetch.
     */
    where?: DeviceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Devices to fetch.
     */
    orderBy?: DeviceOrderByWithRelationInput | DeviceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Devices.
     */
    cursor?: DeviceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Devices.
     */
    skip?: number;
    distinct?: DeviceScalarFieldEnum | DeviceScalarFieldEnum[];
  };

  /**
   * Device create
   */
  export type DeviceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * The data needed to create a Device.
     */
    data: XOR<DeviceCreateInput, DeviceUncheckedCreateInput>;
  };

  /**
   * Device createMany
   */
  export type DeviceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Devices.
     */
    data: DeviceCreateManyInput | DeviceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Device createManyAndReturn
   */
  export type DeviceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Devices.
     */
    data: DeviceCreateManyInput | DeviceCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Device update
   */
  export type DeviceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * The data needed to update a Device.
     */
    data: XOR<DeviceUpdateInput, DeviceUncheckedUpdateInput>;
    /**
     * Choose, which Device to update.
     */
    where: DeviceWhereUniqueInput;
  };

  /**
   * Device updateMany
   */
  export type DeviceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Devices.
     */
    data: XOR<DeviceUpdateManyMutationInput, DeviceUncheckedUpdateManyInput>;
    /**
     * Filter which Devices to update
     */
    where?: DeviceWhereInput;
  };

  /**
   * Device upsert
   */
  export type DeviceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * The filter to search for the Device to update in case it exists.
     */
    where: DeviceWhereUniqueInput;
    /**
     * In case the Device found by the `where` argument doesn't exist, create a new Device with this data.
     */
    create: XOR<DeviceCreateInput, DeviceUncheckedCreateInput>;
    /**
     * In case the Device was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeviceUpdateInput, DeviceUncheckedUpdateInput>;
  };

  /**
   * Device delete
   */
  export type DeviceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
    /**
     * Filter which Device to delete.
     */
    where: DeviceWhereUniqueInput;
  };

  /**
   * Device deleteMany
   */
  export type DeviceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devices to delete
     */
    where?: DeviceWhereInput;
  };

  /**
   * Device without action
   */
  export type DeviceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Device
     */
    select?: DeviceSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeviceInclude<ExtArgs> | null;
  };

  /**
   * Model WatchlistItem
   */

  export type AggregateWatchlistItem = {
    _count: WatchlistItemCountAggregateOutputType | null;
    _avg: WatchlistItemAvgAggregateOutputType | null;
    _sum: WatchlistItemSumAggregateOutputType | null;
    _min: WatchlistItemMinAggregateOutputType | null;
    _max: WatchlistItemMaxAggregateOutputType | null;
  };

  export type WatchlistItemAvgAggregateOutputType = {
    year: number | null;
    rating: number | null;
  };

  export type WatchlistItemSumAggregateOutputType = {
    year: number | null;
    rating: number | null;
  };

  export type WatchlistItemMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tmdbId: string | null;
    mediaType: string | null;
    title: string | null;
    posterPath: string | null;
    year: number | null;
    rating: number | null;
    genres: string | null;
    addedAt: Date | null;
  };

  export type WatchlistItemMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tmdbId: string | null;
    mediaType: string | null;
    title: string | null;
    posterPath: string | null;
    year: number | null;
    rating: number | null;
    genres: string | null;
    addedAt: Date | null;
  };

  export type WatchlistItemCountAggregateOutputType = {
    id: number;
    userId: number;
    tmdbId: number;
    mediaType: number;
    title: number;
    posterPath: number;
    year: number;
    rating: number;
    genres: number;
    addedAt: number;
    _all: number;
  };

  export type WatchlistItemAvgAggregateInputType = {
    year?: true;
    rating?: true;
  };

  export type WatchlistItemSumAggregateInputType = {
    year?: true;
    rating?: true;
  };

  export type WatchlistItemMinAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    year?: true;
    rating?: true;
    genres?: true;
    addedAt?: true;
  };

  export type WatchlistItemMaxAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    year?: true;
    rating?: true;
    genres?: true;
    addedAt?: true;
  };

  export type WatchlistItemCountAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    year?: true;
    rating?: true;
    genres?: true;
    addedAt?: true;
    _all?: true;
  };

  export type WatchlistItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchlistItem to aggregate.
     */
    where?: WatchlistItemWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchlistItems to fetch.
     */
    orderBy?: WatchlistItemOrderByWithRelationInput | WatchlistItemOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WatchlistItemWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchlistItems from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchlistItems.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WatchlistItems
     **/
    _count?: true | WatchlistItemCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: WatchlistItemAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: WatchlistItemSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WatchlistItemMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WatchlistItemMaxAggregateInputType;
  };

  export type GetWatchlistItemAggregateType<T extends WatchlistItemAggregateArgs> = {
    [P in keyof T & keyof AggregateWatchlistItem]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWatchlistItem[P]>
      : GetScalarType<T[P], AggregateWatchlistItem[P]>;
  };

  export type WatchlistItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchlistItemWhereInput;
    orderBy?: WatchlistItemOrderByWithAggregationInput | WatchlistItemOrderByWithAggregationInput[];
    by: WatchlistItemScalarFieldEnum[] | WatchlistItemScalarFieldEnum;
    having?: WatchlistItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WatchlistItemCountAggregateInputType | true;
    _avg?: WatchlistItemAvgAggregateInputType;
    _sum?: WatchlistItemSumAggregateInputType;
    _min?: WatchlistItemMinAggregateInputType;
    _max?: WatchlistItemMaxAggregateInputType;
  };

  export type WatchlistItemGroupByOutputType = {
    id: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath: string | null;
    year: number | null;
    rating: number | null;
    genres: string | null;
    addedAt: Date;
    _count: WatchlistItemCountAggregateOutputType | null;
    _avg: WatchlistItemAvgAggregateOutputType | null;
    _sum: WatchlistItemSumAggregateOutputType | null;
    _min: WatchlistItemMinAggregateOutputType | null;
    _max: WatchlistItemMaxAggregateOutputType | null;
  };

  type GetWatchlistItemGroupByPayload<T extends WatchlistItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WatchlistItemGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof WatchlistItemGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], WatchlistItemGroupByOutputType[P]>
          : GetScalarType<T[P], WatchlistItemGroupByOutputType[P]>;
      }
    >
  >;

  export type WatchlistItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        tmdbId?: boolean;
        mediaType?: boolean;
        title?: boolean;
        posterPath?: boolean;
        year?: boolean;
        rating?: boolean;
        genres?: boolean;
        addedAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["watchlistItem"]
    >;

  export type WatchlistItemSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      tmdbId?: boolean;
      mediaType?: boolean;
      title?: boolean;
      posterPath?: boolean;
      year?: boolean;
      rating?: boolean;
      genres?: boolean;
      addedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["watchlistItem"]
  >;

  export type WatchlistItemSelectScalar = {
    id?: boolean;
    userId?: boolean;
    tmdbId?: boolean;
    mediaType?: boolean;
    title?: boolean;
    posterPath?: boolean;
    year?: boolean;
    rating?: boolean;
    genres?: boolean;
    addedAt?: boolean;
  };

  export type WatchlistItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type WatchlistItemIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $WatchlistItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WatchlistItem";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        tmdbId: string;
        mediaType: string;
        title: string;
        posterPath: string | null;
        year: number | null;
        rating: number | null;
        genres: string | null;
        addedAt: Date;
      },
      ExtArgs["result"]["watchlistItem"]
    >;
    composites: {};
  };

  type WatchlistItemGetPayload<S extends boolean | null | undefined | WatchlistItemDefaultArgs> = $Result.GetResult<
    Prisma.$WatchlistItemPayload,
    S
  >;

  type WatchlistItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    WatchlistItemFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: WatchlistItemCountAggregateInputType | true;
  };

  export interface WatchlistItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["WatchlistItem"]; meta: { name: "WatchlistItem" } };
    /**
     * Find zero or one WatchlistItem that matches the filter.
     * @param {WatchlistItemFindUniqueArgs} args - Arguments to find a WatchlistItem
     * @example
     * // Get one WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WatchlistItemFindUniqueArgs>(
      args: SelectSubset<T, WatchlistItemFindUniqueArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one WatchlistItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WatchlistItemFindUniqueOrThrowArgs} args - Arguments to find a WatchlistItem
     * @example
     * // Get one WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WatchlistItemFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WatchlistItemFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first WatchlistItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemFindFirstArgs} args - Arguments to find a WatchlistItem
     * @example
     * // Get one WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WatchlistItemFindFirstArgs>(
      args?: SelectSubset<T, WatchlistItemFindFirstArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first WatchlistItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemFindFirstOrThrowArgs} args - Arguments to find a WatchlistItem
     * @example
     * // Get one WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WatchlistItemFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WatchlistItemFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more WatchlistItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WatchlistItems
     * const watchlistItems = await prisma.watchlistItem.findMany()
     *
     * // Get first 10 WatchlistItems
     * const watchlistItems = await prisma.watchlistItem.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const watchlistItemWithIdOnly = await prisma.watchlistItem.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WatchlistItemFindManyArgs>(
      args?: SelectSubset<T, WatchlistItemFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a WatchlistItem.
     * @param {WatchlistItemCreateArgs} args - Arguments to create a WatchlistItem.
     * @example
     * // Create one WatchlistItem
     * const WatchlistItem = await prisma.watchlistItem.create({
     *   data: {
     *     // ... data to create a WatchlistItem
     *   }
     * })
     *
     */
    create<T extends WatchlistItemCreateArgs>(
      args: SelectSubset<T, WatchlistItemCreateArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many WatchlistItems.
     * @param {WatchlistItemCreateManyArgs} args - Arguments to create many WatchlistItems.
     * @example
     * // Create many WatchlistItems
     * const watchlistItem = await prisma.watchlistItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WatchlistItemCreateManyArgs>(
      args?: SelectSubset<T, WatchlistItemCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many WatchlistItems and returns the data saved in the database.
     * @param {WatchlistItemCreateManyAndReturnArgs} args - Arguments to create many WatchlistItems.
     * @example
     * // Create many WatchlistItems
     * const watchlistItem = await prisma.watchlistItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WatchlistItems and only return the `id`
     * const watchlistItemWithIdOnly = await prisma.watchlistItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WatchlistItemCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WatchlistItemCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a WatchlistItem.
     * @param {WatchlistItemDeleteArgs} args - Arguments to delete one WatchlistItem.
     * @example
     * // Delete one WatchlistItem
     * const WatchlistItem = await prisma.watchlistItem.delete({
     *   where: {
     *     // ... filter to delete one WatchlistItem
     *   }
     * })
     *
     */
    delete<T extends WatchlistItemDeleteArgs>(
      args: SelectSubset<T, WatchlistItemDeleteArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one WatchlistItem.
     * @param {WatchlistItemUpdateArgs} args - Arguments to update one WatchlistItem.
     * @example
     * // Update one WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WatchlistItemUpdateArgs>(
      args: SelectSubset<T, WatchlistItemUpdateArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more WatchlistItems.
     * @param {WatchlistItemDeleteManyArgs} args - Arguments to filter WatchlistItems to delete.
     * @example
     * // Delete a few WatchlistItems
     * const { count } = await prisma.watchlistItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WatchlistItemDeleteManyArgs>(
      args?: SelectSubset<T, WatchlistItemDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more WatchlistItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WatchlistItems
     * const watchlistItem = await prisma.watchlistItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WatchlistItemUpdateManyArgs>(
      args: SelectSubset<T, WatchlistItemUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one WatchlistItem.
     * @param {WatchlistItemUpsertArgs} args - Arguments to update or create a WatchlistItem.
     * @example
     * // Update or create a WatchlistItem
     * const watchlistItem = await prisma.watchlistItem.upsert({
     *   create: {
     *     // ... data to create a WatchlistItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WatchlistItem we want to update
     *   }
     * })
     */
    upsert<T extends WatchlistItemUpsertArgs>(
      args: SelectSubset<T, WatchlistItemUpsertArgs<ExtArgs>>
    ): Prisma__WatchlistItemClient<
      $Result.GetResult<Prisma.$WatchlistItemPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of WatchlistItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemCountArgs} args - Arguments to filter WatchlistItems to count.
     * @example
     * // Count the number of WatchlistItems
     * const count = await prisma.watchlistItem.count({
     *   where: {
     *     // ... the filter for the WatchlistItems we want to count
     *   }
     * })
     **/
    count<T extends WatchlistItemCountArgs>(
      args?: Subset<T, WatchlistItemCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], WatchlistItemCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a WatchlistItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WatchlistItemAggregateArgs>(
      args: Subset<T, WatchlistItemAggregateArgs>
    ): Prisma.PrismaPromise<GetWatchlistItemAggregateType<T>>;

    /**
     * Group by WatchlistItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WatchlistItemGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: WatchlistItemGroupByArgs["orderBy"] }
        : { orderBy?: WatchlistItemGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, WatchlistItemGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetWatchlistItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the WatchlistItem model
     */
    readonly fields: WatchlistItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WatchlistItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WatchlistItemClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the WatchlistItem model
   */
  interface WatchlistItemFieldRefs {
    readonly id: FieldRef<"WatchlistItem", "String">;
    readonly userId: FieldRef<"WatchlistItem", "String">;
    readonly tmdbId: FieldRef<"WatchlistItem", "String">;
    readonly mediaType: FieldRef<"WatchlistItem", "String">;
    readonly title: FieldRef<"WatchlistItem", "String">;
    readonly posterPath: FieldRef<"WatchlistItem", "String">;
    readonly year: FieldRef<"WatchlistItem", "Int">;
    readonly rating: FieldRef<"WatchlistItem", "Float">;
    readonly genres: FieldRef<"WatchlistItem", "String">;
    readonly addedAt: FieldRef<"WatchlistItem", "DateTime">;
  }

  // Custom InputTypes
  /**
   * WatchlistItem findUnique
   */
  export type WatchlistItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter, which WatchlistItem to fetch.
     */
    where: WatchlistItemWhereUniqueInput;
  };

  /**
   * WatchlistItem findUniqueOrThrow
   */
  export type WatchlistItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter, which WatchlistItem to fetch.
     */
    where: WatchlistItemWhereUniqueInput;
  };

  /**
   * WatchlistItem findFirst
   */
  export type WatchlistItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter, which WatchlistItem to fetch.
     */
    where?: WatchlistItemWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchlistItems to fetch.
     */
    orderBy?: WatchlistItemOrderByWithRelationInput | WatchlistItemOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WatchlistItems.
     */
    cursor?: WatchlistItemWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchlistItems from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchlistItems.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WatchlistItems.
     */
    distinct?: WatchlistItemScalarFieldEnum | WatchlistItemScalarFieldEnum[];
  };

  /**
   * WatchlistItem findFirstOrThrow
   */
  export type WatchlistItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter, which WatchlistItem to fetch.
     */
    where?: WatchlistItemWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchlistItems to fetch.
     */
    orderBy?: WatchlistItemOrderByWithRelationInput | WatchlistItemOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WatchlistItems.
     */
    cursor?: WatchlistItemWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchlistItems from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchlistItems.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WatchlistItems.
     */
    distinct?: WatchlistItemScalarFieldEnum | WatchlistItemScalarFieldEnum[];
  };

  /**
   * WatchlistItem findMany
   */
  export type WatchlistItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter, which WatchlistItems to fetch.
     */
    where?: WatchlistItemWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchlistItems to fetch.
     */
    orderBy?: WatchlistItemOrderByWithRelationInput | WatchlistItemOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WatchlistItems.
     */
    cursor?: WatchlistItemWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchlistItems from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchlistItems.
     */
    skip?: number;
    distinct?: WatchlistItemScalarFieldEnum | WatchlistItemScalarFieldEnum[];
  };

  /**
   * WatchlistItem create
   */
  export type WatchlistItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * The data needed to create a WatchlistItem.
     */
    data: XOR<WatchlistItemCreateInput, WatchlistItemUncheckedCreateInput>;
  };

  /**
   * WatchlistItem createMany
   */
  export type WatchlistItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WatchlistItems.
     */
    data: WatchlistItemCreateManyInput | WatchlistItemCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * WatchlistItem createManyAndReturn
   */
  export type WatchlistItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the WatchlistItem
       */
      select?: WatchlistItemSelectCreateManyAndReturn<ExtArgs> | null;
      /**
       * The data used to create many WatchlistItems.
       */
      data: WatchlistItemCreateManyInput | WatchlistItemCreateManyInput[];
      skipDuplicates?: boolean;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: WatchlistItemIncludeCreateManyAndReturn<ExtArgs> | null;
    };

  /**
   * WatchlistItem update
   */
  export type WatchlistItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * The data needed to update a WatchlistItem.
     */
    data: XOR<WatchlistItemUpdateInput, WatchlistItemUncheckedUpdateInput>;
    /**
     * Choose, which WatchlistItem to update.
     */
    where: WatchlistItemWhereUniqueInput;
  };

  /**
   * WatchlistItem updateMany
   */
  export type WatchlistItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WatchlistItems.
     */
    data: XOR<WatchlistItemUpdateManyMutationInput, WatchlistItemUncheckedUpdateManyInput>;
    /**
     * Filter which WatchlistItems to update
     */
    where?: WatchlistItemWhereInput;
  };

  /**
   * WatchlistItem upsert
   */
  export type WatchlistItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * The filter to search for the WatchlistItem to update in case it exists.
     */
    where: WatchlistItemWhereUniqueInput;
    /**
     * In case the WatchlistItem found by the `where` argument doesn't exist, create a new WatchlistItem with this data.
     */
    create: XOR<WatchlistItemCreateInput, WatchlistItemUncheckedCreateInput>;
    /**
     * In case the WatchlistItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WatchlistItemUpdateInput, WatchlistItemUncheckedUpdateInput>;
  };

  /**
   * WatchlistItem delete
   */
  export type WatchlistItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
    /**
     * Filter which WatchlistItem to delete.
     */
    where: WatchlistItemWhereUniqueInput;
  };

  /**
   * WatchlistItem deleteMany
   */
  export type WatchlistItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchlistItems to delete
     */
    where?: WatchlistItemWhereInput;
  };

  /**
   * WatchlistItem without action
   */
  export type WatchlistItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchlistItem
     */
    select?: WatchlistItemSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchlistItemInclude<ExtArgs> | null;
  };

  /**
   * Model ContinueWatching
   */

  export type AggregateContinueWatching = {
    _count: ContinueWatchingCountAggregateOutputType | null;
    _avg: ContinueWatchingAvgAggregateOutputType | null;
    _sum: ContinueWatchingSumAggregateOutputType | null;
    _min: ContinueWatchingMinAggregateOutputType | null;
    _max: ContinueWatchingMaxAggregateOutputType | null;
  };

  export type ContinueWatchingAvgAggregateOutputType = {
    season: number | null;
    episode: number | null;
    currentTime: number | null;
    duration: number | null;
    progress: number | null;
  };

  export type ContinueWatchingSumAggregateOutputType = {
    season: number | null;
    episode: number | null;
    currentTime: number | null;
    duration: number | null;
    progress: number | null;
  };

  export type ContinueWatchingMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tmdbId: string | null;
    mediaType: string | null;
    title: string | null;
    posterPath: string | null;
    season: number | null;
    episode: number | null;
    currentTime: number | null;
    duration: number | null;
    progress: number | null;
    provider: string | null;
    updatedAt: Date | null;
  };

  export type ContinueWatchingMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tmdbId: string | null;
    mediaType: string | null;
    title: string | null;
    posterPath: string | null;
    season: number | null;
    episode: number | null;
    currentTime: number | null;
    duration: number | null;
    progress: number | null;
    provider: string | null;
    updatedAt: Date | null;
  };

  export type ContinueWatchingCountAggregateOutputType = {
    id: number;
    userId: number;
    tmdbId: number;
    mediaType: number;
    title: number;
    posterPath: number;
    season: number;
    episode: number;
    currentTime: number;
    duration: number;
    progress: number;
    provider: number;
    updatedAt: number;
    _all: number;
  };

  export type ContinueWatchingAvgAggregateInputType = {
    season?: true;
    episode?: true;
    currentTime?: true;
    duration?: true;
    progress?: true;
  };

  export type ContinueWatchingSumAggregateInputType = {
    season?: true;
    episode?: true;
    currentTime?: true;
    duration?: true;
    progress?: true;
  };

  export type ContinueWatchingMinAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    season?: true;
    episode?: true;
    currentTime?: true;
    duration?: true;
    progress?: true;
    provider?: true;
    updatedAt?: true;
  };

  export type ContinueWatchingMaxAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    season?: true;
    episode?: true;
    currentTime?: true;
    duration?: true;
    progress?: true;
    provider?: true;
    updatedAt?: true;
  };

  export type ContinueWatchingCountAggregateInputType = {
    id?: true;
    userId?: true;
    tmdbId?: true;
    mediaType?: true;
    title?: true;
    posterPath?: true;
    season?: true;
    episode?: true;
    currentTime?: true;
    duration?: true;
    progress?: true;
    provider?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ContinueWatchingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContinueWatching to aggregate.
     */
    where?: ContinueWatchingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContinueWatchings to fetch.
     */
    orderBy?: ContinueWatchingOrderByWithRelationInput | ContinueWatchingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ContinueWatchingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContinueWatchings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContinueWatchings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ContinueWatchings
     **/
    _count?: true | ContinueWatchingCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: ContinueWatchingAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: ContinueWatchingSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ContinueWatchingMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ContinueWatchingMaxAggregateInputType;
  };

  export type GetContinueWatchingAggregateType<T extends ContinueWatchingAggregateArgs> = {
    [P in keyof T & keyof AggregateContinueWatching]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContinueWatching[P]>
      : GetScalarType<T[P], AggregateContinueWatching[P]>;
  };

  export type ContinueWatchingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContinueWatchingWhereInput;
    orderBy?: ContinueWatchingOrderByWithAggregationInput | ContinueWatchingOrderByWithAggregationInput[];
    by: ContinueWatchingScalarFieldEnum[] | ContinueWatchingScalarFieldEnum;
    having?: ContinueWatchingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ContinueWatchingCountAggregateInputType | true;
    _avg?: ContinueWatchingAvgAggregateInputType;
    _sum?: ContinueWatchingSumAggregateInputType;
    _min?: ContinueWatchingMinAggregateInputType;
    _max?: ContinueWatchingMaxAggregateInputType;
  };

  export type ContinueWatchingGroupByOutputType = {
    id: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath: string | null;
    season: number;
    episode: number;
    currentTime: number;
    duration: number;
    progress: number;
    provider: string | null;
    updatedAt: Date;
    _count: ContinueWatchingCountAggregateOutputType | null;
    _avg: ContinueWatchingAvgAggregateOutputType | null;
    _sum: ContinueWatchingSumAggregateOutputType | null;
    _min: ContinueWatchingMinAggregateOutputType | null;
    _max: ContinueWatchingMaxAggregateOutputType | null;
  };

  type GetContinueWatchingGroupByPayload<T extends ContinueWatchingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContinueWatchingGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof ContinueWatchingGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], ContinueWatchingGroupByOutputType[P]>
          : GetScalarType<T[P], ContinueWatchingGroupByOutputType[P]>;
      }
    >
  >;

  export type ContinueWatchingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        tmdbId?: boolean;
        mediaType?: boolean;
        title?: boolean;
        posterPath?: boolean;
        season?: boolean;
        episode?: boolean;
        currentTime?: boolean;
        duration?: boolean;
        progress?: boolean;
        provider?: boolean;
        updatedAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["continueWatching"]
    >;

  export type ContinueWatchingSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      tmdbId?: boolean;
      mediaType?: boolean;
      title?: boolean;
      posterPath?: boolean;
      season?: boolean;
      episode?: boolean;
      currentTime?: boolean;
      duration?: boolean;
      progress?: boolean;
      provider?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["continueWatching"]
  >;

  export type ContinueWatchingSelectScalar = {
    id?: boolean;
    userId?: boolean;
    tmdbId?: boolean;
    mediaType?: boolean;
    title?: boolean;
    posterPath?: boolean;
    season?: boolean;
    episode?: boolean;
    currentTime?: boolean;
    duration?: boolean;
    progress?: boolean;
    provider?: boolean;
    updatedAt?: boolean;
  };

  export type ContinueWatchingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type ContinueWatchingIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $ContinueWatchingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContinueWatching";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        tmdbId: string;
        mediaType: string;
        title: string;
        posterPath: string | null;
        season: number;
        episode: number;
        currentTime: number;
        duration: number;
        progress: number;
        provider: string | null;
        updatedAt: Date;
      },
      ExtArgs["result"]["continueWatching"]
    >;
    composites: {};
  };

  type ContinueWatchingGetPayload<S extends boolean | null | undefined | ContinueWatchingDefaultArgs> =
    $Result.GetResult<Prisma.$ContinueWatchingPayload, S>;

  type ContinueWatchingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    ContinueWatchingFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: ContinueWatchingCountAggregateInputType | true;
  };

  export interface ContinueWatchingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["ContinueWatching"]; meta: { name: "ContinueWatching" } };
    /**
     * Find zero or one ContinueWatching that matches the filter.
     * @param {ContinueWatchingFindUniqueArgs} args - Arguments to find a ContinueWatching
     * @example
     * // Get one ContinueWatching
     * const continueWatching = await prisma.continueWatching.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContinueWatchingFindUniqueArgs>(
      args: SelectSubset<T, ContinueWatchingFindUniqueArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one ContinueWatching that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContinueWatchingFindUniqueOrThrowArgs} args - Arguments to find a ContinueWatching
     * @example
     * // Get one ContinueWatching
     * const continueWatching = await prisma.continueWatching.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContinueWatchingFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ContinueWatchingFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first ContinueWatching that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingFindFirstArgs} args - Arguments to find a ContinueWatching
     * @example
     * // Get one ContinueWatching
     * const continueWatching = await prisma.continueWatching.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContinueWatchingFindFirstArgs>(
      args?: SelectSubset<T, ContinueWatchingFindFirstArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first ContinueWatching that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingFindFirstOrThrowArgs} args - Arguments to find a ContinueWatching
     * @example
     * // Get one ContinueWatching
     * const continueWatching = await prisma.continueWatching.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContinueWatchingFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ContinueWatchingFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more ContinueWatchings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContinueWatchings
     * const continueWatchings = await prisma.continueWatching.findMany()
     *
     * // Get first 10 ContinueWatchings
     * const continueWatchings = await prisma.continueWatching.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const continueWatchingWithIdOnly = await prisma.continueWatching.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ContinueWatchingFindManyArgs>(
      args?: SelectSubset<T, ContinueWatchingFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a ContinueWatching.
     * @param {ContinueWatchingCreateArgs} args - Arguments to create a ContinueWatching.
     * @example
     * // Create one ContinueWatching
     * const ContinueWatching = await prisma.continueWatching.create({
     *   data: {
     *     // ... data to create a ContinueWatching
     *   }
     * })
     *
     */
    create<T extends ContinueWatchingCreateArgs>(
      args: SelectSubset<T, ContinueWatchingCreateArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many ContinueWatchings.
     * @param {ContinueWatchingCreateManyArgs} args - Arguments to create many ContinueWatchings.
     * @example
     * // Create many ContinueWatchings
     * const continueWatching = await prisma.continueWatching.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ContinueWatchingCreateManyArgs>(
      args?: SelectSubset<T, ContinueWatchingCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ContinueWatchings and returns the data saved in the database.
     * @param {ContinueWatchingCreateManyAndReturnArgs} args - Arguments to create many ContinueWatchings.
     * @example
     * // Create many ContinueWatchings
     * const continueWatching = await prisma.continueWatching.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ContinueWatchings and only return the `id`
     * const continueWatchingWithIdOnly = await prisma.continueWatching.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ContinueWatchingCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ContinueWatchingCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a ContinueWatching.
     * @param {ContinueWatchingDeleteArgs} args - Arguments to delete one ContinueWatching.
     * @example
     * // Delete one ContinueWatching
     * const ContinueWatching = await prisma.continueWatching.delete({
     *   where: {
     *     // ... filter to delete one ContinueWatching
     *   }
     * })
     *
     */
    delete<T extends ContinueWatchingDeleteArgs>(
      args: SelectSubset<T, ContinueWatchingDeleteArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one ContinueWatching.
     * @param {ContinueWatchingUpdateArgs} args - Arguments to update one ContinueWatching.
     * @example
     * // Update one ContinueWatching
     * const continueWatching = await prisma.continueWatching.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ContinueWatchingUpdateArgs>(
      args: SelectSubset<T, ContinueWatchingUpdateArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more ContinueWatchings.
     * @param {ContinueWatchingDeleteManyArgs} args - Arguments to filter ContinueWatchings to delete.
     * @example
     * // Delete a few ContinueWatchings
     * const { count } = await prisma.continueWatching.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ContinueWatchingDeleteManyArgs>(
      args?: SelectSubset<T, ContinueWatchingDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ContinueWatchings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContinueWatchings
     * const continueWatching = await prisma.continueWatching.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ContinueWatchingUpdateManyArgs>(
      args: SelectSubset<T, ContinueWatchingUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one ContinueWatching.
     * @param {ContinueWatchingUpsertArgs} args - Arguments to update or create a ContinueWatching.
     * @example
     * // Update or create a ContinueWatching
     * const continueWatching = await prisma.continueWatching.upsert({
     *   create: {
     *     // ... data to create a ContinueWatching
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContinueWatching we want to update
     *   }
     * })
     */
    upsert<T extends ContinueWatchingUpsertArgs>(
      args: SelectSubset<T, ContinueWatchingUpsertArgs<ExtArgs>>
    ): Prisma__ContinueWatchingClient<
      $Result.GetResult<Prisma.$ContinueWatchingPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of ContinueWatchings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingCountArgs} args - Arguments to filter ContinueWatchings to count.
     * @example
     * // Count the number of ContinueWatchings
     * const count = await prisma.continueWatching.count({
     *   where: {
     *     // ... the filter for the ContinueWatchings we want to count
     *   }
     * })
     **/
    count<T extends ContinueWatchingCountArgs>(
      args?: Subset<T, ContinueWatchingCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ContinueWatchingCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ContinueWatching.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ContinueWatchingAggregateArgs>(
      args: Subset<T, ContinueWatchingAggregateArgs>
    ): Prisma.PrismaPromise<GetContinueWatchingAggregateType<T>>;

    /**
     * Group by ContinueWatching.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContinueWatchingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ContinueWatchingGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: ContinueWatchingGroupByArgs["orderBy"] }
        : { orderBy?: ContinueWatchingGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, ContinueWatchingGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetContinueWatchingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ContinueWatching model
     */
    readonly fields: ContinueWatchingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContinueWatching.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContinueWatchingClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the ContinueWatching model
   */
  interface ContinueWatchingFieldRefs {
    readonly id: FieldRef<"ContinueWatching", "String">;
    readonly userId: FieldRef<"ContinueWatching", "String">;
    readonly tmdbId: FieldRef<"ContinueWatching", "String">;
    readonly mediaType: FieldRef<"ContinueWatching", "String">;
    readonly title: FieldRef<"ContinueWatching", "String">;
    readonly posterPath: FieldRef<"ContinueWatching", "String">;
    readonly season: FieldRef<"ContinueWatching", "Int">;
    readonly episode: FieldRef<"ContinueWatching", "Int">;
    readonly currentTime: FieldRef<"ContinueWatching", "Float">;
    readonly duration: FieldRef<"ContinueWatching", "Float">;
    readonly progress: FieldRef<"ContinueWatching", "Int">;
    readonly provider: FieldRef<"ContinueWatching", "String">;
    readonly updatedAt: FieldRef<"ContinueWatching", "DateTime">;
  }

  // Custom InputTypes
  /**
   * ContinueWatching findUnique
   */
  export type ContinueWatchingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * Filter, which ContinueWatching to fetch.
     */
    where: ContinueWatchingWhereUniqueInput;
  };

  /**
   * ContinueWatching findUniqueOrThrow
   */
  export type ContinueWatchingFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * Filter, which ContinueWatching to fetch.
     */
    where: ContinueWatchingWhereUniqueInput;
  };

  /**
   * ContinueWatching findFirst
   */
  export type ContinueWatchingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * Filter, which ContinueWatching to fetch.
     */
    where?: ContinueWatchingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContinueWatchings to fetch.
     */
    orderBy?: ContinueWatchingOrderByWithRelationInput | ContinueWatchingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ContinueWatchings.
     */
    cursor?: ContinueWatchingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContinueWatchings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContinueWatchings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ContinueWatchings.
     */
    distinct?: ContinueWatchingScalarFieldEnum | ContinueWatchingScalarFieldEnum[];
  };

  /**
   * ContinueWatching findFirstOrThrow
   */
  export type ContinueWatchingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the ContinueWatching
       */
      select?: ContinueWatchingSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: ContinueWatchingInclude<ExtArgs> | null;
      /**
       * Filter, which ContinueWatching to fetch.
       */
      where?: ContinueWatchingWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of ContinueWatchings to fetch.
       */
      orderBy?: ContinueWatchingOrderByWithRelationInput | ContinueWatchingOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for searching for ContinueWatchings.
       */
      cursor?: ContinueWatchingWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` ContinueWatchings from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` ContinueWatchings.
       */
      skip?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
       *
       * Filter by unique combinations of ContinueWatchings.
       */
      distinct?: ContinueWatchingScalarFieldEnum | ContinueWatchingScalarFieldEnum[];
    };

  /**
   * ContinueWatching findMany
   */
  export type ContinueWatchingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * Filter, which ContinueWatchings to fetch.
     */
    where?: ContinueWatchingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContinueWatchings to fetch.
     */
    orderBy?: ContinueWatchingOrderByWithRelationInput | ContinueWatchingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ContinueWatchings.
     */
    cursor?: ContinueWatchingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContinueWatchings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContinueWatchings.
     */
    skip?: number;
    distinct?: ContinueWatchingScalarFieldEnum | ContinueWatchingScalarFieldEnum[];
  };

  /**
   * ContinueWatching create
   */
  export type ContinueWatchingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * The data needed to create a ContinueWatching.
     */
    data: XOR<ContinueWatchingCreateInput, ContinueWatchingUncheckedCreateInput>;
  };

  /**
   * ContinueWatching createMany
   */
  export type ContinueWatchingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContinueWatchings.
     */
    data: ContinueWatchingCreateManyInput | ContinueWatchingCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ContinueWatching createManyAndReturn
   */
  export type ContinueWatchingCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many ContinueWatchings.
     */
    data: ContinueWatchingCreateManyInput | ContinueWatchingCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * ContinueWatching update
   */
  export type ContinueWatchingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * The data needed to update a ContinueWatching.
     */
    data: XOR<ContinueWatchingUpdateInput, ContinueWatchingUncheckedUpdateInput>;
    /**
     * Choose, which ContinueWatching to update.
     */
    where: ContinueWatchingWhereUniqueInput;
  };

  /**
   * ContinueWatching updateMany
   */
  export type ContinueWatchingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContinueWatchings.
     */
    data: XOR<ContinueWatchingUpdateManyMutationInput, ContinueWatchingUncheckedUpdateManyInput>;
    /**
     * Filter which ContinueWatchings to update
     */
    where?: ContinueWatchingWhereInput;
  };

  /**
   * ContinueWatching upsert
   */
  export type ContinueWatchingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * The filter to search for the ContinueWatching to update in case it exists.
     */
    where: ContinueWatchingWhereUniqueInput;
    /**
     * In case the ContinueWatching found by the `where` argument doesn't exist, create a new ContinueWatching with this data.
     */
    create: XOR<ContinueWatchingCreateInput, ContinueWatchingUncheckedCreateInput>;
    /**
     * In case the ContinueWatching was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContinueWatchingUpdateInput, ContinueWatchingUncheckedUpdateInput>;
  };

  /**
   * ContinueWatching delete
   */
  export type ContinueWatchingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
    /**
     * Filter which ContinueWatching to delete.
     */
    where: ContinueWatchingWhereUniqueInput;
  };

  /**
   * ContinueWatching deleteMany
   */
  export type ContinueWatchingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContinueWatchings to delete
     */
    where?: ContinueWatchingWhereInput;
  };

  /**
   * ContinueWatching without action
   */
  export type ContinueWatchingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContinueWatching
     */
    select?: ContinueWatchingSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContinueWatchingInclude<ExtArgs> | null;
  };

  /**
   * Model WatchedEpisode
   */

  export type AggregateWatchedEpisode = {
    _count: WatchedEpisodeCountAggregateOutputType | null;
    _avg: WatchedEpisodeAvgAggregateOutputType | null;
    _sum: WatchedEpisodeSumAggregateOutputType | null;
    _min: WatchedEpisodeMinAggregateOutputType | null;
    _max: WatchedEpisodeMaxAggregateOutputType | null;
  };

  export type WatchedEpisodeAvgAggregateOutputType = {
    season: number | null;
    episode: number | null;
  };

  export type WatchedEpisodeSumAggregateOutputType = {
    season: number | null;
    episode: number | null;
  };

  export type WatchedEpisodeMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tvdbId: string | null;
    season: number | null;
    episode: number | null;
    watchedAt: Date | null;
  };

  export type WatchedEpisodeMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    tvdbId: string | null;
    season: number | null;
    episode: number | null;
    watchedAt: Date | null;
  };

  export type WatchedEpisodeCountAggregateOutputType = {
    id: number;
    userId: number;
    tvdbId: number;
    season: number;
    episode: number;
    watchedAt: number;
    _all: number;
  };

  export type WatchedEpisodeAvgAggregateInputType = {
    season?: true;
    episode?: true;
  };

  export type WatchedEpisodeSumAggregateInputType = {
    season?: true;
    episode?: true;
  };

  export type WatchedEpisodeMinAggregateInputType = {
    id?: true;
    userId?: true;
    tvdbId?: true;
    season?: true;
    episode?: true;
    watchedAt?: true;
  };

  export type WatchedEpisodeMaxAggregateInputType = {
    id?: true;
    userId?: true;
    tvdbId?: true;
    season?: true;
    episode?: true;
    watchedAt?: true;
  };

  export type WatchedEpisodeCountAggregateInputType = {
    id?: true;
    userId?: true;
    tvdbId?: true;
    season?: true;
    episode?: true;
    watchedAt?: true;
    _all?: true;
  };

  export type WatchedEpisodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchedEpisode to aggregate.
     */
    where?: WatchedEpisodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchedEpisodes to fetch.
     */
    orderBy?: WatchedEpisodeOrderByWithRelationInput | WatchedEpisodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WatchedEpisodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchedEpisodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchedEpisodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WatchedEpisodes
     **/
    _count?: true | WatchedEpisodeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: WatchedEpisodeAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: WatchedEpisodeSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WatchedEpisodeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WatchedEpisodeMaxAggregateInputType;
  };

  export type GetWatchedEpisodeAggregateType<T extends WatchedEpisodeAggregateArgs> = {
    [P in keyof T & keyof AggregateWatchedEpisode]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWatchedEpisode[P]>
      : GetScalarType<T[P], AggregateWatchedEpisode[P]>;
  };

  export type WatchedEpisodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WatchedEpisodeWhereInput;
    orderBy?: WatchedEpisodeOrderByWithAggregationInput | WatchedEpisodeOrderByWithAggregationInput[];
    by: WatchedEpisodeScalarFieldEnum[] | WatchedEpisodeScalarFieldEnum;
    having?: WatchedEpisodeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WatchedEpisodeCountAggregateInputType | true;
    _avg?: WatchedEpisodeAvgAggregateInputType;
    _sum?: WatchedEpisodeSumAggregateInputType;
    _min?: WatchedEpisodeMinAggregateInputType;
    _max?: WatchedEpisodeMaxAggregateInputType;
  };

  export type WatchedEpisodeGroupByOutputType = {
    id: string;
    userId: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt: Date;
    _count: WatchedEpisodeCountAggregateOutputType | null;
    _avg: WatchedEpisodeAvgAggregateOutputType | null;
    _sum: WatchedEpisodeSumAggregateOutputType | null;
    _min: WatchedEpisodeMinAggregateOutputType | null;
    _max: WatchedEpisodeMaxAggregateOutputType | null;
  };

  type GetWatchedEpisodeGroupByPayload<T extends WatchedEpisodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WatchedEpisodeGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof WatchedEpisodeGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], WatchedEpisodeGroupByOutputType[P]>
          : GetScalarType<T[P], WatchedEpisodeGroupByOutputType[P]>;
      }
    >
  >;

  export type WatchedEpisodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        tvdbId?: boolean;
        season?: boolean;
        episode?: boolean;
        watchedAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["watchedEpisode"]
    >;

  export type WatchedEpisodeSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      tvdbId?: boolean;
      season?: boolean;
      episode?: boolean;
      watchedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["watchedEpisode"]
  >;

  export type WatchedEpisodeSelectScalar = {
    id?: boolean;
    userId?: boolean;
    tvdbId?: boolean;
    season?: boolean;
    episode?: boolean;
    watchedAt?: boolean;
  };

  export type WatchedEpisodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type WatchedEpisodeIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $WatchedEpisodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WatchedEpisode";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        tvdbId: string;
        season: number;
        episode: number;
        watchedAt: Date;
      },
      ExtArgs["result"]["watchedEpisode"]
    >;
    composites: {};
  };

  type WatchedEpisodeGetPayload<S extends boolean | null | undefined | WatchedEpisodeDefaultArgs> = $Result.GetResult<
    Prisma.$WatchedEpisodePayload,
    S
  >;

  type WatchedEpisodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    WatchedEpisodeFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: WatchedEpisodeCountAggregateInputType | true;
  };

  export interface WatchedEpisodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["WatchedEpisode"]; meta: { name: "WatchedEpisode" } };
    /**
     * Find zero or one WatchedEpisode that matches the filter.
     * @param {WatchedEpisodeFindUniqueArgs} args - Arguments to find a WatchedEpisode
     * @example
     * // Get one WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WatchedEpisodeFindUniqueArgs>(
      args: SelectSubset<T, WatchedEpisodeFindUniqueArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one WatchedEpisode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WatchedEpisodeFindUniqueOrThrowArgs} args - Arguments to find a WatchedEpisode
     * @example
     * // Get one WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WatchedEpisodeFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WatchedEpisodeFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first WatchedEpisode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeFindFirstArgs} args - Arguments to find a WatchedEpisode
     * @example
     * // Get one WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WatchedEpisodeFindFirstArgs>(
      args?: SelectSubset<T, WatchedEpisodeFindFirstArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first WatchedEpisode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeFindFirstOrThrowArgs} args - Arguments to find a WatchedEpisode
     * @example
     * // Get one WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WatchedEpisodeFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WatchedEpisodeFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more WatchedEpisodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WatchedEpisodes
     * const watchedEpisodes = await prisma.watchedEpisode.findMany()
     *
     * // Get first 10 WatchedEpisodes
     * const watchedEpisodes = await prisma.watchedEpisode.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const watchedEpisodeWithIdOnly = await prisma.watchedEpisode.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WatchedEpisodeFindManyArgs>(
      args?: SelectSubset<T, WatchedEpisodeFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a WatchedEpisode.
     * @param {WatchedEpisodeCreateArgs} args - Arguments to create a WatchedEpisode.
     * @example
     * // Create one WatchedEpisode
     * const WatchedEpisode = await prisma.watchedEpisode.create({
     *   data: {
     *     // ... data to create a WatchedEpisode
     *   }
     * })
     *
     */
    create<T extends WatchedEpisodeCreateArgs>(
      args: SelectSubset<T, WatchedEpisodeCreateArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many WatchedEpisodes.
     * @param {WatchedEpisodeCreateManyArgs} args - Arguments to create many WatchedEpisodes.
     * @example
     * // Create many WatchedEpisodes
     * const watchedEpisode = await prisma.watchedEpisode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WatchedEpisodeCreateManyArgs>(
      args?: SelectSubset<T, WatchedEpisodeCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many WatchedEpisodes and returns the data saved in the database.
     * @param {WatchedEpisodeCreateManyAndReturnArgs} args - Arguments to create many WatchedEpisodes.
     * @example
     * // Create many WatchedEpisodes
     * const watchedEpisode = await prisma.watchedEpisode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WatchedEpisodes and only return the `id`
     * const watchedEpisodeWithIdOnly = await prisma.watchedEpisode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WatchedEpisodeCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WatchedEpisodeCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a WatchedEpisode.
     * @param {WatchedEpisodeDeleteArgs} args - Arguments to delete one WatchedEpisode.
     * @example
     * // Delete one WatchedEpisode
     * const WatchedEpisode = await prisma.watchedEpisode.delete({
     *   where: {
     *     // ... filter to delete one WatchedEpisode
     *   }
     * })
     *
     */
    delete<T extends WatchedEpisodeDeleteArgs>(
      args: SelectSubset<T, WatchedEpisodeDeleteArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one WatchedEpisode.
     * @param {WatchedEpisodeUpdateArgs} args - Arguments to update one WatchedEpisode.
     * @example
     * // Update one WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WatchedEpisodeUpdateArgs>(
      args: SelectSubset<T, WatchedEpisodeUpdateArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more WatchedEpisodes.
     * @param {WatchedEpisodeDeleteManyArgs} args - Arguments to filter WatchedEpisodes to delete.
     * @example
     * // Delete a few WatchedEpisodes
     * const { count } = await prisma.watchedEpisode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WatchedEpisodeDeleteManyArgs>(
      args?: SelectSubset<T, WatchedEpisodeDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more WatchedEpisodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WatchedEpisodes
     * const watchedEpisode = await prisma.watchedEpisode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WatchedEpisodeUpdateManyArgs>(
      args: SelectSubset<T, WatchedEpisodeUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one WatchedEpisode.
     * @param {WatchedEpisodeUpsertArgs} args - Arguments to update or create a WatchedEpisode.
     * @example
     * // Update or create a WatchedEpisode
     * const watchedEpisode = await prisma.watchedEpisode.upsert({
     *   create: {
     *     // ... data to create a WatchedEpisode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WatchedEpisode we want to update
     *   }
     * })
     */
    upsert<T extends WatchedEpisodeUpsertArgs>(
      args: SelectSubset<T, WatchedEpisodeUpsertArgs<ExtArgs>>
    ): Prisma__WatchedEpisodeClient<
      $Result.GetResult<Prisma.$WatchedEpisodePayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of WatchedEpisodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeCountArgs} args - Arguments to filter WatchedEpisodes to count.
     * @example
     * // Count the number of WatchedEpisodes
     * const count = await prisma.watchedEpisode.count({
     *   where: {
     *     // ... the filter for the WatchedEpisodes we want to count
     *   }
     * })
     **/
    count<T extends WatchedEpisodeCountArgs>(
      args?: Subset<T, WatchedEpisodeCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], WatchedEpisodeCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a WatchedEpisode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WatchedEpisodeAggregateArgs>(
      args: Subset<T, WatchedEpisodeAggregateArgs>
    ): Prisma.PrismaPromise<GetWatchedEpisodeAggregateType<T>>;

    /**
     * Group by WatchedEpisode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchedEpisodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WatchedEpisodeGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: WatchedEpisodeGroupByArgs["orderBy"] }
        : { orderBy?: WatchedEpisodeGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, WatchedEpisodeGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetWatchedEpisodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the WatchedEpisode model
     */
    readonly fields: WatchedEpisodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WatchedEpisode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WatchedEpisodeClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the WatchedEpisode model
   */
  interface WatchedEpisodeFieldRefs {
    readonly id: FieldRef<"WatchedEpisode", "String">;
    readonly userId: FieldRef<"WatchedEpisode", "String">;
    readonly tvdbId: FieldRef<"WatchedEpisode", "String">;
    readonly season: FieldRef<"WatchedEpisode", "Int">;
    readonly episode: FieldRef<"WatchedEpisode", "Int">;
    readonly watchedAt: FieldRef<"WatchedEpisode", "DateTime">;
  }

  // Custom InputTypes
  /**
   * WatchedEpisode findUnique
   */
  export type WatchedEpisodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * Filter, which WatchedEpisode to fetch.
     */
    where: WatchedEpisodeWhereUniqueInput;
  };

  /**
   * WatchedEpisode findUniqueOrThrow
   */
  export type WatchedEpisodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the WatchedEpisode
       */
      select?: WatchedEpisodeSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: WatchedEpisodeInclude<ExtArgs> | null;
      /**
       * Filter, which WatchedEpisode to fetch.
       */
      where: WatchedEpisodeWhereUniqueInput;
    };

  /**
   * WatchedEpisode findFirst
   */
  export type WatchedEpisodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * Filter, which WatchedEpisode to fetch.
     */
    where?: WatchedEpisodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchedEpisodes to fetch.
     */
    orderBy?: WatchedEpisodeOrderByWithRelationInput | WatchedEpisodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WatchedEpisodes.
     */
    cursor?: WatchedEpisodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchedEpisodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchedEpisodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WatchedEpisodes.
     */
    distinct?: WatchedEpisodeScalarFieldEnum | WatchedEpisodeScalarFieldEnum[];
  };

  /**
   * WatchedEpisode findFirstOrThrow
   */
  export type WatchedEpisodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * Filter, which WatchedEpisode to fetch.
     */
    where?: WatchedEpisodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchedEpisodes to fetch.
     */
    orderBy?: WatchedEpisodeOrderByWithRelationInput | WatchedEpisodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WatchedEpisodes.
     */
    cursor?: WatchedEpisodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchedEpisodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchedEpisodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WatchedEpisodes.
     */
    distinct?: WatchedEpisodeScalarFieldEnum | WatchedEpisodeScalarFieldEnum[];
  };

  /**
   * WatchedEpisode findMany
   */
  export type WatchedEpisodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * Filter, which WatchedEpisodes to fetch.
     */
    where?: WatchedEpisodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WatchedEpisodes to fetch.
     */
    orderBy?: WatchedEpisodeOrderByWithRelationInput | WatchedEpisodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WatchedEpisodes.
     */
    cursor?: WatchedEpisodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WatchedEpisodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WatchedEpisodes.
     */
    skip?: number;
    distinct?: WatchedEpisodeScalarFieldEnum | WatchedEpisodeScalarFieldEnum[];
  };

  /**
   * WatchedEpisode create
   */
  export type WatchedEpisodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * The data needed to create a WatchedEpisode.
     */
    data: XOR<WatchedEpisodeCreateInput, WatchedEpisodeUncheckedCreateInput>;
  };

  /**
   * WatchedEpisode createMany
   */
  export type WatchedEpisodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WatchedEpisodes.
     */
    data: WatchedEpisodeCreateManyInput | WatchedEpisodeCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * WatchedEpisode createManyAndReturn
   */
  export type WatchedEpisodeCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many WatchedEpisodes.
     */
    data: WatchedEpisodeCreateManyInput | WatchedEpisodeCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * WatchedEpisode update
   */
  export type WatchedEpisodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * The data needed to update a WatchedEpisode.
     */
    data: XOR<WatchedEpisodeUpdateInput, WatchedEpisodeUncheckedUpdateInput>;
    /**
     * Choose, which WatchedEpisode to update.
     */
    where: WatchedEpisodeWhereUniqueInput;
  };

  /**
   * WatchedEpisode updateMany
   */
  export type WatchedEpisodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WatchedEpisodes.
     */
    data: XOR<WatchedEpisodeUpdateManyMutationInput, WatchedEpisodeUncheckedUpdateManyInput>;
    /**
     * Filter which WatchedEpisodes to update
     */
    where?: WatchedEpisodeWhereInput;
  };

  /**
   * WatchedEpisode upsert
   */
  export type WatchedEpisodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * The filter to search for the WatchedEpisode to update in case it exists.
     */
    where: WatchedEpisodeWhereUniqueInput;
    /**
     * In case the WatchedEpisode found by the `where` argument doesn't exist, create a new WatchedEpisode with this data.
     */
    create: XOR<WatchedEpisodeCreateInput, WatchedEpisodeUncheckedCreateInput>;
    /**
     * In case the WatchedEpisode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WatchedEpisodeUpdateInput, WatchedEpisodeUncheckedUpdateInput>;
  };

  /**
   * WatchedEpisode delete
   */
  export type WatchedEpisodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
    /**
     * Filter which WatchedEpisode to delete.
     */
    where: WatchedEpisodeWhereUniqueInput;
  };

  /**
   * WatchedEpisode deleteMany
   */
  export type WatchedEpisodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WatchedEpisodes to delete
     */
    where?: WatchedEpisodeWhereInput;
  };

  /**
   * WatchedEpisode without action
   */
  export type WatchedEpisodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WatchedEpisode
     */
    select?: WatchedEpisodeSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WatchedEpisodeInclude<ExtArgs> | null;
  };

  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null;
    _min: AuditLogMinAggregateOutputType | null;
    _max: AuditLogMaxAggregateOutputType | null;
  };

  export type AuditLogMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    action: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type AuditLogMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    action: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type AuditLogCountAggregateOutputType = {
    id: number;
    userId: number;
    action: number;
    metadata: number;
    ipAddress: number;
    userAgent: number;
    createdAt: number;
    _all: number;
  };

  export type AuditLogMinAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type AuditLogMaxAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type AuditLogCountAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    metadata?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
    _all?: true;
  };

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AuditLogs
     **/
    _count?: true | AuditLogCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AuditLogMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AuditLogMaxAggregateInputType;
  };

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
    [P in keyof T & keyof AggregateAuditLog]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>;
  };

  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput;
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[];
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum;
    having?: AuditLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuditLogCountAggregateInputType | true;
    _min?: AuditLogMinAggregateInputType;
    _max?: AuditLogMaxAggregateInputType;
  };

  export type AuditLogGroupByOutputType = {
    id: string;
    userId: string;
    action: string;
    metadata: JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    _count: AuditLogCountAggregateOutputType | null;
    _min: AuditLogMinAggregateOutputType | null;
    _max: AuditLogMaxAggregateOutputType | null;
  };

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof AuditLogGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
          : GetScalarType<T[P], AuditLogGroupByOutputType[P]>;
      }
    >
  >;

  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        action?: boolean;
        metadata?: boolean;
        ipAddress?: boolean;
        userAgent?: boolean;
        createdAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["auditLog"]
    >;

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        action?: boolean;
        metadata?: boolean;
        ipAddress?: boolean;
        userAgent?: boolean;
        createdAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["auditLog"]
    >;

  export type AuditLogSelectScalar = {
    id?: boolean;
    userId?: boolean;
    action?: boolean;
    metadata?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
  };

  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        action: string;
        metadata: Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      },
      ExtArgs["result"]["auditLog"]
    >;
    composites: {};
  };

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<
    Prisma.$AuditLogPayload,
    S
  >;

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    AuditLogFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: AuditLogCountAggregateInputType | true;
  };

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["AuditLog"]; meta: { name: "AuditLog" } };
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(
      args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>
    ): Prisma__AuditLogClient<
      $Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<
      $Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(
      args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>
    ): Prisma__AuditLogClient<
      $Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<
      $Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     *
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AuditLogFindManyArgs>(
      args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     *
     */
    create<T extends AuditLogCreateArgs>(
      args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>;

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AuditLogCreateManyArgs>(
      args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     *
     */
    delete<T extends AuditLogDeleteArgs>(
      args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>;

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AuditLogUpdateArgs>(
      args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>;

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(
      args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AuditLogUpdateManyArgs>(
      args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(
      args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>;

    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
     **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], AuditLogCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AuditLogAggregateArgs>(
      args: Subset<T, AuditLogAggregateArgs>
    ): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>;

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs["orderBy"] }
        : { orderBy?: AuditLogGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AuditLog model
     */
    readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", "String">;
    readonly userId: FieldRef<"AuditLog", "String">;
    readonly action: FieldRef<"AuditLog", "String">;
    readonly metadata: FieldRef<"AuditLog", "Json">;
    readonly ipAddress: FieldRef<"AuditLog", "String">;
    readonly userAgent: FieldRef<"AuditLog", "String">;
    readonly createdAt: FieldRef<"AuditLog", "DateTime">;
  }

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>;
  };

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>;
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>;
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput;
  };

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput;
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>;
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>;
  };

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput;
  };

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
  };

  /**
   * Model AnalyticsEvent
   */

  export type AggregateAnalyticsEvent = {
    _count: AnalyticsEventCountAggregateOutputType | null;
    _min: AnalyticsEventMinAggregateOutputType | null;
    _max: AnalyticsEventMaxAggregateOutputType | null;
  };

  export type AnalyticsEventMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    event: string | null;
    sessionId: string | null;
    ipAddress: string | null;
    createdAt: Date | null;
  };

  export type AnalyticsEventMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    event: string | null;
    sessionId: string | null;
    ipAddress: string | null;
    createdAt: Date | null;
  };

  export type AnalyticsEventCountAggregateOutputType = {
    id: number;
    userId: number;
    event: number;
    properties: number;
    sessionId: number;
    ipAddress: number;
    createdAt: number;
    _all: number;
  };

  export type AnalyticsEventMinAggregateInputType = {
    id?: true;
    userId?: true;
    event?: true;
    sessionId?: true;
    ipAddress?: true;
    createdAt?: true;
  };

  export type AnalyticsEventMaxAggregateInputType = {
    id?: true;
    userId?: true;
    event?: true;
    sessionId?: true;
    ipAddress?: true;
    createdAt?: true;
  };

  export type AnalyticsEventCountAggregateInputType = {
    id?: true;
    userId?: true;
    event?: true;
    properties?: true;
    sessionId?: true;
    ipAddress?: true;
    createdAt?: true;
    _all?: true;
  };

  export type AnalyticsEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvent to aggregate.
     */
    where?: AnalyticsEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AnalyticsEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AnalyticsEvents
     **/
    _count?: true | AnalyticsEventCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AnalyticsEventMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AnalyticsEventMaxAggregateInputType;
  };

  export type GetAnalyticsEventAggregateType<T extends AnalyticsEventAggregateArgs> = {
    [P in keyof T & keyof AggregateAnalyticsEvent]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnalyticsEvent[P]>
      : GetScalarType<T[P], AggregateAnalyticsEvent[P]>;
  };

  export type AnalyticsEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyticsEventWhereInput;
    orderBy?: AnalyticsEventOrderByWithAggregationInput | AnalyticsEventOrderByWithAggregationInput[];
    by: AnalyticsEventScalarFieldEnum[] | AnalyticsEventScalarFieldEnum;
    having?: AnalyticsEventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AnalyticsEventCountAggregateInputType | true;
    _min?: AnalyticsEventMinAggregateInputType;
    _max?: AnalyticsEventMaxAggregateInputType;
  };

  export type AnalyticsEventGroupByOutputType = {
    id: string;
    userId: string | null;
    event: string;
    properties: JsonValue | null;
    sessionId: string | null;
    ipAddress: string | null;
    createdAt: Date;
    _count: AnalyticsEventCountAggregateOutputType | null;
    _min: AnalyticsEventMinAggregateOutputType | null;
    _max: AnalyticsEventMaxAggregateOutputType | null;
  };

  type GetAnalyticsEventGroupByPayload<T extends AnalyticsEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnalyticsEventGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof AnalyticsEventGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>
          : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>;
      }
    >
  >;

  export type AnalyticsEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        event?: boolean;
        properties?: boolean;
        sessionId?: boolean;
        ipAddress?: boolean;
        createdAt?: boolean;
        user?: boolean | AnalyticsEvent$userArgs<ExtArgs>;
      },
      ExtArgs["result"]["analyticsEvent"]
    >;

  export type AnalyticsEventSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      event?: boolean;
      properties?: boolean;
      sessionId?: boolean;
      ipAddress?: boolean;
      createdAt?: boolean;
      user?: boolean | AnalyticsEvent$userArgs<ExtArgs>;
    },
    ExtArgs["result"]["analyticsEvent"]
  >;

  export type AnalyticsEventSelectScalar = {
    id?: boolean;
    userId?: boolean;
    event?: boolean;
    properties?: boolean;
    sessionId?: boolean;
    ipAddress?: boolean;
    createdAt?: boolean;
  };

  export type AnalyticsEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>;
  };
  export type AnalyticsEventIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>;
  };

  export type $AnalyticsEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnalyticsEvent";
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string | null;
        event: string;
        properties: Prisma.JsonValue | null;
        sessionId: string | null;
        ipAddress: string | null;
        createdAt: Date;
      },
      ExtArgs["result"]["analyticsEvent"]
    >;
    composites: {};
  };

  type AnalyticsEventGetPayload<S extends boolean | null | undefined | AnalyticsEventDefaultArgs> = $Result.GetResult<
    Prisma.$AnalyticsEventPayload,
    S
  >;

  type AnalyticsEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    AnalyticsEventFindManyArgs,
    "select" | "include" | "distinct"
  > & {
    select?: AnalyticsEventCountAggregateInputType | true;
  };

  export interface AnalyticsEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["AnalyticsEvent"]; meta: { name: "AnalyticsEvent" } };
    /**
     * Find zero or one AnalyticsEvent that matches the filter.
     * @param {AnalyticsEventFindUniqueArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnalyticsEventFindUniqueArgs>(
      args: SelectSubset<T, AnalyticsEventFindUniqueArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUnique"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one AnalyticsEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnalyticsEventFindUniqueOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnalyticsEventFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUniqueOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find the first AnalyticsEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnalyticsEventFindFirstArgs>(
      args?: SelectSubset<T, AnalyticsEventFindFirstArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirst"> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first AnalyticsEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnalyticsEventFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AnalyticsEventFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirstOrThrow">,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more AnalyticsEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany()
     *
     * // Get first 10 AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AnalyticsEventFindManyArgs>(
      args?: SelectSubset<T, AnalyticsEventFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findMany">>;

    /**
     * Create a AnalyticsEvent.
     * @param {AnalyticsEventCreateArgs} args - Arguments to create a AnalyticsEvent.
     * @example
     * // Create one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.create({
     *   data: {
     *     // ... data to create a AnalyticsEvent
     *   }
     * })
     *
     */
    create<T extends AnalyticsEventCreateArgs>(
      args: SelectSubset<T, AnalyticsEventCreateArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "create">,
      never,
      ExtArgs
    >;

    /**
     * Create many AnalyticsEvents.
     * @param {AnalyticsEventCreateManyArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AnalyticsEventCreateManyArgs>(
      args?: SelectSubset<T, AnalyticsEventCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many AnalyticsEvents and returns the data saved in the database.
     * @param {AnalyticsEventCreateManyAndReturnArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AnalyticsEvents and only return the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AnalyticsEventCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AnalyticsEventCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "createManyAndReturn">>;

    /**
     * Delete a AnalyticsEvent.
     * @param {AnalyticsEventDeleteArgs} args - Arguments to delete one AnalyticsEvent.
     * @example
     * // Delete one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.delete({
     *   where: {
     *     // ... filter to delete one AnalyticsEvent
     *   }
     * })
     *
     */
    delete<T extends AnalyticsEventDeleteArgs>(
      args: SelectSubset<T, AnalyticsEventDeleteArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "delete">,
      never,
      ExtArgs
    >;

    /**
     * Update one AnalyticsEvent.
     * @param {AnalyticsEventUpdateArgs} args - Arguments to update one AnalyticsEvent.
     * @example
     * // Update one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AnalyticsEventUpdateArgs>(
      args: SelectSubset<T, AnalyticsEventUpdateArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "update">,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more AnalyticsEvents.
     * @param {AnalyticsEventDeleteManyArgs} args - Arguments to filter AnalyticsEvents to delete.
     * @example
     * // Delete a few AnalyticsEvents
     * const { count } = await prisma.analyticsEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AnalyticsEventDeleteManyArgs>(
      args?: SelectSubset<T, AnalyticsEventDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AnalyticsEventUpdateManyArgs>(
      args: SelectSubset<T, AnalyticsEventUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one AnalyticsEvent.
     * @param {AnalyticsEventUpsertArgs} args - Arguments to update or create a AnalyticsEvent.
     * @example
     * // Update or create a AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.upsert({
     *   create: {
     *     // ... data to create a AnalyticsEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnalyticsEvent we want to update
     *   }
     * })
     */
    upsert<T extends AnalyticsEventUpsertArgs>(
      args: SelectSubset<T, AnalyticsEventUpsertArgs<ExtArgs>>
    ): Prisma__AnalyticsEventClient<
      $Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "upsert">,
      never,
      ExtArgs
    >;

    /**
     * Count the number of AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventCountArgs} args - Arguments to filter AnalyticsEvents to count.
     * @example
     * // Count the number of AnalyticsEvents
     * const count = await prisma.analyticsEvent.count({
     *   where: {
     *     // ... the filter for the AnalyticsEvents we want to count
     *   }
     * })
     **/
    count<T extends AnalyticsEventCountArgs>(
      args?: Subset<T, AnalyticsEventCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], AnalyticsEventCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AnalyticsEventAggregateArgs>(
      args: Subset<T, AnalyticsEventAggregateArgs>
    ): Prisma.PrismaPromise<GetAnalyticsEventAggregateType<T>>;

    /**
     * Group by AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AnalyticsEventGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends (True extends HasSelectOrTake
        ? { orderBy: AnalyticsEventGroupByArgs["orderBy"] }
        : { orderBy?: AnalyticsEventGroupByArgs["orderBy"] }),
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends (T["by"] extends never[] ? True : False),
      InputErrors extends (ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]),
    >(
      args: SubsetIntersection<T, AnalyticsEventGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetAnalyticsEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AnalyticsEvent model
     */
    readonly fields: AnalyticsEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnalyticsEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnalyticsEventClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends AnalyticsEvent$userArgs<ExtArgs> = {}>(
      args?: Subset<T, AnalyticsEvent$userArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null,
      null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the AnalyticsEvent model
   */
  interface AnalyticsEventFieldRefs {
    readonly id: FieldRef<"AnalyticsEvent", "String">;
    readonly userId: FieldRef<"AnalyticsEvent", "String">;
    readonly event: FieldRef<"AnalyticsEvent", "String">;
    readonly properties: FieldRef<"AnalyticsEvent", "Json">;
    readonly sessionId: FieldRef<"AnalyticsEvent", "String">;
    readonly ipAddress: FieldRef<"AnalyticsEvent", "String">;
    readonly createdAt: FieldRef<"AnalyticsEvent", "DateTime">;
  }

  // Custom InputTypes
  /**
   * AnalyticsEvent findUnique
   */
  export type AnalyticsEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where: AnalyticsEventWhereUniqueInput;
  };

  /**
   * AnalyticsEvent findUniqueOrThrow
   */
  export type AnalyticsEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the AnalyticsEvent
       */
      select?: AnalyticsEventSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: AnalyticsEventInclude<ExtArgs> | null;
      /**
       * Filter, which AnalyticsEvent to fetch.
       */
      where: AnalyticsEventWhereUniqueInput;
    };

  /**
   * AnalyticsEvent findFirst
   */
  export type AnalyticsEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[];
  };

  /**
   * AnalyticsEvent findFirstOrThrow
   */
  export type AnalyticsEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[];
  };

  /**
   * AnalyticsEvent findMany
   */
  export type AnalyticsEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * Filter, which AnalyticsEvents to fetch.
     */
    where?: AnalyticsEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number;
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[];
  };

  /**
   * AnalyticsEvent create
   */
  export type AnalyticsEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * The data needed to create a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>;
  };

  /**
   * AnalyticsEvent createMany
   */
  export type AnalyticsEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * AnalyticsEvent createManyAndReturn
   */
  export type AnalyticsEventCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AnalyticsEvent update
   */
  export type AnalyticsEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * The data needed to update a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>;
    /**
     * Choose, which AnalyticsEvent to update.
     */
    where: AnalyticsEventWhereUniqueInput;
  };

  /**
   * AnalyticsEvent updateMany
   */
  export type AnalyticsEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnalyticsEvents.
     */
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyInput>;
    /**
     * Filter which AnalyticsEvents to update
     */
    where?: AnalyticsEventWhereInput;
  };

  /**
   * AnalyticsEvent upsert
   */
  export type AnalyticsEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * The filter to search for the AnalyticsEvent to update in case it exists.
     */
    where: AnalyticsEventWhereUniqueInput;
    /**
     * In case the AnalyticsEvent found by the `where` argument doesn't exist, create a new AnalyticsEvent with this data.
     */
    create: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>;
    /**
     * In case the AnalyticsEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>;
  };

  /**
   * AnalyticsEvent delete
   */
  export type AnalyticsEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
    /**
     * Filter which AnalyticsEvent to delete.
     */
    where: AnalyticsEventWhereUniqueInput;
  };

  /**
   * AnalyticsEvent deleteMany
   */
  export type AnalyticsEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvents to delete
     */
    where?: AnalyticsEventWhereInput;
  };

  /**
   * AnalyticsEvent.user
   */
  export type AnalyticsEvent$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    where?: UserWhereInput;
  };

  /**
   * AnalyticsEvent without action
   */
  export type AnalyticsEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum: {
    id: "id";
    email: "email";
    username: "username";
    displayName: "displayName";
    bio: "bio";
    avatarUrl: "avatarUrl";
    role: "role";
    isVerified: "isVerified";
    authUserId: "authUserId";
    subscriptionTier: "subscriptionTier";
    subscriptionExpiry: "subscriptionExpiry";
    currencyPreference: "currencyPreference";
    trialStartDate: "trialStartDate";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const PaymentScalarFieldEnum: {
    id: "id";
    userId: "userId";
    orderId: "orderId";
    amount: "amount";
    currency: "currency";
    status: "status";
    paymentId: "paymentId";
    method: "method";
    createdAt: "createdAt";
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum];

  export const UserSettingsScalarFieldEnum: {
    id: "id";
    userId: "userId";
    language: "language";
    autoplay: "autoplay";
    preferredProvider: "preferredProvider";
    subtitleLang: "subtitleLang";
    quality: "quality";
    notifications: "notifications";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type UserSettingsScalarFieldEnum =
    (typeof UserSettingsScalarFieldEnum)[keyof typeof UserSettingsScalarFieldEnum];

  export const DeviceScalarFieldEnum: {
    id: "id";
    userId: "userId";
    deviceId: "deviceId";
    deviceName: "deviceName";
    platform: "platform";
    browser: "browser";
    appVersion: "appVersion";
    lastActive: "lastActive";
    lastIp: "lastIp";
    createdAt: "createdAt";
  };

  export type DeviceScalarFieldEnum = (typeof DeviceScalarFieldEnum)[keyof typeof DeviceScalarFieldEnum];

  export const WatchlistItemScalarFieldEnum: {
    id: "id";
    userId: "userId";
    tmdbId: "tmdbId";
    mediaType: "mediaType";
    title: "title";
    posterPath: "posterPath";
    year: "year";
    rating: "rating";
    genres: "genres";
    addedAt: "addedAt";
  };

  export type WatchlistItemScalarFieldEnum =
    (typeof WatchlistItemScalarFieldEnum)[keyof typeof WatchlistItemScalarFieldEnum];

  export const ContinueWatchingScalarFieldEnum: {
    id: "id";
    userId: "userId";
    tmdbId: "tmdbId";
    mediaType: "mediaType";
    title: "title";
    posterPath: "posterPath";
    season: "season";
    episode: "episode";
    currentTime: "currentTime";
    duration: "duration";
    progress: "progress";
    provider: "provider";
    updatedAt: "updatedAt";
  };

  export type ContinueWatchingScalarFieldEnum =
    (typeof ContinueWatchingScalarFieldEnum)[keyof typeof ContinueWatchingScalarFieldEnum];

  export const WatchedEpisodeScalarFieldEnum: {
    id: "id";
    userId: "userId";
    tvdbId: "tvdbId";
    season: "season";
    episode: "episode";
    watchedAt: "watchedAt";
  };

  export type WatchedEpisodeScalarFieldEnum =
    (typeof WatchedEpisodeScalarFieldEnum)[keyof typeof WatchedEpisodeScalarFieldEnum];

  export const AuditLogScalarFieldEnum: {
    id: "id";
    userId: "userId";
    action: "action";
    metadata: "metadata";
    ipAddress: "ipAddress";
    userAgent: "userAgent";
    createdAt: "createdAt";
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];

  export const AnalyticsEventScalarFieldEnum: {
    id: "id";
    userId: "userId";
    event: "event";
    properties: "properties";
    sessionId: "sessionId";
    ipAddress: "ipAddress";
    createdAt: "createdAt";
  };

  export type AnalyticsEventScalarFieldEnum =
    (typeof AnalyticsEventScalarFieldEnum)[keyof typeof AnalyticsEventScalarFieldEnum];

  export const SortOrder: {
    asc: "asc";
    desc: "desc";
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];

  export const QueryMode: {
    default: "default";
    insensitive: "insensitive";
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: "first";
    last: "last";
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String">;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String[]">;

  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Role">;

  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Role[]">;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Boolean">;

  /**
   * Reference to a field of type 'SubscriptionTier'
   */
  export type EnumSubscriptionTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "SubscriptionTier">;

  /**
   * Reference to a field of type 'SubscriptionTier[]'
   */
  export type ListEnumSubscriptionTierFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "SubscriptionTier[]"
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "DateTime">;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "DateTime[]">;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float">;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float[]">;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int">;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int[]">;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Json">;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<"User"> | string;
    email?: StringFilter<"User"> | string;
    username?: StringFilter<"User"> | string;
    displayName?: StringNullableFilter<"User"> | string | null;
    bio?: StringNullableFilter<"User"> | string | null;
    avatarUrl?: StringNullableFilter<"User"> | string | null;
    role?: EnumRoleFilter<"User"> | $Enums.Role;
    isVerified?: BoolFilter<"User"> | boolean;
    authUserId?: StringFilter<"User"> | string;
    subscriptionTier?: EnumSubscriptionTierFilter<"User"> | $Enums.SubscriptionTier;
    subscriptionExpiry?: DateTimeNullableFilter<"User"> | Date | string | null;
    currencyPreference?: StringFilter<"User"> | string;
    trialStartDate?: DateTimeNullableFilter<"User"> | Date | string | null;
    createdAt?: DateTimeFilter<"User"> | Date | string;
    updatedAt?: DateTimeFilter<"User"> | Date | string;
    settings?: XOR<UserSettingsNullableRelationFilter, UserSettingsWhereInput> | null;
    devices?: DeviceListRelationFilter;
    watchlist?: WatchlistItemListRelationFilter;
    continueWatching?: ContinueWatchingListRelationFilter;
    watchedEpisodes?: WatchedEpisodeListRelationFilter;
    auditLogs?: AuditLogListRelationFilter;
    analyticsEvents?: AnalyticsEventListRelationFilter;
    payments?: PaymentListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrderInput | SortOrder;
    bio?: SortOrderInput | SortOrder;
    avatarUrl?: SortOrderInput | SortOrder;
    role?: SortOrder;
    isVerified?: SortOrder;
    authUserId?: SortOrder;
    subscriptionTier?: SortOrder;
    subscriptionExpiry?: SortOrderInput | SortOrder;
    currencyPreference?: SortOrder;
    trialStartDate?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    settings?: UserSettingsOrderByWithRelationInput;
    devices?: DeviceOrderByRelationAggregateInput;
    watchlist?: WatchlistItemOrderByRelationAggregateInput;
    continueWatching?: ContinueWatchingOrderByRelationAggregateInput;
    watchedEpisodes?: WatchedEpisodeOrderByRelationAggregateInput;
    auditLogs?: AuditLogOrderByRelationAggregateInput;
    analyticsEvents?: AnalyticsEventOrderByRelationAggregateInput;
    payments?: PaymentOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      email?: string;
      username?: string;
      authUserId?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      displayName?: StringNullableFilter<"User"> | string | null;
      bio?: StringNullableFilter<"User"> | string | null;
      avatarUrl?: StringNullableFilter<"User"> | string | null;
      role?: EnumRoleFilter<"User"> | $Enums.Role;
      isVerified?: BoolFilter<"User"> | boolean;
      subscriptionTier?: EnumSubscriptionTierFilter<"User"> | $Enums.SubscriptionTier;
      subscriptionExpiry?: DateTimeNullableFilter<"User"> | Date | string | null;
      currencyPreference?: StringFilter<"User"> | string;
      trialStartDate?: DateTimeNullableFilter<"User"> | Date | string | null;
      createdAt?: DateTimeFilter<"User"> | Date | string;
      updatedAt?: DateTimeFilter<"User"> | Date | string;
      settings?: XOR<UserSettingsNullableRelationFilter, UserSettingsWhereInput> | null;
      devices?: DeviceListRelationFilter;
      watchlist?: WatchlistItemListRelationFilter;
      continueWatching?: ContinueWatchingListRelationFilter;
      watchedEpisodes?: WatchedEpisodeListRelationFilter;
      auditLogs?: AuditLogListRelationFilter;
      analyticsEvents?: AnalyticsEventListRelationFilter;
      payments?: PaymentListRelationFilter;
    },
    "id" | "email" | "username" | "authUserId"
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrderInput | SortOrder;
    bio?: SortOrderInput | SortOrder;
    avatarUrl?: SortOrderInput | SortOrder;
    role?: SortOrder;
    isVerified?: SortOrder;
    authUserId?: SortOrder;
    subscriptionTier?: SortOrder;
    subscriptionExpiry?: SortOrderInput | SortOrder;
    currencyPreference?: SortOrder;
    trialStartDate?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"User"> | string;
    email?: StringWithAggregatesFilter<"User"> | string;
    username?: StringWithAggregatesFilter<"User"> | string;
    displayName?: StringNullableWithAggregatesFilter<"User"> | string | null;
    bio?: StringNullableWithAggregatesFilter<"User"> | string | null;
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null;
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role;
    isVerified?: BoolWithAggregatesFilter<"User"> | boolean;
    authUserId?: StringWithAggregatesFilter<"User"> | string;
    subscriptionTier?: EnumSubscriptionTierWithAggregatesFilter<"User"> | $Enums.SubscriptionTier;
    subscriptionExpiry?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null;
    currencyPreference?: StringWithAggregatesFilter<"User"> | string;
    trialStartDate?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
  };

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[];
    OR?: PaymentWhereInput[];
    NOT?: PaymentWhereInput | PaymentWhereInput[];
    id?: StringFilter<"Payment"> | string;
    userId?: StringFilter<"Payment"> | string;
    orderId?: StringFilter<"Payment"> | string;
    amount?: FloatFilter<"Payment"> | number;
    currency?: StringFilter<"Payment"> | string;
    status?: StringFilter<"Payment"> | string;
    paymentId?: StringNullableFilter<"Payment"> | string | null;
    method?: StringNullableFilter<"Payment"> | string | null;
    createdAt?: DateTimeFilter<"Payment"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    orderId?: SortOrder;
    amount?: SortOrder;
    currency?: SortOrder;
    status?: SortOrder;
    paymentId?: SortOrderInput | SortOrder;
    method?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type PaymentWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      orderId?: string;
      AND?: PaymentWhereInput | PaymentWhereInput[];
      OR?: PaymentWhereInput[];
      NOT?: PaymentWhereInput | PaymentWhereInput[];
      userId?: StringFilter<"Payment"> | string;
      amount?: FloatFilter<"Payment"> | number;
      currency?: StringFilter<"Payment"> | string;
      status?: StringFilter<"Payment"> | string;
      paymentId?: StringNullableFilter<"Payment"> | string | null;
      method?: StringNullableFilter<"Payment"> | string | null;
      createdAt?: DateTimeFilter<"Payment"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "orderId"
  >;

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    orderId?: SortOrder;
    amount?: SortOrder;
    currency?: SortOrder;
    status?: SortOrder;
    paymentId?: SortOrderInput | SortOrder;
    method?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: PaymentCountOrderByAggregateInput;
    _avg?: PaymentAvgOrderByAggregateInput;
    _max?: PaymentMaxOrderByAggregateInput;
    _min?: PaymentMinOrderByAggregateInput;
    _sum?: PaymentSumOrderByAggregateInput;
  };

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[];
    OR?: PaymentScalarWhereWithAggregatesInput[];
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Payment"> | string;
    userId?: StringWithAggregatesFilter<"Payment"> | string;
    orderId?: StringWithAggregatesFilter<"Payment"> | string;
    amount?: FloatWithAggregatesFilter<"Payment"> | number;
    currency?: StringWithAggregatesFilter<"Payment"> | string;
    status?: StringWithAggregatesFilter<"Payment"> | string;
    paymentId?: StringNullableWithAggregatesFilter<"Payment"> | string | null;
    method?: StringNullableWithAggregatesFilter<"Payment"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string;
  };

  export type UserSettingsWhereInput = {
    AND?: UserSettingsWhereInput | UserSettingsWhereInput[];
    OR?: UserSettingsWhereInput[];
    NOT?: UserSettingsWhereInput | UserSettingsWhereInput[];
    id?: StringFilter<"UserSettings"> | string;
    userId?: StringFilter<"UserSettings"> | string;
    language?: StringFilter<"UserSettings"> | string;
    autoplay?: BoolFilter<"UserSettings"> | boolean;
    preferredProvider?: StringNullableFilter<"UserSettings"> | string | null;
    subtitleLang?: StringNullableFilter<"UserSettings"> | string | null;
    quality?: StringNullableFilter<"UserSettings"> | string | null;
    notifications?: BoolFilter<"UserSettings"> | boolean;
    createdAt?: DateTimeFilter<"UserSettings"> | Date | string;
    updatedAt?: DateTimeFilter<"UserSettings"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type UserSettingsOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    language?: SortOrder;
    autoplay?: SortOrder;
    preferredProvider?: SortOrderInput | SortOrder;
    subtitleLang?: SortOrderInput | SortOrder;
    quality?: SortOrderInput | SortOrder;
    notifications?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type UserSettingsWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId?: string;
      AND?: UserSettingsWhereInput | UserSettingsWhereInput[];
      OR?: UserSettingsWhereInput[];
      NOT?: UserSettingsWhereInput | UserSettingsWhereInput[];
      language?: StringFilter<"UserSettings"> | string;
      autoplay?: BoolFilter<"UserSettings"> | boolean;
      preferredProvider?: StringNullableFilter<"UserSettings"> | string | null;
      subtitleLang?: StringNullableFilter<"UserSettings"> | string | null;
      quality?: StringNullableFilter<"UserSettings"> | string | null;
      notifications?: BoolFilter<"UserSettings"> | boolean;
      createdAt?: DateTimeFilter<"UserSettings"> | Date | string;
      updatedAt?: DateTimeFilter<"UserSettings"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "userId"
  >;

  export type UserSettingsOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    language?: SortOrder;
    autoplay?: SortOrder;
    preferredProvider?: SortOrderInput | SortOrder;
    subtitleLang?: SortOrderInput | SortOrder;
    quality?: SortOrderInput | SortOrder;
    notifications?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: UserSettingsCountOrderByAggregateInput;
    _max?: UserSettingsMaxOrderByAggregateInput;
    _min?: UserSettingsMinOrderByAggregateInput;
  };

  export type UserSettingsScalarWhereWithAggregatesInput = {
    AND?: UserSettingsScalarWhereWithAggregatesInput | UserSettingsScalarWhereWithAggregatesInput[];
    OR?: UserSettingsScalarWhereWithAggregatesInput[];
    NOT?: UserSettingsScalarWhereWithAggregatesInput | UserSettingsScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"UserSettings"> | string;
    userId?: StringWithAggregatesFilter<"UserSettings"> | string;
    language?: StringWithAggregatesFilter<"UserSettings"> | string;
    autoplay?: BoolWithAggregatesFilter<"UserSettings"> | boolean;
    preferredProvider?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null;
    subtitleLang?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null;
    quality?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null;
    notifications?: BoolWithAggregatesFilter<"UserSettings"> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<"UserSettings"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"UserSettings"> | Date | string;
  };

  export type DeviceWhereInput = {
    AND?: DeviceWhereInput | DeviceWhereInput[];
    OR?: DeviceWhereInput[];
    NOT?: DeviceWhereInput | DeviceWhereInput[];
    id?: StringFilter<"Device"> | string;
    userId?: StringFilter<"Device"> | string;
    deviceId?: StringFilter<"Device"> | string;
    deviceName?: StringNullableFilter<"Device"> | string | null;
    platform?: StringNullableFilter<"Device"> | string | null;
    browser?: StringNullableFilter<"Device"> | string | null;
    appVersion?: StringNullableFilter<"Device"> | string | null;
    lastActive?: DateTimeFilter<"Device"> | Date | string;
    lastIp?: StringNullableFilter<"Device"> | string | null;
    createdAt?: DateTimeFilter<"Device"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type DeviceOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    deviceId?: SortOrder;
    deviceName?: SortOrderInput | SortOrder;
    platform?: SortOrderInput | SortOrder;
    browser?: SortOrderInput | SortOrder;
    appVersion?: SortOrderInput | SortOrder;
    lastActive?: SortOrder;
    lastIp?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type DeviceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId_deviceId?: DeviceUserIdDeviceIdCompoundUniqueInput;
      AND?: DeviceWhereInput | DeviceWhereInput[];
      OR?: DeviceWhereInput[];
      NOT?: DeviceWhereInput | DeviceWhereInput[];
      userId?: StringFilter<"Device"> | string;
      deviceId?: StringFilter<"Device"> | string;
      deviceName?: StringNullableFilter<"Device"> | string | null;
      platform?: StringNullableFilter<"Device"> | string | null;
      browser?: StringNullableFilter<"Device"> | string | null;
      appVersion?: StringNullableFilter<"Device"> | string | null;
      lastActive?: DateTimeFilter<"Device"> | Date | string;
      lastIp?: StringNullableFilter<"Device"> | string | null;
      createdAt?: DateTimeFilter<"Device"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "userId_deviceId"
  >;

  export type DeviceOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    deviceId?: SortOrder;
    deviceName?: SortOrderInput | SortOrder;
    platform?: SortOrderInput | SortOrder;
    browser?: SortOrderInput | SortOrder;
    appVersion?: SortOrderInput | SortOrder;
    lastActive?: SortOrder;
    lastIp?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: DeviceCountOrderByAggregateInput;
    _max?: DeviceMaxOrderByAggregateInput;
    _min?: DeviceMinOrderByAggregateInput;
  };

  export type DeviceScalarWhereWithAggregatesInput = {
    AND?: DeviceScalarWhereWithAggregatesInput | DeviceScalarWhereWithAggregatesInput[];
    OR?: DeviceScalarWhereWithAggregatesInput[];
    NOT?: DeviceScalarWhereWithAggregatesInput | DeviceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Device"> | string;
    userId?: StringWithAggregatesFilter<"Device"> | string;
    deviceId?: StringWithAggregatesFilter<"Device"> | string;
    deviceName?: StringNullableWithAggregatesFilter<"Device"> | string | null;
    platform?: StringNullableWithAggregatesFilter<"Device"> | string | null;
    browser?: StringNullableWithAggregatesFilter<"Device"> | string | null;
    appVersion?: StringNullableWithAggregatesFilter<"Device"> | string | null;
    lastActive?: DateTimeWithAggregatesFilter<"Device"> | Date | string;
    lastIp?: StringNullableWithAggregatesFilter<"Device"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"Device"> | Date | string;
  };

  export type WatchlistItemWhereInput = {
    AND?: WatchlistItemWhereInput | WatchlistItemWhereInput[];
    OR?: WatchlistItemWhereInput[];
    NOT?: WatchlistItemWhereInput | WatchlistItemWhereInput[];
    id?: StringFilter<"WatchlistItem"> | string;
    userId?: StringFilter<"WatchlistItem"> | string;
    tmdbId?: StringFilter<"WatchlistItem"> | string;
    mediaType?: StringFilter<"WatchlistItem"> | string;
    title?: StringFilter<"WatchlistItem"> | string;
    posterPath?: StringNullableFilter<"WatchlistItem"> | string | null;
    year?: IntNullableFilter<"WatchlistItem"> | number | null;
    rating?: FloatNullableFilter<"WatchlistItem"> | number | null;
    genres?: StringNullableFilter<"WatchlistItem"> | string | null;
    addedAt?: DateTimeFilter<"WatchlistItem"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type WatchlistItemOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrderInput | SortOrder;
    year?: SortOrderInput | SortOrder;
    rating?: SortOrderInput | SortOrder;
    genres?: SortOrderInput | SortOrder;
    addedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type WatchlistItemWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId_tmdbId?: WatchlistItemUserIdTmdbIdCompoundUniqueInput;
      AND?: WatchlistItemWhereInput | WatchlistItemWhereInput[];
      OR?: WatchlistItemWhereInput[];
      NOT?: WatchlistItemWhereInput | WatchlistItemWhereInput[];
      userId?: StringFilter<"WatchlistItem"> | string;
      tmdbId?: StringFilter<"WatchlistItem"> | string;
      mediaType?: StringFilter<"WatchlistItem"> | string;
      title?: StringFilter<"WatchlistItem"> | string;
      posterPath?: StringNullableFilter<"WatchlistItem"> | string | null;
      year?: IntNullableFilter<"WatchlistItem"> | number | null;
      rating?: FloatNullableFilter<"WatchlistItem"> | number | null;
      genres?: StringNullableFilter<"WatchlistItem"> | string | null;
      addedAt?: DateTimeFilter<"WatchlistItem"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "userId_tmdbId"
  >;

  export type WatchlistItemOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrderInput | SortOrder;
    year?: SortOrderInput | SortOrder;
    rating?: SortOrderInput | SortOrder;
    genres?: SortOrderInput | SortOrder;
    addedAt?: SortOrder;
    _count?: WatchlistItemCountOrderByAggregateInput;
    _avg?: WatchlistItemAvgOrderByAggregateInput;
    _max?: WatchlistItemMaxOrderByAggregateInput;
    _min?: WatchlistItemMinOrderByAggregateInput;
    _sum?: WatchlistItemSumOrderByAggregateInput;
  };

  export type WatchlistItemScalarWhereWithAggregatesInput = {
    AND?: WatchlistItemScalarWhereWithAggregatesInput | WatchlistItemScalarWhereWithAggregatesInput[];
    OR?: WatchlistItemScalarWhereWithAggregatesInput[];
    NOT?: WatchlistItemScalarWhereWithAggregatesInput | WatchlistItemScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"WatchlistItem"> | string;
    userId?: StringWithAggregatesFilter<"WatchlistItem"> | string;
    tmdbId?: StringWithAggregatesFilter<"WatchlistItem"> | string;
    mediaType?: StringWithAggregatesFilter<"WatchlistItem"> | string;
    title?: StringWithAggregatesFilter<"WatchlistItem"> | string;
    posterPath?: StringNullableWithAggregatesFilter<"WatchlistItem"> | string | null;
    year?: IntNullableWithAggregatesFilter<"WatchlistItem"> | number | null;
    rating?: FloatNullableWithAggregatesFilter<"WatchlistItem"> | number | null;
    genres?: StringNullableWithAggregatesFilter<"WatchlistItem"> | string | null;
    addedAt?: DateTimeWithAggregatesFilter<"WatchlistItem"> | Date | string;
  };

  export type ContinueWatchingWhereInput = {
    AND?: ContinueWatchingWhereInput | ContinueWatchingWhereInput[];
    OR?: ContinueWatchingWhereInput[];
    NOT?: ContinueWatchingWhereInput | ContinueWatchingWhereInput[];
    id?: StringFilter<"ContinueWatching"> | string;
    userId?: StringFilter<"ContinueWatching"> | string;
    tmdbId?: StringFilter<"ContinueWatching"> | string;
    mediaType?: StringFilter<"ContinueWatching"> | string;
    title?: StringFilter<"ContinueWatching"> | string;
    posterPath?: StringNullableFilter<"ContinueWatching"> | string | null;
    season?: IntFilter<"ContinueWatching"> | number;
    episode?: IntFilter<"ContinueWatching"> | number;
    currentTime?: FloatFilter<"ContinueWatching"> | number;
    duration?: FloatFilter<"ContinueWatching"> | number;
    progress?: IntFilter<"ContinueWatching"> | number;
    provider?: StringNullableFilter<"ContinueWatching"> | string | null;
    updatedAt?: DateTimeFilter<"ContinueWatching"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type ContinueWatchingOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrderInput | SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
    provider?: SortOrderInput | SortOrder;
    updatedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type ContinueWatchingWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId_tmdbId_season_episode?: ContinueWatchingUserIdTmdbIdSeasonEpisodeCompoundUniqueInput;
      AND?: ContinueWatchingWhereInput | ContinueWatchingWhereInput[];
      OR?: ContinueWatchingWhereInput[];
      NOT?: ContinueWatchingWhereInput | ContinueWatchingWhereInput[];
      userId?: StringFilter<"ContinueWatching"> | string;
      tmdbId?: StringFilter<"ContinueWatching"> | string;
      mediaType?: StringFilter<"ContinueWatching"> | string;
      title?: StringFilter<"ContinueWatching"> | string;
      posterPath?: StringNullableFilter<"ContinueWatching"> | string | null;
      season?: IntFilter<"ContinueWatching"> | number;
      episode?: IntFilter<"ContinueWatching"> | number;
      currentTime?: FloatFilter<"ContinueWatching"> | number;
      duration?: FloatFilter<"ContinueWatching"> | number;
      progress?: IntFilter<"ContinueWatching"> | number;
      provider?: StringNullableFilter<"ContinueWatching"> | string | null;
      updatedAt?: DateTimeFilter<"ContinueWatching"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "userId_tmdbId_season_episode"
  >;

  export type ContinueWatchingOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrderInput | SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
    provider?: SortOrderInput | SortOrder;
    updatedAt?: SortOrder;
    _count?: ContinueWatchingCountOrderByAggregateInput;
    _avg?: ContinueWatchingAvgOrderByAggregateInput;
    _max?: ContinueWatchingMaxOrderByAggregateInput;
    _min?: ContinueWatchingMinOrderByAggregateInput;
    _sum?: ContinueWatchingSumOrderByAggregateInput;
  };

  export type ContinueWatchingScalarWhereWithAggregatesInput = {
    AND?: ContinueWatchingScalarWhereWithAggregatesInput | ContinueWatchingScalarWhereWithAggregatesInput[];
    OR?: ContinueWatchingScalarWhereWithAggregatesInput[];
    NOT?: ContinueWatchingScalarWhereWithAggregatesInput | ContinueWatchingScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"ContinueWatching"> | string;
    userId?: StringWithAggregatesFilter<"ContinueWatching"> | string;
    tmdbId?: StringWithAggregatesFilter<"ContinueWatching"> | string;
    mediaType?: StringWithAggregatesFilter<"ContinueWatching"> | string;
    title?: StringWithAggregatesFilter<"ContinueWatching"> | string;
    posterPath?: StringNullableWithAggregatesFilter<"ContinueWatching"> | string | null;
    season?: IntWithAggregatesFilter<"ContinueWatching"> | number;
    episode?: IntWithAggregatesFilter<"ContinueWatching"> | number;
    currentTime?: FloatWithAggregatesFilter<"ContinueWatching"> | number;
    duration?: FloatWithAggregatesFilter<"ContinueWatching"> | number;
    progress?: IntWithAggregatesFilter<"ContinueWatching"> | number;
    provider?: StringNullableWithAggregatesFilter<"ContinueWatching"> | string | null;
    updatedAt?: DateTimeWithAggregatesFilter<"ContinueWatching"> | Date | string;
  };

  export type WatchedEpisodeWhereInput = {
    AND?: WatchedEpisodeWhereInput | WatchedEpisodeWhereInput[];
    OR?: WatchedEpisodeWhereInput[];
    NOT?: WatchedEpisodeWhereInput | WatchedEpisodeWhereInput[];
    id?: StringFilter<"WatchedEpisode"> | string;
    userId?: StringFilter<"WatchedEpisode"> | string;
    tvdbId?: StringFilter<"WatchedEpisode"> | string;
    season?: IntFilter<"WatchedEpisode"> | number;
    episode?: IntFilter<"WatchedEpisode"> | number;
    watchedAt?: DateTimeFilter<"WatchedEpisode"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type WatchedEpisodeOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tvdbId?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    watchedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type WatchedEpisodeWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId_tvdbId_season_episode?: WatchedEpisodeUserIdTvdbIdSeasonEpisodeCompoundUniqueInput;
      AND?: WatchedEpisodeWhereInput | WatchedEpisodeWhereInput[];
      OR?: WatchedEpisodeWhereInput[];
      NOT?: WatchedEpisodeWhereInput | WatchedEpisodeWhereInput[];
      userId?: StringFilter<"WatchedEpisode"> | string;
      tvdbId?: StringFilter<"WatchedEpisode"> | string;
      season?: IntFilter<"WatchedEpisode"> | number;
      episode?: IntFilter<"WatchedEpisode"> | number;
      watchedAt?: DateTimeFilter<"WatchedEpisode"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id" | "userId_tvdbId_season_episode"
  >;

  export type WatchedEpisodeOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tvdbId?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    watchedAt?: SortOrder;
    _count?: WatchedEpisodeCountOrderByAggregateInput;
    _avg?: WatchedEpisodeAvgOrderByAggregateInput;
    _max?: WatchedEpisodeMaxOrderByAggregateInput;
    _min?: WatchedEpisodeMinOrderByAggregateInput;
    _sum?: WatchedEpisodeSumOrderByAggregateInput;
  };

  export type WatchedEpisodeScalarWhereWithAggregatesInput = {
    AND?: WatchedEpisodeScalarWhereWithAggregatesInput | WatchedEpisodeScalarWhereWithAggregatesInput[];
    OR?: WatchedEpisodeScalarWhereWithAggregatesInput[];
    NOT?: WatchedEpisodeScalarWhereWithAggregatesInput | WatchedEpisodeScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"WatchedEpisode"> | string;
    userId?: StringWithAggregatesFilter<"WatchedEpisode"> | string;
    tvdbId?: StringWithAggregatesFilter<"WatchedEpisode"> | string;
    season?: IntWithAggregatesFilter<"WatchedEpisode"> | number;
    episode?: IntWithAggregatesFilter<"WatchedEpisode"> | number;
    watchedAt?: DateTimeWithAggregatesFilter<"WatchedEpisode"> | Date | string;
  };

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[];
    OR?: AuditLogWhereInput[];
    NOT?: AuditLogWhereInput | AuditLogWhereInput[];
    id?: StringFilter<"AuditLog"> | string;
    userId?: StringFilter<"AuditLog"> | string;
    action?: StringFilter<"AuditLog"> | string;
    metadata?: JsonNullableFilter<"AuditLog">;
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null;
    userAgent?: StringNullableFilter<"AuditLog"> | string | null;
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string;
    user?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: AuditLogWhereInput | AuditLogWhereInput[];
      OR?: AuditLogWhereInput[];
      NOT?: AuditLogWhereInput | AuditLogWhereInput[];
      userId?: StringFilter<"AuditLog"> | string;
      action?: StringFilter<"AuditLog"> | string;
      metadata?: JsonNullableFilter<"AuditLog">;
      ipAddress?: StringNullableFilter<"AuditLog"> | string | null;
      userAgent?: StringNullableFilter<"AuditLog"> | string | null;
      createdAt?: DateTimeFilter<"AuditLog"> | Date | string;
      user?: XOR<UserRelationFilter, UserWhereInput>;
    },
    "id"
  >;

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: AuditLogCountOrderByAggregateInput;
    _max?: AuditLogMaxOrderByAggregateInput;
    _min?: AuditLogMinOrderByAggregateInput;
  };

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[];
    OR?: AuditLogScalarWhereWithAggregatesInput[];
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"AuditLog"> | string;
    userId?: StringWithAggregatesFilter<"AuditLog"> | string;
    action?: StringWithAggregatesFilter<"AuditLog"> | string;
    metadata?: JsonNullableWithAggregatesFilter<"AuditLog">;
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null;
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string;
  };

  export type AnalyticsEventWhereInput = {
    AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[];
    OR?: AnalyticsEventWhereInput[];
    NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[];
    id?: StringFilter<"AnalyticsEvent"> | string;
    userId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    event?: StringFilter<"AnalyticsEvent"> | string;
    properties?: JsonNullableFilter<"AnalyticsEvent">;
    sessionId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    ipAddress?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string;
    user?: XOR<UserNullableRelationFilter, UserWhereInput> | null;
  };

  export type AnalyticsEventOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    event?: SortOrder;
    properties?: SortOrderInput | SortOrder;
    sessionId?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type AnalyticsEventWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[];
      OR?: AnalyticsEventWhereInput[];
      NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[];
      userId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
      event?: StringFilter<"AnalyticsEvent"> | string;
      properties?: JsonNullableFilter<"AnalyticsEvent">;
      sessionId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
      ipAddress?: StringNullableFilter<"AnalyticsEvent"> | string | null;
      createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string;
      user?: XOR<UserNullableRelationFilter, UserWhereInput> | null;
    },
    "id"
  >;

  export type AnalyticsEventOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    event?: SortOrder;
    properties?: SortOrderInput | SortOrder;
    sessionId?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: AnalyticsEventCountOrderByAggregateInput;
    _max?: AnalyticsEventMaxOrderByAggregateInput;
    _min?: AnalyticsEventMinOrderByAggregateInput;
  };

  export type AnalyticsEventScalarWhereWithAggregatesInput = {
    AND?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[];
    OR?: AnalyticsEventScalarWhereWithAggregatesInput[];
    NOT?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"AnalyticsEvent"> | string;
    userId?: StringNullableWithAggregatesFilter<"AnalyticsEvent"> | string | null;
    event?: StringWithAggregatesFilter<"AnalyticsEvent"> | string;
    properties?: JsonNullableWithAggregatesFilter<"AnalyticsEvent">;
    sessionId?: StringNullableWithAggregatesFilter<"AnalyticsEvent"> | string | null;
    ipAddress?: StringNullableWithAggregatesFilter<"AnalyticsEvent"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"AnalyticsEvent"> | Date | string;
  };

  export type UserCreateInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentCreateInput = {
    id?: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutPaymentsInput;
  };

  export type PaymentUncheckedCreateInput = {
    id?: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
  };

  export type PaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput;
  };

  export type PaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentCreateManyInput = {
    id?: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
  };

  export type PaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingsCreateInput = {
    id?: string;
    language?: string;
    autoplay?: boolean;
    preferredProvider?: string | null;
    subtitleLang?: string | null;
    quality?: string | null;
    notifications?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutSettingsInput;
  };

  export type UserSettingsUncheckedCreateInput = {
    id?: string;
    userId: string;
    language?: string;
    autoplay?: boolean;
    preferredProvider?: string | null;
    subtitleLang?: string | null;
    quality?: string | null;
    notifications?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutSettingsNestedInput;
  };

  export type UserSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingsCreateManyInput = {
    id?: string;
    userId: string;
    language?: string;
    autoplay?: boolean;
    preferredProvider?: string | null;
    subtitleLang?: string | null;
    quality?: string | null;
    notifications?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceCreateInput = {
    id?: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutDevicesInput;
  };

  export type DeviceUncheckedCreateInput = {
    id?: string;
    userId: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
  };

  export type DeviceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutDevicesNestedInput;
  };

  export type DeviceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceCreateManyInput = {
    id?: string;
    userId: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
  };

  export type DeviceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemCreateInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
    user: UserCreateNestedOneWithoutWatchlistInput;
  };

  export type WatchlistItemUncheckedCreateInput = {
    id?: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
  };

  export type WatchlistItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutWatchlistNestedInput;
  };

  export type WatchlistItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemCreateManyInput = {
    id?: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
  };

  export type WatchlistItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingCreateInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutContinueWatchingInput;
  };

  export type ContinueWatchingUncheckedCreateInput = {
    id?: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
  };

  export type ContinueWatchingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutContinueWatchingNestedInput;
  };

  export type ContinueWatchingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingCreateManyInput = {
    id?: string;
    userId: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
  };

  export type ContinueWatchingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeCreateInput = {
    id?: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
    user: UserCreateNestedOneWithoutWatchedEpisodesInput;
  };

  export type WatchedEpisodeUncheckedCreateInput = {
    id?: string;
    userId: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
  };

  export type WatchedEpisodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutWatchedEpisodesNestedInput;
  };

  export type WatchedEpisodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeCreateManyInput = {
    id?: string;
    userId: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
  };

  export type WatchedEpisodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogCreateInput = {
    id?: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutAuditLogsInput;
  };

  export type AuditLogUncheckedCreateInput = {
    id?: string;
    userId: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutAuditLogsNestedInput;
  };

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogCreateManyInput = {
    id?: string;
    userId: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventCreateInput = {
    id?: string;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
    user?: UserCreateNestedOneWithoutAnalyticsEventsInput;
  };

  export type AnalyticsEventUncheckedCreateInput = {
    id?: string;
    userId?: string | null;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
  };

  export type AnalyticsEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneWithoutAnalyticsEventsNestedInput;
  };

  export type AnalyticsEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventCreateManyInput = {
    id?: string;
    userId?: string | null;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
  };

  export type AnalyticsEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type EnumSubscriptionTierFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionTier | EnumSubscriptionTierFieldRefInput<$PrismaModel>;
    in?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    not?: NestedEnumSubscriptionTierFilter<$PrismaModel> | $Enums.SubscriptionTier;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type UserSettingsNullableRelationFilter = {
    is?: UserSettingsWhereInput | null;
    isNot?: UserSettingsWhereInput | null;
  };

  export type DeviceListRelationFilter = {
    every?: DeviceWhereInput;
    some?: DeviceWhereInput;
    none?: DeviceWhereInput;
  };

  export type WatchlistItemListRelationFilter = {
    every?: WatchlistItemWhereInput;
    some?: WatchlistItemWhereInput;
    none?: WatchlistItemWhereInput;
  };

  export type ContinueWatchingListRelationFilter = {
    every?: ContinueWatchingWhereInput;
    some?: ContinueWatchingWhereInput;
    none?: ContinueWatchingWhereInput;
  };

  export type WatchedEpisodeListRelationFilter = {
    every?: WatchedEpisodeWhereInput;
    some?: WatchedEpisodeWhereInput;
    none?: WatchedEpisodeWhereInput;
  };

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput;
    some?: AuditLogWhereInput;
    none?: AuditLogWhereInput;
  };

  export type AnalyticsEventListRelationFilter = {
    every?: AnalyticsEventWhereInput;
    some?: AnalyticsEventWhereInput;
    none?: AnalyticsEventWhereInput;
  };

  export type PaymentListRelationFilter = {
    every?: PaymentWhereInput;
    some?: PaymentWhereInput;
    none?: PaymentWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type DeviceOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type WatchlistItemOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ContinueWatchingOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type WatchedEpisodeOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type AnalyticsEventOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type PaymentOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    bio?: SortOrder;
    avatarUrl?: SortOrder;
    role?: SortOrder;
    isVerified?: SortOrder;
    authUserId?: SortOrder;
    subscriptionTier?: SortOrder;
    subscriptionExpiry?: SortOrder;
    currencyPreference?: SortOrder;
    trialStartDate?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    bio?: SortOrder;
    avatarUrl?: SortOrder;
    role?: SortOrder;
    isVerified?: SortOrder;
    authUserId?: SortOrder;
    subscriptionTier?: SortOrder;
    subscriptionExpiry?: SortOrder;
    currencyPreference?: SortOrder;
    trialStartDate?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    bio?: SortOrder;
    avatarUrl?: SortOrder;
    role?: SortOrder;
    isVerified?: SortOrder;
    authUserId?: SortOrder;
    subscriptionTier?: SortOrder;
    subscriptionExpiry?: SortOrder;
    currencyPreference?: SortOrder;
    trialStartDate?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRoleFilter<$PrismaModel>;
    _max?: NestedEnumRoleFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type EnumSubscriptionTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionTier | EnumSubscriptionTierFieldRefInput<$PrismaModel>;
    in?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    not?: NestedEnumSubscriptionTierWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionTier;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumSubscriptionTierFilter<$PrismaModel>;
    _max?: NestedEnumSubscriptionTierFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type UserRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    orderId?: SortOrder;
    amount?: SortOrder;
    currency?: SortOrder;
    status?: SortOrder;
    paymentId?: SortOrder;
    method?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PaymentAvgOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    orderId?: SortOrder;
    amount?: SortOrder;
    currency?: SortOrder;
    status?: SortOrder;
    paymentId?: SortOrder;
    method?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    orderId?: SortOrder;
    amount?: SortOrder;
    currency?: SortOrder;
    status?: SortOrder;
    paymentId?: SortOrder;
    method?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PaymentSumOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type UserSettingsCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    language?: SortOrder;
    autoplay?: SortOrder;
    preferredProvider?: SortOrder;
    subtitleLang?: SortOrder;
    quality?: SortOrder;
    notifications?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserSettingsMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    language?: SortOrder;
    autoplay?: SortOrder;
    preferredProvider?: SortOrder;
    subtitleLang?: SortOrder;
    quality?: SortOrder;
    notifications?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserSettingsMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    language?: SortOrder;
    autoplay?: SortOrder;
    preferredProvider?: SortOrder;
    subtitleLang?: SortOrder;
    quality?: SortOrder;
    notifications?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DeviceUserIdDeviceIdCompoundUniqueInput = {
    userId: string;
    deviceId: string;
  };

  export type DeviceCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    deviceId?: SortOrder;
    deviceName?: SortOrder;
    platform?: SortOrder;
    browser?: SortOrder;
    appVersion?: SortOrder;
    lastActive?: SortOrder;
    lastIp?: SortOrder;
    createdAt?: SortOrder;
  };

  export type DeviceMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    deviceId?: SortOrder;
    deviceName?: SortOrder;
    platform?: SortOrder;
    browser?: SortOrder;
    appVersion?: SortOrder;
    lastActive?: SortOrder;
    lastIp?: SortOrder;
    createdAt?: SortOrder;
  };

  export type DeviceMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    deviceId?: SortOrder;
    deviceName?: SortOrder;
    platform?: SortOrder;
    browser?: SortOrder;
    appVersion?: SortOrder;
    lastActive?: SortOrder;
    lastIp?: SortOrder;
    createdAt?: SortOrder;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type WatchlistItemUserIdTmdbIdCompoundUniqueInput = {
    userId: string;
    tmdbId: string;
  };

  export type WatchlistItemCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    year?: SortOrder;
    rating?: SortOrder;
    genres?: SortOrder;
    addedAt?: SortOrder;
  };

  export type WatchlistItemAvgOrderByAggregateInput = {
    year?: SortOrder;
    rating?: SortOrder;
  };

  export type WatchlistItemMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    year?: SortOrder;
    rating?: SortOrder;
    genres?: SortOrder;
    addedAt?: SortOrder;
  };

  export type WatchlistItemMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    year?: SortOrder;
    rating?: SortOrder;
    genres?: SortOrder;
    addedAt?: SortOrder;
  };

  export type WatchlistItemSumOrderByAggregateInput = {
    year?: SortOrder;
    rating?: SortOrder;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type ContinueWatchingUserIdTmdbIdSeasonEpisodeCompoundUniqueInput = {
    userId: string;
    tmdbId: string;
    season: number;
    episode: number;
  };

  export type ContinueWatchingCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
    provider?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ContinueWatchingAvgOrderByAggregateInput = {
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
  };

  export type ContinueWatchingMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
    provider?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ContinueWatchingMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tmdbId?: SortOrder;
    mediaType?: SortOrder;
    title?: SortOrder;
    posterPath?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
    provider?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ContinueWatchingSumOrderByAggregateInput = {
    season?: SortOrder;
    episode?: SortOrder;
    currentTime?: SortOrder;
    duration?: SortOrder;
    progress?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type WatchedEpisodeUserIdTvdbIdSeasonEpisodeCompoundUniqueInput = {
    userId: string;
    tvdbId: string;
    season: number;
    episode: number;
  };

  export type WatchedEpisodeCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tvdbId?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    watchedAt?: SortOrder;
  };

  export type WatchedEpisodeAvgOrderByAggregateInput = {
    season?: SortOrder;
    episode?: SortOrder;
  };

  export type WatchedEpisodeMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tvdbId?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    watchedAt?: SortOrder;
  };

  export type WatchedEpisodeMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    tvdbId?: SortOrder;
    season?: SortOrder;
    episode?: SortOrder;
    watchedAt?: SortOrder;
  };

  export type WatchedEpisodeSumOrderByAggregateInput = {
    season?: SortOrder;
    episode?: SortOrder;
  };
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, "path">
        >,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, "path">>;

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    metadata?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, "path">
        >,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, "path">>;

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedJsonNullableFilter<$PrismaModel>;
    _max?: NestedJsonNullableFilter<$PrismaModel>;
  };

  export type UserNullableRelationFilter = {
    is?: UserWhereInput | null;
    isNot?: UserWhereInput | null;
  };

  export type AnalyticsEventCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    event?: SortOrder;
    properties?: SortOrder;
    sessionId?: SortOrder;
    ipAddress?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AnalyticsEventMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    event?: SortOrder;
    sessionId?: SortOrder;
    ipAddress?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AnalyticsEventMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    event?: SortOrder;
    sessionId?: SortOrder;
    ipAddress?: SortOrder;
    createdAt?: SortOrder;
  };

  export type UserSettingsCreateNestedOneWithoutUserInput = {
    create?: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;
    connect?: UserSettingsWhereUniqueInput;
  };

  export type DeviceCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>
      | DeviceCreateWithoutUserInput[]
      | DeviceUncheckedCreateWithoutUserInput[];
    connectOrCreate?: DeviceCreateOrConnectWithoutUserInput | DeviceCreateOrConnectWithoutUserInput[];
    createMany?: DeviceCreateManyUserInputEnvelope;
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
  };

  export type WatchlistItemCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>
      | WatchlistItemCreateWithoutUserInput[]
      | WatchlistItemUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchlistItemCreateOrConnectWithoutUserInput | WatchlistItemCreateOrConnectWithoutUserInput[];
    createMany?: WatchlistItemCreateManyUserInputEnvelope;
    connect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
  };

  export type ContinueWatchingCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>
      | ContinueWatchingCreateWithoutUserInput[]
      | ContinueWatchingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      ContinueWatchingCreateOrConnectWithoutUserInput | ContinueWatchingCreateOrConnectWithoutUserInput[];
    createMany?: ContinueWatchingCreateManyUserInputEnvelope;
    connect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
  };

  export type WatchedEpisodeCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>
      | WatchedEpisodeCreateWithoutUserInput[]
      | WatchedEpisodeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchedEpisodeCreateOrConnectWithoutUserInput | WatchedEpisodeCreateOrConnectWithoutUserInput[];
    createMany?: WatchedEpisodeCreateManyUserInputEnvelope;
    connect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
  };

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
  };

  export type AnalyticsEventCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
      | AnalyticsEventCreateWithoutUserInput[]
      | AnalyticsEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[];
    createMany?: AnalyticsEventCreateManyUserInputEnvelope;
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
  };

  export type PaymentCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
      | PaymentCreateWithoutUserInput[]
      | PaymentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[];
    createMany?: PaymentCreateManyUserInputEnvelope;
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
  };

  export type UserSettingsUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;
    connect?: UserSettingsWhereUniqueInput;
  };

  export type DeviceUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>
      | DeviceCreateWithoutUserInput[]
      | DeviceUncheckedCreateWithoutUserInput[];
    connectOrCreate?: DeviceCreateOrConnectWithoutUserInput | DeviceCreateOrConnectWithoutUserInput[];
    createMany?: DeviceCreateManyUserInputEnvelope;
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
  };

  export type WatchlistItemUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>
      | WatchlistItemCreateWithoutUserInput[]
      | WatchlistItemUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchlistItemCreateOrConnectWithoutUserInput | WatchlistItemCreateOrConnectWithoutUserInput[];
    createMany?: WatchlistItemCreateManyUserInputEnvelope;
    connect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
  };

  export type ContinueWatchingUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>
      | ContinueWatchingCreateWithoutUserInput[]
      | ContinueWatchingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      ContinueWatchingCreateOrConnectWithoutUserInput | ContinueWatchingCreateOrConnectWithoutUserInput[];
    createMany?: ContinueWatchingCreateManyUserInputEnvelope;
    connect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
  };

  export type WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>
      | WatchedEpisodeCreateWithoutUserInput[]
      | WatchedEpisodeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchedEpisodeCreateOrConnectWithoutUserInput | WatchedEpisodeCreateOrConnectWithoutUserInput[];
    createMany?: WatchedEpisodeCreateManyUserInputEnvelope;
    connect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
  };

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
  };

  export type AnalyticsEventUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
      | AnalyticsEventCreateWithoutUserInput[]
      | AnalyticsEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[];
    createMany?: AnalyticsEventCreateManyUserInputEnvelope;
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
  };

  export type PaymentUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
      | PaymentCreateWithoutUserInput[]
      | PaymentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[];
    createMany?: PaymentCreateManyUserInputEnvelope;
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type EnumSubscriptionTierFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionTier;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type UserSettingsUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;
    upsert?: UserSettingsUpsertWithoutUserInput;
    disconnect?: UserSettingsWhereInput | boolean;
    delete?: UserSettingsWhereInput | boolean;
    connect?: UserSettingsWhereUniqueInput;
    update?: XOR<
      XOR<UserSettingsUpdateToOneWithWhereWithoutUserInput, UserSettingsUpdateWithoutUserInput>,
      UserSettingsUncheckedUpdateWithoutUserInput
    >;
  };

  export type DeviceUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>
      | DeviceCreateWithoutUserInput[]
      | DeviceUncheckedCreateWithoutUserInput[];
    connectOrCreate?: DeviceCreateOrConnectWithoutUserInput | DeviceCreateOrConnectWithoutUserInput[];
    upsert?: DeviceUpsertWithWhereUniqueWithoutUserInput | DeviceUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: DeviceCreateManyUserInputEnvelope;
    set?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    disconnect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    delete?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    update?: DeviceUpdateWithWhereUniqueWithoutUserInput | DeviceUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: DeviceUpdateManyWithWhereWithoutUserInput | DeviceUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: DeviceScalarWhereInput | DeviceScalarWhereInput[];
  };

  export type WatchlistItemUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>
      | WatchlistItemCreateWithoutUserInput[]
      | WatchlistItemUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchlistItemCreateOrConnectWithoutUserInput | WatchlistItemCreateOrConnectWithoutUserInput[];
    upsert?: WatchlistItemUpsertWithWhereUniqueWithoutUserInput | WatchlistItemUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: WatchlistItemCreateManyUserInputEnvelope;
    set?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    disconnect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    delete?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    connect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    update?: WatchlistItemUpdateWithWhereUniqueWithoutUserInput | WatchlistItemUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: WatchlistItemUpdateManyWithWhereWithoutUserInput | WatchlistItemUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: WatchlistItemScalarWhereInput | WatchlistItemScalarWhereInput[];
  };

  export type ContinueWatchingUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>
      | ContinueWatchingCreateWithoutUserInput[]
      | ContinueWatchingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      ContinueWatchingCreateOrConnectWithoutUserInput | ContinueWatchingCreateOrConnectWithoutUserInput[];
    upsert?:
      ContinueWatchingUpsertWithWhereUniqueWithoutUserInput | ContinueWatchingUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: ContinueWatchingCreateManyUserInputEnvelope;
    set?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    disconnect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    delete?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    connect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    update?:
      ContinueWatchingUpdateWithWhereUniqueWithoutUserInput | ContinueWatchingUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      ContinueWatchingUpdateManyWithWhereWithoutUserInput | ContinueWatchingUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: ContinueWatchingScalarWhereInput | ContinueWatchingScalarWhereInput[];
  };

  export type WatchedEpisodeUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>
      | WatchedEpisodeCreateWithoutUserInput[]
      | WatchedEpisodeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchedEpisodeCreateOrConnectWithoutUserInput | WatchedEpisodeCreateOrConnectWithoutUserInput[];
    upsert?:
      WatchedEpisodeUpsertWithWhereUniqueWithoutUserInput | WatchedEpisodeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: WatchedEpisodeCreateManyUserInputEnvelope;
    set?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    disconnect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    delete?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    connect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    update?:
      WatchedEpisodeUpdateWithWhereUniqueWithoutUserInput | WatchedEpisodeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      WatchedEpisodeUpdateManyWithWhereWithoutUserInput | WatchedEpisodeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: WatchedEpisodeScalarWhereInput | WatchedEpisodeScalarWhereInput[];
  };

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[];
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
  };

  export type AnalyticsEventUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
      | AnalyticsEventCreateWithoutUserInput[]
      | AnalyticsEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[];
    upsert?:
      AnalyticsEventUpsertWithWhereUniqueWithoutUserInput | AnalyticsEventUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AnalyticsEventCreateManyUserInputEnvelope;
    set?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    disconnect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    delete?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    update?:
      AnalyticsEventUpdateWithWhereUniqueWithoutUserInput | AnalyticsEventUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      AnalyticsEventUpdateManyWithWhereWithoutUserInput | AnalyticsEventUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[];
  };

  export type PaymentUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
      | PaymentCreateWithoutUserInput[]
      | PaymentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[];
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: PaymentCreateManyUserInputEnvelope;
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[];
  };

  export type UserSettingsUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;
    upsert?: UserSettingsUpsertWithoutUserInput;
    disconnect?: UserSettingsWhereInput | boolean;
    delete?: UserSettingsWhereInput | boolean;
    connect?: UserSettingsWhereUniqueInput;
    update?: XOR<
      XOR<UserSettingsUpdateToOneWithWhereWithoutUserInput, UserSettingsUpdateWithoutUserInput>,
      UserSettingsUncheckedUpdateWithoutUserInput
    >;
  };

  export type DeviceUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>
      | DeviceCreateWithoutUserInput[]
      | DeviceUncheckedCreateWithoutUserInput[];
    connectOrCreate?: DeviceCreateOrConnectWithoutUserInput | DeviceCreateOrConnectWithoutUserInput[];
    upsert?: DeviceUpsertWithWhereUniqueWithoutUserInput | DeviceUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: DeviceCreateManyUserInputEnvelope;
    set?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    disconnect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    delete?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    connect?: DeviceWhereUniqueInput | DeviceWhereUniqueInput[];
    update?: DeviceUpdateWithWhereUniqueWithoutUserInput | DeviceUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: DeviceUpdateManyWithWhereWithoutUserInput | DeviceUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: DeviceScalarWhereInput | DeviceScalarWhereInput[];
  };

  export type WatchlistItemUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>
      | WatchlistItemCreateWithoutUserInput[]
      | WatchlistItemUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchlistItemCreateOrConnectWithoutUserInput | WatchlistItemCreateOrConnectWithoutUserInput[];
    upsert?: WatchlistItemUpsertWithWhereUniqueWithoutUserInput | WatchlistItemUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: WatchlistItemCreateManyUserInputEnvelope;
    set?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    disconnect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    delete?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    connect?: WatchlistItemWhereUniqueInput | WatchlistItemWhereUniqueInput[];
    update?: WatchlistItemUpdateWithWhereUniqueWithoutUserInput | WatchlistItemUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: WatchlistItemUpdateManyWithWhereWithoutUserInput | WatchlistItemUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: WatchlistItemScalarWhereInput | WatchlistItemScalarWhereInput[];
  };

  export type ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>
      | ContinueWatchingCreateWithoutUserInput[]
      | ContinueWatchingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      ContinueWatchingCreateOrConnectWithoutUserInput | ContinueWatchingCreateOrConnectWithoutUserInput[];
    upsert?:
      ContinueWatchingUpsertWithWhereUniqueWithoutUserInput | ContinueWatchingUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: ContinueWatchingCreateManyUserInputEnvelope;
    set?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    disconnect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    delete?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    connect?: ContinueWatchingWhereUniqueInput | ContinueWatchingWhereUniqueInput[];
    update?:
      ContinueWatchingUpdateWithWhereUniqueWithoutUserInput | ContinueWatchingUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      ContinueWatchingUpdateManyWithWhereWithoutUserInput | ContinueWatchingUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: ContinueWatchingScalarWhereInput | ContinueWatchingScalarWhereInput[];
  };

  export type WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>
      | WatchedEpisodeCreateWithoutUserInput[]
      | WatchedEpisodeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: WatchedEpisodeCreateOrConnectWithoutUserInput | WatchedEpisodeCreateOrConnectWithoutUserInput[];
    upsert?:
      WatchedEpisodeUpsertWithWhereUniqueWithoutUserInput | WatchedEpisodeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: WatchedEpisodeCreateManyUserInputEnvelope;
    set?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    disconnect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    delete?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    connect?: WatchedEpisodeWhereUniqueInput | WatchedEpisodeWhereUniqueInput[];
    update?:
      WatchedEpisodeUpdateWithWhereUniqueWithoutUserInput | WatchedEpisodeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      WatchedEpisodeUpdateManyWithWhereWithoutUserInput | WatchedEpisodeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: WatchedEpisodeScalarWhereInput | WatchedEpisodeScalarWhereInput[];
  };

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[];
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
  };

  export type AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
      | AnalyticsEventCreateWithoutUserInput[]
      | AnalyticsEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[];
    upsert?:
      AnalyticsEventUpsertWithWhereUniqueWithoutUserInput | AnalyticsEventUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AnalyticsEventCreateManyUserInputEnvelope;
    set?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    disconnect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    delete?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[];
    update?:
      AnalyticsEventUpdateWithWhereUniqueWithoutUserInput | AnalyticsEventUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      AnalyticsEventUpdateManyWithWhereWithoutUserInput | AnalyticsEventUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[];
  };

  export type PaymentUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
      | PaymentCreateWithoutUserInput[]
      | PaymentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[];
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: PaymentCreateManyUserInputEnvelope;
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[];
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput;
    connect?: UserWhereUniqueInput;
  };

  export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type UserUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput;
    upsert?: UserUpsertWithoutPaymentsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutPaymentsInput, UserUpdateWithoutPaymentsInput>,
      UserUncheckedUpdateWithoutPaymentsInput
    >;
  };

  export type UserCreateNestedOneWithoutSettingsInput = {
    create?: XOR<UserCreateWithoutSettingsInput, UserUncheckedCreateWithoutSettingsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutSettingsNestedInput = {
    create?: XOR<UserCreateWithoutSettingsInput, UserUncheckedCreateWithoutSettingsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;
    upsert?: UserUpsertWithoutSettingsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutSettingsInput, UserUpdateWithoutSettingsInput>,
      UserUncheckedUpdateWithoutSettingsInput
    >;
  };

  export type UserCreateNestedOneWithoutDevicesInput = {
    create?: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>;
    connectOrCreate?: UserCreateOrConnectWithoutDevicesInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutDevicesNestedInput = {
    create?: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>;
    connectOrCreate?: UserCreateOrConnectWithoutDevicesInput;
    upsert?: UserUpsertWithoutDevicesInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutDevicesInput, UserUpdateWithoutDevicesInput>,
      UserUncheckedUpdateWithoutDevicesInput
    >;
  };

  export type UserCreateNestedOneWithoutWatchlistInput = {
    create?: XOR<UserCreateWithoutWatchlistInput, UserUncheckedCreateWithoutWatchlistInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWatchlistInput;
    connect?: UserWhereUniqueInput;
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type UserUpdateOneRequiredWithoutWatchlistNestedInput = {
    create?: XOR<UserCreateWithoutWatchlistInput, UserUncheckedCreateWithoutWatchlistInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWatchlistInput;
    upsert?: UserUpsertWithoutWatchlistInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutWatchlistInput, UserUpdateWithoutWatchlistInput>,
      UserUncheckedUpdateWithoutWatchlistInput
    >;
  };

  export type UserCreateNestedOneWithoutContinueWatchingInput = {
    create?: XOR<UserCreateWithoutContinueWatchingInput, UserUncheckedCreateWithoutContinueWatchingInput>;
    connectOrCreate?: UserCreateOrConnectWithoutContinueWatchingInput;
    connect?: UserWhereUniqueInput;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type UserUpdateOneRequiredWithoutContinueWatchingNestedInput = {
    create?: XOR<UserCreateWithoutContinueWatchingInput, UserUncheckedCreateWithoutContinueWatchingInput>;
    connectOrCreate?: UserCreateOrConnectWithoutContinueWatchingInput;
    upsert?: UserUpsertWithoutContinueWatchingInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutContinueWatchingInput, UserUpdateWithoutContinueWatchingInput>,
      UserUncheckedUpdateWithoutContinueWatchingInput
    >;
  };

  export type UserCreateNestedOneWithoutWatchedEpisodesInput = {
    create?: XOR<UserCreateWithoutWatchedEpisodesInput, UserUncheckedCreateWithoutWatchedEpisodesInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWatchedEpisodesInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutWatchedEpisodesNestedInput = {
    create?: XOR<UserCreateWithoutWatchedEpisodesInput, UserUncheckedCreateWithoutWatchedEpisodesInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWatchedEpisodesInput;
    upsert?: UserUpsertWithoutWatchedEpisodesInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutWatchedEpisodesInput, UserUpdateWithoutWatchedEpisodesInput>,
      UserUncheckedUpdateWithoutWatchedEpisodesInput
    >;
  };

  export type UserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutAuditLogsNestedInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput;
    upsert?: UserUpsertWithoutAuditLogsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutAuditLogsInput, UserUpdateWithoutAuditLogsInput>,
      UserUncheckedUpdateWithoutAuditLogsInput
    >;
  };

  export type UserCreateNestedOneWithoutAnalyticsEventsInput = {
    create?: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutAnalyticsEventsInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneWithoutAnalyticsEventsNestedInput = {
    create?: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutAnalyticsEventsInput;
    upsert?: UserUpsertWithoutAnalyticsEventsInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutAnalyticsEventsInput, UserUpdateWithoutAnalyticsEventsInput>,
      UserUncheckedUpdateWithoutAnalyticsEventsInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedEnumSubscriptionTierFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionTier | EnumSubscriptionTierFieldRefInput<$PrismaModel>;
    in?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    not?: NestedEnumSubscriptionTierFilter<$PrismaModel> | $Enums.SubscriptionTier;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRoleFilter<$PrismaModel>;
    _max?: NestedEnumRoleFilter<$PrismaModel>;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedEnumSubscriptionTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionTier | EnumSubscriptionTierFieldRefInput<$PrismaModel>;
    in?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubscriptionTier[] | ListEnumSubscriptionTierFieldRefInput<$PrismaModel>;
    not?: NestedEnumSubscriptionTierWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionTier;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumSubscriptionTierFilter<$PrismaModel>;
    _max?: NestedEnumSubscriptionTierFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, "path">
        >,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, "path">>;

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type UserSettingsCreateWithoutUserInput = {
    id?: string;
    language?: string;
    autoplay?: boolean;
    preferredProvider?: string | null;
    subtitleLang?: string | null;
    quality?: string | null;
    notifications?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingsUncheckedCreateWithoutUserInput = {
    id?: string;
    language?: string;
    autoplay?: boolean;
    preferredProvider?: string | null;
    subtitleLang?: string | null;
    quality?: string | null;
    notifications?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingsCreateOrConnectWithoutUserInput = {
    where: UserSettingsWhereUniqueInput;
    create: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
  };

  export type DeviceCreateWithoutUserInput = {
    id?: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
  };

  export type DeviceUncheckedCreateWithoutUserInput = {
    id?: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
  };

  export type DeviceCreateOrConnectWithoutUserInput = {
    where: DeviceWhereUniqueInput;
    create: XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>;
  };

  export type DeviceCreateManyUserInputEnvelope = {
    data: DeviceCreateManyUserInput | DeviceCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type WatchlistItemCreateWithoutUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
  };

  export type WatchlistItemUncheckedCreateWithoutUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
  };

  export type WatchlistItemCreateOrConnectWithoutUserInput = {
    where: WatchlistItemWhereUniqueInput;
    create: XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>;
  };

  export type WatchlistItemCreateManyUserInputEnvelope = {
    data: WatchlistItemCreateManyUserInput | WatchlistItemCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type ContinueWatchingCreateWithoutUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
  };

  export type ContinueWatchingUncheckedCreateWithoutUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
  };

  export type ContinueWatchingCreateOrConnectWithoutUserInput = {
    where: ContinueWatchingWhereUniqueInput;
    create: XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>;
  };

  export type ContinueWatchingCreateManyUserInputEnvelope = {
    data: ContinueWatchingCreateManyUserInput | ContinueWatchingCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type WatchedEpisodeCreateWithoutUserInput = {
    id?: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
  };

  export type WatchedEpisodeUncheckedCreateWithoutUserInput = {
    id?: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
  };

  export type WatchedEpisodeCreateOrConnectWithoutUserInput = {
    where: WatchedEpisodeWhereUniqueInput;
    create: XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>;
  };

  export type WatchedEpisodeCreateManyUserInputEnvelope = {
    data: WatchedEpisodeCreateManyUserInput | WatchedEpisodeCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type AuditLogCreateWithoutUserInput = {
    id?: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>;
  };

  export type AuditLogCreateManyUserInputEnvelope = {
    data: AuditLogCreateManyUserInput | AuditLogCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type AnalyticsEventCreateWithoutUserInput = {
    id?: string;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
  };

  export type AnalyticsEventUncheckedCreateWithoutUserInput = {
    id?: string;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
  };

  export type AnalyticsEventCreateOrConnectWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput;
    create: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>;
  };

  export type AnalyticsEventCreateManyUserInputEnvelope = {
    data: AnalyticsEventCreateManyUserInput | AnalyticsEventCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type PaymentCreateWithoutUserInput = {
    id?: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
  };

  export type PaymentUncheckedCreateWithoutUserInput = {
    id?: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
  };

  export type PaymentCreateOrConnectWithoutUserInput = {
    where: PaymentWhereUniqueInput;
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>;
  };

  export type PaymentCreateManyUserInputEnvelope = {
    data: PaymentCreateManyUserInput | PaymentCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type UserSettingsUpsertWithoutUserInput = {
    update: XOR<UserSettingsUpdateWithoutUserInput, UserSettingsUncheckedUpdateWithoutUserInput>;
    create: XOR<UserSettingsCreateWithoutUserInput, UserSettingsUncheckedCreateWithoutUserInput>;
    where?: UserSettingsWhereInput;
  };

  export type UserSettingsUpdateToOneWithWhereWithoutUserInput = {
    where?: UserSettingsWhereInput;
    data: XOR<UserSettingsUpdateWithoutUserInput, UserSettingsUncheckedUpdateWithoutUserInput>;
  };

  export type UserSettingsUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingsUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    language?: StringFieldUpdateOperationsInput | string;
    autoplay?: BoolFieldUpdateOperationsInput | boolean;
    preferredProvider?: NullableStringFieldUpdateOperationsInput | string | null;
    subtitleLang?: NullableStringFieldUpdateOperationsInput | string | null;
    quality?: NullableStringFieldUpdateOperationsInput | string | null;
    notifications?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceUpsertWithWhereUniqueWithoutUserInput = {
    where: DeviceWhereUniqueInput;
    update: XOR<DeviceUpdateWithoutUserInput, DeviceUncheckedUpdateWithoutUserInput>;
    create: XOR<DeviceCreateWithoutUserInput, DeviceUncheckedCreateWithoutUserInput>;
  };

  export type DeviceUpdateWithWhereUniqueWithoutUserInput = {
    where: DeviceWhereUniqueInput;
    data: XOR<DeviceUpdateWithoutUserInput, DeviceUncheckedUpdateWithoutUserInput>;
  };

  export type DeviceUpdateManyWithWhereWithoutUserInput = {
    where: DeviceScalarWhereInput;
    data: XOR<DeviceUpdateManyMutationInput, DeviceUncheckedUpdateManyWithoutUserInput>;
  };

  export type DeviceScalarWhereInput = {
    AND?: DeviceScalarWhereInput | DeviceScalarWhereInput[];
    OR?: DeviceScalarWhereInput[];
    NOT?: DeviceScalarWhereInput | DeviceScalarWhereInput[];
    id?: StringFilter<"Device"> | string;
    userId?: StringFilter<"Device"> | string;
    deviceId?: StringFilter<"Device"> | string;
    deviceName?: StringNullableFilter<"Device"> | string | null;
    platform?: StringNullableFilter<"Device"> | string | null;
    browser?: StringNullableFilter<"Device"> | string | null;
    appVersion?: StringNullableFilter<"Device"> | string | null;
    lastActive?: DateTimeFilter<"Device"> | Date | string;
    lastIp?: StringNullableFilter<"Device"> | string | null;
    createdAt?: DateTimeFilter<"Device"> | Date | string;
  };

  export type WatchlistItemUpsertWithWhereUniqueWithoutUserInput = {
    where: WatchlistItemWhereUniqueInput;
    update: XOR<WatchlistItemUpdateWithoutUserInput, WatchlistItemUncheckedUpdateWithoutUserInput>;
    create: XOR<WatchlistItemCreateWithoutUserInput, WatchlistItemUncheckedCreateWithoutUserInput>;
  };

  export type WatchlistItemUpdateWithWhereUniqueWithoutUserInput = {
    where: WatchlistItemWhereUniqueInput;
    data: XOR<WatchlistItemUpdateWithoutUserInput, WatchlistItemUncheckedUpdateWithoutUserInput>;
  };

  export type WatchlistItemUpdateManyWithWhereWithoutUserInput = {
    where: WatchlistItemScalarWhereInput;
    data: XOR<WatchlistItemUpdateManyMutationInput, WatchlistItemUncheckedUpdateManyWithoutUserInput>;
  };

  export type WatchlistItemScalarWhereInput = {
    AND?: WatchlistItemScalarWhereInput | WatchlistItemScalarWhereInput[];
    OR?: WatchlistItemScalarWhereInput[];
    NOT?: WatchlistItemScalarWhereInput | WatchlistItemScalarWhereInput[];
    id?: StringFilter<"WatchlistItem"> | string;
    userId?: StringFilter<"WatchlistItem"> | string;
    tmdbId?: StringFilter<"WatchlistItem"> | string;
    mediaType?: StringFilter<"WatchlistItem"> | string;
    title?: StringFilter<"WatchlistItem"> | string;
    posterPath?: StringNullableFilter<"WatchlistItem"> | string | null;
    year?: IntNullableFilter<"WatchlistItem"> | number | null;
    rating?: FloatNullableFilter<"WatchlistItem"> | number | null;
    genres?: StringNullableFilter<"WatchlistItem"> | string | null;
    addedAt?: DateTimeFilter<"WatchlistItem"> | Date | string;
  };

  export type ContinueWatchingUpsertWithWhereUniqueWithoutUserInput = {
    where: ContinueWatchingWhereUniqueInput;
    update: XOR<ContinueWatchingUpdateWithoutUserInput, ContinueWatchingUncheckedUpdateWithoutUserInput>;
    create: XOR<ContinueWatchingCreateWithoutUserInput, ContinueWatchingUncheckedCreateWithoutUserInput>;
  };

  export type ContinueWatchingUpdateWithWhereUniqueWithoutUserInput = {
    where: ContinueWatchingWhereUniqueInput;
    data: XOR<ContinueWatchingUpdateWithoutUserInput, ContinueWatchingUncheckedUpdateWithoutUserInput>;
  };

  export type ContinueWatchingUpdateManyWithWhereWithoutUserInput = {
    where: ContinueWatchingScalarWhereInput;
    data: XOR<ContinueWatchingUpdateManyMutationInput, ContinueWatchingUncheckedUpdateManyWithoutUserInput>;
  };

  export type ContinueWatchingScalarWhereInput = {
    AND?: ContinueWatchingScalarWhereInput | ContinueWatchingScalarWhereInput[];
    OR?: ContinueWatchingScalarWhereInput[];
    NOT?: ContinueWatchingScalarWhereInput | ContinueWatchingScalarWhereInput[];
    id?: StringFilter<"ContinueWatching"> | string;
    userId?: StringFilter<"ContinueWatching"> | string;
    tmdbId?: StringFilter<"ContinueWatching"> | string;
    mediaType?: StringFilter<"ContinueWatching"> | string;
    title?: StringFilter<"ContinueWatching"> | string;
    posterPath?: StringNullableFilter<"ContinueWatching"> | string | null;
    season?: IntFilter<"ContinueWatching"> | number;
    episode?: IntFilter<"ContinueWatching"> | number;
    currentTime?: FloatFilter<"ContinueWatching"> | number;
    duration?: FloatFilter<"ContinueWatching"> | number;
    progress?: IntFilter<"ContinueWatching"> | number;
    provider?: StringNullableFilter<"ContinueWatching"> | string | null;
    updatedAt?: DateTimeFilter<"ContinueWatching"> | Date | string;
  };

  export type WatchedEpisodeUpsertWithWhereUniqueWithoutUserInput = {
    where: WatchedEpisodeWhereUniqueInput;
    update: XOR<WatchedEpisodeUpdateWithoutUserInput, WatchedEpisodeUncheckedUpdateWithoutUserInput>;
    create: XOR<WatchedEpisodeCreateWithoutUserInput, WatchedEpisodeUncheckedCreateWithoutUserInput>;
  };

  export type WatchedEpisodeUpdateWithWhereUniqueWithoutUserInput = {
    where: WatchedEpisodeWhereUniqueInput;
    data: XOR<WatchedEpisodeUpdateWithoutUserInput, WatchedEpisodeUncheckedUpdateWithoutUserInput>;
  };

  export type WatchedEpisodeUpdateManyWithWhereWithoutUserInput = {
    where: WatchedEpisodeScalarWhereInput;
    data: XOR<WatchedEpisodeUpdateManyMutationInput, WatchedEpisodeUncheckedUpdateManyWithoutUserInput>;
  };

  export type WatchedEpisodeScalarWhereInput = {
    AND?: WatchedEpisodeScalarWhereInput | WatchedEpisodeScalarWhereInput[];
    OR?: WatchedEpisodeScalarWhereInput[];
    NOT?: WatchedEpisodeScalarWhereInput | WatchedEpisodeScalarWhereInput[];
    id?: StringFilter<"WatchedEpisode"> | string;
    userId?: StringFilter<"WatchedEpisode"> | string;
    tvdbId?: StringFilter<"WatchedEpisode"> | string;
    season?: IntFilter<"WatchedEpisode"> | number;
    episode?: IntFilter<"WatchedEpisode"> | number;
    watchedAt?: DateTimeFilter<"WatchedEpisode"> | Date | string;
  };

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    update: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>;
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>;
  };

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    data: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>;
  };

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput;
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutUserInput>;
  };

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
    OR?: AuditLogScalarWhereInput[];
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
    id?: StringFilter<"AuditLog"> | string;
    userId?: StringFilter<"AuditLog"> | string;
    action?: StringFilter<"AuditLog"> | string;
    metadata?: JsonNullableFilter<"AuditLog">;
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null;
    userAgent?: StringNullableFilter<"AuditLog"> | string | null;
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string;
  };

  export type AnalyticsEventUpsertWithWhereUniqueWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput;
    update: XOR<AnalyticsEventUpdateWithoutUserInput, AnalyticsEventUncheckedUpdateWithoutUserInput>;
    create: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>;
  };

  export type AnalyticsEventUpdateWithWhereUniqueWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput;
    data: XOR<AnalyticsEventUpdateWithoutUserInput, AnalyticsEventUncheckedUpdateWithoutUserInput>;
  };

  export type AnalyticsEventUpdateManyWithWhereWithoutUserInput = {
    where: AnalyticsEventScalarWhereInput;
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyWithoutUserInput>;
  };

  export type AnalyticsEventScalarWhereInput = {
    AND?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[];
    OR?: AnalyticsEventScalarWhereInput[];
    NOT?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[];
    id?: StringFilter<"AnalyticsEvent"> | string;
    userId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    event?: StringFilter<"AnalyticsEvent"> | string;
    properties?: JsonNullableFilter<"AnalyticsEvent">;
    sessionId?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    ipAddress?: StringNullableFilter<"AnalyticsEvent"> | string | null;
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string;
  };

  export type PaymentUpsertWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput;
    update: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>;
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>;
  };

  export type PaymentUpdateWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput;
    data: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>;
  };

  export type PaymentUpdateManyWithWhereWithoutUserInput = {
    where: PaymentScalarWhereInput;
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutUserInput>;
  };

  export type PaymentScalarWhereInput = {
    AND?: PaymentScalarWhereInput | PaymentScalarWhereInput[];
    OR?: PaymentScalarWhereInput[];
    NOT?: PaymentScalarWhereInput | PaymentScalarWhereInput[];
    id?: StringFilter<"Payment"> | string;
    userId?: StringFilter<"Payment"> | string;
    orderId?: StringFilter<"Payment"> | string;
    amount?: FloatFilter<"Payment"> | number;
    currency?: StringFilter<"Payment"> | string;
    status?: StringFilter<"Payment"> | string;
    paymentId?: StringNullableFilter<"Payment"> | string | null;
    method?: StringNullableFilter<"Payment"> | string | null;
    createdAt?: DateTimeFilter<"Payment"> | Date | string;
  };

  export type UserCreateWithoutPaymentsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutPaymentsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutPaymentsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>;
  };

  export type UserUpsertWithoutPaymentsInput = {
    update: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>;
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>;
  };

  export type UserUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutSettingsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutSettingsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutSettingsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutSettingsInput, UserUncheckedCreateWithoutSettingsInput>;
  };

  export type UserUpsertWithoutSettingsInput = {
    update: XOR<UserUpdateWithoutSettingsInput, UserUncheckedUpdateWithoutSettingsInput>;
    create: XOR<UserCreateWithoutSettingsInput, UserUncheckedCreateWithoutSettingsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutSettingsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutSettingsInput, UserUncheckedUpdateWithoutSettingsInput>;
  };

  export type UserUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutDevicesInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutDevicesInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutDevicesInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>;
  };

  export type UserUpsertWithoutDevicesInput = {
    update: XOR<UserUpdateWithoutDevicesInput, UserUncheckedUpdateWithoutDevicesInput>;
    create: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutDevicesInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutDevicesInput, UserUncheckedUpdateWithoutDevicesInput>;
  };

  export type UserUpdateWithoutDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutWatchlistInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutWatchlistInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutWatchlistInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutWatchlistInput, UserUncheckedCreateWithoutWatchlistInput>;
  };

  export type UserUpsertWithoutWatchlistInput = {
    update: XOR<UserUpdateWithoutWatchlistInput, UserUncheckedUpdateWithoutWatchlistInput>;
    create: XOR<UserCreateWithoutWatchlistInput, UserUncheckedCreateWithoutWatchlistInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutWatchlistInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutWatchlistInput, UserUncheckedUpdateWithoutWatchlistInput>;
  };

  export type UserUpdateWithoutWatchlistInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutWatchlistInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutContinueWatchingInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutContinueWatchingInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutContinueWatchingInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutContinueWatchingInput, UserUncheckedCreateWithoutContinueWatchingInput>;
  };

  export type UserUpsertWithoutContinueWatchingInput = {
    update: XOR<UserUpdateWithoutContinueWatchingInput, UserUncheckedUpdateWithoutContinueWatchingInput>;
    create: XOR<UserCreateWithoutContinueWatchingInput, UserUncheckedCreateWithoutContinueWatchingInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutContinueWatchingInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutContinueWatchingInput, UserUncheckedUpdateWithoutContinueWatchingInput>;
  };

  export type UserUpdateWithoutContinueWatchingInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutContinueWatchingInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutWatchedEpisodesInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutWatchedEpisodesInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutWatchedEpisodesInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutWatchedEpisodesInput, UserUncheckedCreateWithoutWatchedEpisodesInput>;
  };

  export type UserUpsertWithoutWatchedEpisodesInput = {
    update: XOR<UserUpdateWithoutWatchedEpisodesInput, UserUncheckedUpdateWithoutWatchedEpisodesInput>;
    create: XOR<UserCreateWithoutWatchedEpisodesInput, UserUncheckedCreateWithoutWatchedEpisodesInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutWatchedEpisodesInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutWatchedEpisodesInput, UserUncheckedUpdateWithoutWatchedEpisodesInput>;
  };

  export type UserUpdateWithoutWatchedEpisodesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutWatchedEpisodesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutAuditLogsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutAuditLogsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutAuditLogsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>;
  };

  export type UserUpsertWithoutAuditLogsInput = {
    update: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>;
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>;
  };

  export type UserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutAnalyticsEventsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsCreateNestedOneWithoutUserInput;
    devices?: DeviceCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    payments?: PaymentCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutAnalyticsEventsInput = {
    id?: string;
    email: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    role?: $Enums.Role;
    isVerified?: boolean;
    authUserId: string;
    subscriptionTier?: $Enums.SubscriptionTier;
    subscriptionExpiry?: Date | string | null;
    currencyPreference?: string;
    trialStartDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    settings?: UserSettingsUncheckedCreateNestedOneWithoutUserInput;
    devices?: DeviceUncheckedCreateNestedManyWithoutUserInput;
    watchlist?: WatchlistItemUncheckedCreateNestedManyWithoutUserInput;
    continueWatching?: ContinueWatchingUncheckedCreateNestedManyWithoutUserInput;
    watchedEpisodes?: WatchedEpisodeUncheckedCreateNestedManyWithoutUserInput;
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutAnalyticsEventsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>;
  };

  export type UserUpsertWithoutAnalyticsEventsInput = {
    update: XOR<UserUpdateWithoutAnalyticsEventsInput, UserUncheckedUpdateWithoutAnalyticsEventsInput>;
    create: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutAnalyticsEventsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutAnalyticsEventsInput, UserUncheckedUpdateWithoutAnalyticsEventsInput>;
  };

  export type UserUpdateWithoutAnalyticsEventsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUpdateOneWithoutUserNestedInput;
    devices?: DeviceUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    payments?: PaymentUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutAnalyticsEventsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: NullableStringFieldUpdateOperationsInput | string | null;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isVerified?: BoolFieldUpdateOperationsInput | boolean;
    authUserId?: StringFieldUpdateOperationsInput | string;
    subscriptionTier?: EnumSubscriptionTierFieldUpdateOperationsInput | $Enums.SubscriptionTier;
    subscriptionExpiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    currencyPreference?: StringFieldUpdateOperationsInput | string;
    trialStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    settings?: UserSettingsUncheckedUpdateOneWithoutUserNestedInput;
    devices?: DeviceUncheckedUpdateManyWithoutUserNestedInput;
    watchlist?: WatchlistItemUncheckedUpdateManyWithoutUserNestedInput;
    continueWatching?: ContinueWatchingUncheckedUpdateManyWithoutUserNestedInput;
    watchedEpisodes?: WatchedEpisodeUncheckedUpdateManyWithoutUserNestedInput;
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type DeviceCreateManyUserInput = {
    id?: string;
    deviceId: string;
    deviceName?: string | null;
    platform?: string | null;
    browser?: string | null;
    appVersion?: string | null;
    lastActive?: Date | string;
    lastIp?: string | null;
    createdAt?: Date | string;
  };

  export type WatchlistItemCreateManyUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    year?: number | null;
    rating?: number | null;
    genres?: string | null;
    addedAt?: Date | string;
  };

  export type ContinueWatchingCreateManyUserInput = {
    id?: string;
    tmdbId: string;
    mediaType: string;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
    progress?: number;
    provider?: string | null;
    updatedAt?: Date | string;
  };

  export type WatchedEpisodeCreateManyUserInput = {
    id?: string;
    tvdbId: string;
    season: number;
    episode: number;
    watchedAt?: Date | string;
  };

  export type AuditLogCreateManyUserInput = {
    id?: string;
    action: string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AnalyticsEventCreateManyUserInput = {
    id?: string;
    event: string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: string | null;
    ipAddress?: string | null;
    createdAt?: Date | string;
  };

  export type PaymentCreateManyUserInput = {
    id?: string;
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    paymentId?: string | null;
    method?: string | null;
    createdAt?: Date | string;
  };

  export type DeviceUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DeviceUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    deviceId?: StringFieldUpdateOperationsInput | string;
    deviceName?: NullableStringFieldUpdateOperationsInput | string | null;
    platform?: NullableStringFieldUpdateOperationsInput | string | null;
    browser?: NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: NullableStringFieldUpdateOperationsInput | string | null;
    lastActive?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistItemUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    year?: NullableIntFieldUpdateOperationsInput | number | null;
    rating?: NullableFloatFieldUpdateOperationsInput | number | null;
    genres?: NullableStringFieldUpdateOperationsInput | string | null;
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContinueWatchingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tmdbId?: StringFieldUpdateOperationsInput | string;
    mediaType?: StringFieldUpdateOperationsInput | string;
    title?: StringFieldUpdateOperationsInput | string;
    posterPath?: NullableStringFieldUpdateOperationsInput | string | null;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    currentTime?: FloatFieldUpdateOperationsInput | number;
    duration?: FloatFieldUpdateOperationsInput | number;
    progress?: IntFieldUpdateOperationsInput | number;
    provider?: NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchedEpisodeUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tvdbId?: StringFieldUpdateOperationsInput | string;
    season?: IntFieldUpdateOperationsInput | number;
    episode?: IntFieldUpdateOperationsInput | number;
    watchedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AnalyticsEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    event?: StringFieldUpdateOperationsInput | string;
    properties?: NullableJsonNullValueInput | InputJsonValue;
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PaymentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    orderId?: StringFieldUpdateOperationsInput | string;
    amount?: FloatFieldUpdateOperationsInput | number;
    currency?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null;
    method?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Aliases for legacy arg types
   */
  /**
   * @deprecated Use UserCountOutputTypeDefaultArgs instead
   */
  export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    UserCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use UserDefaultArgs instead
   */
  export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PaymentDefaultArgs instead
   */
  export type PaymentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    PaymentDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use UserSettingsDefaultArgs instead
   */
  export type UserSettingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    UserSettingsDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use DeviceDefaultArgs instead
   */
  export type DeviceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    DeviceDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use WatchlistItemDefaultArgs instead
   */
  export type WatchlistItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    WatchlistItemDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use ContinueWatchingDefaultArgs instead
   */
  export type ContinueWatchingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    ContinueWatchingDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use WatchedEpisodeDefaultArgs instead
   */
  export type WatchedEpisodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    WatchedEpisodeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use AuditLogDefaultArgs instead
   */
  export type AuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    AuditLogDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use AnalyticsEventDefaultArgs instead
   */
  export type AnalyticsEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    AnalyticsEventDefaultArgs<ExtArgs>;

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
