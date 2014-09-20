<?php 
class Waypoint {
	public $id;
	public $nr;
	public $icao;
	public $name;
	public $lat;
	public $lng;
	public $type;

	private static $format = "[%3d] [%-5s] [%11s] [%11s] [%-7s] [%s]"; 
	
	function __construct($row){
		$this->nr =	$row["ID"];
		$this->icao = $row["ICAO"];
		$this->name = $row["NAME"];
		$this->lat = $row["LAT"];
		$this->lng = $row["LON"];
		$this->type = $row["NAVTYPE"];
		$this->id = $this->icao . "|" . $this->nr;
	}

	public function __toString(){
		//return "ICAO[$this->icao] \t NR[$this->nr] \t TYPE[$this->type] \t LAT[$this->lat] \t LNG[$this->lng] \t NAME[$this->name]";
		return sprintf(self::$format, $this->nr, $this->icao, sprintf("%+.6f", $this->lat), sprintf("%+.6f", $this->lng), $this->type, $this->name);
	}

	public function asJSON(){
		$arr = array ('icao'=>$this->icao,'n'=>$this->name, 't'=>$this->type, 'lat'=>$this->lat, 'lng'=>$this->lng);
		return $arr;
	}
}
?>
<?php
class WaypointGroup {
	public $id;
	public $waypoints;

	function __construct($id) {
		$this->id = $id;
		$this->waypoints = array();
	}

	function getWp() {
		if (count($this->waypoints)==1) {
			return $this->waypoints[0];
		} else {
			return null;
		}
	}
}
?>
<?php
class Route {
	public $wpGroups;

	function __construct() {
		$this->wpGroups = array();
	}

	function addWp($wp) {
		$groupIndex = $this->getGroupIndex($wp->id);
		if ($groupIndex>-1) {
			array_push($this->wpGroups[$groupIndex]->waypoints, $wp);
		} else {
			$wpg = new WaypointGroup($wp->id);
			array_push($wpg->waypoints, $wp);
			array_push($this->wpGroups, $wpg);
		}
	}

	function getGroupIndex($key) {
		foreach ($this->wpGroups as $k=>$v){
			//debug("$key $k " . $v->id);
			if ($key === $v->id) {
				return $k;
				break;
			}
		}
		return -1;
	}
	
	function getGroupCount() {
		return count($this->wpGroups);
	}

	function getNearesWpFromGroup($g) {
		$prevGrp = $this->getPreviousGroup($g);
		$nextGrp = $this->getNextGroup($g);
		$prev = $prevGrp->getWp();
		$next = $nextGrp->getWp();
		debug("prev: $prev->icao next: $next->icao");
		//loop through all WP in the group and see which one is closest
		$shortestDist = 0;
		$nextWp = null;
		foreach ($g->waypoints as $wp) {
			$distPrev = GC_Calc($prev->lat, $prev->lng, $wp->lat, $wp->lng);
			$distNext = GC_Calc($next->lat, $next->lng, $wp->lat, $wp->lng);
			$distTotal = floatval($distPrev) + floatval($distNext);
			debug("distance for $wp->name \t($wp->type) \t $distPrev \t $distNext \t $distTotal");
			if($shortestDist == 0 || $distTotal < $shortestDist) {
				$shortestDist = $distTotal;
				$nextWp = $wp;
			}
		}
		debug("closest waypoint: $nextWp->name \t at $shortestDist");
		return $nextWp;
	}

	function getPreviousGroup($g){
		$groupIndex = $this->getGroupIndex($g->id);
		$prev = $this->wpGroups[$groupIndex-1];
		if (count($prev->waypoints)>1) {
			return $this->getPreviousGroup($prev);
		} else {
			return $prev;
		}
	}

	function getNextGroup($g){
		$groupIndex = $this->getGroupIndex($g->id);
		$prev = $this->wpGroups[$groupIndex+1];
		if (count($prev->waypoints)>1) {
			return $this->getNextGroup($prev);
		} else {
			return $prev;
		}
	}
}
?>
