define( [
            'dojo/_base/declare',
            'JBrowse/View/InfoDialog'
        ],
        function(
            declare,
            InfoDialog
        ) {
return declare( InfoDialog, {

    title: "Download Track Data",

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
                + '<div class="jbrowse help_dialog">'
                + '<div class="main" style="float: left; width: 49%;">'

                + '<dl>'
                + '<dt>Open Menu Options for a Track</dt>'
                + '<dd><ul>'
                + '    <li>Click on the down arrow next to the track title.  <img src="'+this.browser.resolveUrl('plugins/EbrcTracks/img/download_help_track_title.png')+'"></li>'
                + '</ul></dd>'

                + '<dt>Select "Save Track Data" Option</dt>'
                + '<dd><ul>'
                + '    <li>Click on the option to save track data.  <img src="'+this.browser.resolveUrl('plugins/EbrcTracks/img/download_help_dialog.png')+'"></li>'
                + '</ul></dd>'

                + '</dl>'
                + '</div>'

                + '<div class="main" style="float: right; width: 49%;">'
                + '<dl>'
                + '<dt>Choose Options</dt>'
                + '<dd><ul>'
                + '    <li>File formats are track dependent.  For example, GFF data is availalbe for Transcript tracks and Fasta is avaliable for Refrence Sequence</li>'
                + '    <li>Choose which region you are interested in downloading and choose a filename.  <img src="'+this.browser.resolveUrl('plugins/EbrcTracks/img/download_help_options.png')+'"></li>'
                + '    </ul>'
                + '</dd>'
                + '<dt>Save or View</dt>'
                + '<dd><ul>'
                + '    <li>Choose to either View in the Browser or Save as a file.</li>'
                + '    </ul>'
                + '</dd>'

                + '</dd>'
                + '</dl>'
                + '</div>'
                + '</div>'
            ;
    }
});
});
