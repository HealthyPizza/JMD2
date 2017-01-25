var search;

function sortElements(source,callback) {
    console.log("sorting");
    var clone=source.siblings("p").clone();
    clone.html('');
    var elements= source.siblings("p").children(".fake-link").clone();
    var sorted = elements.sort(callback);
    for(var i=0;i<sorted.length;i++){
        clone.append(sorted[i]);
        clone.append(" - ");
    }
    source.siblings("p").replaceWith(clone);
    $('.tooltipped').tooltip({delay: 50});
}

function sortAscending( a, b ) {

    var text1=a.innerHTML;
    var text2=b.innerHTML;
    return text1.localeCompare(text2,{ caseFirst: 'upper' });
}

function sortDescending( a, b ) {
    var aValue = parseInt( a.getAttribute("data-tooltip"), 10 );
    var bValue = parseInt( b.getAttribute("data-tooltip"), 10 );
    return bValue - aValue;		
}
function sortedE(){
    console.log("sorted");
}

function expandAll(){
    $(".collapsible-header").addClass("active");
    $(".collapsible").collapsible({accordion: false});
    document.getElementById("button").setAttribute("onclick","collapseAll()");
}

function collapseAll(){
    $(".collapsible-header").removeClass(function(){
        return "active";
    });
    $(".collapsible").collapsible({accordion: true});
    $(".collapsible").collapsible({accordion: false});
    document.getElementById("button").setAttribute("onclick","expandAll()");
}

function getDefinition(mot){
    $.getJSON( "/getDefinition.php?term="+mot, function( data ) {
        $("#def").html(data['def']);
    });
}

/*Genere les accordéons en fonction des criteres de recherche séléctionnés*/
function generateAccordion(id,name){
    //console.log("Generation accordion"+id+ "  -  "+name);
    $("#col").append("<li><div class='collapsible-header'>"+name+"</div><div class='collapsible-body'><div class='row'><p id='p"+id+"' offset='0'></p></div></div></li>");
}

/*Rafraichit le nombre l'elements affichés*/
function updatePageHeader(listItem,nbAdded){
    $("#count"+listItem).text(parseInt( $("#count"+listItem).text())+nbAdded);
}

function moreElement(listItem){
    $("#p"+listItem).parent().append("<div class='row center'> <a class='btn-floating btn-large waves-effect waves-light red' id='more"+listItem+"'><i class='material-icons'>add</i></a></div>");
    $("#more"+listItem).click(function() {
        var query="/search2.php?mot="+search;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                var resp=JSON.parse(xmlHttp.responseText);
                for (i = 0; i < resp["m"].length; i++){
                    generateLink($("#p"+listItem+">p"),resp["m"][i],resp["w"][i]);
                }
                $offset=parseInt($("#p"+listItem).attr("offset"))+150;
                $("#p"+listItem).attr("offset",$offset);
                updatePageHeader(listItem,resp["m"].length);
                $('.tooltipped').tooltip({delay: 50});
                if(resp["hasMore"]==false){
                    $("#more"+listItem).remove();
                }
            }
        }
        $offset=parseInt($("#p"+listItem).attr("offset"))+150;
        query+="&offset="+$offset+"&rel=";
        query+=listItem;
        xmlHttp.open("GET", query, true); // true for asynchronous 
        xmlHttp.send(null);	
    });

}
/*Genere le panneau de résultat a partir du JSON recu*/
/*Definition non supportée :( */
function generatePage(js,listItem){//listiem = id de la relation
    var txt;
    $("#title").text($("<div></div>").html(document.getElementById("search").value.replace(/\\/,"")).text());
    txt="<h5>Termes associés: <span id='count"+listItem+"'>"+js["m"].length+"</span></h5><br/> <button id='ws"+listItem+"' class='btn waves-effect waves-light' type='submit'>Tri par poids</button><button id='fs"+listItem+"' class='btn waves-effect waves-light' type='submit' style='margin-left: 20px;'>Tri alphabetique</button><p style='padding-left: 0px; padding-right: 0px;'></p>";
    $("#p"+listItem).html(txt);
    var i;
    $("#ws"+listItem).click(function(event) {sortElements( $(event.target),sortDescending)});
    $("#fs"+listItem).click(function(event) {sortElements( $(event.target),sortAscending)});

    $("#p"+listItem).click(function(event){
        if( event.target.nodeName=="SPAN")
            tst(event.target.innerHTML);
    });
    for (i = 0; i < js["m"].length; i++){
        generateLink($("#p"+listItem+">p"),js["m"][i],js["w"][i]);
    }
    if(js["hasMore"]==true){
        moreElement(listItem);
    }
    $('.tooltipped').tooltip({delay: 50});
    $("#w"+listItem).remove();
    //console.log(items);
    $("#result_panel").css('display', 'inline');
}

function generateLink(node,linkText,w){
    node.append("<span class='blue-text fake-link tooltipped' data-position='bottom' data-delay='50' data-tooltip='"+w+"'>"+linkText+"</span> - ");
}

function tst(arg){

    $("#search").val(arg);
    $('html, body').animate({
        scrollTop: $("#rdico").offset().top
    }, 1000);
}

function cleanPage(){
    $("#col").html("");
    $("#result_panel").css('display', 'none');
}

$(document).ready(function() {
    $('select').material_select();
    $('input.autocomplete').keydown(function(event) {
        if(event.keyCode == 13){
            $('.autocomplete-content').eq(0).remove();
            event.preventDefault();
            test();
        }
        if(event.keyCode != 8){
            if( ($('#search').val().length!=0) && (($('#search').val().length+1)%2) == 0 ){
                $('.autocomplete-content').eq(0).remove();
                $.getJSON( "/autocomplete.php?term="+$('#search').val(), function( data ) {
                    $('input.autocomplete').autocomplete(data);
                });
            }
        }
        
    });
});