define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'JBrowse/Util',
    'dojo/on',
    'dojo/Deferred',
    'EbrcTracks/View/MultiRectLayoutSynteny',
    'EbrcTracks/View/Track/CanvasSubtracks'
],
function (
    declare,
    array,
    lang,
    domConstruct,
    Util,
    on,
    Deferred,
    MultiRectLayoutSynteny,
    CanvasSubtracks
) {
    return declare(CanvasSubtracks, {
        constructor: function () {
            console.log("Synteny Tracks");
        },

        // override getLayout to access addRect method
        _getLayout: function (scale) {
            if( ! this.layout || this._layoutpitchX != 1/scale ) {
                var pitchY = this.getConf('layoutPitchY') || 6;
                this.layout = new MultiRectLayoutSynteny({ pitchX: 1/scale, pitchY: pitchY, maxHeight: this.getConf('maxHeight'), displayMode: this.displayMode, subtracks: this.subtracks, geneGroupAttributeName: "soTerm" });
                this._layoutpitchX = 1/scale;
            }
            return this.layout;
        },


        renderSynteny: function() {
            var multiLayout = this.layout;

            var layoutCount = multiLayout.layouts.length;

            var thisB = this;

            var i = 0;
            blockLoop:
            for (i = 0; i < this.blocks.length; i++) { 
                var block = thisB.blocks[i];
                if(!block || !block.featureCanvas) {
                    continue blockLoop;
                }

                var context = block.featureCanvas.getContext('2d');;
                var j = 0;
                // for each layout
                for (j = 0; j < multiLayout.layouts.length; j++) { 
                    var subLayout = multiLayout.layouts[j];

                    var pitchY=  subLayout.pitchY;

                    // get all rectangles for a layout
                    for(var id in subLayout.rectangles) {
                    
                        var rectangle = subLayout.rectangles[id];
                        var geneGroup = subLayout.featureIdMap[id];

                        var k = 0;

                        // look down one layout at a time.  if found one, render the rectangle pairs
                        syntenyPairsLoop:
                        for (k = j+1; k < multiLayout.layouts.length; k++) {
                            var nextLayout = multiLayout.layouts[k];

                            // this happens when there are no features in a sublayout
                            if(!nextLayout.geneGroupMap) {
                                continue syntenyPairsLoop;
                            }

                            var orthologs = nextLayout.geneGroupMap[geneGroup];

                            if(Array.isArray(orthologs) && orthologs.length) {
                                array.forEach(orthologs, function( orthologId ) {
                                    var orthologRectangle = nextLayout.rectangles[orthologId];
                                    //                                    thisB.renderSynteny(rectangle, orthologRectangle);

                                    var fStartX = block.bpToX(rectangle.data.data.start);
                                    var fEndX = block.bpToX(rectangle.data.data.end);
                                    var fY = (rectangle.top * pitchY) + rectangle.h;


                                    var oStartX = block.bpToX(orthologRectangle.data.data.start);
                                    var oEndX = block.bpToX(orthologRectangle.data.data.end);
                                    var oY = orthologRectangle.top * pitchY;

                                    

                                    context.beginPath();
                                    context.moveTo(fStartX, fY);
                                    context.lineTo(fEndX, fY);
                                    context.lineTo(oEndX, oY);
                                    context.lineTo(oStartX, oY);
                                    context.closePath();
                                    context.stroke();
                                    context.fillStyle = "grey";
                                    context.globalAlpha = 0.1;
                                    context.fill();

                                    context.globalAlpha = 1;
                                });
                                break syntenyPairsLoop;
                            }
                        }
                    }
                }
            }

        },

    showRange: function(first, last, startBase, bpPerBlock, scale,
                        containerStart, containerEnd, finishCallback) {

        var thisB = this;

        if( this.fatalError ) {
            this.showFatalError( this.fatalError );
            return;
        }

        if ( this.blocks === undefined || ! this.blocks.length )
            return;

        // this might make more sense in setViewInfo, but the label element
        // isn't in the DOM tree yet at that point
        if ((this.labelHeight == 0) && this.label)
            this.labelHeight = this.label.offsetHeight;

        this.inShowRange = true;
        this.height = this.labelHeight;

        var firstAttached = (null == this.firstAttached ? last + 1 : this.firstAttached);
        var lastAttached =  (null == this.lastAttached ? first - 1 : this.lastAttached);

        var i, leftBase;
        var maxHeight = 0;
        var blockShowingPromises = [];
        //fill left, including existing blocks (to get their heights)
        for (i = lastAttached; i >= first; i--) {
            leftBase = startBase + (bpPerBlock * (i - first));
            blockShowingPromises.push( new Promise((resolve,reject) => {
                this._showBlock(i, leftBase, leftBase + bpPerBlock, scale,
                    containerStart, containerEnd, resolve);
            }))
        }
        //fill right
        for (i = lastAttached + 1; i <= last; i++) {
            leftBase = startBase + (bpPerBlock * (i - first));
            blockShowingPromises.push( new Promise((resolve,reject) => {
                this._showBlock(i, leftBase, leftBase + bpPerBlock, scale,
                    containerStart, containerEnd, resolve);
            }))
        }
        
        // if we have a finishing callback, call it when we have finished all our _showBlock calls
        if( finishCallback ) {
            Promise.all(blockShowingPromises)
                .then(finishCallback, finishCallback)
        }

        Promise.all(blockShowingPromises)
                .then(function() {
                    thisB.renderSynteny();
                });



        //detach left blocks
        var destBlock = this.blocks[first];
        for (i = firstAttached; i < first; i++) {
            this.transfer(this.blocks[i], destBlock, scale,
                          containerStart, containerEnd);
            this.cleanupBlock(this.blocks[i]);
            this._hideBlock(i);
        }
        //detach right blocks
        destBlock = this.blocks[last];
        for (i = lastAttached; i > last; i--) {
            this.transfer(this.blocks[i], destBlock, scale,
                          containerStart, containerEnd);
            this.cleanupBlock(this.blocks[i]);
            this._hideBlock(i);
        }

        this.firstAttached = first;
        this.lastAttached = last;
        this._adjustBlanks();
        this.inShowRange = false;

        this.heightUpdate(this.height);
        this.updateStaticElements( this.genomeView.getPosition() );
    },




    });
});
