<?php
/*
    GC_Calc()

Calculates the distance over the surface of a sphere between two
sets of lats & lons

Inputs are in decimal degrees; output is in minutes of arc.
*/
function GC_Calc( $lat, $lon, $lat1, $lon1 )
{
    global $debugmode;

// do all this once...
    $rlat  = deg2rad( $lat  );
    $rlon  = deg2rad( $lon  );
    $rlat1 = deg2rad( $lat1 );
    $rlon1 = deg2rad( $lon1 );

// calculate the angular distance
    $drad = acos( ( sin($rlat)*sin($rlat1) ) + ( cos($rlat)*cos($rlat1)*cos($rlon-$rlon1) ) );

    if ( is_nan( $drad ) ) $drad = 0;

// drad is distance in radians at this point, so convert to nautical miles before returning
// Note that we're taking advantage of the fact that 1 nm = ~1 minute of arc (1/60 degree)
    $dist = rad2deg( $drad ) * 60.0;

//if ( $debugmode == "ENABLED" )
//    print "\n lat=$lat  lon=$lon  lat1=$lat1  lon1=$lon1  dist=$dist <br>";

    return ( $dist );
}
?>