define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'JBrowse/View/Track/HTMLFeatures'
],
function(
    declare,
    lang,
    HTMLFeatures
) {
    return declare(HTMLFeatures, {
        extendedInit: function() {
            this.glyphHeightPad = -10;
        },
        _trackMenuOptions: function() {
            var opts = this.inherited(arguments);
            var thisB = this;
            opts.push({
                label: "Only Introns which Match Transcript Annotation",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.filterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('annotatedintron') == 'Yes'; 
                        }, 'annotatedFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('annotatedFilter');
                    }
                    thisB.config.filterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "Only Novel Introns",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.novelFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('annotatedintron') == 'No'; 
                        }, 'novelFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('novelFilter');
                    }
                    thisB.config.novelFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });


            return opts;
        }
    });
});
