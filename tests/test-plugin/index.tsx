import {after, unpatchAll} from "@patcher";
import {Plugin} from "@structs";
import React from "react";

export default class Test extends Plugin {
    onStart() {
        console.log("Hey.", after);
        /*#ifdef BETTERDISCORD*/
        BdApi.alert("Hey.", (
            <p>Hello.</p>
        ));
        /*#endif*/
    }

    onStop() {
        console.log("Bye.", unpatchAll);
    }
}
