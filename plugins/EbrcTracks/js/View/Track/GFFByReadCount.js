define([
    'dojo/_base/declare',
    'NeatCanvasFeatures/View/Track/NeatFeatures'
],
function(
    declare,
    NeatFeatures
) {
    return declare(NeatFeatures, {
        constructor: function() {
            console.log('GFFByReadCount track added');
            var thisB = this;
            thisB.setFeatureFilter(function(feat) {
                return feat.get('totalCount') >=5;
            }, 'readFilter');
        }
    });
});

