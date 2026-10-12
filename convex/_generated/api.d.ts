/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as features_auth_devOnly from "../features/auth/devOnly.js";
import type * as features_auth_devPassword from "../features/auth/devPassword.js";
import type * as features_auth_devPasswordProvider from "../features/auth/devPasswordProvider.js";
import type * as features_auth_google from "../features/auth/google.js";
import type * as features_auth_ofyEmail from "../features/auth/ofyEmail.js";
import type * as features_auth_ofyUser from "../features/auth/ofyUser.js";
import type * as features_auth_redirect from "../features/auth/redirect.js";
import type * as features_users from "../features/users.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib_displayName from "../lib/displayName.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "features/auth/devOnly": typeof features_auth_devOnly;
  "features/auth/devPassword": typeof features_auth_devPassword;
  "features/auth/devPasswordProvider": typeof features_auth_devPasswordProvider;
  "features/auth/google": typeof features_auth_google;
  "features/auth/ofyEmail": typeof features_auth_ofyEmail;
  "features/auth/ofyUser": typeof features_auth_ofyUser;
  "features/auth/redirect": typeof features_auth_redirect;
  "features/users": typeof features_users;
  health: typeof health;
  http: typeof http;
  "lib/displayName": typeof lib_displayName;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
