define([
       'dojo/_base/declare',
       'dojo/_base/array',
       'dijit/MenuItem',
       'dijit/registry',
       'EbrcTracks/View/Dialog/SetTrackYMax',
       'EbrcTracks/View/Dialog/SetTrackLogScale',
       'JBrowse/Plugin'
       ],
       function(
           declare,
           array,
           dijitMenuItem,
           dijitRegistry,
           SetTrackYMaxDialog,
           SetTrackLogScaleDialog,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "EbrcTracks plugin starting" );

        // hide smrna filter btn
        browser.afterMilestone('completely initialized', function () {
            var smrnabutton = dijitRegistry.byId('smrna-filter-btn');
            var smrnabuttonNode = smrnabutton.domNode;
            smrnabuttonNode.parentNode.removeChild(smrnabuttonNode);
          });

        browser.afterMilestone('initView', function() {
            // add a global menu item for resizing all visible quantitative tracks
            browser.addGlobalMenuItem( 'view', new dijitMenuItem({
                label: 'Set Y-axis max (linear) for quant. tracks',
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


            // add a global menu item for resizing all visible quantitative tracks
            browser.addGlobalMenuItem( 'view', new dijitMenuItem({
                label: 'Set Log Scale for quant. tracks',
                id: 'menubar_settracklogscale',
                title: 'Set log scale for all visible quantitative tracks',
                iconClass: 'dijitIconConfigure',
                onClick: function() {
                    new SetTrackLogScaleDialog({


                        setCallback: function( checked ) {
                            var tracks = browser.view.visibleTracks();
                            array.forEach( tracks, function( track ) {
                                // operate only on XYPlot or Density tracks
                                if( ! /\b(XYPlot|Density)/.test( track.config.type ) )
                                    return;

                                if(track.config.logScaleOption) {
                                    if(checked) {
                                        track.config.scale = 'log';
                                    }
                                    else {
                                        track.config.scale = 'linear';
                                    }
                                }

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
