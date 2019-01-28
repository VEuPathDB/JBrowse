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


/****** Pop-up functions for various record types ******/

// Gene title
function gene_title (tip, projectId, sourceId, chr, loc, soTerm, product, taxon, utr, gbLinkParams, orthomcl, geneId, baseUrl, baseRecordUrl, aaseqid ) {

  // In ToxoDB, sequences of alternative gene models have to be returned
  var ignore_gene_alias = 0;
  if (projectId == 'ToxoDB') {
    ignore_gene_alias = 1;
  }

  // expand minimalist input data
  var cdsLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences' target='_blank'>CDS</a>"
  var proteinLink = "<a href='" + baseUrl + "/cgi-bin/geneSrt?project_id=" + projectId
    + "&ids=" + sourceId
    + "&ignore_gene_alias=" + ignore_gene_alias
    + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&endAnchor3=End&go=Get+Sequences' target='_blank'>protein</a>"
  var recordLink = '<a href="' + baseRecordUrl + '/gene/' + geneId + '">Gene Page</a>';
  var gbLink = "<a href='" + baseUrl + "/cgi-bin/gbrowse/" + projectId.toLowerCase() + "/?" + gbLinkParams + "'>GBrowse</a>";
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



// EST title
function est (tip, paramsString) {
  // split paramsString on asterisk (to avoid library name characters)
  var v = new Array();
  v = paramsString.split('*');

  var ACCESSION = 0;
  var START = ACCESSION + 1;
  var STOP = START + 1;
  var PERC_IDENT = STOP + 1;
  var LIB =  PERC_IDENT + 1;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Accession:', v[ACCESSION]));
  rows.push(twoColRow('Location:', v[START] + "-" + v[STOP]));
  rows.push(twoColRow('Identity:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Library:', v[LIB]));

  tip.T_TITLE = 'EST ' + v[ACCESSION];
  return table(rows);
}


// Syntetic Gene title
function syn_gene_title (tip, projectId, sourceId, taxon, geneType, desc, location, gbLinkParams, orthomcl, baseRecordUrl) {

  var gbLink = '<a href="../../../../cgi-bin/gbrowse/' + projectId.toLowerCase() + '/?' + gbLinkParams + '">GBrowse</a>';
  var recordLink = '<a href="' + baseRecordUrl + '/app/record/gene/' + sourceId + '">Gene Page</a>';

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Gene:', sourceId));
  rows.push(twoColRow('Species:', taxon));
  rows.push(twoColRow('Gene Type:', geneType));
  rows.push(twoColRow('Description:', desc));
  rows.push(twoColRow('Location:', location));
  rows.push(twoColRow(GbrowsePopupConfig.saveRowTitle, getSaveRowLinks(projectId, sourceId)));
  rows.push(twoColRow('Links:', gbLink + ' | ' + recordLink));

  if (geneType =='Protein Coding') {
    rows.push(twoColRow('OrthoMCL', orthomcl));
  }


  tip.T_TITLE = 'Syntenic Gene: ' + sourceId;
  return table(rows);
}

// BLAST title
function blt (tip, paramsString) {
  // split paramsString on asterisk (to avoid defline characters)
  var v = new Array();
  v = paramsString.split('*');

  var ACCESSION = 0;
  var DEFLINE = ACCESSION + 1;
  var START = DEFLINE + 1;
  var STOP = START + 1;
  var PERC_IDENT = STOP + 1;
  var EXPECT = PERC_IDENT + 1;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Accession:', "gi|" + v[ACCESSION]));
  rows.push(twoColRow('Description:', v[DEFLINE]));
  rows.push(twoColRow('Location:', v[START] + "-" + v[STOP]));
  rows.push(twoColRow('Identity:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Positive:', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Expect:', v[EXPECT]));

  tip.T_TITLE = 'BLASTX: ' + "gi|" + v[ACCESSION];
  return table(rows);
}


// SNP Title
function pst (tip, paramsString) {
  // split paramsString on ampersand
  var v = new Array();
  v = paramsString.split('&');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  var POS_IN_CDS     = 0;
  var POS_IN_PROTEIN = POS_IN_CDS + 1;
  var REF_STRAIN     = POS_IN_PROTEIN + 1;
  var REF_AA         = REF_STRAIN + 1;
  var REVERSED       = REF_AA + 1;
  var REF_NA         = REVERSED + 1;
  var SOURCE_ID      = REF_NA + 1;
  var VARIANTS       = SOURCE_ID + 1;
  var START          = VARIANTS + 1;
  var GENE           = START + 1;
  var IS_CODING      = GENE + 1;
  var NON_SYN        = IS_CODING + 1;
  var WEBAPP         = NON_SYN + 1;

  // expand minimalist input data
  var link = "<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";

  var type = 'Non-coding';
  var refNA = (v[REVERSED] == '1')? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == 'yes') {
    var non = (v[NON_SYN] == 'yes')? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING] == 'yes') {
    rows.push(twoColRow('Position&nbsp;in&nbsp;CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position&nbsp;in&nbsp;protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));
  rows.push(twoColRow(v[REF_STRAIN] + '&nbsp;(reference)', 'NA=' + refNA + refAAString));

  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split(':');
    var strain = variant[0];
    if (strain == v[REF_STRAIN]) continue;
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na];
    var aa = variant[2];
    var info =
      'NA=' + na + ((v[IS_CODING] == 'yes')? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    rows.push(twoColRow(strain, info));
  }

  //  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows);
}


// htsSNP Title
function htspst (tip, paramsString) {
  // split paramsString on ampersand
  var v = new Array();
  v = paramsString.split('&');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  var POS_IN_CDS     = 0;
  var POS_IN_PROTEIN = POS_IN_CDS + 1;
  var REF_STRAIN     = POS_IN_PROTEIN + 1;
  var REF_AA         = REF_STRAIN + 1;
  var REVERSED       = REF_AA + 1;
  var REF_NA         = REVERSED + 1;
  var SOURCE_ID      = REF_NA + 1;
  var VARIANTS       = SOURCE_ID + 1;
  var START          = VARIANTS + 1;
  var GENE           = START + 1;
  var IS_CODING      = GENE + 1;
  var NON_SYN        = IS_CODING + 1;
  var WEBAPP         = NON_SYN + 1;

  // expand minimalist input data
  var link = "<a href=/a/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";

  var type = 'Non-coding';
  var refNA = (v[REVERSED] == '1')? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == 'yes') {
    var non = (v[NON_SYN] == 'yes')? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING] == 'yes') {
    rows.push(twoColRow('Position&nbsp;in&nbsp;CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position&nbsp;in&nbsp;protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));

  var strains = new Array();
  strains.push(fiveColRow('<b>Strain</b>','<b>Allele</b>','<b>Product</b>','<b>Coverage</b>','<b>Allele&nbsp;%</b>'));
  strains.push(fiveColRow(v[REF_STRAIN] + '&nbsp;(reference)',refNA,v[REF_AA],'&nbsp;','&nbsp;'));
  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split('::');
    var strain = variant[0];
    if (strain == v[REF_STRAIN]) continue;
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na];
    var aa = variant[2];
    var info =
      'NA=' + na + ((v[IS_CODING] == 'yes')? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    strains.push(fiveColRow(strain, na, (v[IS_CODING] == 'yes') ? aa : '&nbsp;',variant[3],variant[4]));
  }

  //  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows) + table(strains);
}

