define([
           'dojo/_base/declare',
           'dojo/dom-construct',
           'dijit/focus',
           'dijit/form/NumberSpinner',
           'JBrowse/View/Dialog/WithActionBar',
           'dojo/on',
           'dijit/form/Button',
           'JBrowse/Model/Location'
       ],
       function( declare, dom, focus, NumberSpinner, ActionBarDialog, on, Button, Location ) {


return declare( ActionBarDialog, {
    /**
     * Dijit Dialog subclass that pops up prompt for the user to
     * manually set a new track y-max.
     * @lends JBrowse.View.InfoDialog
     */
    title: 'Set new max score for y-axis max score',

    constructor: function( args ) {
        this.maxScore = args.max_score || 1000;
        this.setCallback    = args.setCallback || function() {};
        this.cancelCallback = args.cancelCallback || function() {};
        this.maxScoreConstraints = { min: 10, max: args.maxMaxScore||10000 };
        this.msg = args.msg
    },

    _fillActionBar: function( actionBar ) {
        var ok_button = new Button({
            label: "OK",
            onClick: dojo.hitch(this, function() {
                var maxScore = parseInt(this.maxScoreSpinner.getValue());
                if (isNaN(maxScore) || maxScore < this.maxScoreConstraints.min
                    || maxScore > this.maxScoreConstraints.max) return;
                this.setCallback && this.setCallback( maxScore );
                this.hide();
            })
        }).placeAt(actionBar);

        var cancel_button = new Button({
            label: "Cancel",
            onClick: dojo.hitch(this, function() {
                this.cancelCallback && this.cancelCallback();
                this.hide();
            })
        }).placeAt(actionBar);
    },

    show: function( callback ) {
        dojo.addClass( this.domNode, 'setTrackMaxScoreDialog' );

        this.maxScoreSpinner = new NumberSpinner({
            value: this.maxScore,
            smallDelta: 100,
            constraints: this.maxScoreConstraints
        });

        this.set('content', [
                     dom.create('label', { "for": 'newhighlight_locstring', innerHTML: '' } ),
                     this.maxScoreSpinner.domNode,
                     dom.create( 'span', { innerHTML: this.msg||' pixels' } )
                 ] );

        this.inherited( arguments );
    },

    hide: function() {
        this.inherited(arguments);
        window.setTimeout( dojo.hitch( this, 'destroyRecursive' ), 500 );
    }
});
});
