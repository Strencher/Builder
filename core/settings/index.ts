//@ts-nocheck

/*#ifdef BETTERDISCORD*/
export * from "./betterdiscord";
/*#endif*/

/*#ifdef POWERCORD*/
export * from "./powercord";
/*#endif*/

/*#ifdef ASTRA*/
// We use BD's stuff because Astra DOES have the BdApi global.
export * from "./betterdiscord";
/*#endif*/

/*#ifdef UNBOUND*/
export * from "./unbound";
/*#endif*/
