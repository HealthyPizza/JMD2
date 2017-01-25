<?php

function readCache($rid,$offset){
    if(file_exists('cache/'.utf8_decode($_GET['mot']).$rid)){
        $file=file_get_contents('cache/'.utf8_decode($_GET['mot']).$rid);
        $data=json_decode($file,true);
        if((int)$data["meta"]>$offset){
            //echo '<br/>R'.$rid.' FROM CACHE:<br/>';
            $data["m"]=array_slice($data["m"],$offset,150);
            $data["w"]=array_slice($data["w"],$offset,150);
            $data["hasMore"]=true;
            return $data;
        }
        else
            return FALSE;
    }
    else{
        //echo '<br/>R'.$rid.'NOT IN CACHE<br/>';
        return FALSE;
    }
}

function writeCache($data,$rid){
    $mot=stripslashes($_GET['mot']);
    if(file_exists('cache/'.utf8_decode($mot.$rid))){
        //echo 'writing on existing cache<br/>';
        $file=file_get_contents('cache/'.utf8_decode($mot.$rid));
        $file=json_decode($file,true);
        $data["m"]=array_merge($file["m"],$data["m"]);
        $data["w"]=array_merge($file["w"],$data["w"]);
    }
    $mot=stripslashes($mot);
    file_put_contents('cache/'.utf8_decode($mot.$rid),json_encode($data));
    //echo 'Donnees mises en cache<br/>';
}

function getNodeId($mot){
    $dbh=new PDO('mysql:host=localhost;dbname=jdm','root');
    $query=$dbh->prepare("SELECT id from nodes where mot like ?") ;
    $query->bindParam(1,utf8_decode($_GET['mot']));
    $query->execute();
    $result=$query->fetchAll(PDO::FETCH_COLUMN, 0);
    $dbh = null;
    return $result[0];
}

function getWordById($id){
    $id=substr($id,1);
    $dbh=new PDO('mysql:host=localhost;dbname=jdm','root');
    $dbh->query('SET NAMES UTF8'); 
    $query=$dbh->prepare("SELECT mot from nodes where id=?") ;
    $query->bindParam(1,utf8_decode($id));
    $query->execute();
    $result=$query->fetchAll(PDO::FETCH_COLUMN, 0);
    $dbh = null;
    return $result[0];
}

function queryData($id,$rid,$offset){
    $offset=(int)$offset; //dont know why
    $dbh=new PDO('mysql:host=localhost;dbname=jdm','root');
    $query=$dbh->prepare("SELECT n2,w FROM relations where n1= ? and t= ? LIMIT 150 OFFSET ?"); /*l'id des mots correspondants*/
    $query->bindParam(1,$id);
    $query->bindParam(2,$rid);
    $query->bindParam(3,$offset, PDO::PARAM_INT);
    $query->execute();
    $req = $dbh->query('SET NAMES UTF8'); 
    $result=$query->fetchAll();
    //print_r($result);
    $query=$dbh->prepare("SELECT mot from nodes where id=?") ;
    $mots=array();
    $mots['meta']=$offset;
    $mots['m']=array();
    $mots['w']=array();
    $mots['hasMore']=false;
    /*On recherche le mot associe a chaque ID*/
    $count=0;
    foreach($result as $id){
        $query->bindParam(1,$id['n2']);
        $query->execute();
        $res=$query->fetchAll(PDO::FETCH_COLUMN, 0);
        if( isset($res[0]) && (strstr($res[0],":r")==FALSE) ){
            if(strstr($res[0],">")){
                $res[0]=str_replace(strstr($res[0],">"),'>'.getWordById(strstr($res[0],">")),$res[0]);
            }
            //$mot=array();
            $mots['m'][]=$res[0];
            $mots['w'][]=$id['w'];
        }
        $count++;

    }
    if($count==150)
        $mots['hasMore']=true;

    writeCache($mots,$rid);
    return ($mots);
}

if (isset($_GET['mot'])){
    $_GET['mot']= html_entity_decode($_GET['mot']);
    $data =readCache($_GET['rel'],$_GET['offset']);
    if($data){
        $returnvalue=$data;
    }
    else{
        $id=getNodeId($_GET['mot']);
        $newdata=queryData($id,$_GET['rel'],$_GET['offset']);
        $returnvalue=$newdata;
    }
    echo json_encode($returnvalue);
}
else
    echo 'not set';
?>