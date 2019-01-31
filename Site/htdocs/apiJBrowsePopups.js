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
function gene_title (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, utr, loc, orthomcl, geneId, dataRoot, baseUrl, baseRecordUrl, aaseqid ) {

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

  var gbLink = "<a href='" + baseUrl + "index.html?data=" + dataRoot + "&loc=" + loc + "'>JBrowse</a>";
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





