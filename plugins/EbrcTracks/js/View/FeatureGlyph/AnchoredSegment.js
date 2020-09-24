define(['dojo/_base/declare',
           'dojo/_base/lang',
           'JBrowse/View/FeatureGlyph/Box'],
       function(declare,
           lang,
           Box) {

return declare(Box, {

    renderBox: function( context, viewInfo, feature, top, overallHeight, parentFeature, style ) {
        var left  = viewInfo.block.bpToX( feature.get('start') );
        var right  = viewInfo.block.bpToX( feature.get('end') );
        var width = viewInfo.block.bpToX( feature.get('end') ) - left;

        style = style || lang.hitch( this, 'getStyle' );

        var height = this._getFeatureHeight( viewInfo, feature );

	if( ! height )
            return;
        if( height != overallHeight )
            top += Math.round( (overallHeight - height)/2 );

        var bgcolor = style( feature, 'color' );
        var postHeight = style( feature, 'postHeight' );
        var lineThickness = style( feature, 'lineThickness' );

        if( viewInfo.displayMode == 'compact' ) {
            lineThickness = Math.round( 0.45 * lineThickness );
            postHeight = Math.round( 0.45 * postHeight );
        }

        var midRectYStart = top + (height / 2) - (lineThickness / 2);
        var heightOffset = top + ((height - postHeight) / 2);

        if( bgcolor ) {
            context.fillStyle = bgcolor;
            context.fillRect(left, midRectYStart, width, lineThickness);

            context.fillRect(left, heightOffset,lineThickness, postHeight);
            context.fillRect(right - lineThickness, heightOffset, lineThickness, postHeight);
        }
        else {
            context.clearRect( left, top, Math.max(1,width), height );
        }


        }
    });

});

