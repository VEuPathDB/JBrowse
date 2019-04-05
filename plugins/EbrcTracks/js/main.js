define([
       'dojo/_base/declare',
       'dojo/_base/array',
       'dijit/MenuItem',
       'EbrcTracks/View/Dialog/SetTrackYMax',
       'JBrowse/Plugin'
       ],
       function(
           declare,
           array,
           dijitMenuItem,
           SetTrackYMaxDialog,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "EbrcTracks plugin starting" );


        browser.afterMilestone('initView', function() {
            // add a global menu item for resizing all visible quantitative tracks
            browser.addGlobalMenuItem( 'view', new dijitMenuItem({
                label: 'Set Y axis max quant. tracks',
                id: 'menubar_settrackymax',
                title: 'Set all visible quantitative tracks to a new ymax',
                iconClass: 'jbrowseIconVerticalResize',
                onClick: function() {
                    new SetTrackYMaxDialog({
                        setCallback: function( maxScore ) {
                            var tracks = browser.view.visibleTracks();
                            array.forEach( tracks, function( track ) {
                                // operate only on XYPlot or Density tracks
                                if( ! /\b(XYPlot|Density)/.test( track.config.type ) )
                                    return;

                                track.config.max_score = maxScore;
                                track.browser.publish('/jbrowse/v1/v/tracks/replace', [track.config]);

                            });
                        }
                    }).show();
                }
            }));
        });

    }
});
});
