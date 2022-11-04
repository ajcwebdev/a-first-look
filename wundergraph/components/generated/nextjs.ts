import type { DragonsResponse, DragonsResponseData } from "./models";
import { createContext } from "react";
import { hooks, WunderGraphContextProperties } from "@wundergraph/nextjs";
import { QueryArgsWithInput, SubscriptionArgs, SubscriptionArgsWithInput } from "@wundergraph/sdk/client";
export type Role = "admin" | "user";

export enum AuthProvider {
	"github" = "github",
}

export const AuthProviders = {
	github: AuthProvider.github,
};

const defaultWunderGraphContextProperties: WunderGraphContextProperties<Role> = {
	ssrCache: {},
	client: null,
	clientConfig: {
		applicationHash: "e4612e25",
		applicationPath: "app/main",
		baseURL: "http://localhost:9991",
		sdkVersion: "0.109.0",
		authenticationEnabled: true,
	},
	user: null,
	setUser: (value) => {},
	isWindowFocused: "pristine",
	setIsWindowFocused: (value) => {},
	refetchMountedOperations: 0,
	setRefetchMountedOperations: (value) => {},
};

export const WunderGraphContext = createContext<WunderGraphContextProperties<Role>>(
	defaultWunderGraphContextProperties
);

export const withWunderGraph = hooks.withWunderGraphContextWrapper(
	WunderGraphContext,
	defaultWunderGraphContextProperties
);

export const useWunderGraph = hooks.useWunderGraph<Role, AuthProvider>(WunderGraphContext);

export const useQuery = {
	Dragons: hooks.useQueryWithoutInput<DragonsResponseData, Role>(WunderGraphContext, {
		operationName: "Dragons",
		requiresAuthentication: false,
	}),
};

export const useMutation = {};

export const useSubscription = {};

export const useLiveQuery = {
	Dragons: (args?: SubscriptionArgs) =>
		hooks.useSubscriptionWithoutInput<DragonsResponseData, Role>(WunderGraphContext, {
			operationName: "Dragons",
			requiresAuthentication: false,
			isLiveQuery: true,
		})(args),
};
