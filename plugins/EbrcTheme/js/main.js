define([
           'dojo/_base/declare',
           'JBrowse/Plugin'
       ],
       function(
           declare,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "EbrcTheme plugin starting" );

        browser.afterMilestone('initView', function() {
            dojo.create("div", { className: "eupathlogo", innerHTML: "<a href='/'><img class='eupathlogoimage' src='/a/images/EuPathDB/title_s.png'></a>" }, browser.menuBar);

        });
}});

});
