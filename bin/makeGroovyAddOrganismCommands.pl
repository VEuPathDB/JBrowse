#!/usr/bin/perl

use strict;

use JSON;
use Data::Dumper;

my $filename = "organismList.json";
my $file_content = do{local(@ARGV,$/)=$filename;<>};


my $organisms = decode_json $file_content;

foreach (@{$organisms->{organisms}}) {
    my $fullName = $_->{NAME};
    my $organismAbbrev = $_->{ORGANISM_ABBREV};
    my $annotationVersion = $_->{ANNOTATION_VERSION};

    print "groovy add_organism.groovy -name '$fullName [$annotationVersion]' -url https://apollo.apidb.org/ -directory /data/apollo_data/${organismAbbrev} -username 'admin@local.host' -password  \$APOLLO_ADMIN_PASSWORD\n";
}

