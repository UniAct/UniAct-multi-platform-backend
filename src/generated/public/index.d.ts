
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model SuperAdmin
 * 
 */
export type SuperAdmin = $Result.DefaultSelection<Prisma.$SuperAdminPayload>
/**
 * Model SuperAdminTenant
 * 
 */
export type SuperAdminTenant = $Result.DefaultSelection<Prisma.$SuperAdminTenantPayload>
/**
 * Model University
 * 
 */
export type University = $Result.DefaultSelection<Prisma.$UniversityPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.superAdmin`: Exposes CRUD operations for the **SuperAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuperAdmins
    * const superAdmins = await prisma.superAdmin.findMany()
    * ```
    */
  get superAdmin(): Prisma.SuperAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.superAdminTenant`: Exposes CRUD operations for the **SuperAdminTenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuperAdminTenants
    * const superAdminTenants = await prisma.superAdminTenant.findMany()
    * ```
    */
  get superAdminTenant(): Prisma.SuperAdminTenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.university`: Exposes CRUD operations for the **University** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Universities
    * const universities = await prisma.university.findMany()
    * ```
    */
  get university(): Prisma.UniversityDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.0
   * Query Engine version: c0aafc03b8ef6cdced8654b9a817999e02457d6a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

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
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
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
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    SuperAdmin: 'SuperAdmin',
    SuperAdminTenant: 'SuperAdminTenant',
    University: 'University'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tenant" | "superAdmin" | "superAdminTenant" | "university"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      SuperAdmin: {
        payload: Prisma.$SuperAdminPayload<ExtArgs>
        fields: Prisma.SuperAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SuperAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SuperAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findFirst: {
            args: Prisma.SuperAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SuperAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findMany: {
            args: Prisma.SuperAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          create: {
            args: Prisma.SuperAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          createMany: {
            args: Prisma.SuperAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SuperAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          delete: {
            args: Prisma.SuperAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          update: {
            args: Prisma.SuperAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          deleteMany: {
            args: Prisma.SuperAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SuperAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SuperAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          upsert: {
            args: Prisma.SuperAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          aggregate: {
            args: Prisma.SuperAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperAdmin>
          }
          groupBy: {
            args: Prisma.SuperAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SuperAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminCountAggregateOutputType> | number
          }
        }
      }
      SuperAdminTenant: {
        payload: Prisma.$SuperAdminTenantPayload<ExtArgs>
        fields: Prisma.SuperAdminTenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SuperAdminTenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SuperAdminTenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          findFirst: {
            args: Prisma.SuperAdminTenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SuperAdminTenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          findMany: {
            args: Prisma.SuperAdminTenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>[]
          }
          create: {
            args: Prisma.SuperAdminTenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          createMany: {
            args: Prisma.SuperAdminTenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SuperAdminTenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>[]
          }
          delete: {
            args: Prisma.SuperAdminTenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          update: {
            args: Prisma.SuperAdminTenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          deleteMany: {
            args: Prisma.SuperAdminTenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SuperAdminTenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SuperAdminTenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>[]
          }
          upsert: {
            args: Prisma.SuperAdminTenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminTenantPayload>
          }
          aggregate: {
            args: Prisma.SuperAdminTenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperAdminTenant>
          }
          groupBy: {
            args: Prisma.SuperAdminTenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminTenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.SuperAdminTenantCountArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminTenantCountAggregateOutputType> | number
          }
        }
      }
      University: {
        payload: Prisma.$UniversityPayload<ExtArgs>
        fields: Prisma.UniversityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UniversityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UniversityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          findFirst: {
            args: Prisma.UniversityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UniversityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          findMany: {
            args: Prisma.UniversityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>[]
          }
          create: {
            args: Prisma.UniversityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          createMany: {
            args: Prisma.UniversityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UniversityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>[]
          }
          delete: {
            args: Prisma.UniversityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          update: {
            args: Prisma.UniversityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          deleteMany: {
            args: Prisma.UniversityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UniversityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UniversityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>[]
          }
          upsert: {
            args: Prisma.UniversityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UniversityPayload>
          }
          aggregate: {
            args: Prisma.UniversityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUniversity>
          }
          groupBy: {
            args: Prisma.UniversityGroupByArgs<ExtArgs>
            result: $Utils.Optional<UniversityGroupByOutputType>[]
          }
          count: {
            args: Prisma.UniversityCountArgs<ExtArgs>
            result: $Utils.Optional<UniversityCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    tenant?: TenantOmit
    superAdmin?: SuperAdminOmit
    superAdminTenant?: SuperAdminTenantOmit
    university?: UniversityOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    superAdmins: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    superAdmins?: boolean | TenantCountOutputTypeCountSuperAdminsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountSuperAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminTenantWhereInput
  }


  /**
   * Count Type SuperAdminCountOutputType
   */

  export type SuperAdminCountOutputType = {
    tenants: number
  }

  export type SuperAdminCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | SuperAdminCountOutputTypeCountTenantsArgs
  }

  // Custom InputTypes
  /**
   * SuperAdminCountOutputType without action
   */
  export type SuperAdminCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminCountOutputType
     */
    select?: SuperAdminCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SuperAdminCountOutputType without action
   */
  export type SuperAdminCountOutputTypeCountTenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminTenantWhereInput
  }


  /**
   * Count Type UniversityCountOutputType
   */

  export type UniversityCountOutputType = {
    tenants: number
  }

  export type UniversityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | UniversityCountOutputTypeCountTenantsArgs
  }

  // Custom InputTypes
  /**
   * UniversityCountOutputType without action
   */
  export type UniversityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UniversityCountOutputType
     */
    select?: UniversityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UniversityCountOutputType without action
   */
  export type UniversityCountOutputTypeCountTenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _avg: TenantAvgAggregateOutputType | null
    _sum: TenantSumAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantAvgAggregateOutputType = {
    id: number | null
    university_id: number | null
  }

  export type TenantSumAggregateOutputType = {
    id: number | null
    university_id: number | null
  }

  export type TenantMinAggregateOutputType = {
    id: number | null
    name: string | null
    subdomain: string | null
    db_schema: string | null
    created_at: Date | null
    updated_at: Date | null
    is_active: boolean | null
    university_id: number | null
  }

  export type TenantMaxAggregateOutputType = {
    id: number | null
    name: string | null
    subdomain: string | null
    db_schema: string | null
    created_at: Date | null
    updated_at: Date | null
    is_active: boolean | null
    university_id: number | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    subdomain: number
    db_schema: number
    created_at: number
    updated_at: number
    is_active: number
    university_id: number
    _all: number
  }


  export type TenantAvgAggregateInputType = {
    id?: true
    university_id?: true
  }

  export type TenantSumAggregateInputType = {
    id?: true
    university_id?: true
  }

  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    subdomain?: true
    db_schema?: true
    created_at?: true
    updated_at?: true
    is_active?: true
    university_id?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    subdomain?: true
    db_schema?: true
    created_at?: true
    updated_at?: true
    is_active?: true
    university_id?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    subdomain?: true
    db_schema?: true
    created_at?: true
    updated_at?: true
    is_active?: true
    university_id?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _avg?: TenantAvgAggregateInputType
    _sum?: TenantSumAggregateInputType
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: number
    name: string
    subdomain: string
    db_schema: string
    created_at: Date
    updated_at: Date
    is_active: boolean
    university_id: number | null
    _count: TenantCountAggregateOutputType | null
    _avg: TenantAvgAggregateOutputType | null
    _sum: TenantSumAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subdomain?: boolean
    db_schema?: boolean
    created_at?: boolean
    updated_at?: boolean
    is_active?: boolean
    university_id?: boolean
    university?: boolean | Tenant$universityArgs<ExtArgs>
    superAdmins?: boolean | Tenant$superAdminsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subdomain?: boolean
    db_schema?: boolean
    created_at?: boolean
    updated_at?: boolean
    is_active?: boolean
    university_id?: boolean
    university?: boolean | Tenant$universityArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subdomain?: boolean
    db_schema?: boolean
    created_at?: boolean
    updated_at?: boolean
    is_active?: boolean
    university_id?: boolean
    university?: boolean | Tenant$universityArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    subdomain?: boolean
    db_schema?: boolean
    created_at?: boolean
    updated_at?: boolean
    is_active?: boolean
    university_id?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "subdomain" | "db_schema" | "created_at" | "updated_at" | "is_active" | "university_id", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    university?: boolean | Tenant$universityArgs<ExtArgs>
    superAdmins?: boolean | Tenant$superAdminsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    university?: boolean | Tenant$universityArgs<ExtArgs>
  }
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    university?: boolean | Tenant$universityArgs<ExtArgs>
  }

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      university: Prisma.$UniversityPayload<ExtArgs> | null
      superAdmins: Prisma.$SuperAdminTenantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      subdomain: string
      db_schema: string
      created_at: Date
      updated_at: Date
      is_active: boolean
      university_id: number | null
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    university<T extends Tenant$universityArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$universityArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    superAdmins<T extends Tenant$superAdminsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$superAdminsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'Int'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly subdomain: FieldRef<"Tenant", 'String'>
    readonly db_schema: FieldRef<"Tenant", 'String'>
    readonly created_at: FieldRef<"Tenant", 'DateTime'>
    readonly updated_at: FieldRef<"Tenant", 'DateTime'>
    readonly is_active: FieldRef<"Tenant", 'Boolean'>
    readonly university_id: FieldRef<"Tenant", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.university
   */
  export type Tenant$universityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    where?: UniversityWhereInput
  }

  /**
   * Tenant.superAdmins
   */
  export type Tenant$superAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    where?: SuperAdminTenantWhereInput
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    cursor?: SuperAdminTenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SuperAdminTenantScalarFieldEnum | SuperAdminTenantScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model SuperAdmin
   */

  export type AggregateSuperAdmin = {
    _count: SuperAdminCountAggregateOutputType | null
    _avg: SuperAdminAvgAggregateOutputType | null
    _sum: SuperAdminSumAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  export type SuperAdminAvgAggregateOutputType = {
    id: number | null
  }

  export type SuperAdminSumAggregateOutputType = {
    id: number | null
  }

  export type SuperAdminMinAggregateOutputType = {
    id: number | null
    username: string | null
    email: string | null
    password: string | null
    created_at: Date | null
    is_active: boolean | null
  }

  export type SuperAdminMaxAggregateOutputType = {
    id: number | null
    username: string | null
    email: string | null
    password: string | null
    created_at: Date | null
    is_active: boolean | null
  }

  export type SuperAdminCountAggregateOutputType = {
    id: number
    username: number
    email: number
    password: number
    created_at: number
    is_active: number
    _all: number
  }


  export type SuperAdminAvgAggregateInputType = {
    id?: true
  }

  export type SuperAdminSumAggregateInputType = {
    id?: true
  }

  export type SuperAdminMinAggregateInputType = {
    id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    is_active?: true
  }

  export type SuperAdminMaxAggregateInputType = {
    id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    is_active?: true
  }

  export type SuperAdminCountAggregateInputType = {
    id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    is_active?: true
    _all?: true
  }

  export type SuperAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmin to aggregate.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SuperAdmins
    **/
    _count?: true | SuperAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SuperAdminAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SuperAdminSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperAdminMaxAggregateInputType
  }

  export type GetSuperAdminAggregateType<T extends SuperAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperAdmin[P]>
      : GetScalarType<T[P], AggregateSuperAdmin[P]>
  }




  export type SuperAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminWhereInput
    orderBy?: SuperAdminOrderByWithAggregationInput | SuperAdminOrderByWithAggregationInput[]
    by: SuperAdminScalarFieldEnum[] | SuperAdminScalarFieldEnum
    having?: SuperAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperAdminCountAggregateInputType | true
    _avg?: SuperAdminAvgAggregateInputType
    _sum?: SuperAdminSumAggregateInputType
    _min?: SuperAdminMinAggregateInputType
    _max?: SuperAdminMaxAggregateInputType
  }

  export type SuperAdminGroupByOutputType = {
    id: number
    username: string
    email: string
    password: string
    created_at: Date
    is_active: boolean
    _count: SuperAdminCountAggregateOutputType | null
    _avg: SuperAdminAvgAggregateOutputType | null
    _sum: SuperAdminSumAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  type GetSuperAdminGroupByPayload<T extends SuperAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
        }
      >
    >


  export type SuperAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    is_active?: boolean
    tenants?: boolean | SuperAdmin$tenantsArgs<ExtArgs>
    _count?: boolean | SuperAdminCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    is_active?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    is_active?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectScalar = {
    id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    is_active?: boolean
  }

  export type SuperAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "email" | "password" | "created_at" | "is_active", ExtArgs["result"]["superAdmin"]>
  export type SuperAdminInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | SuperAdmin$tenantsArgs<ExtArgs>
    _count?: boolean | SuperAdminCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SuperAdminIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SuperAdminIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SuperAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SuperAdmin"
    objects: {
      tenants: Prisma.$SuperAdminTenantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      email: string
      password: string
      created_at: Date
      is_active: boolean
    }, ExtArgs["result"]["superAdmin"]>
    composites: {}
  }

  type SuperAdminGetPayload<S extends boolean | null | undefined | SuperAdminDefaultArgs> = $Result.GetResult<Prisma.$SuperAdminPayload, S>

  type SuperAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SuperAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SuperAdminCountAggregateInputType | true
    }

  export interface SuperAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SuperAdmin'], meta: { name: 'SuperAdmin' } }
    /**
     * Find zero or one SuperAdmin that matches the filter.
     * @param {SuperAdminFindUniqueArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SuperAdminFindUniqueArgs>(args: SelectSubset<T, SuperAdminFindUniqueArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SuperAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SuperAdminFindUniqueOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SuperAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SuperAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SuperAdminFindFirstArgs>(args?: SelectSubset<T, SuperAdminFindFirstArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SuperAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SuperAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SuperAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany()
     * 
     * // Get first 10 SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SuperAdminFindManyArgs>(args?: SelectSubset<T, SuperAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SuperAdmin.
     * @param {SuperAdminCreateArgs} args - Arguments to create a SuperAdmin.
     * @example
     * // Create one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.create({
     *   data: {
     *     // ... data to create a SuperAdmin
     *   }
     * })
     * 
     */
    create<T extends SuperAdminCreateArgs>(args: SelectSubset<T, SuperAdminCreateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SuperAdmins.
     * @param {SuperAdminCreateManyArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SuperAdminCreateManyArgs>(args?: SelectSubset<T, SuperAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SuperAdmins and returns the data saved in the database.
     * @param {SuperAdminCreateManyAndReturnArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SuperAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SuperAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SuperAdmin.
     * @param {SuperAdminDeleteArgs} args - Arguments to delete one SuperAdmin.
     * @example
     * // Delete one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.delete({
     *   where: {
     *     // ... filter to delete one SuperAdmin
     *   }
     * })
     * 
     */
    delete<T extends SuperAdminDeleteArgs>(args: SelectSubset<T, SuperAdminDeleteArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SuperAdmin.
     * @param {SuperAdminUpdateArgs} args - Arguments to update one SuperAdmin.
     * @example
     * // Update one SuperAdmin
     * const superAdmin = await prisma.superAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SuperAdminUpdateArgs>(args: SelectSubset<T, SuperAdminUpdateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SuperAdmins.
     * @param {SuperAdminDeleteManyArgs} args - Arguments to filter SuperAdmins to delete.
     * @example
     * // Delete a few SuperAdmins
     * const { count } = await prisma.superAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SuperAdminDeleteManyArgs>(args?: SelectSubset<T, SuperAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SuperAdminUpdateManyArgs>(args: SelectSubset<T, SuperAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins and returns the data updated in the database.
     * @param {SuperAdminUpdateManyAndReturnArgs} args - Arguments to update many SuperAdmins.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SuperAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, SuperAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SuperAdmin.
     * @param {SuperAdminUpsertArgs} args - Arguments to update or create a SuperAdmin.
     * @example
     * // Update or create a SuperAdmin
     * const superAdmin = await prisma.superAdmin.upsert({
     *   create: {
     *     // ... data to create a SuperAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuperAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SuperAdminUpsertArgs>(args: SelectSubset<T, SuperAdminUpsertArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminCountArgs} args - Arguments to filter SuperAdmins to count.
     * @example
     * // Count the number of SuperAdmins
     * const count = await prisma.superAdmin.count({
     *   where: {
     *     // ... the filter for the SuperAdmins we want to count
     *   }
     * })
    **/
    count<T extends SuperAdminCountArgs>(
      args?: Subset<T, SuperAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SuperAdminAggregateArgs>(args: Subset<T, SuperAdminAggregateArgs>): Prisma.PrismaPromise<GetSuperAdminAggregateType<T>>

    /**
     * Group by SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminGroupByArgs} args - Group by arguments.
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
      T extends SuperAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SuperAdminGroupByArgs['orderBy'] }
        : { orderBy?: SuperAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SuperAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SuperAdmin model
   */
  readonly fields: SuperAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SuperAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SuperAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenants<T extends SuperAdmin$tenantsArgs<ExtArgs> = {}>(args?: Subset<T, SuperAdmin$tenantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SuperAdmin model
   */
  interface SuperAdminFieldRefs {
    readonly id: FieldRef<"SuperAdmin", 'Int'>
    readonly username: FieldRef<"SuperAdmin", 'String'>
    readonly email: FieldRef<"SuperAdmin", 'String'>
    readonly password: FieldRef<"SuperAdmin", 'String'>
    readonly created_at: FieldRef<"SuperAdmin", 'DateTime'>
    readonly is_active: FieldRef<"SuperAdmin", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * SuperAdmin findUnique
   */
  export type SuperAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findUniqueOrThrow
   */
  export type SuperAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findFirst
   */
  export type SuperAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findFirstOrThrow
   */
  export type SuperAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findMany
   */
  export type SuperAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdmins to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin create
   */
  export type SuperAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * The data needed to create a SuperAdmin.
     */
    data: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
  }

  /**
   * SuperAdmin createMany
   */
  export type SuperAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin createManyAndReturn
   */
  export type SuperAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin update
   */
  export type SuperAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * The data needed to update a SuperAdmin.
     */
    data: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
    /**
     * Choose, which SuperAdmin to update.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin updateMany
   */
  export type SuperAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin updateManyAndReturn
   */
  export type SuperAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin upsert
   */
  export type SuperAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * The filter to search for the SuperAdmin to update in case it exists.
     */
    where: SuperAdminWhereUniqueInput
    /**
     * In case the SuperAdmin found by the `where` argument doesn't exist, create a new SuperAdmin with this data.
     */
    create: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
    /**
     * In case the SuperAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
  }

  /**
   * SuperAdmin delete
   */
  export type SuperAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
    /**
     * Filter which SuperAdmin to delete.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin deleteMany
   */
  export type SuperAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmins to delete
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to delete.
     */
    limit?: number
  }

  /**
   * SuperAdmin.tenants
   */
  export type SuperAdmin$tenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    where?: SuperAdminTenantWhereInput
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    cursor?: SuperAdminTenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SuperAdminTenantScalarFieldEnum | SuperAdminTenantScalarFieldEnum[]
  }

  /**
   * SuperAdmin without action
   */
  export type SuperAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminInclude<ExtArgs> | null
  }


  /**
   * Model SuperAdminTenant
   */

  export type AggregateSuperAdminTenant = {
    _count: SuperAdminTenantCountAggregateOutputType | null
    _avg: SuperAdminTenantAvgAggregateOutputType | null
    _sum: SuperAdminTenantSumAggregateOutputType | null
    _min: SuperAdminTenantMinAggregateOutputType | null
    _max: SuperAdminTenantMaxAggregateOutputType | null
  }

  export type SuperAdminTenantAvgAggregateOutputType = {
    tenant_id: number | null
    super_admin_id: number | null
  }

  export type SuperAdminTenantSumAggregateOutputType = {
    tenant_id: number | null
    super_admin_id: number | null
  }

  export type SuperAdminTenantMinAggregateOutputType = {
    tenant_id: number | null
    super_admin_id: number | null
    assigned_at: Date | null
  }

  export type SuperAdminTenantMaxAggregateOutputType = {
    tenant_id: number | null
    super_admin_id: number | null
    assigned_at: Date | null
  }

  export type SuperAdminTenantCountAggregateOutputType = {
    tenant_id: number
    super_admin_id: number
    assigned_at: number
    _all: number
  }


  export type SuperAdminTenantAvgAggregateInputType = {
    tenant_id?: true
    super_admin_id?: true
  }

  export type SuperAdminTenantSumAggregateInputType = {
    tenant_id?: true
    super_admin_id?: true
  }

  export type SuperAdminTenantMinAggregateInputType = {
    tenant_id?: true
    super_admin_id?: true
    assigned_at?: true
  }

  export type SuperAdminTenantMaxAggregateInputType = {
    tenant_id?: true
    super_admin_id?: true
    assigned_at?: true
  }

  export type SuperAdminTenantCountAggregateInputType = {
    tenant_id?: true
    super_admin_id?: true
    assigned_at?: true
    _all?: true
  }

  export type SuperAdminTenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdminTenant to aggregate.
     */
    where?: SuperAdminTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdminTenants to fetch.
     */
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SuperAdminTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdminTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdminTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SuperAdminTenants
    **/
    _count?: true | SuperAdminTenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SuperAdminTenantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SuperAdminTenantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperAdminTenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperAdminTenantMaxAggregateInputType
  }

  export type GetSuperAdminTenantAggregateType<T extends SuperAdminTenantAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperAdminTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperAdminTenant[P]>
      : GetScalarType<T[P], AggregateSuperAdminTenant[P]>
  }




  export type SuperAdminTenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminTenantWhereInput
    orderBy?: SuperAdminTenantOrderByWithAggregationInput | SuperAdminTenantOrderByWithAggregationInput[]
    by: SuperAdminTenantScalarFieldEnum[] | SuperAdminTenantScalarFieldEnum
    having?: SuperAdminTenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperAdminTenantCountAggregateInputType | true
    _avg?: SuperAdminTenantAvgAggregateInputType
    _sum?: SuperAdminTenantSumAggregateInputType
    _min?: SuperAdminTenantMinAggregateInputType
    _max?: SuperAdminTenantMaxAggregateInputType
  }

  export type SuperAdminTenantGroupByOutputType = {
    tenant_id: number
    super_admin_id: number
    assigned_at: Date
    _count: SuperAdminTenantCountAggregateOutputType | null
    _avg: SuperAdminTenantAvgAggregateOutputType | null
    _sum: SuperAdminTenantSumAggregateOutputType | null
    _min: SuperAdminTenantMinAggregateOutputType | null
    _max: SuperAdminTenantMaxAggregateOutputType | null
  }

  type GetSuperAdminTenantGroupByPayload<T extends SuperAdminTenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperAdminTenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperAdminTenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperAdminTenantGroupByOutputType[P]>
            : GetScalarType<T[P], SuperAdminTenantGroupByOutputType[P]>
        }
      >
    >


  export type SuperAdminTenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    super_admin_id?: boolean
    assigned_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superAdminTenant"]>

  export type SuperAdminTenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    super_admin_id?: boolean
    assigned_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superAdminTenant"]>

  export type SuperAdminTenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    super_admin_id?: boolean
    assigned_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superAdminTenant"]>

  export type SuperAdminTenantSelectScalar = {
    tenant_id?: boolean
    super_admin_id?: boolean
    assigned_at?: boolean
  }

  export type SuperAdminTenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"tenant_id" | "super_admin_id" | "assigned_at", ExtArgs["result"]["superAdminTenant"]>
  export type SuperAdminTenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }
  export type SuperAdminTenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }
  export type SuperAdminTenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    superAdmin?: boolean | SuperAdminDefaultArgs<ExtArgs>
  }

  export type $SuperAdminTenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SuperAdminTenant"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      superAdmin: Prisma.$SuperAdminPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      tenant_id: number
      super_admin_id: number
      assigned_at: Date
    }, ExtArgs["result"]["superAdminTenant"]>
    composites: {}
  }

  type SuperAdminTenantGetPayload<S extends boolean | null | undefined | SuperAdminTenantDefaultArgs> = $Result.GetResult<Prisma.$SuperAdminTenantPayload, S>

  type SuperAdminTenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SuperAdminTenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SuperAdminTenantCountAggregateInputType | true
    }

  export interface SuperAdminTenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SuperAdminTenant'], meta: { name: 'SuperAdminTenant' } }
    /**
     * Find zero or one SuperAdminTenant that matches the filter.
     * @param {SuperAdminTenantFindUniqueArgs} args - Arguments to find a SuperAdminTenant
     * @example
     * // Get one SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SuperAdminTenantFindUniqueArgs>(args: SelectSubset<T, SuperAdminTenantFindUniqueArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SuperAdminTenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SuperAdminTenantFindUniqueOrThrowArgs} args - Arguments to find a SuperAdminTenant
     * @example
     * // Get one SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SuperAdminTenantFindUniqueOrThrowArgs>(args: SelectSubset<T, SuperAdminTenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdminTenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantFindFirstArgs} args - Arguments to find a SuperAdminTenant
     * @example
     * // Get one SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SuperAdminTenantFindFirstArgs>(args?: SelectSubset<T, SuperAdminTenantFindFirstArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdminTenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantFindFirstOrThrowArgs} args - Arguments to find a SuperAdminTenant
     * @example
     * // Get one SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SuperAdminTenantFindFirstOrThrowArgs>(args?: SelectSubset<T, SuperAdminTenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SuperAdminTenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuperAdminTenants
     * const superAdminTenants = await prisma.superAdminTenant.findMany()
     * 
     * // Get first 10 SuperAdminTenants
     * const superAdminTenants = await prisma.superAdminTenant.findMany({ take: 10 })
     * 
     * // Only select the `tenant_id`
     * const superAdminTenantWithTenant_idOnly = await prisma.superAdminTenant.findMany({ select: { tenant_id: true } })
     * 
     */
    findMany<T extends SuperAdminTenantFindManyArgs>(args?: SelectSubset<T, SuperAdminTenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SuperAdminTenant.
     * @param {SuperAdminTenantCreateArgs} args - Arguments to create a SuperAdminTenant.
     * @example
     * // Create one SuperAdminTenant
     * const SuperAdminTenant = await prisma.superAdminTenant.create({
     *   data: {
     *     // ... data to create a SuperAdminTenant
     *   }
     * })
     * 
     */
    create<T extends SuperAdminTenantCreateArgs>(args: SelectSubset<T, SuperAdminTenantCreateArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SuperAdminTenants.
     * @param {SuperAdminTenantCreateManyArgs} args - Arguments to create many SuperAdminTenants.
     * @example
     * // Create many SuperAdminTenants
     * const superAdminTenant = await prisma.superAdminTenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SuperAdminTenantCreateManyArgs>(args?: SelectSubset<T, SuperAdminTenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SuperAdminTenants and returns the data saved in the database.
     * @param {SuperAdminTenantCreateManyAndReturnArgs} args - Arguments to create many SuperAdminTenants.
     * @example
     * // Create many SuperAdminTenants
     * const superAdminTenant = await prisma.superAdminTenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SuperAdminTenants and only return the `tenant_id`
     * const superAdminTenantWithTenant_idOnly = await prisma.superAdminTenant.createManyAndReturn({
     *   select: { tenant_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SuperAdminTenantCreateManyAndReturnArgs>(args?: SelectSubset<T, SuperAdminTenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SuperAdminTenant.
     * @param {SuperAdminTenantDeleteArgs} args - Arguments to delete one SuperAdminTenant.
     * @example
     * // Delete one SuperAdminTenant
     * const SuperAdminTenant = await prisma.superAdminTenant.delete({
     *   where: {
     *     // ... filter to delete one SuperAdminTenant
     *   }
     * })
     * 
     */
    delete<T extends SuperAdminTenantDeleteArgs>(args: SelectSubset<T, SuperAdminTenantDeleteArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SuperAdminTenant.
     * @param {SuperAdminTenantUpdateArgs} args - Arguments to update one SuperAdminTenant.
     * @example
     * // Update one SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SuperAdminTenantUpdateArgs>(args: SelectSubset<T, SuperAdminTenantUpdateArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SuperAdminTenants.
     * @param {SuperAdminTenantDeleteManyArgs} args - Arguments to filter SuperAdminTenants to delete.
     * @example
     * // Delete a few SuperAdminTenants
     * const { count } = await prisma.superAdminTenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SuperAdminTenantDeleteManyArgs>(args?: SelectSubset<T, SuperAdminTenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdminTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuperAdminTenants
     * const superAdminTenant = await prisma.superAdminTenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SuperAdminTenantUpdateManyArgs>(args: SelectSubset<T, SuperAdminTenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdminTenants and returns the data updated in the database.
     * @param {SuperAdminTenantUpdateManyAndReturnArgs} args - Arguments to update many SuperAdminTenants.
     * @example
     * // Update many SuperAdminTenants
     * const superAdminTenant = await prisma.superAdminTenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SuperAdminTenants and only return the `tenant_id`
     * const superAdminTenantWithTenant_idOnly = await prisma.superAdminTenant.updateManyAndReturn({
     *   select: { tenant_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SuperAdminTenantUpdateManyAndReturnArgs>(args: SelectSubset<T, SuperAdminTenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SuperAdminTenant.
     * @param {SuperAdminTenantUpsertArgs} args - Arguments to update or create a SuperAdminTenant.
     * @example
     * // Update or create a SuperAdminTenant
     * const superAdminTenant = await prisma.superAdminTenant.upsert({
     *   create: {
     *     // ... data to create a SuperAdminTenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuperAdminTenant we want to update
     *   }
     * })
     */
    upsert<T extends SuperAdminTenantUpsertArgs>(args: SelectSubset<T, SuperAdminTenantUpsertArgs<ExtArgs>>): Prisma__SuperAdminTenantClient<$Result.GetResult<Prisma.$SuperAdminTenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SuperAdminTenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantCountArgs} args - Arguments to filter SuperAdminTenants to count.
     * @example
     * // Count the number of SuperAdminTenants
     * const count = await prisma.superAdminTenant.count({
     *   where: {
     *     // ... the filter for the SuperAdminTenants we want to count
     *   }
     * })
    **/
    count<T extends SuperAdminTenantCountArgs>(
      args?: Subset<T, SuperAdminTenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperAdminTenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuperAdminTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SuperAdminTenantAggregateArgs>(args: Subset<T, SuperAdminTenantAggregateArgs>): Prisma.PrismaPromise<GetSuperAdminTenantAggregateType<T>>

    /**
     * Group by SuperAdminTenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminTenantGroupByArgs} args - Group by arguments.
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
      T extends SuperAdminTenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SuperAdminTenantGroupByArgs['orderBy'] }
        : { orderBy?: SuperAdminTenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SuperAdminTenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperAdminTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SuperAdminTenant model
   */
  readonly fields: SuperAdminTenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SuperAdminTenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SuperAdminTenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    superAdmin<T extends SuperAdminDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SuperAdminDefaultArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SuperAdminTenant model
   */
  interface SuperAdminTenantFieldRefs {
    readonly tenant_id: FieldRef<"SuperAdminTenant", 'Int'>
    readonly super_admin_id: FieldRef<"SuperAdminTenant", 'Int'>
    readonly assigned_at: FieldRef<"SuperAdminTenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SuperAdminTenant findUnique
   */
  export type SuperAdminTenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdminTenant to fetch.
     */
    where: SuperAdminTenantWhereUniqueInput
  }

  /**
   * SuperAdminTenant findUniqueOrThrow
   */
  export type SuperAdminTenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdminTenant to fetch.
     */
    where: SuperAdminTenantWhereUniqueInput
  }

  /**
   * SuperAdminTenant findFirst
   */
  export type SuperAdminTenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdminTenant to fetch.
     */
    where?: SuperAdminTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdminTenants to fetch.
     */
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdminTenants.
     */
    cursor?: SuperAdminTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdminTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdminTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdminTenants.
     */
    distinct?: SuperAdminTenantScalarFieldEnum | SuperAdminTenantScalarFieldEnum[]
  }

  /**
   * SuperAdminTenant findFirstOrThrow
   */
  export type SuperAdminTenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdminTenant to fetch.
     */
    where?: SuperAdminTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdminTenants to fetch.
     */
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdminTenants.
     */
    cursor?: SuperAdminTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdminTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdminTenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdminTenants.
     */
    distinct?: SuperAdminTenantScalarFieldEnum | SuperAdminTenantScalarFieldEnum[]
  }

  /**
   * SuperAdminTenant findMany
   */
  export type SuperAdminTenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter, which SuperAdminTenants to fetch.
     */
    where?: SuperAdminTenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdminTenants to fetch.
     */
    orderBy?: SuperAdminTenantOrderByWithRelationInput | SuperAdminTenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SuperAdminTenants.
     */
    cursor?: SuperAdminTenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdminTenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdminTenants.
     */
    skip?: number
    distinct?: SuperAdminTenantScalarFieldEnum | SuperAdminTenantScalarFieldEnum[]
  }

  /**
   * SuperAdminTenant create
   */
  export type SuperAdminTenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * The data needed to create a SuperAdminTenant.
     */
    data: XOR<SuperAdminTenantCreateInput, SuperAdminTenantUncheckedCreateInput>
  }

  /**
   * SuperAdminTenant createMany
   */
  export type SuperAdminTenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SuperAdminTenants.
     */
    data: SuperAdminTenantCreateManyInput | SuperAdminTenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdminTenant createManyAndReturn
   */
  export type SuperAdminTenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * The data used to create many SuperAdminTenants.
     */
    data: SuperAdminTenantCreateManyInput | SuperAdminTenantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SuperAdminTenant update
   */
  export type SuperAdminTenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * The data needed to update a SuperAdminTenant.
     */
    data: XOR<SuperAdminTenantUpdateInput, SuperAdminTenantUncheckedUpdateInput>
    /**
     * Choose, which SuperAdminTenant to update.
     */
    where: SuperAdminTenantWhereUniqueInput
  }

  /**
   * SuperAdminTenant updateMany
   */
  export type SuperAdminTenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SuperAdminTenants.
     */
    data: XOR<SuperAdminTenantUpdateManyMutationInput, SuperAdminTenantUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdminTenants to update
     */
    where?: SuperAdminTenantWhereInput
    /**
     * Limit how many SuperAdminTenants to update.
     */
    limit?: number
  }

  /**
   * SuperAdminTenant updateManyAndReturn
   */
  export type SuperAdminTenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * The data used to update SuperAdminTenants.
     */
    data: XOR<SuperAdminTenantUpdateManyMutationInput, SuperAdminTenantUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdminTenants to update
     */
    where?: SuperAdminTenantWhereInput
    /**
     * Limit how many SuperAdminTenants to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SuperAdminTenant upsert
   */
  export type SuperAdminTenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * The filter to search for the SuperAdminTenant to update in case it exists.
     */
    where: SuperAdminTenantWhereUniqueInput
    /**
     * In case the SuperAdminTenant found by the `where` argument doesn't exist, create a new SuperAdminTenant with this data.
     */
    create: XOR<SuperAdminTenantCreateInput, SuperAdminTenantUncheckedCreateInput>
    /**
     * In case the SuperAdminTenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SuperAdminTenantUpdateInput, SuperAdminTenantUncheckedUpdateInput>
  }

  /**
   * SuperAdminTenant delete
   */
  export type SuperAdminTenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
    /**
     * Filter which SuperAdminTenant to delete.
     */
    where: SuperAdminTenantWhereUniqueInput
  }

  /**
   * SuperAdminTenant deleteMany
   */
  export type SuperAdminTenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdminTenants to delete
     */
    where?: SuperAdminTenantWhereInput
    /**
     * Limit how many SuperAdminTenants to delete.
     */
    limit?: number
  }

  /**
   * SuperAdminTenant without action
   */
  export type SuperAdminTenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdminTenant
     */
    select?: SuperAdminTenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdminTenant
     */
    omit?: SuperAdminTenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SuperAdminTenantInclude<ExtArgs> | null
  }


  /**
   * Model University
   */

  export type AggregateUniversity = {
    _count: UniversityCountAggregateOutputType | null
    _avg: UniversityAvgAggregateOutputType | null
    _sum: UniversitySumAggregateOutputType | null
    _min: UniversityMinAggregateOutputType | null
    _max: UniversityMaxAggregateOutputType | null
  }

  export type UniversityAvgAggregateOutputType = {
    id: number | null
  }

  export type UniversitySumAggregateOutputType = {
    id: number | null
  }

  export type UniversityMinAggregateOutputType = {
    id: number | null
    name: string | null
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    established_date: Date | null
    accreditation: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UniversityMaxAggregateOutputType = {
    id: number | null
    name: string | null
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    established_date: Date | null
    accreditation: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UniversityCountAggregateOutputType = {
    id: number
    name: number
    address: number
    phone: number
    email: number
    website: number
    established_date: number
    accreditation: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UniversityAvgAggregateInputType = {
    id?: true
  }

  export type UniversitySumAggregateInputType = {
    id?: true
  }

  export type UniversityMinAggregateInputType = {
    id?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    website?: true
    established_date?: true
    accreditation?: true
    created_at?: true
    updated_at?: true
  }

  export type UniversityMaxAggregateInputType = {
    id?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    website?: true
    established_date?: true
    accreditation?: true
    created_at?: true
    updated_at?: true
  }

  export type UniversityCountAggregateInputType = {
    id?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    website?: true
    established_date?: true
    accreditation?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UniversityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which University to aggregate.
     */
    where?: UniversityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Universities to fetch.
     */
    orderBy?: UniversityOrderByWithRelationInput | UniversityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UniversityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Universities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Universities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Universities
    **/
    _count?: true | UniversityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UniversityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UniversitySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UniversityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UniversityMaxAggregateInputType
  }

  export type GetUniversityAggregateType<T extends UniversityAggregateArgs> = {
        [P in keyof T & keyof AggregateUniversity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUniversity[P]>
      : GetScalarType<T[P], AggregateUniversity[P]>
  }




  export type UniversityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UniversityWhereInput
    orderBy?: UniversityOrderByWithAggregationInput | UniversityOrderByWithAggregationInput[]
    by: UniversityScalarFieldEnum[] | UniversityScalarFieldEnum
    having?: UniversityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UniversityCountAggregateInputType | true
    _avg?: UniversityAvgAggregateInputType
    _sum?: UniversitySumAggregateInputType
    _min?: UniversityMinAggregateInputType
    _max?: UniversityMaxAggregateInputType
  }

  export type UniversityGroupByOutputType = {
    id: number
    name: string
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    established_date: Date | null
    accreditation: string | null
    created_at: Date
    updated_at: Date
    _count: UniversityCountAggregateOutputType | null
    _avg: UniversityAvgAggregateOutputType | null
    _sum: UniversitySumAggregateOutputType | null
    _min: UniversityMinAggregateOutputType | null
    _max: UniversityMaxAggregateOutputType | null
  }

  type GetUniversityGroupByPayload<T extends UniversityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UniversityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UniversityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UniversityGroupByOutputType[P]>
            : GetScalarType<T[P], UniversityGroupByOutputType[P]>
        }
      >
    >


  export type UniversitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    website?: boolean
    established_date?: boolean
    accreditation?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenants?: boolean | University$tenantsArgs<ExtArgs>
    _count?: boolean | UniversityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["university"]>

  export type UniversitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    website?: boolean
    established_date?: boolean
    accreditation?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["university"]>

  export type UniversitySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    website?: boolean
    established_date?: boolean
    accreditation?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["university"]>

  export type UniversitySelectScalar = {
    id?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    website?: boolean
    established_date?: boolean
    accreditation?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UniversityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "address" | "phone" | "email" | "website" | "established_date" | "accreditation" | "created_at" | "updated_at", ExtArgs["result"]["university"]>
  export type UniversityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | University$tenantsArgs<ExtArgs>
    _count?: boolean | UniversityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UniversityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UniversityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UniversityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "University"
    objects: {
      tenants: Prisma.$TenantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      address: string | null
      phone: string | null
      email: string | null
      website: string | null
      established_date: Date | null
      accreditation: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["university"]>
    composites: {}
  }

  type UniversityGetPayload<S extends boolean | null | undefined | UniversityDefaultArgs> = $Result.GetResult<Prisma.$UniversityPayload, S>

  type UniversityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UniversityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UniversityCountAggregateInputType | true
    }

  export interface UniversityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['University'], meta: { name: 'University' } }
    /**
     * Find zero or one University that matches the filter.
     * @param {UniversityFindUniqueArgs} args - Arguments to find a University
     * @example
     * // Get one University
     * const university = await prisma.university.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UniversityFindUniqueArgs>(args: SelectSubset<T, UniversityFindUniqueArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one University that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UniversityFindUniqueOrThrowArgs} args - Arguments to find a University
     * @example
     * // Get one University
     * const university = await prisma.university.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UniversityFindUniqueOrThrowArgs>(args: SelectSubset<T, UniversityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first University that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityFindFirstArgs} args - Arguments to find a University
     * @example
     * // Get one University
     * const university = await prisma.university.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UniversityFindFirstArgs>(args?: SelectSubset<T, UniversityFindFirstArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first University that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityFindFirstOrThrowArgs} args - Arguments to find a University
     * @example
     * // Get one University
     * const university = await prisma.university.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UniversityFindFirstOrThrowArgs>(args?: SelectSubset<T, UniversityFindFirstOrThrowArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Universities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Universities
     * const universities = await prisma.university.findMany()
     * 
     * // Get first 10 Universities
     * const universities = await prisma.university.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const universityWithIdOnly = await prisma.university.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UniversityFindManyArgs>(args?: SelectSubset<T, UniversityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a University.
     * @param {UniversityCreateArgs} args - Arguments to create a University.
     * @example
     * // Create one University
     * const University = await prisma.university.create({
     *   data: {
     *     // ... data to create a University
     *   }
     * })
     * 
     */
    create<T extends UniversityCreateArgs>(args: SelectSubset<T, UniversityCreateArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Universities.
     * @param {UniversityCreateManyArgs} args - Arguments to create many Universities.
     * @example
     * // Create many Universities
     * const university = await prisma.university.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UniversityCreateManyArgs>(args?: SelectSubset<T, UniversityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Universities and returns the data saved in the database.
     * @param {UniversityCreateManyAndReturnArgs} args - Arguments to create many Universities.
     * @example
     * // Create many Universities
     * const university = await prisma.university.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Universities and only return the `id`
     * const universityWithIdOnly = await prisma.university.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UniversityCreateManyAndReturnArgs>(args?: SelectSubset<T, UniversityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a University.
     * @param {UniversityDeleteArgs} args - Arguments to delete one University.
     * @example
     * // Delete one University
     * const University = await prisma.university.delete({
     *   where: {
     *     // ... filter to delete one University
     *   }
     * })
     * 
     */
    delete<T extends UniversityDeleteArgs>(args: SelectSubset<T, UniversityDeleteArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one University.
     * @param {UniversityUpdateArgs} args - Arguments to update one University.
     * @example
     * // Update one University
     * const university = await prisma.university.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UniversityUpdateArgs>(args: SelectSubset<T, UniversityUpdateArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Universities.
     * @param {UniversityDeleteManyArgs} args - Arguments to filter Universities to delete.
     * @example
     * // Delete a few Universities
     * const { count } = await prisma.university.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UniversityDeleteManyArgs>(args?: SelectSubset<T, UniversityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Universities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Universities
     * const university = await prisma.university.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UniversityUpdateManyArgs>(args: SelectSubset<T, UniversityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Universities and returns the data updated in the database.
     * @param {UniversityUpdateManyAndReturnArgs} args - Arguments to update many Universities.
     * @example
     * // Update many Universities
     * const university = await prisma.university.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Universities and only return the `id`
     * const universityWithIdOnly = await prisma.university.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UniversityUpdateManyAndReturnArgs>(args: SelectSubset<T, UniversityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one University.
     * @param {UniversityUpsertArgs} args - Arguments to update or create a University.
     * @example
     * // Update or create a University
     * const university = await prisma.university.upsert({
     *   create: {
     *     // ... data to create a University
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the University we want to update
     *   }
     * })
     */
    upsert<T extends UniversityUpsertArgs>(args: SelectSubset<T, UniversityUpsertArgs<ExtArgs>>): Prisma__UniversityClient<$Result.GetResult<Prisma.$UniversityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Universities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityCountArgs} args - Arguments to filter Universities to count.
     * @example
     * // Count the number of Universities
     * const count = await prisma.university.count({
     *   where: {
     *     // ... the filter for the Universities we want to count
     *   }
     * })
    **/
    count<T extends UniversityCountArgs>(
      args?: Subset<T, UniversityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UniversityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a University.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UniversityAggregateArgs>(args: Subset<T, UniversityAggregateArgs>): Prisma.PrismaPromise<GetUniversityAggregateType<T>>

    /**
     * Group by University.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UniversityGroupByArgs} args - Group by arguments.
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
      T extends UniversityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UniversityGroupByArgs['orderBy'] }
        : { orderBy?: UniversityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UniversityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUniversityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the University model
   */
  readonly fields: UniversityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for University.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UniversityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenants<T extends University$tenantsArgs<ExtArgs> = {}>(args?: Subset<T, University$tenantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the University model
   */
  interface UniversityFieldRefs {
    readonly id: FieldRef<"University", 'Int'>
    readonly name: FieldRef<"University", 'String'>
    readonly address: FieldRef<"University", 'String'>
    readonly phone: FieldRef<"University", 'String'>
    readonly email: FieldRef<"University", 'String'>
    readonly website: FieldRef<"University", 'String'>
    readonly established_date: FieldRef<"University", 'DateTime'>
    readonly accreditation: FieldRef<"University", 'String'>
    readonly created_at: FieldRef<"University", 'DateTime'>
    readonly updated_at: FieldRef<"University", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * University findUnique
   */
  export type UniversityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter, which University to fetch.
     */
    where: UniversityWhereUniqueInput
  }

  /**
   * University findUniqueOrThrow
   */
  export type UniversityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter, which University to fetch.
     */
    where: UniversityWhereUniqueInput
  }

  /**
   * University findFirst
   */
  export type UniversityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter, which University to fetch.
     */
    where?: UniversityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Universities to fetch.
     */
    orderBy?: UniversityOrderByWithRelationInput | UniversityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Universities.
     */
    cursor?: UniversityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Universities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Universities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Universities.
     */
    distinct?: UniversityScalarFieldEnum | UniversityScalarFieldEnum[]
  }

  /**
   * University findFirstOrThrow
   */
  export type UniversityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter, which University to fetch.
     */
    where?: UniversityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Universities to fetch.
     */
    orderBy?: UniversityOrderByWithRelationInput | UniversityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Universities.
     */
    cursor?: UniversityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Universities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Universities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Universities.
     */
    distinct?: UniversityScalarFieldEnum | UniversityScalarFieldEnum[]
  }

  /**
   * University findMany
   */
  export type UniversityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter, which Universities to fetch.
     */
    where?: UniversityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Universities to fetch.
     */
    orderBy?: UniversityOrderByWithRelationInput | UniversityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Universities.
     */
    cursor?: UniversityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Universities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Universities.
     */
    skip?: number
    distinct?: UniversityScalarFieldEnum | UniversityScalarFieldEnum[]
  }

  /**
   * University create
   */
  export type UniversityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * The data needed to create a University.
     */
    data: XOR<UniversityCreateInput, UniversityUncheckedCreateInput>
  }

  /**
   * University createMany
   */
  export type UniversityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Universities.
     */
    data: UniversityCreateManyInput | UniversityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * University createManyAndReturn
   */
  export type UniversityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * The data used to create many Universities.
     */
    data: UniversityCreateManyInput | UniversityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * University update
   */
  export type UniversityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * The data needed to update a University.
     */
    data: XOR<UniversityUpdateInput, UniversityUncheckedUpdateInput>
    /**
     * Choose, which University to update.
     */
    where: UniversityWhereUniqueInput
  }

  /**
   * University updateMany
   */
  export type UniversityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Universities.
     */
    data: XOR<UniversityUpdateManyMutationInput, UniversityUncheckedUpdateManyInput>
    /**
     * Filter which Universities to update
     */
    where?: UniversityWhereInput
    /**
     * Limit how many Universities to update.
     */
    limit?: number
  }

  /**
   * University updateManyAndReturn
   */
  export type UniversityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * The data used to update Universities.
     */
    data: XOR<UniversityUpdateManyMutationInput, UniversityUncheckedUpdateManyInput>
    /**
     * Filter which Universities to update
     */
    where?: UniversityWhereInput
    /**
     * Limit how many Universities to update.
     */
    limit?: number
  }

  /**
   * University upsert
   */
  export type UniversityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * The filter to search for the University to update in case it exists.
     */
    where: UniversityWhereUniqueInput
    /**
     * In case the University found by the `where` argument doesn't exist, create a new University with this data.
     */
    create: XOR<UniversityCreateInput, UniversityUncheckedCreateInput>
    /**
     * In case the University was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UniversityUpdateInput, UniversityUncheckedUpdateInput>
  }

  /**
   * University delete
   */
  export type UniversityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
    /**
     * Filter which University to delete.
     */
    where: UniversityWhereUniqueInput
  }

  /**
   * University deleteMany
   */
  export type UniversityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Universities to delete
     */
    where?: UniversityWhereInput
    /**
     * Limit how many Universities to delete.
     */
    limit?: number
  }

  /**
   * University.tenants
   */
  export type University$tenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    cursor?: TenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * University without action
   */
  export type UniversityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the University
     */
    select?: UniversitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the University
     */
    omit?: UniversityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UniversityInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    subdomain: 'subdomain',
    db_schema: 'db_schema',
    created_at: 'created_at',
    updated_at: 'updated_at',
    is_active: 'is_active',
    university_id: 'university_id'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const SuperAdminScalarFieldEnum: {
    id: 'id',
    username: 'username',
    email: 'email',
    password: 'password',
    created_at: 'created_at',
    is_active: 'is_active'
  };

  export type SuperAdminScalarFieldEnum = (typeof SuperAdminScalarFieldEnum)[keyof typeof SuperAdminScalarFieldEnum]


  export const SuperAdminTenantScalarFieldEnum: {
    tenant_id: 'tenant_id',
    super_admin_id: 'super_admin_id',
    assigned_at: 'assigned_at'
  };

  export type SuperAdminTenantScalarFieldEnum = (typeof SuperAdminTenantScalarFieldEnum)[keyof typeof SuperAdminTenantScalarFieldEnum]


  export const UniversityScalarFieldEnum: {
    id: 'id',
    name: 'name',
    address: 'address',
    phone: 'phone',
    email: 'email',
    website: 'website',
    established_date: 'established_date',
    accreditation: 'accreditation',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UniversityScalarFieldEnum = (typeof UniversityScalarFieldEnum)[keyof typeof UniversityScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: IntFilter<"Tenant"> | number
    name?: StringFilter<"Tenant"> | string
    subdomain?: StringFilter<"Tenant"> | string
    db_schema?: StringFilter<"Tenant"> | string
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    updated_at?: DateTimeFilter<"Tenant"> | Date | string
    is_active?: BoolFilter<"Tenant"> | boolean
    university_id?: IntNullableFilter<"Tenant"> | number | null
    university?: XOR<UniversityNullableScalarRelationFilter, UniversityWhereInput> | null
    superAdmins?: SuperAdminTenantListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    db_schema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    is_active?: SortOrder
    university_id?: SortOrderInput | SortOrder
    university?: UniversityOrderByWithRelationInput
    superAdmins?: SuperAdminTenantOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    subdomain?: string
    db_schema?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    updated_at?: DateTimeFilter<"Tenant"> | Date | string
    is_active?: BoolFilter<"Tenant"> | boolean
    university_id?: IntNullableFilter<"Tenant"> | number | null
    university?: XOR<UniversityNullableScalarRelationFilter, UniversityWhereInput> | null
    superAdmins?: SuperAdminTenantListRelationFilter
  }, "id" | "subdomain" | "db_schema">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    db_schema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    is_active?: SortOrder
    university_id?: SortOrderInput | SortOrder
    _count?: TenantCountOrderByAggregateInput
    _avg?: TenantAvgOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
    _sum?: TenantSumOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Tenant"> | number
    name?: StringWithAggregatesFilter<"Tenant"> | string
    subdomain?: StringWithAggregatesFilter<"Tenant"> | string
    db_schema?: StringWithAggregatesFilter<"Tenant"> | string
    created_at?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    is_active?: BoolWithAggregatesFilter<"Tenant"> | boolean
    university_id?: IntNullableWithAggregatesFilter<"Tenant"> | number | null
  }

  export type SuperAdminWhereInput = {
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    id?: IntFilter<"SuperAdmin"> | number
    username?: StringFilter<"SuperAdmin"> | string
    email?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    created_at?: DateTimeFilter<"SuperAdmin"> | Date | string
    is_active?: BoolFilter<"SuperAdmin"> | boolean
    tenants?: SuperAdminTenantListRelationFilter
  }

  export type SuperAdminOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    is_active?: SortOrder
    tenants?: SuperAdminTenantOrderByRelationAggregateInput
  }

  export type SuperAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    email?: string
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    password?: StringFilter<"SuperAdmin"> | string
    created_at?: DateTimeFilter<"SuperAdmin"> | Date | string
    is_active?: BoolFilter<"SuperAdmin"> | boolean
    tenants?: SuperAdminTenantListRelationFilter
  }, "id" | "username" | "email">

  export type SuperAdminOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    is_active?: SortOrder
    _count?: SuperAdminCountOrderByAggregateInput
    _avg?: SuperAdminAvgOrderByAggregateInput
    _max?: SuperAdminMaxOrderByAggregateInput
    _min?: SuperAdminMinOrderByAggregateInput
    _sum?: SuperAdminSumOrderByAggregateInput
  }

  export type SuperAdminScalarWhereWithAggregatesInput = {
    AND?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    OR?: SuperAdminScalarWhereWithAggregatesInput[]
    NOT?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SuperAdmin"> | number
    username?: StringWithAggregatesFilter<"SuperAdmin"> | string
    email?: StringWithAggregatesFilter<"SuperAdmin"> | string
    password?: StringWithAggregatesFilter<"SuperAdmin"> | string
    created_at?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
    is_active?: BoolWithAggregatesFilter<"SuperAdmin"> | boolean
  }

  export type SuperAdminTenantWhereInput = {
    AND?: SuperAdminTenantWhereInput | SuperAdminTenantWhereInput[]
    OR?: SuperAdminTenantWhereInput[]
    NOT?: SuperAdminTenantWhereInput | SuperAdminTenantWhereInput[]
    tenant_id?: IntFilter<"SuperAdminTenant"> | number
    super_admin_id?: IntFilter<"SuperAdminTenant"> | number
    assigned_at?: DateTimeFilter<"SuperAdminTenant"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    superAdmin?: XOR<SuperAdminScalarRelationFilter, SuperAdminWhereInput>
  }

  export type SuperAdminTenantOrderByWithRelationInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
    assigned_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    superAdmin?: SuperAdminOrderByWithRelationInput
  }

  export type SuperAdminTenantWhereUniqueInput = Prisma.AtLeast<{
    tenant_id_super_admin_id?: SuperAdminTenantTenant_idSuper_admin_idCompoundUniqueInput
    AND?: SuperAdminTenantWhereInput | SuperAdminTenantWhereInput[]
    OR?: SuperAdminTenantWhereInput[]
    NOT?: SuperAdminTenantWhereInput | SuperAdminTenantWhereInput[]
    tenant_id?: IntFilter<"SuperAdminTenant"> | number
    super_admin_id?: IntFilter<"SuperAdminTenant"> | number
    assigned_at?: DateTimeFilter<"SuperAdminTenant"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    superAdmin?: XOR<SuperAdminScalarRelationFilter, SuperAdminWhereInput>
  }, "tenant_id_super_admin_id">

  export type SuperAdminTenantOrderByWithAggregationInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
    assigned_at?: SortOrder
    _count?: SuperAdminTenantCountOrderByAggregateInput
    _avg?: SuperAdminTenantAvgOrderByAggregateInput
    _max?: SuperAdminTenantMaxOrderByAggregateInput
    _min?: SuperAdminTenantMinOrderByAggregateInput
    _sum?: SuperAdminTenantSumOrderByAggregateInput
  }

  export type SuperAdminTenantScalarWhereWithAggregatesInput = {
    AND?: SuperAdminTenantScalarWhereWithAggregatesInput | SuperAdminTenantScalarWhereWithAggregatesInput[]
    OR?: SuperAdminTenantScalarWhereWithAggregatesInput[]
    NOT?: SuperAdminTenantScalarWhereWithAggregatesInput | SuperAdminTenantScalarWhereWithAggregatesInput[]
    tenant_id?: IntWithAggregatesFilter<"SuperAdminTenant"> | number
    super_admin_id?: IntWithAggregatesFilter<"SuperAdminTenant"> | number
    assigned_at?: DateTimeWithAggregatesFilter<"SuperAdminTenant"> | Date | string
  }

  export type UniversityWhereInput = {
    AND?: UniversityWhereInput | UniversityWhereInput[]
    OR?: UniversityWhereInput[]
    NOT?: UniversityWhereInput | UniversityWhereInput[]
    id?: IntFilter<"University"> | number
    name?: StringFilter<"University"> | string
    address?: StringNullableFilter<"University"> | string | null
    phone?: StringNullableFilter<"University"> | string | null
    email?: StringNullableFilter<"University"> | string | null
    website?: StringNullableFilter<"University"> | string | null
    established_date?: DateTimeNullableFilter<"University"> | Date | string | null
    accreditation?: StringNullableFilter<"University"> | string | null
    created_at?: DateTimeFilter<"University"> | Date | string
    updated_at?: DateTimeFilter<"University"> | Date | string
    tenants?: TenantListRelationFilter
  }

  export type UniversityOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    established_date?: SortOrderInput | SortOrder
    accreditation?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenants?: TenantOrderByRelationAggregateInput
  }

  export type UniversityWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: UniversityWhereInput | UniversityWhereInput[]
    OR?: UniversityWhereInput[]
    NOT?: UniversityWhereInput | UniversityWhereInput[]
    address?: StringNullableFilter<"University"> | string | null
    phone?: StringNullableFilter<"University"> | string | null
    email?: StringNullableFilter<"University"> | string | null
    website?: StringNullableFilter<"University"> | string | null
    established_date?: DateTimeNullableFilter<"University"> | Date | string | null
    accreditation?: StringNullableFilter<"University"> | string | null
    created_at?: DateTimeFilter<"University"> | Date | string
    updated_at?: DateTimeFilter<"University"> | Date | string
    tenants?: TenantListRelationFilter
  }, "id" | "name">

  export type UniversityOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    established_date?: SortOrderInput | SortOrder
    accreditation?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UniversityCountOrderByAggregateInput
    _avg?: UniversityAvgOrderByAggregateInput
    _max?: UniversityMaxOrderByAggregateInput
    _min?: UniversityMinOrderByAggregateInput
    _sum?: UniversitySumOrderByAggregateInput
  }

  export type UniversityScalarWhereWithAggregatesInput = {
    AND?: UniversityScalarWhereWithAggregatesInput | UniversityScalarWhereWithAggregatesInput[]
    OR?: UniversityScalarWhereWithAggregatesInput[]
    NOT?: UniversityScalarWhereWithAggregatesInput | UniversityScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"University"> | number
    name?: StringWithAggregatesFilter<"University"> | string
    address?: StringNullableWithAggregatesFilter<"University"> | string | null
    phone?: StringNullableWithAggregatesFilter<"University"> | string | null
    email?: StringNullableWithAggregatesFilter<"University"> | string | null
    website?: StringNullableWithAggregatesFilter<"University"> | string | null
    established_date?: DateTimeNullableWithAggregatesFilter<"University"> | Date | string | null
    accreditation?: StringNullableWithAggregatesFilter<"University"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"University"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"University"> | Date | string
  }

  export type TenantCreateInput = {
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    university?: UniversityCreateNestedOneWithoutTenantsInput
    superAdmins?: SuperAdminTenantCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: number
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    university_id?: number | null
    superAdmins?: SuperAdminTenantUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    university?: UniversityUpdateOneWithoutTenantsNestedInput
    superAdmins?: SuperAdminTenantUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    university_id?: NullableIntFieldUpdateOperationsInput | number | null
    superAdmins?: SuperAdminTenantUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: number
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    university_id?: number | null
  }

  export type TenantUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    university_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SuperAdminCreateInput = {
    username: string
    email: string
    password: string
    created_at?: Date | string
    is_active?: boolean
    tenants?: SuperAdminTenantCreateNestedManyWithoutSuperAdminInput
  }

  export type SuperAdminUncheckedCreateInput = {
    id?: number
    username: string
    email: string
    password: string
    created_at?: Date | string
    is_active?: boolean
    tenants?: SuperAdminTenantUncheckedCreateNestedManyWithoutSuperAdminInput
  }

  export type SuperAdminUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    tenants?: SuperAdminTenantUpdateManyWithoutSuperAdminNestedInput
  }

  export type SuperAdminUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    tenants?: SuperAdminTenantUncheckedUpdateManyWithoutSuperAdminNestedInput
  }

  export type SuperAdminCreateManyInput = {
    id?: number
    username: string
    email: string
    password: string
    created_at?: Date | string
    is_active?: boolean
  }

  export type SuperAdminUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminTenantCreateInput = {
    assigned_at?: Date | string
    tenant: TenantCreateNestedOneWithoutSuperAdminsInput
    superAdmin: SuperAdminCreateNestedOneWithoutTenantsInput
  }

  export type SuperAdminTenantUncheckedCreateInput = {
    tenant_id: number
    super_admin_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantUpdateInput = {
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSuperAdminsNestedInput
    superAdmin?: SuperAdminUpdateOneRequiredWithoutTenantsNestedInput
  }

  export type SuperAdminTenantUncheckedUpdateInput = {
    tenant_id?: IntFieldUpdateOperationsInput | number
    super_admin_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantCreateManyInput = {
    tenant_id: number
    super_admin_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantUpdateManyMutationInput = {
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantUncheckedUpdateManyInput = {
    tenant_id?: IntFieldUpdateOperationsInput | number
    super_admin_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UniversityCreateInput = {
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    established_date?: Date | string | null
    accreditation?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tenants?: TenantCreateNestedManyWithoutUniversityInput
  }

  export type UniversityUncheckedCreateInput = {
    id?: number
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    established_date?: Date | string | null
    accreditation?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tenants?: TenantUncheckedCreateNestedManyWithoutUniversityInput
  }

  export type UniversityUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenants?: TenantUpdateManyWithoutUniversityNestedInput
  }

  export type UniversityUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenants?: TenantUncheckedUpdateManyWithoutUniversityNestedInput
  }

  export type UniversityCreateManyInput = {
    id?: number
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    established_date?: Date | string | null
    accreditation?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UniversityUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UniversityUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UniversityNullableScalarRelationFilter = {
    is?: UniversityWhereInput | null
    isNot?: UniversityWhereInput | null
  }

  export type SuperAdminTenantListRelationFilter = {
    every?: SuperAdminTenantWhereInput
    some?: SuperAdminTenantWhereInput
    none?: SuperAdminTenantWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SuperAdminTenantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    db_schema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    is_active?: SortOrder
    university_id?: SortOrder
  }

  export type TenantAvgOrderByAggregateInput = {
    id?: SortOrder
    university_id?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    db_schema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    is_active?: SortOrder
    university_id?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    db_schema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    is_active?: SortOrder
    university_id?: SortOrder
  }

  export type TenantSumOrderByAggregateInput = {
    id?: SortOrder
    university_id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SuperAdminCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    is_active?: SortOrder
  }

  export type SuperAdminAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SuperAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    is_active?: SortOrder
  }

  export type SuperAdminMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    is_active?: SortOrder
  }

  export type SuperAdminSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type SuperAdminScalarRelationFilter = {
    is?: SuperAdminWhereInput
    isNot?: SuperAdminWhereInput
  }

  export type SuperAdminTenantTenant_idSuper_admin_idCompoundUniqueInput = {
    tenant_id: number
    super_admin_id: number
  }

  export type SuperAdminTenantCountOrderByAggregateInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
    assigned_at?: SortOrder
  }

  export type SuperAdminTenantAvgOrderByAggregateInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
  }

  export type SuperAdminTenantMaxOrderByAggregateInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
    assigned_at?: SortOrder
  }

  export type SuperAdminTenantMinOrderByAggregateInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
    assigned_at?: SortOrder
  }

  export type SuperAdminTenantSumOrderByAggregateInput = {
    tenant_id?: SortOrder
    super_admin_id?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type TenantListRelationFilter = {
    every?: TenantWhereInput
    some?: TenantWhereInput
    none?: TenantWhereInput
  }

  export type TenantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UniversityCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    website?: SortOrder
    established_date?: SortOrder
    accreditation?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UniversityAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UniversityMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    website?: SortOrder
    established_date?: SortOrder
    accreditation?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UniversityMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    website?: SortOrder
    established_date?: SortOrder
    accreditation?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UniversitySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UniversityCreateNestedOneWithoutTenantsInput = {
    create?: XOR<UniversityCreateWithoutTenantsInput, UniversityUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: UniversityCreateOrConnectWithoutTenantsInput
    connect?: UniversityWhereUniqueInput
  }

  export type SuperAdminTenantCreateNestedManyWithoutTenantInput = {
    create?: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput> | SuperAdminTenantCreateWithoutTenantInput[] | SuperAdminTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutTenantInput | SuperAdminTenantCreateOrConnectWithoutTenantInput[]
    createMany?: SuperAdminTenantCreateManyTenantInputEnvelope
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
  }

  export type SuperAdminTenantUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput> | SuperAdminTenantCreateWithoutTenantInput[] | SuperAdminTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutTenantInput | SuperAdminTenantCreateOrConnectWithoutTenantInput[]
    createMany?: SuperAdminTenantCreateManyTenantInputEnvelope
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UniversityUpdateOneWithoutTenantsNestedInput = {
    create?: XOR<UniversityCreateWithoutTenantsInput, UniversityUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: UniversityCreateOrConnectWithoutTenantsInput
    upsert?: UniversityUpsertWithoutTenantsInput
    disconnect?: UniversityWhereInput | boolean
    delete?: UniversityWhereInput | boolean
    connect?: UniversityWhereUniqueInput
    update?: XOR<XOR<UniversityUpdateToOneWithWhereWithoutTenantsInput, UniversityUpdateWithoutTenantsInput>, UniversityUncheckedUpdateWithoutTenantsInput>
  }

  export type SuperAdminTenantUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput> | SuperAdminTenantCreateWithoutTenantInput[] | SuperAdminTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutTenantInput | SuperAdminTenantCreateOrConnectWithoutTenantInput[]
    upsert?: SuperAdminTenantUpsertWithWhereUniqueWithoutTenantInput | SuperAdminTenantUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SuperAdminTenantCreateManyTenantInputEnvelope
    set?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    disconnect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    delete?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    update?: SuperAdminTenantUpdateWithWhereUniqueWithoutTenantInput | SuperAdminTenantUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SuperAdminTenantUpdateManyWithWhereWithoutTenantInput | SuperAdminTenantUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SuperAdminTenantUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput> | SuperAdminTenantCreateWithoutTenantInput[] | SuperAdminTenantUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutTenantInput | SuperAdminTenantCreateOrConnectWithoutTenantInput[]
    upsert?: SuperAdminTenantUpsertWithWhereUniqueWithoutTenantInput | SuperAdminTenantUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SuperAdminTenantCreateManyTenantInputEnvelope
    set?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    disconnect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    delete?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    update?: SuperAdminTenantUpdateWithWhereUniqueWithoutTenantInput | SuperAdminTenantUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SuperAdminTenantUpdateManyWithWhereWithoutTenantInput | SuperAdminTenantUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
  }

  export type SuperAdminTenantCreateNestedManyWithoutSuperAdminInput = {
    create?: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput> | SuperAdminTenantCreateWithoutSuperAdminInput[] | SuperAdminTenantUncheckedCreateWithoutSuperAdminInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutSuperAdminInput | SuperAdminTenantCreateOrConnectWithoutSuperAdminInput[]
    createMany?: SuperAdminTenantCreateManySuperAdminInputEnvelope
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
  }

  export type SuperAdminTenantUncheckedCreateNestedManyWithoutSuperAdminInput = {
    create?: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput> | SuperAdminTenantCreateWithoutSuperAdminInput[] | SuperAdminTenantUncheckedCreateWithoutSuperAdminInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutSuperAdminInput | SuperAdminTenantCreateOrConnectWithoutSuperAdminInput[]
    createMany?: SuperAdminTenantCreateManySuperAdminInputEnvelope
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
  }

  export type SuperAdminTenantUpdateManyWithoutSuperAdminNestedInput = {
    create?: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput> | SuperAdminTenantCreateWithoutSuperAdminInput[] | SuperAdminTenantUncheckedCreateWithoutSuperAdminInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutSuperAdminInput | SuperAdminTenantCreateOrConnectWithoutSuperAdminInput[]
    upsert?: SuperAdminTenantUpsertWithWhereUniqueWithoutSuperAdminInput | SuperAdminTenantUpsertWithWhereUniqueWithoutSuperAdminInput[]
    createMany?: SuperAdminTenantCreateManySuperAdminInputEnvelope
    set?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    disconnect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    delete?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    update?: SuperAdminTenantUpdateWithWhereUniqueWithoutSuperAdminInput | SuperAdminTenantUpdateWithWhereUniqueWithoutSuperAdminInput[]
    updateMany?: SuperAdminTenantUpdateManyWithWhereWithoutSuperAdminInput | SuperAdminTenantUpdateManyWithWhereWithoutSuperAdminInput[]
    deleteMany?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
  }

  export type SuperAdminTenantUncheckedUpdateManyWithoutSuperAdminNestedInput = {
    create?: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput> | SuperAdminTenantCreateWithoutSuperAdminInput[] | SuperAdminTenantUncheckedCreateWithoutSuperAdminInput[]
    connectOrCreate?: SuperAdminTenantCreateOrConnectWithoutSuperAdminInput | SuperAdminTenantCreateOrConnectWithoutSuperAdminInput[]
    upsert?: SuperAdminTenantUpsertWithWhereUniqueWithoutSuperAdminInput | SuperAdminTenantUpsertWithWhereUniqueWithoutSuperAdminInput[]
    createMany?: SuperAdminTenantCreateManySuperAdminInputEnvelope
    set?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    disconnect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    delete?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    connect?: SuperAdminTenantWhereUniqueInput | SuperAdminTenantWhereUniqueInput[]
    update?: SuperAdminTenantUpdateWithWhereUniqueWithoutSuperAdminInput | SuperAdminTenantUpdateWithWhereUniqueWithoutSuperAdminInput[]
    updateMany?: SuperAdminTenantUpdateManyWithWhereWithoutSuperAdminInput | SuperAdminTenantUpdateManyWithWhereWithoutSuperAdminInput[]
    deleteMany?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutSuperAdminsInput = {
    create?: XOR<TenantCreateWithoutSuperAdminsInput, TenantUncheckedCreateWithoutSuperAdminsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSuperAdminsInput
    connect?: TenantWhereUniqueInput
  }

  export type SuperAdminCreateNestedOneWithoutTenantsInput = {
    create?: XOR<SuperAdminCreateWithoutTenantsInput, SuperAdminUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: SuperAdminCreateOrConnectWithoutTenantsInput
    connect?: SuperAdminWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutSuperAdminsNestedInput = {
    create?: XOR<TenantCreateWithoutSuperAdminsInput, TenantUncheckedCreateWithoutSuperAdminsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSuperAdminsInput
    upsert?: TenantUpsertWithoutSuperAdminsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutSuperAdminsInput, TenantUpdateWithoutSuperAdminsInput>, TenantUncheckedUpdateWithoutSuperAdminsInput>
  }

  export type SuperAdminUpdateOneRequiredWithoutTenantsNestedInput = {
    create?: XOR<SuperAdminCreateWithoutTenantsInput, SuperAdminUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: SuperAdminCreateOrConnectWithoutTenantsInput
    upsert?: SuperAdminUpsertWithoutTenantsInput
    connect?: SuperAdminWhereUniqueInput
    update?: XOR<XOR<SuperAdminUpdateToOneWithWhereWithoutTenantsInput, SuperAdminUpdateWithoutTenantsInput>, SuperAdminUncheckedUpdateWithoutTenantsInput>
  }

  export type TenantCreateNestedManyWithoutUniversityInput = {
    create?: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput> | TenantCreateWithoutUniversityInput[] | TenantUncheckedCreateWithoutUniversityInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutUniversityInput | TenantCreateOrConnectWithoutUniversityInput[]
    createMany?: TenantCreateManyUniversityInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type TenantUncheckedCreateNestedManyWithoutUniversityInput = {
    create?: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput> | TenantCreateWithoutUniversityInput[] | TenantUncheckedCreateWithoutUniversityInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutUniversityInput | TenantCreateOrConnectWithoutUniversityInput[]
    createMany?: TenantCreateManyUniversityInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type TenantUpdateManyWithoutUniversityNestedInput = {
    create?: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput> | TenantCreateWithoutUniversityInput[] | TenantUncheckedCreateWithoutUniversityInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutUniversityInput | TenantCreateOrConnectWithoutUniversityInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutUniversityInput | TenantUpsertWithWhereUniqueWithoutUniversityInput[]
    createMany?: TenantCreateManyUniversityInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutUniversityInput | TenantUpdateWithWhereUniqueWithoutUniversityInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutUniversityInput | TenantUpdateManyWithWhereWithoutUniversityInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type TenantUncheckedUpdateManyWithoutUniversityNestedInput = {
    create?: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput> | TenantCreateWithoutUniversityInput[] | TenantUncheckedCreateWithoutUniversityInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutUniversityInput | TenantCreateOrConnectWithoutUniversityInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutUniversityInput | TenantUpsertWithWhereUniqueWithoutUniversityInput[]
    createMany?: TenantCreateManyUniversityInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutUniversityInput | TenantUpdateWithWhereUniqueWithoutUniversityInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutUniversityInput | TenantUpdateManyWithWhereWithoutUniversityInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UniversityCreateWithoutTenantsInput = {
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    established_date?: Date | string | null
    accreditation?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UniversityUncheckedCreateWithoutTenantsInput = {
    id?: number
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    established_date?: Date | string | null
    accreditation?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UniversityCreateOrConnectWithoutTenantsInput = {
    where: UniversityWhereUniqueInput
    create: XOR<UniversityCreateWithoutTenantsInput, UniversityUncheckedCreateWithoutTenantsInput>
  }

  export type SuperAdminTenantCreateWithoutTenantInput = {
    assigned_at?: Date | string
    superAdmin: SuperAdminCreateNestedOneWithoutTenantsInput
  }

  export type SuperAdminTenantUncheckedCreateWithoutTenantInput = {
    super_admin_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantCreateOrConnectWithoutTenantInput = {
    where: SuperAdminTenantWhereUniqueInput
    create: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput>
  }

  export type SuperAdminTenantCreateManyTenantInputEnvelope = {
    data: SuperAdminTenantCreateManyTenantInput | SuperAdminTenantCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UniversityUpsertWithoutTenantsInput = {
    update: XOR<UniversityUpdateWithoutTenantsInput, UniversityUncheckedUpdateWithoutTenantsInput>
    create: XOR<UniversityCreateWithoutTenantsInput, UniversityUncheckedCreateWithoutTenantsInput>
    where?: UniversityWhereInput
  }

  export type UniversityUpdateToOneWithWhereWithoutTenantsInput = {
    where?: UniversityWhereInput
    data: XOR<UniversityUpdateWithoutTenantsInput, UniversityUncheckedUpdateWithoutTenantsInput>
  }

  export type UniversityUpdateWithoutTenantsInput = {
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UniversityUncheckedUpdateWithoutTenantsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    established_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    accreditation?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantUpsertWithWhereUniqueWithoutTenantInput = {
    where: SuperAdminTenantWhereUniqueInput
    update: XOR<SuperAdminTenantUpdateWithoutTenantInput, SuperAdminTenantUncheckedUpdateWithoutTenantInput>
    create: XOR<SuperAdminTenantCreateWithoutTenantInput, SuperAdminTenantUncheckedCreateWithoutTenantInput>
  }

  export type SuperAdminTenantUpdateWithWhereUniqueWithoutTenantInput = {
    where: SuperAdminTenantWhereUniqueInput
    data: XOR<SuperAdminTenantUpdateWithoutTenantInput, SuperAdminTenantUncheckedUpdateWithoutTenantInput>
  }

  export type SuperAdminTenantUpdateManyWithWhereWithoutTenantInput = {
    where: SuperAdminTenantScalarWhereInput
    data: XOR<SuperAdminTenantUpdateManyMutationInput, SuperAdminTenantUncheckedUpdateManyWithoutTenantInput>
  }

  export type SuperAdminTenantScalarWhereInput = {
    AND?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
    OR?: SuperAdminTenantScalarWhereInput[]
    NOT?: SuperAdminTenantScalarWhereInput | SuperAdminTenantScalarWhereInput[]
    tenant_id?: IntFilter<"SuperAdminTenant"> | number
    super_admin_id?: IntFilter<"SuperAdminTenant"> | number
    assigned_at?: DateTimeFilter<"SuperAdminTenant"> | Date | string
  }

  export type SuperAdminTenantCreateWithoutSuperAdminInput = {
    assigned_at?: Date | string
    tenant: TenantCreateNestedOneWithoutSuperAdminsInput
  }

  export type SuperAdminTenantUncheckedCreateWithoutSuperAdminInput = {
    tenant_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantCreateOrConnectWithoutSuperAdminInput = {
    where: SuperAdminTenantWhereUniqueInput
    create: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput>
  }

  export type SuperAdminTenantCreateManySuperAdminInputEnvelope = {
    data: SuperAdminTenantCreateManySuperAdminInput | SuperAdminTenantCreateManySuperAdminInput[]
    skipDuplicates?: boolean
  }

  export type SuperAdminTenantUpsertWithWhereUniqueWithoutSuperAdminInput = {
    where: SuperAdminTenantWhereUniqueInput
    update: XOR<SuperAdminTenantUpdateWithoutSuperAdminInput, SuperAdminTenantUncheckedUpdateWithoutSuperAdminInput>
    create: XOR<SuperAdminTenantCreateWithoutSuperAdminInput, SuperAdminTenantUncheckedCreateWithoutSuperAdminInput>
  }

  export type SuperAdminTenantUpdateWithWhereUniqueWithoutSuperAdminInput = {
    where: SuperAdminTenantWhereUniqueInput
    data: XOR<SuperAdminTenantUpdateWithoutSuperAdminInput, SuperAdminTenantUncheckedUpdateWithoutSuperAdminInput>
  }

  export type SuperAdminTenantUpdateManyWithWhereWithoutSuperAdminInput = {
    where: SuperAdminTenantScalarWhereInput
    data: XOR<SuperAdminTenantUpdateManyMutationInput, SuperAdminTenantUncheckedUpdateManyWithoutSuperAdminInput>
  }

  export type TenantCreateWithoutSuperAdminsInput = {
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    university?: UniversityCreateNestedOneWithoutTenantsInput
  }

  export type TenantUncheckedCreateWithoutSuperAdminsInput = {
    id?: number
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    university_id?: number | null
  }

  export type TenantCreateOrConnectWithoutSuperAdminsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutSuperAdminsInput, TenantUncheckedCreateWithoutSuperAdminsInput>
  }

  export type SuperAdminCreateWithoutTenantsInput = {
    username: string
    email: string
    password: string
    created_at?: Date | string
    is_active?: boolean
  }

  export type SuperAdminUncheckedCreateWithoutTenantsInput = {
    id?: number
    username: string
    email: string
    password: string
    created_at?: Date | string
    is_active?: boolean
  }

  export type SuperAdminCreateOrConnectWithoutTenantsInput = {
    where: SuperAdminWhereUniqueInput
    create: XOR<SuperAdminCreateWithoutTenantsInput, SuperAdminUncheckedCreateWithoutTenantsInput>
  }

  export type TenantUpsertWithoutSuperAdminsInput = {
    update: XOR<TenantUpdateWithoutSuperAdminsInput, TenantUncheckedUpdateWithoutSuperAdminsInput>
    create: XOR<TenantCreateWithoutSuperAdminsInput, TenantUncheckedCreateWithoutSuperAdminsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutSuperAdminsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutSuperAdminsInput, TenantUncheckedUpdateWithoutSuperAdminsInput>
  }

  export type TenantUpdateWithoutSuperAdminsInput = {
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    university?: UniversityUpdateOneWithoutTenantsNestedInput
  }

  export type TenantUncheckedUpdateWithoutSuperAdminsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    university_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SuperAdminUpsertWithoutTenantsInput = {
    update: XOR<SuperAdminUpdateWithoutTenantsInput, SuperAdminUncheckedUpdateWithoutTenantsInput>
    create: XOR<SuperAdminCreateWithoutTenantsInput, SuperAdminUncheckedCreateWithoutTenantsInput>
    where?: SuperAdminWhereInput
  }

  export type SuperAdminUpdateToOneWithWhereWithoutTenantsInput = {
    where?: SuperAdminWhereInput
    data: XOR<SuperAdminUpdateWithoutTenantsInput, SuperAdminUncheckedUpdateWithoutTenantsInput>
  }

  export type SuperAdminUpdateWithoutTenantsInput = {
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminUncheckedUpdateWithoutTenantsInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TenantCreateWithoutUniversityInput = {
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    superAdmins?: SuperAdminTenantCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUniversityInput = {
    id?: number
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
    superAdmins?: SuperAdminTenantUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUniversityInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput>
  }

  export type TenantCreateManyUniversityInputEnvelope = {
    data: TenantCreateManyUniversityInput | TenantCreateManyUniversityInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithWhereUniqueWithoutUniversityInput = {
    where: TenantWhereUniqueInput
    update: XOR<TenantUpdateWithoutUniversityInput, TenantUncheckedUpdateWithoutUniversityInput>
    create: XOR<TenantCreateWithoutUniversityInput, TenantUncheckedCreateWithoutUniversityInput>
  }

  export type TenantUpdateWithWhereUniqueWithoutUniversityInput = {
    where: TenantWhereUniqueInput
    data: XOR<TenantUpdateWithoutUniversityInput, TenantUncheckedUpdateWithoutUniversityInput>
  }

  export type TenantUpdateManyWithWhereWithoutUniversityInput = {
    where: TenantScalarWhereInput
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyWithoutUniversityInput>
  }

  export type TenantScalarWhereInput = {
    AND?: TenantScalarWhereInput | TenantScalarWhereInput[]
    OR?: TenantScalarWhereInput[]
    NOT?: TenantScalarWhereInput | TenantScalarWhereInput[]
    id?: IntFilter<"Tenant"> | number
    name?: StringFilter<"Tenant"> | string
    subdomain?: StringFilter<"Tenant"> | string
    db_schema?: StringFilter<"Tenant"> | string
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    updated_at?: DateTimeFilter<"Tenant"> | Date | string
    is_active?: BoolFilter<"Tenant"> | boolean
    university_id?: IntNullableFilter<"Tenant"> | number | null
  }

  export type SuperAdminTenantCreateManyTenantInput = {
    super_admin_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantUpdateWithoutTenantInput = {
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
    superAdmin?: SuperAdminUpdateOneRequiredWithoutTenantsNestedInput
  }

  export type SuperAdminTenantUncheckedUpdateWithoutTenantInput = {
    super_admin_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantUncheckedUpdateManyWithoutTenantInput = {
    super_admin_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantCreateManySuperAdminInput = {
    tenant_id: number
    assigned_at?: Date | string
  }

  export type SuperAdminTenantUpdateWithoutSuperAdminInput = {
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSuperAdminsNestedInput
  }

  export type SuperAdminTenantUncheckedUpdateWithoutSuperAdminInput = {
    tenant_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminTenantUncheckedUpdateManyWithoutSuperAdminInput = {
    tenant_id?: IntFieldUpdateOperationsInput | number
    assigned_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateManyUniversityInput = {
    id?: number
    name: string
    subdomain: string
    db_schema: string
    created_at?: Date | string
    updated_at?: Date | string
    is_active?: boolean
  }

  export type TenantUpdateWithoutUniversityInput = {
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    superAdmins?: SuperAdminTenantUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUniversityInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    superAdmins?: SuperAdminTenantUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateManyWithoutUniversityInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    db_schema?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}