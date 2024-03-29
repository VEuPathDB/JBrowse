define(['dojo/_base/declare',
        'dojo/_base/array',
        'EbrcTracks/View/GranularRectLayout',
       ],
function (
    declare,
    array,
    Layout
) {
  return declare(null, {
    constructor(args) {
        this.pitchX = args.pitchX || 10
        this.pitchY = args.pitchY || 10

        this.displayMode = args.displayMode

        // reduce the pitchY to try and pack the features tighter
        if (this.displayMode === 'compact') {
            this.pitchY = Math.round(this.pitchY / 4) || 1
            this.pitchX = Math.round(this.pitchX / 4) || 1
        }

        this.subtracks = args.subtracks;

        var thisB = this;

        var top = 0

        // This must match the value set in "CanvasSubtracks"
        var sumHeights = 3;

        this.layouts = array.map(this.subtracks, function(subtrack) {
            top = sumHeights
            subtrack.top = top * thisB.pitchY;

            var subtrackHeight = subtrack.height || 5;
            sumHeights = sumHeights + subtrackHeight;

            return new Layout({ sTop: top, pitchX: thisB.pitchX, pitchY: thisB.pitchY, displayMode: thisB.displayMode, featureFilters: subtrack.featureFilters });
        });
    },

    getLayoutForFeature(feature) {
        var rv;

        array.forEach(this.layouts, function(layout) {
            var keyCount = Object.keys(layout.featureFilters).length;

            var countMatched = 0;
            Object.keys(layout.featureFilters).forEach(function(featureFiltersKey) {

                var featureFilter = layout.featureFilters[featureFiltersKey];

                if(typeof featureFilter == 'function') {
                    if(featureFilter(feature)) {
                        countMatched = countMatched + 1;
                    }
                }

                else {
                    if(feature.get(featureFiltersKey) === layout.featureFilters[featureFiltersKey]) {

                        //                if(feature.get(featureFiltersKey) != layout.featureFilters[featureFiltersKey]) {
                        countMatched = countMatched + 1;
                    }
                }
            });

            // our layout is the one where all the metadata match

            if(countMatched === keyCount) {
                rv = layout;
            }

        });

        return rv;
    },

    addRect(id, left, right, height, feature) {
        var layout = this.getLayoutForFeature(feature);

        if(layout) {
            return layout.addRect(id, left, right, height, feature);
        }
//        console.log("WARN:  Feature not sorted into subtrack... SKIPPING:" + feature.data['name']);
    },

    getTotalHeight() {
        var lastIndex = this.layouts.length - 1;

        var buffer = 8;

        var heights = this.layouts.map(function(layout) {
            return layout.getTotalHeight() == 0 ? layout.sTop * layout.pitchY + buffer : layout.getTotalHeight();
        });

        return Math.max(...heights);
    },
    discardRange(left, right) {
        array.forEach(this.layouts, function(layout) {
            layout.discardRange(left, right);
        });
    },
    getByCoord(x, y) {
        var rv;
        array.forEach(this.layouts, function(layout) {
            var tmp = layout.getByCoord(x, y);
            if(tmp) {
                rv = tmp;
            }
        });

        if(rv) {
            return rv;
        }
    }

  })
})

