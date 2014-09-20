<?php
//ini_set("display_errors", "Off");
include_once('../Log.php');
require_once('../db.class.php');
require_once('./route.class.php');
require_once('./geo.php');
$db = new db_class;

// http://localhost/xfsd/fsdmap/data.php?debug&action=track&cs=TEST&from=MZBZ&to=SKBO&route=CAT01|ALMOR|-26.983,+51.124|AUH30|CAT|CAT05|ALMOR
// http://localhost/xfsd/fsdmap/data.php?debug&action=track&cs=TEST&from=MMMX&to=KJFK&route=VASOS|D248R|APN|VISOS|XOSOK|TAM|ONBUL|SIDRA|PETRA|RAKAS|ABBOT|COKER|MAEKO|KELPP|TARPN|LEV|HRV|SJI|CATLN|MGM|AJFEB|IRQ|CAE|CASAT|TUBAS|RDU|FRANZ|TYI|ORF|SAWED|KALDA|SWL|RADDS|SIE|AVALO|BRIGS|DRIFT|MANTA|SHERL

?>
<?php
$action = $_GET["action"];
$cs = $_GET["cs"];

debugStartClean();

switch ($action){
	case "positions" :
		getPositionMarkers($db);
		break;
	case "track":
		getTrack($db, $cs);
		break;
	default:
		break;
}

function getTrack($db, $cs){
	if (!$db->connect()) {
		$db->print_last_error(false);
	}

	$paramFrom = mysql_escape_string(strtoupper($_GET["from"]));
	$paramTo = mysql_escape_string(strtoupper($_GET["to"]));

	$paramRoute = array();
	if ($_GET["route"]!= "DCT,VFR") {
		$paramRoute = explode("|",mysql_escape_string(strtoupper($_GET["route"])));
	}
	debug($paramRoute);

	$lines = array();
	$points = array();
	$bounds = array();

	$sqlRoute = "SELECT n.ICAO, n.NAME, n.LAT, n.LON, t.TYPE as NAVTYPE, 0 as ID FROM xplane_navaids n LEFT JOIN xplane_navtypes t ON n.NAVTYPEID = t.ID WHERE NAVTYPEID=1 AND ICAO = '$paramFrom'";

	for ($i = 0; $i < count($paramRoute); $i++) {
		if (strpos($paramRoute[$i], ',')>0 ) {
			$latLng = explode(',', $paramRoute[$i]);
			$sqlRoute .= " UNION SELECT '$paramRoute[$i]' as ICAO, 'GPS' as NAME, $latLng[0] as LAT, $latLng[1] as LON, 'GPS' as NAVTYPE, " . ($i + 1) ." as ID FROM xplane_navaids n LEFT JOIN xplane_navtypes t ON n.NAVTYPEID = t.ID ";
		} else {
			$sqlRoute .= " UNION SELECT n.ICAO, n.NAME, n.LAT, n.LON, t.TYPE as NAVTYPE, " . ($i + 1) ." as ID FROM xplane_navaids n LEFT JOIN xplane_navtypes t ON n.NAVTYPEID = t.ID WHERE ICAO = '" . $paramRoute[$i] . "' ";
		}
	}
	$sqlRoute .= " UNION SELECT n.ICAO, n.NAME, n.LAT, n.LON, t.TYPE as NAVTYPE, " . ++$i ." as ID FROM xplane_navaids n LEFT JOIN xplane_navtypes t ON n.NAVTYPEID = t.ID WHERE NAVTYPEID=1 AND ICAO = '$paramTo'";
	$inputCount = $i;
	
	$r = $db->select($sqlRoute . ";");
	debug($db->last_error);
	debug($db->last_query);

	$route = new Route();
	while ($row = $db->get_row($r, 'MYSQL_ASSOC')) {
		//$arr = array ('icao'=>$row["ICAO"],'n'=>$row["NAME"],'lat'=>$row['LAT'],'lng'=>$row['LON']);
		$wp = new Waypoint($row);
		$route->addWp($wp);
	}
	//debug($route);

	/*
	$a =$route->getGroupIndex($paramFrom . "|0");
	$b = $route->getGroupIndex($paramTo . "|$inputCount");
	$c = $route->getGroupCount();
	*/
	if ( $route->getGroupIndex($paramFrom . "|0") == 0 && $route->getGroupIndex($paramTo . "|$inputCount") == $route->getGroupCount()-1) {

		$finalRoute = array();
		foreach ($route->wpGroups as $id => $wpg) {
			debug("$id $wpg->id:" . count($wpg->waypoints));
			if (count($wpg->waypoints)>1) {
				$nearestWp = $route->getNearesWpFromGroup($wpg);
				//debug($nearestWp);
				array_push($finalRoute, $nearestWp);
			} else {
				array_push($finalRoute, $wpg->getWp());
			}
		}

		//debug($finalRoute);
	
		/*
		 if (count($points)>2){
		 //print_r($points);
		 $to = array_splice($points, 1,1);
		 //print_r($to);
		 //print_r($points);

		 array_push($points, $to[0]);
		 }
		 */

		//loop all waypoints
		foreach ($finalRoute as $waypoint) {
			array_push($points, $waypoint->asJSON());
			debug("$waypoint");
		}

		$config = array('colour'=>'#FF0000', 'width'=>2, 'points'=>$points, 'cs' => $cs);
		array_push($lines, $config);


	} else {
		debug("Departure or Destination missing");
	}
	$data = array('lines'=>$lines);
	echo json_encode($data);
	//debug($data);
}



function getPositionMarkers($db) {
	if (!$db->connect()) {
		$db->print_last_error(false);
	}

	$markers = array();

	//$r = $db->select("SELECT * FROM `xfsd_positions` ORDER BY ID DESC Limit 1");

	$sql = <<< EOT
SELECT TIMEstampdiff(second, c.timestamp, now()), c.*, f.ID, f.DEST, p.CALLSIGN, f.ICAO
  FROM
    xfsd_coords c
    join xfsd_flights f on f.id=c.flightid
    join xfsd_pilots p on p.id=f.pilotid
  WHERE c.timestamp > timestampadd(second, -10, now())
  ORDER BY c.timestamp;
EOT;

	//$r = $db->select("SELECT  xfsd_flights.ID, xfsd_positions.LAT, xfsd_positions.LON, xfsd_positions.ALT, xfsd_positions.KIAS, xfsd_positions.HDG, xfsd_pilots.CALLSIGN, xfsd_pilots.ICAO FROM xfsd_flights AS xfsd_flights, xfsd_pilots AS xfsd_pilots, xfsd_positions AS xfsd_positions WHERE xfsd_flights.PILOTID = xfsd_pilots.ID AND xfsd_positions.FLIGHTID = xfsd_flights.ID LIMIT 1");
	$r = $db->select($sql);
	debug($db->last_error);
	debug($db->last_query);

	while ($row=$db->get_row($r, 'MYSQL_ASSOC')) {
		//echo "<p>plane at ".$row['LAT']. " " .$row['LON']. " " . $row['ALT']."</p>";
		//$arr = array ('point'=>"new GLatLng(" . $row['LAT'] . "," . $row['LON'] . ")",'html'=>$row['ALT'],'label'=>$row['ID']);
		//$arr = array ('lat'=>$row['LAT'],'lng'=>$row['LON'],'html'=>$row['ALT'],'label'=>$row['ID']);
		$arr = array ('lat'=>$row['LAT'],'lng'=>$row['LON'],'alt'=>$row['ALT'],'kias'=>$row["KIAS"],'hdg'=>$row["HDG"],'callsign'=>$row['CALLSIGN'],'id'=>$row["ID"], 'plane'=>$row["ICAO"], 'dest'=>$row["DEST"]);
		array_push($markers, $arr);
	}

	$data = array('markers'=>$markers);
	echo json_encode($data);

	debug($data);
}
?>
