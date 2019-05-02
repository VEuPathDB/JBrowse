define(['dojo/_base/declare',
        'dojo/_base/array',
        'EbrcTracks/View/MultiRectLayout',
       ],
function (
    declare,
    array,
    MultiRectLayout
) {
  return declare(MultiRectLayout, {

      constructor: function (args) {
          this.geneGroupAttributeName = args.geneGroupAttributeName;
      },


      addRect(id, left, right, height, feature) {
          var layout = this.getLayoutForFeature(feature);

          var thisB = this;

          if(layout) {
              if(!layout.featureIdMap) {
                  layout.featureIdMap = {};
              }

              if(!layout.geneGroupMap) {
                  layout.geneGroupMap = {};
              }

              var geneGroup = feature.data[thisB.geneGroupAttributeName];
              var featureId = feature.id();

              if(!layout.geneGroupMap[geneGroup]) {
                  layout.geneGroupMap[geneGroup] = [];
              }

              if(!layout.featureIdMap[featureId]) {
                  layout.geneGroupMap[geneGroup].push(featureId);
                  layout.featureIdMap[featureId] = geneGroup;
              }

              return layout.addRect(id, left, right, height, feature);
          }
          console.log("WARN:  Feature not sorted into subtrack... SKIP");
          console.log(feature);
      },
      
  })
})

