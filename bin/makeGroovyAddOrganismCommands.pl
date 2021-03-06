#!/usr/bin/perl

use strict;

use JSON;
use Data::Dumper;
use CBIL::Util::Utils;


my $filename = "organismList.json";
my $file_content = do{local(@ARGV,$/)=$filename;<>};

my $organisms = decode_json $file_content;
print "Extracting current organisms in Apollo\n";
my $cmd = "curl -X POST -F 'username=api\@local.host' -F  -L https://apollo-api\.veupathdb\.org/organism/findAllOrganisms | jq  '\.[]\.commonName'";
my @currentOrganisms = split /"/, runCmd($cmd);
chomp @currentOrganisms;

foreach (@{$organisms->{organisms}}) {
    my $fullName = $_->{NAME};
    my $organismAbbrev = $_->{ORGANISM_ABBREV};
    my $annotationVersion = $_->{ANNOTATION_VERSION};

my $checkOrganism = $fullName." \[".$annotationVersion."\]";

if ( grep( /\Q$checkOrganism/, @currentOrganisms)){
	next;
}
elsif( grep( /\Q$fullName/, @currentOrganisms) ){

	my ($oldCommonName) = grep {/$fullName/} @currentOrganisms ;
        my $commonName = "$fullName \[$annotationVersion\]";
	my $getIdCmd = "arrow organisms get_organisms --common_name \"".$oldCommonName."\" \| jq -r '\.\[\]\.id, \.\[\]\.directory'";
	my @results = `$getIdCmd`;
	chomp @results;
	my $organismId = $results[0];
 	my $directory = $results[1];
	print "arrow organisms update_organism ".$organismId." \"".$commonName."\" \"".$directory."\" \n";
#	print "groovy add_organism.groovy -name '$fullName \[$annotationVersion\]' -url https://apollo.apidb.org/ -directory /data/apollo_data/${organismAbbrev} -username 'admin\@local.host' -password  \$APOLLO_ADMIN_PASSWORD\n";
}
else {
	print "groovy add_organism.groovy -name '$fullName \[$annotationVersion\]' -url https://apollo.apidb.org/ -directory /data/apollo_data/${organismAbbrev} -username 'admin\@local.host' -password  \$APOLLO_ADMIN_PASSWORD\n";
}

}

