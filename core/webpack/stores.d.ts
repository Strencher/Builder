// TODO: Make types for discord's primitives

type User = any;
type Guild = any;

type FluxStore = {
    _dispatchToken: string;
    __getLocalVars(): any;

    emitChange(): void;
    getName(): string;
    addChangeListener(listener: (...args: any[]) => void): void;
    removeChangeListener(listener: (...args: any[]) => void): void;
}

export type StoreNames = "UserStore" | "GuildStore" | "SelectedGuildStore" | "SelectedChannelStore" | "AuthenticationStore";

type Store<T extends StoreNames> =
    T extends "UserStore" ? UserStore :
    T extends "GuildStore" ? GuildStore :
    T extends "SelectedGuildStore" ? SelectedGuildStore :
    T extends "SelectedChannelStore" ? SelectedChannelStore :
    T extends "AuthenticationStore" ? AuthenticationStore : never;

export type UserStore = FluxStore & {
    filter(predicate: (user: User) => boolean, sort?: boolean): User[];
    findByTag(username: string, discriminator: string): User | undefined;
    getUsers(): {[id: string]: User};
    getUser(id: string): User;
    getCurrentUser(): User;
};

export type GuildStore = FluxStore & {
    getGuild(id: string): Guild | undefined;
    getGuilds(): {[id: string]: Guild};
    getGuildCount(): number;
};

export type SelectedGuildStore = FluxStore & {
    getGuildId(): string;
    getLastSelectedGuildId(): string;
    getLastSelectedTimestamp(id: string): number;
    getState(): {
        selectedGuildTimestampMillis: {[id: string]: number}
    };
};

export type SelectedChannelStore = FluxStore & {
    getMostRecentSelectedTextChannelId(guildId: string): string;
    getLastSelectedChannelId(guildId: string): string;
    getLastSelectedChannels(guildId: string): string;
    getLastChannelFollowingDestination(): any;
    getVoiceChannelId(): string;
    getChannelId(): string;
};

export type AuthenticationStore = FluxStore & {
    // getCredentials(): undefined | {login: string, password: string}
    getMaskedPhone(): string | undefined;
    getCurrentRegistrationOption(): any;
    getSessionId(): string | undefined;
    getAuthSessionIdHash(): string;
    allowLogoutRedirect(): boolean;
    getVerifyingUserId(): string;
    getAnalyticsToken(): string;
    didVerifySucceed(): boolean;
    getRegisterStatus(): string;
    getId(): string | undefined;
    isAuthenticated(): boolean;
    getVerifyErrors(): any[];
    getLoginStatus(): string;
    didVerifyFail(): boolean;
    // getEmail(): string;
    // getToken(): string;
    // getLogin(): string;
    getMFATicket(): any;
    getErrors(): any[];
    getMFASMS(): any;
};
