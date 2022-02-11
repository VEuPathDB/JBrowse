define( [
            'dojo/_base/declare',
            'JBrowse/View/InfoDialog'
        ],
        function(
            declare,
            InfoDialog
        ) {
return declare( InfoDialog, {

    title: "Pbrowse color key",

    constructor: function(args) {
        this.browser = args.browser;
        this.defaultContent = this._makeDefaultContent();

        if( ! args.content && ! args.href ) {
            // make a div containing our help text
            this.content = this.defaultContent;
        }
    },

    _makeDefaultContent: function() {
        return    ''
                + '<div class="pbrowse_color_key">'
                + '<div class="main" style="float: left; width: 66%;">'

                + '<dl>'
                + '<dt>Amino acid color key</dt>'
                + '<dd><ul>'
                + '    <li>Colors are based on three properties:  <img src="'+this.browser.resolveUrl('plugins/EbrcTracks/img/pbrowse_legend.png')+'"></li>'
                + '</ul></dd>'
                + '</dl>'
                + '</div>'
                + '</div>'
            ;
    }
});
});
