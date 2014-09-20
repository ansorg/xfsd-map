<?
include_once('../Log.php');
require_once('settings.php');
$filename = 'cache.xml';
header('Content-type: application/xml');
if (file_exists($filename)) {
    $time = filemtime($filename);
    header('Last-Modified: '.gmdate('D, d M Y H:i:s', $time).' GMT');
    header("Content-Length: " . filesize($filename)); 
}
debug("now: " . time() . " filetime: " . filemtime('cache.xml'). " Diff:" . time()-filemtime('cache.xml') . " Updatefreq: " . UPDATE_FREQ/1000);

/*
if (is_readable('cache.xml')){
*/
if (is_readable('cache.xml') && time()-filemtime('cache.xml')<UPDATE_FREQ/1000){
	debug("loading from cache");
	readfile('cache.xml');
	die();
}

$userLevels=array(
 0=>'disabled',
    'Observer',
    'Junior Student',
    'Student',
    'Senior Student',
    'Junior Controller',
    'Controller',
    'Senior Controller',
    'Junior Instructor',
    'Instructor',
    'Senior Instructor',
    'Supervisor',
    'Administrator'
);


class WhazzupParser{

	private $whazzup;
	private $pilots=array();
	private $atc=array();
	private $info=array();
	
	function __construct($whazzupPath){
		$this->whazzup=file($whazzupPath,FILE_IGNORE_NEW_LINES);
		if($this->whazzup===false){
			die('Fatal Error: Could not connect to server');
		}
	}
	
	function parseClients(){
		$clients=array_search("!CLIENTS",$this->whazzup)+1;
		if($clients===false){
			die('Fatal Error: Malformed Whazzup File');
		}
		for($i=$clients;strpos($this->whazzup[$i],'!')!==0;$i++){
			$parts=explode(':',$this->whazzup[$i]);
			$clientData=array(
				'callsign'=>$parts[0],
				'type'=>$parts[3],
				'cid'=>$parts[1],
				'freq'=>$parts[4],
				'name'=>$parts[2],
				'server'=>$parts[14],
				'rating'=>$parts[16],
				'logged_on'=>$parts[37],
				'aircraft'=>$parts[9],
				'depart'=>$parts[11],
				'arrive'=>$parts[13],
				'route'=>$parts[30],
				'lat'=>$parts[5],
				'lon'=>$parts[6],
				'altitude'=>$parts[7],
                'groundspeed'=>$parts[8]
			);
			foreach($clientData as &$v){
				$v=htmlspecialchars($v);
				$v=utf8_encode($v);
			}
			if($clientData['type']=='PILOT'){
				$this->pilots[]=$clientData;
			}else{
				$this->atc[]=$clientData;
			}
			
		}
	}
	
	function parseGeneral(){
		$general=array_search("!GENERAL",$this->whazzup)+1;
		if($general===false){
			die('Fatal Error: Malformed Whazzup File');
		}
		for($i=$general;strpos($this->whazzup[$i],'!')!==0;$i++){
			$parts=explode('=',$this->whazzup[$i]);
			$parts[0]=trim($parts[0]);
			$parts[1]=trim($parts[1]);
			$this->info[$parts[0]]=$parts[1];
		}
	}
	
	function getServers(){
		//not yet implmented
	}
	
	
	function getAtc(){
		return $this->atc;
	}
	
	function getPilots(){
		return $this->pilots;
	}
	function getClients(){
		return array_merge($this->atc,$this->pilots);
	}
	function getUpdateNo(){
		return $this->info['UPDATE'];
	}
	function dump(){
		$out = "";
		for($i=0;$i<count($this->whazzup);$i++){
			$out.=$this->whazzup[$i];
		}
		return $out;
	}
}

$parser = new WhazzupParser(WHAZZUP_URL);
$parser->parseClients();
ob_start();
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
//echo "<!DOCTYPE clients SYSTEM \"clients.dtd\">\n";
echo "<clients timestamp=\"" . time() ."\">";
foreach($parser->getPilots() as $pilot){
	echo "<client type=\"P\" cs=\"{$pilot['callsign']}\" name=\"{$pilot['name']}\" rating=\"{$pilot['rating']}\" 
	cid=\"{$pilot['cid']}\" acf=\"{$pilot['aircraft']}\" from=\"{$pilot['depart']}\" to=\"{$pilot['arrive']}\" 
	route=\"{$pilot['route']}\" lat=\"{$pilot['lat']}\" lng=\"{$pilot['lon']}\" alt=\"{$pilot['altitude']}\" gs=\"{$pilot['groundspeed']}\"></client>";
}
foreach($parser->getAtc() as $atc){
	echo "<client type=\"C\" cs=\"{$atc['callsign']}\" name=\"{$atc['name']}\" 
	cid=\"{$atc['cid']}\" rating=\"{$atc['rating']}\"
	freq=\"{$atc['freq']}\" logged_on=\"{$atc['logged_on']}\" 
	lat=\"{$atc['lat']}\" lng=\"{$atc['lon']}\"></client>";
}
echo '</clients>';
$xml=ob_get_contents();
ob_end_flush();
//write data to cache
if(is_writeable('cache.xml') && $fh=fopen('cache.xml','w')){
	fwrite($fh,$xml);
	fclose($fh);
	debug("file written");
} else {
	debug("could not write cache file");
}


?>
