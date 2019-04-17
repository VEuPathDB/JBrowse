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
            this.labels = {};
            this.labelsCompleted = new Deferred();
            var thisB = this;
            if (this.config.sublabels) {
                this.config.sublabels.forEach(function (elt) {
                    this.labels[elt.name] = elt;
                }, this);
                this.labelsCompleted.resolve('success');
            } else {
                this.labelsCompleted.resolve('success');
            }
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
                this.layout = new MultiRectLayout({ pitchX: 1/scale, pitchY: pitchY, maxHeight: this.getConf('maxHeight'), displayMode: this.displayMode, subtracks: this.getConf('subtracks') });
                this._layoutpitchX = 1/scale;
            }
            return this.layout;
        },

        // draw the features on the canvas
        renderFeatures: function( args, fRects ) {

            var multiLayout = this.layout;
            var prevPtotalHeight = 0;

            // loop over sublayouts to get the height and update the top for each
            // Do this once, not per region
            array.forEach(multiLayout.layouts, function( layout ) {
                if(!layout.hasAdjustedTop) {
                    layout.sTop = prevPtotalHeight;

                    var pTot = layout.pTotalHeight;

                    prevPtotalHeight = pTot + prevPtotalHeight + multiLayout.pitchY;

                    layout.rectangles = {};
                    layout.bitmap = [];
                    layout.pTotalHeight = 0;
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


    });
});
