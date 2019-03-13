/* global Balloon, jQuery, Wdk, apidb */

/****** Table-building utilities ******/

function table(rows) {
  return '<table border="0">' + rows.join('') + '</table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>';
}

function fiveColRow(one, two, three, four, five) {
  return '<tr><td>' + one + '</td><td>' + two + '</td><td>' + three + '</td><td>' + four + '</td><td>' + five + '</td></tr>';
}


/******  utilities ******/

positionString = function(refseq, start, end, strand)  {
    var strandString = strand == 1 ? "(+ strand)" : "(- strand)";
    return refseq + ":" + start + ".." + end + " " + strandString;
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}

/****** Pop-up functions for various record types ******/

// Gene title
function gene_title (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, utr, position, orthomcl, geneId, dataRoot, baseUrl, baseRecordUrl, aaseqid ) {

  // In ToxoDB, sequences of alternative gene models have to be returned
  var ignore_gene_alias = 0;
  if (projectId == 'ToxoDB') {
    ignore_gene_alias = 1;
  }

  // expand minimalist input data
  var cdsLink = "<a href='/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences' target='_blank'>CDS</a>"
  var proteinLink = "<a href='/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&endAnchor3=End&go=Get+Sequences' target='_blank'>protein</a>"
  var recordLink = '<a href="' + baseRecordUrl + '/gene/' + geneId + '">Gene Page</a>';

  var gbLink = "<a href='" + baseUrl + "index.html?data=" + dataRoot + "&loc=" + position + "'>JBrowse</a>";
  var orthomclLink = "<a href='http://orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=" + orthomcl + "'>" + orthomcl + "</a>";

  // format into html table rows
  var rows = new Array();
    if (taxon != '') {rows.push(twoColRow('Species:', taxon))};
    if (sourceId != '') { rows.push(twoColRow('ID:', sourceId))};
    if (geneId != '') { rows.push(twoColRow('Gene ID:', geneId))};
    if (soTerm != '') { rows.push(twoColRow('Gene Type:', soTerm))};
    if (product != '') { rows.push(twoColRow('Description:', product))};

  var exon_or_cds = 'Exon:';

  if (soTerm =='Protein Coding') {
    exon_or_cds = 'CDS:';
  }

  if (loc != '') {
    rows.push(twoColRow(exon_or_cds, loc)) ;
  }
  if(utr != '') {
    rows.push(twoColRow('UTR:', utr));
  }
  // TO FIX for GUS4
  //  rows.push(twoColRow(GbrowsePopupConfig.saveRowTitle, getSaveRowLinks(projectId, sourceId)));
  if (soTerm =='Protein Coding' && aaseqid) {
    rows.push(twoColRow('Download:', cdsLink + " | " + proteinLink));
    if ( orthomcl != '') {
      rows.push(twoColRow('OrthoMCL', orthomclLink));
    }
  }
    if (geneId != '') { rows.push(twoColRow('Links:', gbLink + " | " + recordLink))};

  //tip.T_BGCOLOR = 'lightskyblue';
  //tip.T_TITLE = 'Annotated Gene ' + sourceId;
  return table(rows);
}


function gsnapUnifiedIntronJunctionTitle (track, feature, featureDiv) {
    var rows = new Array();
    //arrays
    var exps = feature.get('Exps');
    var samples = feature.get('Samples');
    var urs = feature.get('URS');
    var isrpm = feature.get('ISRPM');
    var nrs =  feature.get('NRS');
    var percSamp = feature.get('PerMaxSample'); 
    var isrCovRatio = feature.get('IsrCovRatio'); 
    var isrAvgCovRatio = feature.get('IsrAvgCovRatio'); 
    var normIsrCovRatio = feature.get('NormIsrCovRatio'); 
    var normIsrAvgCovRatio = feature.get('NormIsrAvgCovRatio'); 
    var isrpmExpRatio = feature.get('IsrpmExpRatio'); 
    var isrpmAvgExpRatio = feature.get('IsrpmAvgExpRatio'); 

    //attributes
    var totalScore = feature.get('TotalScore'); 
    var intronPercent = feature.get('IntronPercent'); 
    var intronRatio = feature.get('IntronRatio'); 
    var matchesGeneStrand = feature.get('MatchesGeneStrand'); 
    var isReversed = feature.get('IsReversed'); 
    var annotIntron = feature.get('AnnotatedIntron'); 
    var gene_source_id = feature.get('GeneSourceId'); 

    var start = feature.get("start");
    var end = feature.get("end");

    var exp_arr = exps.split('|');
    var sample_arr = samples.split('|');
    var ur_arr = urs.split('|');
    var isrpm_arr = isrpm.split('|');
    var percSamp_arr = percSamp.split('|');
    var isrCovRatio_arr = isrCovRatio.split('|');
    var isrAvgCovRatio_arr = isrAvgCovRatio.split('|');
    var count = 0;
    var html;
    if(intronPercent) {
        html = "<table><tr><th>Experiment</th><th>Sample</th><th>Unique</th><th>ISRPM</th><th>ISR/Cov</th><th>% MAI</th></tr>";
    }
    else {
        html = "<table><tr><th>Experiment</th><th>Sample</th><th>Unique</th><th>ISRPM</th><th>ISR/AvgCov</th></tr>";
    }

    var maxRatio = [0,0,'sample here','experiment'];
    var sumIsrpm = 0;

    exp_arr.forEach(function(exp) {
        var sa = sample_arr[count].split(',');
        var ur = ur_arr[count].split(',');
        var isrpm = isrpm_arr[count].split(',');
        var rcs = isrCovRatio_arr[count].split(',');
        var rct = isrAvgCovRatio_arr[count].split(',');
        var ps = percSamp_arr[count].split(',');

        var i;
        for (i = 0; i < sa.length; i++) { 

            if(Number(isrpm[i]) > Number(maxRatio[0])) maxRatio = [ isrpm[i], intronPercent ? rcs[i] : rct[i], sa[i], exp, intronPercent ? rcs[i] : rct[i] ];
            sumIsrpm = sumIsrpm + Number(isrpm[i]);

            if(i == 0) {
                html = html + "<tr><td>"+ exp+ "</td><td>" + sa[i] + "</td><td>" + ur[i] + "</td><td>" + isrpm[i] + "</td>"; 
            } else {
                html = html + "<tr><td></td><td>" + sa[i] + "</td><td>" + ur[i] + "</td><td>" + isrpm[i] + "</td>"; 
            }
            if(intronPercent){
                html = html + "<td>" + rcs[i] + "</td><td>" + ps[i] + "</td></tr>";
            }else{
                html = html + "<td>" + rct[i] + "</td></tr>";
            }
        }
        count++;
    });
    html = html + "</table>";

    rows.push(twoColRow('<b>Intron Location:</b>', "<b>" + start + " - " + end + " (" + (end - start + 1) + ' nt)</b>'));
    rows.push(twoColRow('<b>Intron Spanning Reads (ISR):</b>', "<b>" + totalScore + "</b>" ));
    rows.push(twoColRow('<b>ISR per million (ISRPM):</b>', "<b>" + round(sumIsrpm, 2) + "</b>" ));
    if(intronPercent) rows.push(twoColRow('<b>Gene assignment:</b>', "<b>" + gene_source_id + (annotIntron === "Yes" ? " - annotated intron" : "") + "</b>"));
    if(intronPercent) rows.push(twoColRow('<b>&nbsp;&nbsp;&nbsp;% of Most Abundant Intron (MAI):</b>', "<b>" + intronPercent + "</b>"));
    rows.push(twoColRow('<b>Most abundant in:</b>', "<b>" + maxRatio[3] + " : " + maxRatio[2] + "</b>"));
    rows.push(twoColRow('<b>&nbsp;&nbsp;&nbsp;ISRPM (ISR /' + (annotIntron === 'Yes' ? ' gene coverage)' : ' avg coverage)') + '</b>', "<b>" + maxRatio[0] + " (" + maxRatio[1] +")</b>"));

    return table(rows) + html;
 }



function gsnapIntronWidthFromScore( feature ) {
    var sum = feature.get('TotalScore'); 
    if(sum <= 4096) return 4;
    if(sum <= 16000) return 8;
    return 12;
}

function gsnapIntronHeightFromPercent ( feature ) {
    var goalHeight = gsnapIntronWidthFromScore(feature) * 2;

    var perc = feature.get('IntronPercent'); 
    if(perc <= 5) return goalHeight + 3;
    if(perc <= 20) return goalHeight + 4;
    if(perc <= 60) return goalHeight + 5;
    if(perc <= 80) return goalHeight + 6;
    return goalHeight + 7;
}

function gsnapIntronColorFromStrandAndScore( feature ) {
    var isReversed = feature.get('IsReversed'); 
    var sum = feature.get('TotalScore'); 
    if(isReversed == 1) {
        if(sum <= 4) return 'rgb(255,219,219)';
        if(sum <= 16) return 'rgb(255,182,182)';
        if(sum <= 64) return 'rgb(255,146,146)';
        if(sum <= 256) return 'rgb(255,109,109)';
        if(sum <= 1024) return 'rgb(255,73,73)';
        return 'rgb(255,36,36)';   
    }
    else {
        if(sum <= 4) return 'rgb(219,219,255)';
        if(sum <= 16) return 'rgb(182,182,255)';
        if(sum <= 64) return 'rgb(146,146,255)';
        if(sum <= 256) return 'rgb(109,109,255)';
        if(sum <= 1024) return 'rgb(73,73,255)';
        return 'rgb(36,36,255)';   
    }
}


function chipColor(feature) { 
    var a = feature.get('Antibody');

    if(!a) {
      a = feature.get("immunoglobulin complex, circulating");
    }
    
    var t = feature.get('Compound');
    var r = feature.get('Replicate');
    var g = feature.get('genotype information');
    var l = feature.get('life cycle stage');
    var anls = feature.get('name');

    if(anls == 'H4_schizonti_smoothed (ChIP-chip)') return '#D80000';
    if(anls == 'H4_trophozoite_smoothed (ChIP-chip)')  return '#006633';
    if(anls == 'H4_ring_smoothed (ChIP-chip)') return '#27408B';
    if(anls == 'H3K9ac_troph_smoothed (ChIP-chip)') return '#524818';

    if(/CenH3_H3K9me2/i.test(a)) return '#000080';
    if(/CenH3/i.test(a)) return '#B0E0E6';

    if (/wild_type/i.test(g) && (/H3K/i.test(a) || /H4K/i.test(a))) return '#0A7D8C';
    if (/sir2KO/i.test(g) && (/H3K/i.test(a) || /H4K/i.test(a))) return '#FF7C70';

    if(/H3K4me3/i.test(a) && r == 'Replicate 1') return '#00FF00';
    if(/H3K4me3/i.test(a) && r == 'Replicate 2') return '#00C896';
    if(/H3k4me1/i.test(a) && r == 'Replicate 1') return '#0033FF';
    if(/H3k4me1/i.test(a) && r == 'Replicate 2') return '#0066FF';


    if(/H3K9/i.test(a) && r == 'Replicate 1') return '#C86400';
    if(/H3K9/i.test(a) && r == 'Replicate 2') return '#FA9600';

    if(/DMSO/i.test(t)) return '#4B0082';
    if(/FR235222/i.test(t)) return '#F08080';

    if(r == 'replicate1') return '#00C800';
    if(r == 'replicate2') return '#FA9600';
    if(r == 'replicate3') return '#884C00';

    if(/early-log promastigotes/i.test(l)) return '#B22222';
    if(/stationary promastigotes/i.test(l)) return '#4682B4'; 

    if(/H3K4me3/i.test(a)) return '#00C800';
    if(/H3K9Ac/i.test(a)) return '#FA9600';
    if(/H3K9me3/i.test(a) ) return '#57178F';
    if(/H3/i.test(a) ) return '#E6E600';
    if(/H4K20me3/i.test(a)) return '#F00000';

    if(/SET8/i.test(a) && r == 'Replicate 1' ) return '#600000';
    if(/TBP1/i.test(a) && r == 'Replicate 1' ) return '#600000';
    if(/TBP2/i.test(a) && r == 'Replicate 1' ) return '#600000';
    if(/RPB9_RNA_pol_II/i.test(a) && r == 'Replicate 1' ) return '#600000';

    if(/SET8/i.test(a) && r == 'Replicate 2' ) return '#C00000';
    if(/TBP1/i.test(a) && r == 'Replicate 2' ) return '#C00000';
    if(/TBP2/i.test(a) && r == 'Replicate 2' ) return '#C00000';
    if(/RPB9_RNA_pol_II/i.test(a) && r == 'Replicate 2' ) return '#C00000';

   return '#B84C00';
}

function peakTitleChipSeq(track, feature, featureDiv) {
    var rows = new Array();

    var start = feature.get("start");
    var end = feature.get("end");

    rows.push(twoColRow('Start:', start));
    rows.push(twoColRow('End:', end));

    var ontologyTermToDisplayName = {'antibody' : 'Antibody', 
                                     'immunoglobulin complex, circulating' : 'Antibody',
                                     'genotype information' : 'Genotype', 
                                     'compound based treatment' : 'Treatment',
                                     'replicate' : 'Replicate',
                                     'life cycle stage' : 'Lifecycle Stage',
                                     'strain'   : 'Strain',
                                     'tag_count' : 'Normalised Tag Count',
                                     'fold_change' : 'Fold Change',
                                     'p_value' : 'P Value'};

    for (var key in ontologyTermToDisplayName) {
        var value = feature.get(key);
        var displayName = ontologyTermToDisplayName[key];
        if (value) {
            rows.push(twoColRow(displayName + ':', value));
        }
    }

    return table(rows);
}

function positionAndSequence( track, f, featDiv ) {
    container = dojo.create('div', { className: 'detail feature-detail feature-detail-'+track.name.replace(/\s+/g,'_').toLowerCase(), innerHTML: '' } );
    track._renderCoreDetails( track, f, featDiv, container );
    track._renderUnderlyingReferenceSequence( track, f, featDiv, container );
    return container;
}
