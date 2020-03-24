#!/usr/bin/perl

use strict;

use JSON;

use LWP::Simple;

use File::Copy "cp";

use Getopt::Long;
use Data::Dumper;

my ($help, $directory, @sites, $workflowDir);


# /eupath/data/EuPathDB/workflows/VectorBase/47/data/agamPEST/makeAndMaskTopLevelGenome/topLevelGenomicSeqs.fasta

&GetOptions('help|h' => \$help,
            'workflow_dir=s' => \$workflowDir,
            'output_dir=s' => \$directory,
            'website=s' => \@sites,
    );

if($help) {
  &usage();
  exit;
}

foreach my $site (@sites) {
  my $orgUrl = "$site/a/service/jbrowse/organismList";

  my $organisms = &getData($orgUrl);

  foreach my $organism (@{$organisms->{organisms}}) {
    my $organismAbbrev = $organism->{ORGANISM_ABBREV};

#    next unless $organismAbbrev eq 'agamPEST';

    my $mainUrl = "$site/a/service/jbrowse/tracks/pfal3D7/trackList.json";
    my $main = &getData($mainUrl);

    my $organismDir = "$directory/$organismAbbrev";
    mkdir $organismDir;

    my $fastaFile = "$workflowDir/data/$organismAbbrev/makeAndMaskTopLevelGenome/topLevelGenomicSeqs.fasta";
    unless(-e $fastaFile) {
      die "file does not exist: $fastaFile";
    }

    my $fa = "$organismAbbrev.fa";
    my $fai = "$organismAbbrev.fa.fai";
    my $refSeqFasta = "$organismDir/$fa";

    cp($fastaFile, $refSeqFasta);

    system("samtools faidx $refSeqFasta") == 0
        or die "samtools command failed: $?";

    $main->{refSeqs} = $fai;

    $main->{tracks} = [
      {"label" => "refseqs",
       "key" => "Reference sequence",
       "storeClass" => "JBrowse/Store/SeqFeature/IndexedFasta",
       "urlTemplate" => $fa,
       "useAsRefSeqStore" => JSON::true,
       "type" => "Sequence"
      }
        ];

    $main->{names}->{url} = &redirect($site, $main->{names}->{url}, $organismAbbrev);

    # weed out user datasets
    @{$main->{include}} = grep {!/user-datasets-jbrowse/} @{$main->{include}};

    for(my $i = 0; $i < @{$main->{include}}; $i++) {
      my $includeUrl = $main->{include}->[$i];

      $includeUrl = &redirect($site, $includeUrl, $organismAbbrev);

      my $tracksJson = get($includeUrl);
      die "Couldn't get $includeUrl" unless defined $tracksJson;
      $tracksJson =~ s/\/a\//$site\/a\//g;

      my ($fileName) = $includeUrl =~ /jbrowse\/(.+)\/$organismAbbrev$/; 
      $fileName = "$fileName.json";
      if($includeUrl =~ /tracks.conf/) {

        # this bit removes the dataset_id
        $tracksJson =~ s/\[general\]\s*dataset_id=$organismAbbrev//i;

        # This bit removes the refseq track;  I'm making the assumption that there is no # char in the refseq track
        $tracksJson =~ s/\[tracks.refseq\][^#\[]*//;

        $fileName = "tracks.conf";
      }
      
      $main->{include}->[$i] = $fileName;
      open(I, ">$organismDir/$fileName") or die "Cannot open file $organismDir/$fileName for writing: $!";

      print I $tracksJson;
      close I;
    }

    open(M, ">$organismDir/trackList.json") or die "Cannot open file $organismDir/trackList.json for writing: $!";
    print M encode_json $main;
    exit;
  }
}



sub redirect {
  my ($site, $url, $organismAbbrev) = @_;
  $url =~ s/^\/a/$site\/a/;
  $url =~ s/\/\/tracks.conf$/\/$organismAbbrev\/tracks.conf/;

  unless($url =~ /\/tracks.conf$/ || $url =~ /\/$organismAbbrev$/) {
    $url = $url . $organismAbbrev;
  }

  return $url;
}


sub getData {
  my ($url) = @_;

  my $json = get $url;
  die "Couldn't get $url" unless defined $json;
  return decode_json ($json);
}


sub usage {
  print STDERR "dumpConfigurationsForApollo.pl --workflow_dir=<DIR> --output_dir=<DIR>  --website=\@s\n";
}
