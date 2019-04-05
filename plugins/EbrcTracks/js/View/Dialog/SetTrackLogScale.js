define([
           'dojo/_base/declare',
           'dojo/dom-construct',
           'dijit/focus',
           'dijit/form/CheckBox',
           'JBrowse/View/Dialog/WithActionBar',
           'dojo/on',
           'dijit/form/Button',
           'JBrowse/Model/Location'
       ],
       function( declare, dom, focus, CheckBox, ActionBarDialog, on, Button, Location ) {


return declare( ActionBarDialog, {
    /**
     * Dijit Dialog subclass that pops up prompt for the user to
     * manually set a new track log scale (log or linear)
     * @lends JBrowse.View.InfoDialog
     */
    title: 'Set log scale',

    constructor: function( args ) {
        this.scale = args.scale || "linear";
        this.setCallback    = args.setCallback || function() {};
        this.cancelCallback = args.cancelCallback || function() {};
        this.msg = args.msg
    },

    _fillActionBar: function( actionBar ) {
        var ok_button = new Button({
            label: "OK",
            onClick: dojo.hitch(this, function() {
                var checked = this.checkBox.checked;

                this.setCallback && this.setCallback( checked );
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
        dojo.addClass( this.domNode, 'setTrackLogScaleDialog' );

        this.checkBox = new CheckBox({
            name: "checkBox",
            value: "agreed",
            checked: false,
        });

        console.log(this.checkBox);

        this.set('content', [
                     dom.create( 'span', { innerHTML: this.msg||'Log scale: ' } ),
                     this.checkBox.domNode
                 ] );

        this.inherited( arguments );
    },

    hide: function() {
        this.inherited(arguments);
        window.setTimeout( dojo.hitch( this, 'destroyRecursive' ), 500 );
    }
});
});
