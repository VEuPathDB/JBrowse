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


