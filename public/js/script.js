"use strict"

    let styleStart = {
        position:           "relative",
        left :              "-1000px",
        opacity:            0,
        color:              "#ffffff",
        padding:            "10px 20px"
    }
    
    let styleEnd ={
        left:  0,
        opacity: 1
    }
    
   $("#myimage").css(styleStart);
   $("#myimage").animate(styleEnd, 2000);


