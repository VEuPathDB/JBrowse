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
            console.log('SNPGenotyping track added');
        },
        _trackMenuOptions: function() {
            var opts = this.inherited(arguments);
            var thisB = this;

            opts.push({
                label: "exclude Broad 75K Genotyping Chip",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.broad75FilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('snpchiptype') != 'Broad75KGenotyping'; 
                        }, 'broad75Filter');
                    }
                    else {
                        thisB.removeFeatureFilter('broad75Filter');
                    }
                    thisB.config.broad75FilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "exclude Broad 3K Genotyping Chip",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.broad3FilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('snpchiptype') != 'Broad3KGenotyping';
                        }, 'broad3Filter');
                    }
                    else {
                        thisB.removeFeatureFilter('broad3Filter');
                    }
                    thisB.config.broad3FilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "exclude Broad Isolate Barcode",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.broadIsolateFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('snpchiptype') != 'BroadIsolateBarcode'; 
                        }, 'broadIsolateFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('broadIsolateFilter');
                    }
                    thisB.config.broadIsolateFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            opts.push({
                label: "exclude NIH 10K",
                type: "dijit/CheckedMenuItem",
                checked: !!this.config.nihFilterEnabled,
                onClick: function() {
                    if(this.checked) {
                        thisB.addFeatureFilter(function(feat) {
                            return feat.get('snpchiptype') != 'SNP_Chip_Artesunate_Resistance'; 
                        }, 'nihFilter');
                    }
                    else {
                        thisB.removeFeatureFilter('nihFilter');
                    }
                    thisB.config.nihFilterEnabled = this.checked;
                    thisB.redraw();
                }
            });

            return opts;
        }
    });
});
