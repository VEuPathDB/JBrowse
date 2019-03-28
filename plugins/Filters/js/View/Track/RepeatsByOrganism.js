define([
    'dojo/_base/declare',
    'JBrowse/View/Track/CanvasFeatures'
],
function(
    declare,
    CanvasFeatures
) {
    return declare(CanvasFeatures, {
        constructor: function() {
            console.log('RepeatsByOrganism track added');
        },
        _trackMenuOptions: function() {
            var opts = this.inherited(arguments);
            var thisB = this;

            opts.push({
                label: "exclude Entamoeba dispar",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.eDisFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.data['edName'] != 'edisSAW760_genomeFeature_repeatElements_GFF3_RSRC'; 
                        }, 'edisFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('edisFilter');
                    }
                    thisB.config.eDisFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "exclude Entamoeba histolytica",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.eHisFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.data['edName'] != 'ehisHM1IMSS_genomeFeature_repeatElements_GFF3_RSRC';
                        }, 'ehisFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('ehisFilter');
                    }
                    thisB.config.eHisFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "exclude Entamoeba invadens",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.eInvFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.data['edName'] != 'einvIP1_genomeFeature_repeatElements_GFF3_RSRC'; 
                        }, 'einvFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('einvFilter');
                    }
                    thisB.config.eInvFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            return opts;
        }
    });
});
