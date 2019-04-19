define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/on',
    'JBrowse/View/Track/CanvasFeatures',
    'EbrcTracks/View/MultiRectLayout',
    'JBrowse/View/Track/BlockBased',
    'JBrowse/Util',
    'dojo/Deferred',
    'dijit/Tooltip'
],
function (
    declare,
    array,
    lang,
    on,
    CanvasFeatures,
    MultiRectLayout,
    BlockBased,
    Util,
    Deferred,
    Tooltip
) {
    return declare(CanvasFeatures, {
        constructor: function () {

            var subtracks = [];
            array.forEach(this.getConf('subtracks'), function(subtrack) {
                if(subtrack.visible) {
                    subtracks.push(subtrack);
                }
            });

            this.subtracks = subtracks;
        },

        _defaultConfig: function () {
            var ret = Util.deepUpdate(lang.clone(this.inherited(arguments)), {
                glyph: 'JBrowse/View/FeatureGlyph/Box',
                showLabels: true,
                showTooltips: true,
            });
            return ret;
        },

        // override getLayout to access addRect method
        _getLayout: function (scale) {
            if( ! this.layout || this._layoutpitchX != 1/scale ) {
                var pitchY = this.getConf('layoutPitchY') || 6;
                this.layout = new MultiRectLayout({ pitchX: 1/scale, pitchY: pitchY, maxHeight: this.getConf('maxHeight'), displayMode: this.displayMode, subtracks: this.subtracks });
                this._layoutpitchX = 1/scale;
            }
            return this.layout;
        },

        // draw the features on the canvas
        renderFeatures: function( args, fRects ) {

            var multiLayout = this.layout;
            var prevPtotalHeight = 0;

            thisB = this;
            // loop over sublayouts to get the height and update the top for each
            // Do this once, not per region
            var i = 0;
            array.forEach(multiLayout.layouts, function( layout ) {
                if(!layout.hasAdjustedTop) {
                    layout.sTop = prevPtotalHeight;
                    thisB.subtracks[i].top = prevPtotalHeight * layout.pitchY;

                    var pTot = layout.pTotalHeight;

                    prevPtotalHeight = pTot + prevPtotalHeight + multiLayout.pitchY;

                    layout.rectangles = {};
                    layout.bitmap = [];
                    layout.pTotalHeight = 0;

                    i++;
                }

                layout.hasAdjustedTop = true;
            });

            var context = this.getRenderingContext( args );
            if( context ) {
                var thisB = this;
                array.forEach( fRects, function( fRect ) {
                    if( fRect )
                        var layout = multiLayout.getLayoutForFeature(fRect.f);
                        if(layout) {
                            var scale = fRect.viewInfo.scale;
                            var leftBase = fRect.viewInfo.leftBase;
                            var startbp = fRect.l/scale + leftBase;
                            var endbp   = (fRect.l+fRect.w)/scale + leftBase;

                            var top = layout.addRect(
                                fRect.f.id(),
                                startbp,
                                endbp,
                                fRect.h,
                                fRect.f
                            );

                            fRect.t = top;
                            thisB.renderFeature( context, fRect );
                        }
                });
            }
        },

        makeTrackLabel: function () {
            var thisB = this;
            var c = this.config;
            this.inherited(arguments);

            if (this.config.showLabels || this.config.showTooltips) {

                this.sublabels = array.map(this.subtracks, function (elt) {

                    var htmlnode = dojo.create('div', {
                        className: 'track-sublabel',
                        id: thisB.config.label + '_' + elt.label,
                        style: {
                            position: 'absolute',
                            height: '15px',
                            font: thisB.config.labelFont,
                            backgroundColor: '#DCDCDC',
                            opacity: 0.6,
                            visibility: 'hidden'
                        },
                        innerHTML: elt.label
                    }, thisB.div);

                    on(htmlnode, c.clickTooltips ? 'click' : 'mouseover', function () {
                        Tooltip.show(elt.label + '<br />', htmlnode);
                    });
                    on(htmlnode, 'mouseleave', function () {
                        Tooltip.hide(htmlnode);
                    });

                    return htmlnode;
                });
            }
        },


        updateStaticElements: function (/** Object*/ coords) {
            this.inherited(arguments);
            thisB = this;

            if (this.sublabels && 'x' in coords) {
                array.forEach(this.sublabels, function (sublabel, i) {
                    sublabel.style.left = coords.x + 'px';
                    sublabel.style.top = thisB.subtracks[i].top  + 'px';
                    if(thisB.displayMode == 'normal') { 
                        sublabel.style.visibility = 'visible';
                    } 
                    else {
                        sublabel.style.visibility = 'hidden';
                    }

                }, this);
            }
        }


    });
});
