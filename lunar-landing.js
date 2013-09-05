G.F.loadMain = function () {
    
    this.AI = G.F.mainAI;

    G.KB.addKeys('LEFT','RIGHT','SPACE', 'R');
    
    G.setState({ fuel: 100, horizontalSpeed: 0, verticalSpeed: 0, surfaces: [], landed: '' });
    
    G.makeGob('viewport', G, 'DIV', document.getElementById('lunarLandingGameContainer'))
     .setVar({x:0, y:0, w:480, h:320})
     .setStyle({backgroundColor:'#000000',position:'relative'})
     .turnOn();
     
    G.makeGob('fuel', G.O.viewport)
     .setVar({x:0, y:0, h:50, w:200, AI:G.F.fuelAI})
     .setSrc("fuel: "+G.S.fuel)
     .setStyle({color: 'green', textAlign: 'left'})
     .turnOn();
    
    G.makeGob('ship', G.O.viewport)
     .setVar({x:227, y:15, z:100, w:26, h:30, AI:G.F.shipAI})
     .setVar({nextSrc:'<div id="shipCabin"></div><div id="shipWings"></div><div id="shipBody"></div>'})
     .turnOn();
    
    G.makeGob('thrusterLeft',G.O.viewport)
    .setVar({x:-100, y:-100, w:12, h:4, AI:G.F.thrusterLeftAI})
    .setStyle({backgroundColor:'yellow'});
    
    G.makeGob('thrusterRight',G.O.viewport)
    .setVar({x:-100, y:-100, w:12, h:4, AI:G.F.thrusterRightAI})
    .setStyle({backgroundColor:'yellow'});
    
    G.makeGob('rocket',G.O.viewport)
    .setVar({x:-100, y:-100, w:8, h:12, AI:G.F.rocketAI})
    .setStyle({backgroundColor:'yellow'});

    G.makeGob('explosion',G.O.viewport)
     .setState({frame:0})
     .setVar({x:-100, y:-100, w:4, h:12, AI:G.F.explosionAI})
     .turnOn();
    
    G.makeGob('result',G.O.viewport)
//		     .setVar({x:40,y:20,z:200, w:400,h:280, AI:G.F.resultAI})
     .setState({frame:0})
     .setVar({x:240,y:160,z:200, w:0,h:0, AI:G.F.resultAI})
     ;
    
    G.makeGob('result_status', G.O.result)
    .setSrc("...")
    .setVar({x:0,y:10,w:400,h:100})
    .turnOn()
    ;

    G.makeGob('result_rejugar', G.O.result)
    .setSrc("Prem <b>R</b> per tornar a jugar!")
    .setVar({x:0,y:220,w:400,h:60})
    .turnOn()
    ;
    
    G.makeGob('control_rocket', G.O.viewport)
    .setVar({x:100,y:160,w:280,h:160})
    .turnOn()
    ;
    G.makeGob('control_thursterLeft', G.O.viewport)
    .setVar({x:0,y:0,w:100,h:320})
    .turnOn()
    ;
    G.makeGob('control_thursterRight', G.O.viewport)
    .setVar({x:380,y:0,w:100,h:320})
    .turnOn()
    ;
    

    for (var i = 0; i < 10; i++) {

    	var h= (Math.random() * 80); h= Math.sqrt(h*h) &-1;
    	var im= Math.random() < 0.4;
    	var clazz;
    	
    	if (!im) {
        	G.S.surfaces[i]= 320 - h;
        	clazz= 'surface';
    	} else {
    		G.S.surfaces[i]= 0;
        	clazz= 'impracticable';
    	}
    	
        G.makeGob('surface'+i, G.O.viewport)
         .removeClass('surface')
         .removeClass('impracticable')
         .setVar({x:i*48, y:320-h, w:48, h:h})
         .setState({i: i})
         .addClass(clazz)
         .turnOn();

    }
}; 


G.F.mainAI = function () {
	
	var t= this;
	var bum= false;
		
	G.O.ship.AI();

	G.O.thrusterLeft.AI();
	G.O.thrusterRight.AI();
	G.O.rocket.AI();
	
	G.O.fuel.AI();
	G.O.explosion.AI();
	
	if (!G.S.landed)
	{
		if (G.O.ship.y > 320 || G.O.ship.y < -100) {
			G.S.landed= "stranded";
		} else
		for (i=0; i < 10; i++) {

	        surface=G.O['surface' + i];
	        
	        if (G.O.ship.checkIntersection(surface) ) {

	        	if (G.S.surfaces[i] < G.O.ship.y + 25 
	        			|| G.O.ship.x < i*48 || (i+1) * 48 < G.O.ship.x + 26
	        			|| Math.abs(G.S.verticalSpeed) > 3
	        			|| Math.abs(G.S.horizontalSpeed) > 2 
	        	) {
	        		G.S.landed= 'crashed';
	                G.O.ship.turnOff();
	                G.O.explosion.setVar({x: G.O.ship.x + 6, y:G.O.ship.y + 8}).AI('reset').turnOn();
	        	} else {
	        		G.S.landed= 'successful';
	        		G.S.horizontalSpeed= 0;
	        		G.S.verticalSpeed= 0;
	        	}
	        }

	    }
	}
	
	G.O.result.AI();
	
};


G.F.fuelAI = function () {
	var t= this;
	
	if (G.S.fuel < 50) {
		t.setStyle({color: 'yellow'});
	} 
	if (G.S.fuel < 15) {
		t.setStyle({color: 'red'});
	}
	t.setSrc("fuel: "+G.S.fuel
		//	+" / "+ Math.floor(G.S.horizontalSpeed*10)/10 + "<->, ^v" + Math.floor(G.S.verticalSpeed*10)/10
		//	+" | "+G.O.explosion.on
	).draw();
};

G.F.shipAI = function () {
	
	var s= G.O.ship;
	var gameSpeed= 5;
	
	if (!G.S.landed) {
		G.S.verticalSpeed+= .3;
	}
	s.setVar({x: s.x + G.S.horizontalSpeed/gameSpeed, y: s.y + G.S.verticalSpeed/gameSpeed}).draw();
	
};

G.F.thrusterLeftAI = function () {
	
	var t= this;
	var s= G.O.ship;
	
	if ((G.KB.keys.LEFT.isPressed || G.O.control_thursterLeft.tagContainsMouseDown()) 
			&& G.S.fuel && !G.S.landed) {
		G.O.thrusterLeft.setVar({x: s.x -12, y:s.y + 18}).turnOn();
		G.S.fuel--;
		G.S.horizontalSpeed++;
    } else {
    	G.O.thrusterLeft.turnOff();
    }
	
};


G.F.thrusterRightAI = function () {
	
	var t= this;
	var s= G.O.ship;
	
	if ((G.KB.keys.RIGHT.isPressed  || G.O.control_thursterRight.tagContainsMouseDown()) 
			&& G.S.fuel && !G.S.landed) {
		G.O.thrusterRight.setVar({x: s.x + 26, y:s.y + 18}).turnOn();
		G.S.fuel--;
		G.S.horizontalSpeed--;
    } else {
    	G.O.thrusterRight.turnOff();
    }

};


G.F.rocketAI = function () {
	
	var t= this;
	var s= G.O.ship;
	
	if ((G.KB.keys.SPACE.isPressed || G.O.control_rocket.tagContainsMouseDown()) 
			&& G.S.fuel && !G.S.landed) {
		G.O.rocket.setVar({x: s.x + 9, y:s.y + 30}).turnOn();
		G.S.fuel--;
		G.S.verticalSpeed--;
    } else {
    	G.O.rocket.turnOff();
    }
	
};



G.F.explosionAI  = function (cmd) {
    
    var t=this;
    var F;

    if (cmd == 'reset') {
        t.setState({frame:0}).setVar({ tx:0, ty:0, tw:0, th:0 }).draw();
    }

    else {
        
        if (!t.on) {
            return t;
        }

        F=t.S.frame;
        
        if (F < 8) {

            t.setVar({ tx:-(F*F+1), ty:-(F*F+1), tw:F*F*2+2, th:F*F*2+2 }).draw();
        }
        else {
            t.turnOff();
        }
        
        t.S.frame++;

    }
    
    return t;

};

G.F.resultAI = function (cmd) {
	
	var t= this;
	
	if (G.S.landed) {
		if (t.S.frame == 0) {
			if (G.S.landed == "successful") {
				G.O.result_status
					.setSrc("ENORABONA!<br /><br />Has completat la missió amb èxit!")
					.setStyle({color: 'green'})
					.draw()
					;				
			} else
			if (G.S.landed == "stranded") {
				G.O.result_status
				.setSrc("PERDUT!<br /><br />T'has perdut en la inmensitat de la lluna!")
				.setStyle({color: 'yollow'})
				.draw()
				;				
			} else
			if (G.S.landed == "crashed") {
				G.O.result_status
				.setSrc("DESASTRE!<br /><br />Has estrellat el modul llunar!")
				.setStyle({color: 'red'})
				.draw()
				;				
			} 
			t.S.frame++;
		} else if (t.S.frame < 24) {
			t.S.frame++;
		} else if (t.S.frame <= 48){
			
//		     .setVar({x:40,y:20,z:200, w:400,h:280, AI:G.F.resultAI})
			var progress= (t.S.frame - 24) / 24;
			var w= 400 * progress;
			var h= 280 * progress;
			
			if (!t.on) {
				t.turnOn();
			}
			
			t.setVar({ tx:-w/2, ty:-h/2, tw:w, th:h }).draw();
			
			t.S.frame++;
			
		} 
	} 
	
	if (G.KB.keys.R.wasPressed || t.tagContainsMouseClick()) {
		t.turnOff();
		G.F.loadMain();
	}
	
	return t;
	
};


G.makeBlock('main', G.F.loadMain).loadBlock('main');