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

  my $organismsFile = "$directory/organismList.json";

  open(ORGS, ">$organismsFile") or die "Cannot open file $organismsFile for writing: $!";
  print ORGS encode_json $organisms;
  close ORGS;

  foreach my $organism (@{$organisms->{organisms}}) {
    my $organismAbbrev = $organism->{ORGANISM_ABBREV};

#    next unless $organismAbbrev eq 'agamPEST';
    print STDERR "Preparing Configuration for Organism $organismAbbrev\n";
    my $mainUrl = "$site/a/service/jbrowse/tracks/${organismAbbrev}/trackList.json";
    my $main = &getData($mainUrl);

    # include the functions.conf
    push @{$main->{include}}, "/a/jbrowse/functions.conf";

    # todo: only include this for annotated genomes
    push @{$main->{include}}, "/a/jbrowse/apollo_gene_tracks.conf";

    my $organismDir = "$directory/$organismAbbrev";
    my $seqDir = "$directory/$organismAbbrev/seq";

    mkdir $organismDir;
    mkdir $seqDir;

    my $refSeqsUrl = &redirect($site, $main->{refSeqs}, $organismAbbrev);
    my $refSeqsJson = get($refSeqsUrl);
    my $refSeqsFile = "$seqDir/refSeqs.json";

    open(REFSEQ, ">$refSeqsFile") or die "Cannot open file $refSeqsFile for writing: $!";
    print REFSEQ $refSeqsJson . "\n";
    close REFSEQ;

    my $fastaFile = "$workflowDir/data/$organismAbbrev/makeAndMaskTopLevelGenome/topLevelGenomicSeqs.fasta";
    unless(-e $fastaFile) {
      die "file does not exist: $fastaFile";
    }

    my $fa = "$organismAbbrev.fa";
    my $fai = "$organismAbbrev.fa.fai";
    my $refSeqFasta = "$organismDir/seq/$fa";

    cp($fastaFile, $refSeqFasta);

    system("samtools faidx $refSeqFasta") == 0
        or die "samtools command failed: $?";

    $main->{refSeqs} = "seq/$fai";

    $main->{tracks} = [
      {"category" => "Sequence Analysis",  
       "faiUrlTemplate" => "seq/$fai",
       "key" => "Reference sequence",
       "label" => "DNA",
       "seqType" => "dna",
       "storeClass" => "JBrowse/Store/SeqFeature/IndexedFasta",
       "type" => "SequenceTrack",
       "urlTemplate" => "seq/$fa",
       "useAsRefSeqStore" => JSON::true
      }
        ];

    $main->{names}->{url} = &redirect($site, $main->{names}->{url}, $organismAbbrev);

    # weed out user datasets
    @{$main->{include}} = grep {!/user-datasets-jbrowse/} @{$main->{include}};

    for(my $i = 0; $i < @{$main->{include}}; $i++) {
      my $includeUrl = $main->{include}->[$i];

      $includeUrl = &redirect($site, $includeUrl, $organismAbbrev);

      if($includeUrl =~ /rnaseqJunctions/) {
        $includeUrl = $includeUrl .  "?isApollo=1";
      }

      my $tracksJson = get($includeUrl);
      die "Couldn't get $includeUrl" unless defined $tracksJson;
      $tracksJson =~ s/\/a\//$site\/a\//g;

      my ($fileName) = $includeUrl =~ /jbrowse\/(.+)\/$organismAbbrev/; 
      $fileName = "$fileName.json";
      if($includeUrl =~ /tracks.conf/) {

        # this bit removes the dataset_id
        #$tracksJson =~ s/\[general\]\s*dataset_id=$organismAbbrev//i;

        # This bit removes the refseq track;  I'm making the assumption that there is no # char in the refseq track
        $tracksJson =~ s/\[tracks.refseq\][^#\[]*//;

        $fileName = "tracks.conf";
      }

      if($includeUrl =~ /functions.conf/) {
        $fileName = "functions.conf";
      }

      if($includeUrl =~ /apollo_gene_tracks.conf/) {
        $fileName = "apollo_gene_tracks.conf";
      }

      
      $main->{include}->[$i] = $fileName;
      open(I, ">$organismDir/$fileName") or die "Cannot open file $organismDir/$fileName for writing: $!";

      print I $tracksJson;
      close I;
    }

    open(M, ">$organismDir/trackList.json") or die "Cannot open file $organismDir/trackList.json for writing: $!";
    print M encode_json $main;
  }
}



sub redirect {
  my ($site, $url, $organismAbbrev) = @_;
  $url =~ s/^\/a/$site\/a/;

  # $url =~ s/\/\/tracks.conf$/\/$organismAbbrev\/tracks.conf/;

  # unless($url =~ /\/tracks.conf$/ || $url =~ /\/$organismAbbrev$/) {
  #   $url = $url . $organismAbbrev;
  # }

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
