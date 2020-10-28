#!/usr/bin/perl

use strict;

use JSON;

use LWP::Simple;
use File::Copy;
#use File::Copy "cp";
#use CBIL::Util::Utils;
use Getopt::Long;
use Data::Dumper;
use URI::Escape;

my ($help, $directory, @websites, $workflowDir, $subdomain, $stripSubdomain);

&GetOptions('help|h' => \$help,
            'workflow_dir=s' => \$workflowDir,
            'output_dir=s' => \$directory,
            'website=s' => \@websites,
            'subdomain=s' => \$subdomain,
            'strip_subdomain' => \$stripSubdomain,
    );

if($help) {
  &usage();
  exit;
}

my %partialProjects;
while(<DATA>) {
  chomp;
  my ($p, $o) = split(',', $_);
  $partialProjects{$p}->{$o}=  1;

}


my $dataDir = "$directory/data";
mkdir $dataDir;

foreach my $website (@websites) {
  print STDERR "Working on website: $website\n";

  my ($sourceWebsite, $websiteForApolloConfig, $cleanSiteDir) = &websiteNames($website, $subdomain, $stripSubdomain);

  my $websiteDir = "$directory/$cleanSiteDir";
  mkdir $websiteDir; 

  my $isPartialProject = &isPartialProject($cleanSiteDir, \%partialProjects);

  my $organisms = &getOrganismListAndPrintJson($sourceWebsite, $websiteDir);

  foreach my $organism (@{$organisms->{organisms}}) {
    my $organismAbbrev = $organism->{ORGANISM_ABBREV};
    my $fullName = $organism->{NAME};

    next if($isPartialProject && &skipOrganism($organismAbbrev, \%partialProjects));

    print STDERR "Preparing Configuration for Organism $organismAbbrev\n";
    my $mainUrl = "$sourceWebsite/a/service/jbrowse/tracks/${organismAbbrev}/trackList.json";
    my $main = &getData($mainUrl);

    # include the functions.conf
    push @{$main->{include}}, "/a/jbrowse/functions.conf";

    # TODO: only include this for annotated genomes
    push @{$main->{include}}, "/a/jbrowse/apollo_gene_tracks.conf";

    my $organismDir = "$dataDir/$organismAbbrev";
    my $seqDir = "$dataDir/$organismAbbrev/seq";

    mkdir $organismDir;
    mkdir $seqDir;

    my $refSeqsUrl = &redirect($sourceWebsite, $main->{refSeqs}, $organismAbbrev);
    my $refSeqsJson = get($refSeqsUrl);
    my $refSeqsFile = "$seqDir/refSeqs.json";

    open(REFSEQ, ">$refSeqsFile") or die "Cannot open file $refSeqsFile for writing: $!";
    print REFSEQ $refSeqsJson . "\n";
    close REFSEQ;

    # TODO: use webservice for srt to get the top level fasta seqs
    # my $fastaFile = "$workflowDir/data/$organismAbbrev/makeAndMaskTopLevelGenome/topLevelGenomicSeqs.fasta";
    # unless(-e $fastaFile) {
    #   die "file does not exist: $fastaFile";
    # }

     my $fa = "$organismAbbrev.fa";
     my $fai = "$organismAbbrev.fa.fai";
     my $refSeqFasta = "$organismDir/seq/$fa";
     my $fullNameEscaped= uri_escape($fullName);
print "FULLNAME= $fullName \n";
     my $srtFastaSeqUrl = $sourceWebsite."/a/service/record-types/genomic-sequence/searches/SequencesByTaxon/reports/srt\?organism=$fullNameEscaped&reportConfig=\{\"attachmentType\":\"plain\",\"revComp\":true,\"start\":1\,\"end\":0\}";
print "URL = $srtFastaSeqUrl\n";
     my $fastaSeqCmd = "curl $srtFastaSeqUrl";
     #my $fastaSequence = &runCmd($fastaSeqCmd); 
     my $fastaSequence = `$fastaSeqCmd`;
     open(FASTASEQ, ">$refSeqFasta") or die "Cannot open file $refSeqFasta for writing: $!";
     print FASTASEQ $fastaSequence . "\n";
     close FASTASEQ;


    # TODO:
    # # will Bob's Server have samtools installed?  
    # # can we use docker or singularity to index the fasta? (ask BobB)

    # cp($fastaFile, $refSeqFasta);
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

    $main->{names}->{url} = &redirect($websiteForApolloConfig, $main->{names}->{url}, $organismAbbrev);

    # weed out user datasets
    @{$main->{include}} = grep {!/user-datasets-jbrowse/} @{$main->{include}};

    for(my $i = 0; $i < @{$main->{include}}; $i++) {
      my $includeUrl = $main->{include}->[$i];

      $includeUrl = &redirect($sourceWebsite, $includeUrl, $organismAbbrev);

      if($includeUrl =~ /rnaseqJunctions/) {
        $includeUrl = $includeUrl .  "?isApollo=1";
      }

      my $tracksJson = get($includeUrl);
      die "Couldn't get $includeUrl" unless defined $tracksJson;
      $tracksJson =~ s/\/a\//$websiteForApolloConfig\/a\//g;

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


sub getOrganismListAndPrintJson {
  my ($site, $websiteDir) = @_;

  my $orgUrl = "$site/a/service/jbrowse/organismList";
  my $organismsFile = "$websiteDir/organismList.json";

  my $organisms = &getData($orgUrl);

  open(ORGS, ">$organismsFile") or die "Cannot open file $organismsFile for writing: $!";
  print ORGS encode_json $organisms;
  close ORGS;

  return $organisms;
}


sub websiteNames {
  my ($site, $subdomain, $stripSubdomain) = @_;

  if($site =~ /(https?:\/\/)?(.+).org\/?/) {
    my $siteNoSub = "https://$2.org";

    my $sourceSite = $subdomain ? "https://$subdomain.$2.org" : $siteNoSub;
    my $siteForApolloConfig = $stripSubdomain ? $siteNoSub : $sourceSite;

    my $cleanSource = $subdomain ? "$subdomain.$2.org" : "$2.org";
    my $cleanSiteDir = $stripSubdomain ? "$2.org" : $cleanSource;
    
    print STDERR "Configs will be generated from:  $sourceSite\n";
    print STDERR "The website referenced in output configs will be:  $siteForApolloConfig\n";
    print STDERR "The directory name for this website is:  $cleanSiteDir\n";

    return ($sourceSite, $siteForApolloConfig, $cleanSiteDir);
  }

  die "Did not recognize veupathdb website: $site";
}


sub skipOrganism {
  my ($organismAbbrev, $partialProjects) = @_;

  my $found = 0;
  foreach my $p (keys %$partialProjects) {
    $found = 1 if($partialProjects->{$p}->{$organismAbbrev});
  }

  print "$organismAbbrev was found\n" if $found;

  return !$found;
}

sub isPartialProject {
  my ($site, $partialProjects) = @_;

  foreach(keys %$partialProjects) {
    my $lcProjectName = lc($_);
    if( $site =~ /$lcProjectName/) {
      print STDERR "A partial List of organism configurations will be dumped for $site\n";
      return 1 ;
    }
  }

  return 0;
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

1; 


__DATA__
TriTrypDB,lbraMHOMBR75M2904
TriTrypDB,ldonBPK282A1
TriTrypDB,linfJPCM5
TriTrypDB,lmajFriedlin
TriTrypDB,lmexMHOMGT2001U1103
TriTrypDB,tbrugambienseDAL972
TriTrypDB,tbruLister427_2018
TriTrypDB,tconIL3000
TriTrypDB,tcruCLBrenerEsmeraldo-like
TriTrypDB,tcruCLBrenerNon-Esmeraldo-like
TriTrypDB,tcruCLBrener
TriTrypDB,tvivY486
CryptoDB,cparIOWA-ATCC
GiardiaDB,gassAWB
FungiDB,afumAf293
FungiDB,anidFGSCA4
FungiDB,anigCBS513-88
FungiDB,aoryRIB40
FungiDB,bcinB05-10
FungiDB,cimmRS
FungiDB,cposSilveira
FungiDB,cneoH99
FungiDB,cneoJEC21
FungiDB,fgraPH-1
FungiDB,hcapNAm1
FungiDB,mory70-15
FungiDB,mgloCBS7966
FungiDB,ncraOR74A
FungiDB,pjirSE8
FungiDB,treeQM6a
FungiDB,umay521
FungiDB,cgatWM276
FungiDB,calbSC5314
FungiDB,foxy4287
FungiDB,caurB8441
