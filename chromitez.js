/*
TODO: 
- jquery-ify more of this bad boy.
- md5/hash the urls
- persist unique color with mite
- give mitez a dna
- reintroduce mite behaviours/ unique characteristics (based off of dna?)
- make them mate
*/

(function(){

  var context = this;

  var $infestor = {

    context: context,

    hive: 'http://mitesrv.nu-ex.com',
    //hive: 'http://localhost:3030',

    mites: [],

    Mite: function(data){
      var _self = this;

      this.dom = null;

      var pixel_to_int = function(str){
        return parseInt(str.match(/[0-9]*/)[0]);
      }

      this.next_duration = function(){
        var max_duration = 5000;
        var min_duration = 1000;
        return Math.floor(min_duration + (Math.random() * min_duration));
      }

      this.next_position = function(){
      
        // TODO: we should look into why all the mitez want to go hump in one corner. but who could blame them?
      
        var min_distance = 20;
        var max_distance = 100;
        var x = pixel_to_int(_self.dom.style.left);
        var y = pixel_to_int(_self.dom.style.top);
        var field_width = context.innerWidth;
        var field_height = context.innerHeight;
        var x_max = x + max_distance
        var x_min = x - min_distance
        var y_max = y + max_distance
        var y_min = y - min_distance
        var next_x = Math.floor(x_min + (Math.random() * (x_max - x_min)))
        var next_y = Math.floor(y_min + (Math.random() * (y_max - y_min)))
        if (next_x > field_width) next_x = (field_width - _self.dom.style.width);
        if (next_x < 0) next_x = 0
        if (next_y > field_height) next_y = (field_height - _self.dom.style.height);
        if (next_y < 0) next_y = 0
        return {x: next_x + 'px', y: next_y + 'px'}
      }

      this.spawn = function(){
        var body_tag = document.getElementsByTagName('body')[0];
        var mite_dom = document.createElement('div');
        mite_dom.setAttribute('class', 'mite');
        mite_dom.style.width = '10px';
        mite_dom.style.height = '10px';
        mite_dom.style.position = 'fixed';
        mite_dom.style.top = $infestor.rand(context.innerHeight) + 'px';
        mite_dom.style.left = $infestor.rand(context.innerWidth) + 'px';
        var r = $infestor.rand(255);
        var g = $infestor.rand(255);
        var b = $infestor.rand(255);
        var a = $infestor.rand(100) / 100.0;
        mite_dom.style.backgroundColor = 'rgba('+r+','+g+','+b+','+a+')';
        body_tag.appendChild(mite_dom);
        _self.container = body_tag;
        _self.dom = mite_dom;
        
        
      // Future Jquery powered version !!:
        //var color = 'rgba('+r+','+g+','+b+','+a+')';
        //$('body').append("<div class='mite' style='top:"+$infestor.rand(context.innerHeight)+"px;left:"+$infestor.rand(context.innerWidth)+"px;background-color:"+color+"'></div>")
        
      }

      this.move = function(){
        var position = _self.next_position();
        //_self.dom.style.left = position.x;
        //_self.dom.style.top = position.y;
        
        $(_self.dom).stop().animate({"left":position.x, "top":position.y}, 1000);
        
        setTimeout(_self.move, _self.next_duration());
      }
    },

    /*!
    Math.uuid.js (v1.4)
    http://www.broofa.com
    mailto:robert@broofa.com

    Copyright (c) 2010 Robert Kieffer
    Dual licensed under the MIT and GPL licenses.
    */
    uuid: function(){
      // Private array of chars to use
      var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

      // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
      // by minimizing calls to random()
      var chars = CHARS, uuid = new Array(36), rnd=0, r;
      for (var i = 0; i < 36; i++) {
        if (i==8 || i==13 ||  i==18 || i==23) {
          uuid[i] = '-';
        } else {
          if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
          r = rnd & 0xf;
          rnd = rnd >> 4;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
      return uuid.join('');
    },

    rand: function(limit){
      return Math.floor(Math.random() * limit);
    },

    log: function(str){
      if(typeof(console) != 'undefined') console.log(str);
    },

    key: function(){
      if(typeof(localStorage['infestor_key']) == 'undefined') {
        localStorage['infestor_key'] = $infestor.uuid();
      }
      return localStorage['infestor_key'];
    },

    uri: context.location.href,

    infest: function(){
      this.log('Calling mitez... ');
      
      var url = this.hive + '/infest';
      var params = 'key=' + this.key() + '&uri=' + this.uri;
      
      chrome.extension.sendRequest({'action': 'mitez_infest', 'url':url, 'params':params}, this.infestResponse);
    },
    
    infestResponse: function(data) {
      if(data !== null) {
        data = JSON.parse(data);
        $infestor.spawn_mites(data);
        $infestor.log('Infested!');
      } else {
        $infestor.log('FAILED');
      }
    },

    add_mite: function(data){
      mite = new this.Mite(data);
      mite.spawn();
      this.mites.push(mite);
    },

    bring_to_life: function(){
      for(i in this.mites){
        this.mites[i].move();
      }
    },

    spawn_mites: function(data){
      for(i in data.mites) {
        this.add_mite(data.mites[i]);
      }
      this.bring_to_life();      
    }
  }

  $infestor.log('Infestor Initialized');
  $infestor.log('Infestor Key: ' + $infestor.key());
  $infestor.log('    Hive URI: ' + $infestor.hive);
  $infestor.log(' Current URI: ' + $infestor.uri);

  $infestor.infest();

})();
