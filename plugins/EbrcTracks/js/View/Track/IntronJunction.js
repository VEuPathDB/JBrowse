define([
    'dojo/_base/declare',
    'JBrowse/View/Track/HTMLFeatures'
],
function(
    declare,
    HTMLFeatures
) {
    return declare(HTMLFeatures, {
        constructor: function() {
            console.log('FilterFeature track added');
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
                            return feat.data['AnnotatedIntron'] == 'Yes'; 
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
                            return feat.data['AnnotatedIntron'] == 'No'; 
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
