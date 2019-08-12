define([
           'dojo/_base/declare',
           'JBrowse/Plugin'
       ],
       function(
           declare,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "EbrcTheme plugin starting" );

        browser.afterMilestone('initView', function() {
            dojo.create("div", { className: "eupathlogo", innerHTML: "<a href='/'><img class='eupathlogoimage' src='/a/images/-PROJECT-/title_s.png'></a>" }, browser.menuBar);

                var smallMenuList = dojo.create('ul', {
                    className: 'eupathdb-SmallMenu',
                }, browser.menuBar );


                var contactUs = dojo.create('li', {
                    className: 'eupathdb-SmallMenuItem',
                    innerHTML: "<a target='_blank' href='/a/app/contact-us'>Contact Us</a>",
                    title: 'Contact Us',
                }, smallMenuList );

                var register = dojo.create('li', {
                    className: 'eupathdb-SmallMenuItem',
                    innerHTML: "<a href='/a/app/user/registration'>Register</a>",
                    title: 'Register',
                }, smallMenuList );


                var login = dojo.create('li', {
                    className: 'eupathdb-SmallMenuItem',
                    innerHTML: "<a href=/a/app/user/login?destination='" + window.location.href + "'>Login</a>",
                    title: 'Login',
                }, smallMenuList );




        });
}});

});
