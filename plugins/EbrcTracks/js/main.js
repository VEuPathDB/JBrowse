define([
       'dojo/_base/declare',
       'dojo/_base/lang',
       'dojo/_base/array',
       'dijit/MenuItem',
       'dijit/registry',
       'EbrcTracks/View/Dialog/SetTrackYMax',
       'EbrcTracks/View/Dialog/SetTrackLogScale',
       'EbrcTracks/View/Dialog/DownloadHelp',
       'EbrcTracks/View/Dialog/PbrowseLegend',
       'JBrowse/Plugin'
       ],
       function(
           declare,
           lang,
           array,
           dijitMenuItem,
           dijitRegistry,
           SetTrackYMaxDialog,
           SetTrackLogScaleDialog,
           DownloadHelp,
           PbrowseLegend,
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

            // Patch to disable L/R Two finger scroll;
            browser.view.wheelScroll = function( event ) {
                if ( !event )
                    event = window.event;

                // if( window.WheelEvent )
                //     event = window.WheelEvent;

                var delta = { x: 0, y: 0 };
                if( 'wheelDeltaX' in event ) {
                    delta.x = event.wheelDeltaX/2;
                    delta.y = event.wheelDeltaY/2;
                }
                else if( 'deltaX' in event ) {
                    var multiplier = navigator.userAgent.indexOf("OS X 10.9")!==-1 ? -5 : -40;
                    delta.x = Math.abs(event.deltaY) > Math.abs(2*event.deltaX) ? 0 : event.deltaX*multiplier;
                    delta.y = event.deltaY*-10;
                }
                else if( event.wheelDelta ) {
                    delta.y = event.wheelDelta/2;
                    if( window.opera )
                        delta.y = -delta.y;
                }
                else if( event.detail ) {
                    delta.y = -event.detail*100;
                }

                delta.x = Math.round( delta.x * 2 );
                delta.y = Math.round( delta.y );

                var didScroll = false

                // PATCH to disallow L/R trackpad scrolling
                //if( delta.x ) {
                //this.keySlideX( -delta.x );
                //didScroll = true
                //}

                if( delta.y ) {
                    // 60 pixels per mouse wheel event
                    var prevY = this.getY()
                    var currY = this.setY( prevY - delta.y );
                    // check if clamping happened
                    if(currY !== prevY) {
                        didScroll = true
                    }
                }

                //the timeout is so that we don't have to run showVisibleBlocks
                //for every scroll wheel click (we just wait until so many ms
                //after the last one).
                if ( this.wheelScrollTimeout )
                    window.clearTimeout( this.wheelScrollTimeout );

                // 100 milliseconds since the last scroll event is an arbitrary
                // cutoff for deciding when the user is done scrolling
                // (set by a bit of experimentation)
                this.wheelScrollTimeout = window.setTimeout( dojo.hitch( this, function() {
                    this.showVisibleBlocks(true);
                    this.wheelScrollTimeout = null;
                }, 100));

                // allow event to bubble out of iframe for example
                if(didScroll || this.browser.config.alwaysStopScrollBubble) dojo.stopEvent(event);
            };



            browser.addGlobalMenuItem( 'help',
                                       new dijitMenuItem(
                                        {
                                            id: 'menubar_downloadhelp',
                                            label: 'Download',
                                            iconClass: 'jbrowseIconHelp',
                                            onClick: function() {
                                                new DownloadHelp( lang.mixin(browser.config.quickHelp || {}, { browser: browser } )).show()
                                                }
                                        })
                                     );

            browser.addGlobalMenuItem( 'help',
                                       new dijitMenuItem(
                                        {
                                            id: 'menubar_pbrowselegend',
                                            label: 'Pbrowse key',
                                            iconClass: 'jbrowseIconHelp',
                                            onClick: function() {
                                                new PbrowseLegend( lang.mixin(browser.config.quickHelp || {}, { browser: browser } )).show()
                                                }
                                        })
                                     );


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
