// main.js: main script for src/view/index.html.
// Part of TabFern.  Copyright (c) cxw42, r4j4h, 2017.

/// Modules loaded via requirejs
let Modules = {};

/// HACK - a global for loglevel because typing `Modules.log` everywhere is a pain.
let log;

/// The tree window itself.
let W = window.frames[0];
    // Thanks to https://stackoverflow.com/a/13913943/2877364 by
    // https://stackoverflow.com/users/1105384/shank

//////////////////////////////////////////////////////////////////////////
// CHROME API //

var chrome_api = {
    windows: {},
    tabs: {},
    runtime: {},
    management: {},
    storage: {},
};

chrome.management.getSelf(function(info){console.log(info, this)});
let self = this;
console.log({self});

// Initialize the API with shims for everything
(function(api){
    for(let subsystem_name in api) {
        let src = chrome[subsystem_name];
        let dest = api[subsystem_name];

        for(let member_name in src) {
            let orig = src[member_name];
            if(typeof orig !== 'function') {
                dest[member_name] = orig;
            } else {
                dest[member_name] = function(...args) {
                    console.trace(`Called ${subsystem_name}.${member_name}`);
                                chrome[subsystem_name][member_name].apply(this,args);
                };
            }

        } //foreach member_name
    } //foreach subsystem_name
})(chrome_api);

//////////////////////////////////////////////////////////////////////////
// WORKERS //

function hello()
{
    chrome.management.getSelf(function(info){
        console.log({'Hello from main.js':info});});
}

function domOnMessage(evt)
{
    console.log({got:evt.data, from:evt.origin});
}

function initMain()
{
    window.addEventListener('message',domOnMessage);
}

// TODO?  Use https://github.com/wingify/please.js for postMessage()-based
// communications?

//////////////////////////////////////////////////////////////////////////
// MAIN //

/// require.js modules used by this file
let dependencies = [
    'jquery', 'split', 'loglevel'
];

function main(...args)
{
    // Hack: Copy the loaded modules into our Modules global
    for(let depidx = 0; depidx < args.length; ++depidx) {
        Modules[dependencies[depidx]] = args[depidx];
    }

    log = Modules.loglevel;
    log.setDefaultLevel(log.levels.DEBUG);  // TODO set to WARN for production

    console.log({"parent check main":window.parent===window});

    // Main events
    //window.addEventListener('unload', shutdownTree, { 'once': true });
    //window.addEventListener('resize', eventOnResize);
        // This doesn't detect window movement without a resize, which is why
        // we have timedResizeDetector above.

    // Fire off the main init
    if(document.readyState !== 'complete') {
        // Thanks to https://stackoverflow.com/a/28093606/2877364 by
        // https://stackoverflow.com/users/4483389/matthias-samsel
        window.addEventListener('load', initMain, { 'once': true });
    } else {
        window.setTimeout(initMain, 0);    //always async
    }
} // main()

require(dependencies, main);

// ###########################################################################
// ### End of real code
// ###########################################################################

//TODO test what happens when Chrome exits.  Does the background page need to
//save anything?

// Notes:
// can get T.treeobj from $(selector).data('jstree')
// can get element from T.treeobj.element

// vi: set ts=4 sts=4 sw=4 et ai fo-=o fo-=r: //
