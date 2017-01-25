<?php

if(isset($_GET['term'])){
    $_GET['term']= html_entity_decode($_GET['term']).'%';
    $response=array();
    $response['data']=array();
    $dbh=new PDO('mysql:host=localhost;dbname=jdm','root');
    $dbh->query('SET NAMES UTF8'); 
    $query=$dbh->prepare("SELECT mot from nodes where mot like ? LIMIT 30") ;
    $query->bindParam(1,utf8_decode($_GET['term']));
    $query->execute();
    $result=$query->fetchAll(PDO::FETCH_COLUMN, 0);
    //echo $result[0].'<br/>';
    foreach($result as $id){
      $response["data"][$id]=null;
    }
    echo json_encode($response);
}


?>