// var debug = require('ace/search').debug;
var Range = require("ace/range").Range;
var lang = require("ace/lib/lang")
var oop = require("ace/lib/oop");

function sort_unique(arr) {
    arr = arr.sort(function (a, b) { return a*1 - b*1; });
    var ret = [arr[0].toLowerCase()];
    for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
        if (arr[i-1].toLowerCase() !== arr[i].toLowerCase()) {
            ret.push(arr[i].toLowerCase());
        }
    }
    return ret;
}


var qintents = {items: [

{value: "<tag1>", name: "tag1"},
{value: "<tag2>", name: "tag2"}

]}; 


var mentions = {items: [
 {value: "[tag1]", name: "tag1"},
 {value: "[tag2]", name: "tag2"},


]}; 


var valid_intents=[];
var valid_mentions =  [];
function escape_reg (str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};
var Debug = function() {

  Debug.ALL = 1;
  Debug.SELECTION = 2;
    this.$options = {
        needle: "",
        backwards: false,
        wrap: false,
        caseSensitive: false,
        wholeWord: false,
        scope: Debug.ALL,
        regExp: false
    };
    this.$assembleRegExp = function() {
        if (this.$options.regExp) {
            var needle = this.$options.needle;
        } else {
            needle = lang.escapeRegExp(this.$options.needle);
        }

        if (this.$options.wholeWord) {
            needle = "\\b" + needle + "\\b";
        }

        var modifier = "g";
        if (!this.$options.caseSensitive) {
            modifier += "i";
        }

        var re = new RegExp(needle, modifier);
        return re;
    };
    this.set = function(options) {
        oop.mixin(this.$options, options);
        return this;
    };

    this.parseAll = function(session) {
        var options = this.$options;
        if (!options.needle)
            return [];

        if (options.backwards) {
            var iterator = this.$backwardMatchIterator(session);
        } else {
            iterator = this.$forwardMatchIterator(session);
        }

        var ignoreCursor = !options.start && options.wrap && options.scope == Debug.ALL;
        if (ignoreCursor)
            options.start = {row: 0, column: 0};

        var ranges = [];
        iterator.forEach(function(range) {
            ranges.push(range);
        });

        if (ignoreCursor)
            options.start = null;

        return ranges;
    };

    this.parse = function(session) {
        if (!this.$options.needle)
            return null;

        if (this.$options.backwards) {
            var iterator = this.$backwardMatchIterator(session);
        } else {
            iterator = this.$forwardMatchIterator(session);
        }

        var firstRange = null;
        iterator.forEach(function(range) {
            firstRange = range;
            return true;
        });

        return firstRange;
    };


        this.$forwardMatchIterator = function(session) {
        // var re = this.$assembleRegExp();
        var self = this;

        return {
            forEach: function(callback) {
                self.$forwardLineIterator(session).forEach(function(line, startIndex, row) {
                    if (startIndex) {
                        line = line.substring(startIndex);
                    }
                    
                    var matches = [];

                    if (line.match(/\}\s*[^\s]+/g) || line.match(/corrections here/g) ){
                    if (line.match(/([^\s]+\[|\]+[^\s])/) ){
                            
                            var re = new RegExp("([^\\s]+\\[|\\]+[^\\s])","g");
                            line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });
                    }

                    if (!line.match(/.*\{.*\}.*/) ){  //&& line.match(/correction here/g)
                            var re = new RegExp("dm_main.*<","g");
                            line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });
                    }

                      if (!line.match(/.*<.*-(.*-)?.*>.*/)  ){ //&& line.match(/correction here/g)
                            var re = new RegExp("dm_main.*\\{","g");
                            line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });
                    }



                    var mt=line.match(/\[.*?\]/g)
                    if (mt){ 

                        if(mt.length %2 ==0){
                        for (var i = 0; i < mt.length; i=i+2) {
                                // r=line.match(/\[[^\]]*?\][^\[]*?\[\/[^\]]*?\]/g);
                                var mt2=mt[i+1];
                                var mt3=mt2.replace("/","");
                                if ((mt2[1]!="/") || (mt[i][1]=="/") || (mt3!=mt[i]) ){
                                    var mt1=escape_reg(mt[i]);
                                    var mt2=escape_reg(mt2);
                                    var re = new RegExp(mt1+"[^\[]*?"+mt2,"g");

                                    line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });    
                            }
                        };
                        }
                        else{
                            var re = new RegExp("\\[.*\\]","g");
                            line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });
                        }
                        



                          for (m in mt){ mt[m]=mt[m].replace(/(\[|\]|\/)/g,"");}
                          mt=$.unique(mt);  
                          for (m in mt){

                            try{
                            var cmention =mt[m].toLowerCase();
                            if ($.inArray(cmention, valid_mentions)==-1) {
                              var re=new RegExp(cmention,"g")
                              line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });

                            }

                        }//try
                        catch(err){ alert("invalid character:' "+m+ " 'on line: "+line);}
                        }
                    } 


                    var qint=line.match(/<.*?>/g)
                    if (qint && !line.match(/correction_/g)){ 
                          // for (q in qint){ qint[q]=qint[q].replace(/(<|>|\/)/g,"");}
                            var cintent =qint[0];
                            if ($.inArray(cintent, valid_intents)==-1) {
                              var re=new RegExp(cintent,"i")
                              line.replace(re, function(str) {
                                  var offset = arguments[arguments.length-2];
                                  matches.push({
                                      str: str,
                                      offset: startIndex + offset
                                  });
                                  return str;
                              });

                            }
                    }

                    var swifield=line.split("{")[1];
                    if (swifield) {
                    var query = line.split("{")[1].split("}")[0];
                    query=query.replace(/\[/g,"<").replace(/\]/g,">");
                    var swi= "<q>"+query+"</q>"
                    }  
                     // line.replace(re, function(str) {
                    //     var offset = arguments[arguments.length-2];
                    //     matches.push({
                    //         str: str,
                    //         offset: startIndex + offset
                    //     });
                    //     return str;
                    // });
					
                    for (var i=0; i<matches.length; i++) {
                        var match = matches[i];
                        var range = self.$rangeFromMatch(row, match.offset, match.str.length);
                        if (callback(range))
                            return true;
                    }
                }//if review test
                });
            }
        };
    };

    this.$backwardMatchIterator = function(session) {
        var re = this.$assembleRegExp();
        var self = this;

        return {
            forEach: function(callback) {
                self.$backwardLineIterator(session).forEach(function(line, startIndex, row) {
                    if (startIndex) {
                        line = line.substring(startIndex);
                    }

                    var matches = [];

                    line.replace(re, function(str, offset) {
                        matches.push({
                            str: str,
                            offset: startIndex + offset
                        });
                        return str;
                    });

                    for (var i=matches.length-1; i>= 0; i--) {
                        var match = matches[i];
                        var range = self.$rangeFromMatch(row, match.offset, match.str.length);
                        if (callback(range))
                            return true;
                    }
                });
            }
        };
    };

    this.$rangeFromMatch = function(row, column, length) {
        return new Range(row, column, row, column+length);
    };

    this.$forwardLineIterator = function(session) {
        var searchSelection = this.$options.scope == Search.SELECTION;

        var range = this.$options.range || session.getSelection().getRange();
        var start = this.$options.start || range[searchSelection ? "start" : "end"];

        var firstRow = searchSelection ? range.start.row : 0;
        var firstColumn = searchSelection ? range.start.column : 0;
        var lastRow = searchSelection ? range.end.row : session.getLength() - 1;

        var wrap = this.$options.wrap;
        var inWrap = false;

        function getLine(row) {
            var line = session.getLine(row);
            if (searchSelection && row == range.end.row) {
                line = line.substring(0, range.end.column);
            }
            if (inWrap && row == start.row) {
                line = line.substring(0, start.column);
            }
            return line;
        }

        return {
            forEach: function(callback) {
                var row = start.row;

                var line = getLine(row);
                var startIndex = start.column;

                var stop = false;
                inWrap = false;

                while (!callback(line, startIndex, row)) {

                    if (stop) {
                        return;
                    }

                    row++;
                    startIndex = 0;

                    if (row > lastRow) {
                        if (wrap) {
                            row = firstRow;
                            startIndex = firstColumn;
                            inWrap = true;
                        } else {
                            return;
                        }
                    }

                    if (row == start.row)
                        stop = true;

                    line = getLine(row);
                }
            }
        };
    };

    this.$backwardLineIterator = function(session) {
        var searchSelection = this.$options.scope == Search.SELECTION;

        var range = this.$options.range || session.getSelection().getRange();
        var start = this.$options.start || range[searchSelection ? "end" : "start"];

        var firstRow = searchSelection ? range.start.row : 0;
        var firstColumn = searchSelection ? range.start.column : 0;
        var lastRow = searchSelection ? range.end.row : session.getLength() - 1;

        var wrap = this.$options.wrap;

        return {
            forEach : function(callback) {
                var row = start.row;

                var line = session.getLine(row).substring(0, start.column);
                var startIndex = 0;
                var stop = false;
                var inWrap = false;

                while (!callback(line, startIndex, row)) {

                    if (stop)
                        return;

                    row--;
                    startIndex = 0;

                    if (row < firstRow) {
                        if (wrap) {
                            row = lastRow;
                            inWrap = true;
                        } else {
                            return;
                        }
                    }

                    if (row == start.row)
                        stop = true;

                    line = session.getLine(row);
                    if (searchSelection) {
                        if (row == firstRow)
                            startIndex = firstColumn;
                        else if (row == lastRow)
                            line = line.substring(0, range.end.column);
                    }

                    if (inWrap && row == start.row)
                        startIndex = start.column;
                }
            }
        };
    };

};

function debug_ui (toggle) {
  if (toggle == 'replace') {
    $("#error_replace_term").removeAttr("disabled");
  }
  
  if (toggle == 'debug') {
    $("#error_replace_term").attr("disabled", "disabled");
  }
  
  if (toggle == 'sin_current' || toggle == 'sin_all') {
    $("#dirchooser").css("display", "none");
  }
  
  if (toggle == 'sin_current') {
    $("#debug_select, #debug_wrap, #debug_back").removeAttr("disabled");
  }
  
  if (toggle == 'sin_all' || toggle == 'sin_dir') {
    $("#debug_select, #debug_wrap, #debug_back").attr("disabled", "disabled");
  }
  
  if (toggle == 'sin_dir') {
    $("#dirchooser").css("display", "block");
  }
  
  if (toggle == 'prev_next_debug') {
    $("#next_prev_debug").css("display", "block");
  }
  
  if (toggle == 'error_replace_next') {
    $("#error_replace_next").css("display", "block");
  }
  
  if (toggle == 'error_replace_all_tabs') {
    $("#error_replace_all_tabs").css("display", "block");
  }
  
  if (toggle == 'error_replace_next' || toggle == 'prev_next_debug' || toggle == 'error_replace_all_tabs' || toggle == 'debug_status') {
    $("#debug_submit").css("display", "none");
    $("input[type='text'], input[type='checkbox'], input[type='radio']").attr('disabled', 'disabled');
  }
  
  if (toggle == 'dir_replace') {
    $("#debug_status").css("display", "none");
    $("#debug_status span").html('');
    
    $("#error_replace_status").css("display", "block");
    
    $("#error_replace_status_started").css("display", "none");
    $("#error_replace_status_started span").html('');
  }
  
  if (toggle == 'dir_error_replace_started') {
    $("#error_replace_status").css("display", "none");
    $("#error_replace_status_started").css("display", "block");
  }
  
  if (toggle == 'new_debug') {
    $("#next_prev_debug").css("display", "none");
    $("#error_replace_next").css("display", "none");
    $("#error_replace_all_tabs").css("display", "none");
    $("#debug_status").css("display", "none");
    $("#debug_status span").html('');
    
    $("#error_replace_status").css("display", "none");
    $("#error_replace_status_started").css("display", "none");
    $("#error_replace_status_started span").html('');
    
    $("#debug_submit").css("display", "block");
    $("input[type='text'], input[type='checkbox'], input[type='radio']").removeAttr('disabled');
    
    var stype = $("input[name='stype']:checked").val();
    debug_ui(stype);
    
    dirdebugJob = null;
    dirdebugTask = null;
    debugWorker = null;
    
    $("input[name='sin']:checked").click();
  }
  
  if (toggle == 'debug_status' || toggle == 'error_replace_status') {
    $("#debug_status").css("display", "block");
    
    if (toggle == 'debug_status') {
      $("#debug_status span").html('debuging ...');
    }
    
    else {
      $("#debug_status span").html('Replacing ...');
    }
  }
}

var current_debug;
var current_replace;
var current_range;
var current_backwards;
var debug_options;
var debugWorker = null;
var dirdebugJob = null;
var dirdebugTask = null;

function do_debug () {
  // var needle = $("#debug_term").val();
  var sin = 'all'//  $("input[name='sin']:checked").val();
  // var stype = $("input[name='stype']:checked").val();
  
  // current_replace = $("#error_replace_term").val();
  
  // if (needle == '' && sin != 'dir') {
  //   alert('If I debug for nothing I may find the end of a black hole and kill us all.');
  // }
  
  // else {
    debug_options = {
      wrap: false,
      back: false,
      sensitive: false,
      whole: false,
      regex: false
    }
    
    // for (var key in debug_options) {
    //   if (document.getElementById('debug_' + key).checked) {
    //     debug_options[key] = true;
    //   }
    // }
    
    debug_options['needle'] = "tag errors";
    
    // if (sin == 'current') {
    //   current_debug = false;
    //   // if (stype == 'replace') {
    //   //   debug_ui('error_replace_next');
    //   // }
      
    //   // else {
    //     debug_ui('prev_next_debug');
    //   // }
      
    //   current_range = false;
    //   current_backwards = debug_options['back'];
      
    //   debug_next('forward');
    // }
    
    // else if (sin == 'all') {
    if (sin == 'all') {
      var opts = {
        needle: "tag errors",
        backwards: false,
        wrap: true,
        caseSensitive: debug_options['sensitive'],
        wholeWord: debug_options['whole'],
        scope: 1,
        regExp: debug_options['regex']
      }
      
      current_debug = new Debug().set(opts);
      
      var html = '<div class="title"><em>All Tabs</em><strong>debug For: ' + debug_options['needle'] + '</strong></div>';
      html += '<table>';
      html += '<tr><td><strong>Filename</strong></td><td><strong>Matches</strong></td></tr>';
      
      var item = $("#debug_panel_replace");
      debug_panel.select(item);
      debug_panel.expand(item);
      for (dp in tab_paths) {

      	var mentionslist=[];
      	var intentlist=[];
      	var pname=dp.split("/").reverse()[2];

		intentlist=qintents;mentionslist=mentions;

		// if (pname.match(/review_/)){tab_paths[dp].session.opts.review=true;}
		// else {opts.review=false;}
		valid_intents=[]
		for (var i=0;i<intentlist.items.length;i++){valid_intents.push(intentlist.items[i].value)}
		valid_mentions=[]
		for (var i=0;i<mentionslist.items.length;i++){valid_mentions.push(mentionslist.items[i].name)}
			
		// console.log(valid_mentions.join(" "));
		// console.log(valid_intents.join(" "));

        var ranges = current_debug.parseAll(tab_paths[dp].session);
        
        if (ranges.length > 0) {
          var fn = dp.replace(basedir + "/", "");
          
          lines = '<div class="lines" id="debug_line_results_' + tab_paths[dp].uid + '" style="display: none;">';
          for (var i=0; i < ranges.length; i++) {
            var row = ranges[i].start.row + 1;
            var col = ranges[i].start.column + 1;
            lines += '<a href="javascript: void(0)" onclick="go_to_line(\'' + escape(dp) + '\', ' + ranges[i].start.row + ', ' + ranges[i].start.column + ', ' + ranges[i].end.row + ', ' + ranges[i].end.column + ')">Line ' + row + ', Column ' + col + '</a>';
          }
          
          lines += '</div>';
          html += '<tr>';
          html += '<td><a class="expand" href="javascript: void(0)" onclick="show_line_debug_results(\'' + tab_paths[dp].uid + '\')">' + fn +'</a>' + lines + '</td><td>' + ranges.length + '</td>';
          html += '</tr>';
        }
      }
      
      html += '</table>';
      $("#debug_panel_results").html(html);
      
      size_debug();
      current_range = false;
      
      // if (stype == 'replace') {
      //   debug_ui('error_replace_all_tabs');
      // }
    }
    
    // else if (sin == 'dir') {
    //   var glob = document.getElementById('file_glob').value;
    //   dir_results_started = false;
    //   dir_results_list = [];
      
    //   if (stype == 'debug' && needle == '' && glob == '') {
    //     alert('If I debug for nothing I may find the end of a black hole and kill us all.');
    //   }
      
    //   else if (stype == 'replace' && needle == '') {
    //     alert('If I debug for nothing I may find the end of a black hole and kill us all.');
    //   }
      
    //   else {
    //     debug_ui('debug_status');
        
    //     var dpath = basedir + '/' + $("#picked_dir").val();
        
    //     $.ajax({
    //        type: "POST",
    //        dataType: 'json',
    //        url: "/dir_debug/",
    //        data: {
    //          dir: dpath,
    //          'glob': glob,
    //          'needle': needle,
    //          caseSensitive: debug_options['sensitive'],
    //          wholeWord: debug_options['whole'],
    //          regExp: debug_options['regex'],
    //          'replace': current_replace,
    //        },
    //        success: function (data, textStatus, jqXHR) {
    //          debugWorker = setTimeout(function () { check_debug_status(data.task_id, data.dsid) }, 500);
    //        },
    //        error: function (jqXHR, textStatus, errorThrown) {
    //          alert('Error submitting debug.');
    //          debug_ui('new_debug');
    //        }
    //     });
    //   }
    // }

  // }
  
  return false;
}

function check_debug_status (task_id, dsid) {
  dirdebugJob = dsid;
  dirdebugTask = task_id;
  
  $.ajax({
     type: "POST",
     dataType: 'json',
     url: "/check_debug/",
     data: {
       ds: dsid,
       task: task_id
     },
     success: function (data, textStatus, jqXHR) {
       set_results_dir_debug(task_id, dsid, data.results);
       var stype = $("input[name='stype']:checked").val();
       
       if (data.state == 'complete') {
         if (stype == 'replace') {
           debug_ui('dir_replace');
         }
         
         else {
           debug_ui('new_debug');
         }
       }
       
       else {
         debugWorker = setTimeout(function () { check_debug_status(task_id, dsid) }, 3000);
       }
     },
     error: function (jqXHR, textStatus, errorThrown) {
       debugWorker = setTimeout(function () { check_debug_status(task_id, dsid) }, 3000);
     }
  });
}

function check_error_replace_status (task_id, dsid) {
  dirdebugJob = dsid;
  dirdebugTask = task_id;
  
  $.ajax({
     type: "POST",
     dataType: 'json',
     url: "/check_replace/",
     data: {
       ds: dsid,
       task: task_id
     },
     success: function (data, textStatus, jqXHR) {
       if (data.state == 'complete') {
         alert('Replace Completed');
         debug_ui('new_debug');
       }
       
       else {
         $("#error_replace_status_started span").html('Working On: ' + data.last_file.replace(basedir + "/", ""));
         debugWorker = setTimeout(function () { check_error_replace_status(task_id, dsid) }, 3000);
       }
     },
     error: function (jqXHR, textStatus, errorThrown) {
       debugWorker = setTimeout(function () { check_error_replace_status(task_id, dsid) }, 3000);
     }
  });
}

var dir_results_started = false;
var dir_results_list = [];
function set_results_dir_debug(task_id, dsid, results) {
  if (dir_results_started) {
    var html = '';
    for (j in results) {
      var result = results[j];
      var dp = result[0];
      var uid = result[1];
      var ranges = result[2];
      
      if ($('#debug_tr_'+ uid).length == 0) {
        var fn = result[0].replace(basedir + "/", "");
        html += debug_lines(dp, fn, uid, ranges);
      }
    }
    
    $("#debug_panel_results > table > tbody").append(html);
  }
  
  else {
    dir_results_started = true;
    
    var html = '<div class="title"><em>Directory</em><strong>debug For: ' + debug_options['needle'] + '</strong></div>';
    html += '<table>';
    html += '<tr><td><strong>Filename</strong></td><td><strong>Matches</strong></td></tr>';
    
    var item = $("#debug_panel_replace");
    debug_panel.select(item);
    debug_panel.expand(item);
    
    for (j in results) {
      var result = results[j];
      var dp = result[0];
      var uid = result[1];
      var ranges = result[2];
      var fn = result[0].replace(basedir + "/", "");
      
      html += debug_lines(dp, fn, uid, ranges);
    }
    
    html += '</table>';
    $("#debug_panel_results").html(html);
  }
  
  size_debug();
}

function debug_lines (dp, fn, uid, ranges) {
  var html = '';
  var dpnoa = dp.replace("'", "\\'");
  
  if (dp in dir_results_list) {}
  else {
    dir_results_list.push(dp);
    
    if (ranges.length == 0) {
      html += '<tr id="debug_tr_'+ uid + '">';
      html += '<td><a class="expand" href="javascript: void(0)" onclick="get_file (\'' + dpnoa + '\', new Range(0, 0, 0, 0))">' + fn +'</a></td><td></td>';
      html += '</tr>';
    }
    
    else {
      var lines = '<div class="lines" id="debug_line_results_' + uid + '" style="display: none;">';
      for (var i=0; i < ranges.length; i++) {
        var row = ranges[i][0] + 1;
        var col = ranges[i][1] + 1;
        lines += '<a href="javascript: void(0)" onclick="go_to_line(\'' + escape(dp) + '\', ' + ranges[i][0] + ', ' + ranges[i][1] + ', ' + ranges[i][0] + ', ' + ranges[i][2] + ')">Line ' + row + ', Column ' + col + '</a>';
      }
      
      lines += '</div>';
      
      html += '<tr id="debug_tr_'+ uid + '">';
      html += '<td><a class="expand" href="javascript: void(0)" onclick="show_line_debug_results(\'' + uid + '\')">' + fn +'</a>' + lines + '</td><td>' + ranges.length + '</td>';
      html += '</tr>';
    }
  }
  
  return html
}

function cancel_debug () {
  if (debugWorker) {
    clearTimeout(debugWorker);
    $.ajax({
       type: "POST",
       dataType: 'json',
       url: "/cancel_job/",
       data: {ds: dirdebugJob, task: dirdebugTask, jtype: 'debug'},
       success: function (data, textStatus, jqXHR) {
         if (data.result) {
           alert('Job Killed Successfully!');
         }
         
         else {
           alert('Job Finished Normally!');
         }
         
         debug_ui('new_debug');
       },
       error: function (jqXHR, textStatus, errorThrown) { alert('Error cancelling job'); }
    });
  }
}

function cancel_replace () {
  if (debugWorker) {
    clearTimeout(debugWorker);
    $.ajax({
       type: "POST",
       dataType: 'json',
       url: "/cancel_job/",
       data: {ds: dirdebugJob, task: dirdebugTask, jtype: 'replace'},
       success: function (data, textStatus, jqXHR) {
         alert('Job Killed Successfully!');
         debug_ui('new_debug');
       },
       error: function (jqXHR, textStatus, errorThrown) { alert('Error cancelling job'); }
    });
  }
}

function error_replace_dfiles () {
  debug_ui('dir_error_replace_started');
  $("#error_replace_status_started span").html('Replacing ... ');
  $.ajax({
     type: "POST",
     dataType: 'json',
     url: "/dir_replace/",
     data: {ds: dirdebugJob},
     success: function (data, textStatus, jqXHR) {
       debugWorker = setTimeout(function () { check_error_replace_status(data.task_id, data.dsid) }, 500);
     },
     error: function (jqXHR, textStatus, errorThrown) {
       alert('Error submitting replace.');
       debug_ui('dir_replace');
     }
  });
}

function go_to_line (dp, y1, x1, y2, x2) {
  dp = unescape(dp);
  var range = new Range(y1, x1, y2, x2);
  
  if (dp in tab_paths) {
    $tabs.tabs('select', "#tabs-" + tab_paths[dp].tab);
    var sess = editor_global.getSession();
    //current_debug.findAll(sess);
    sess.getSelection().setSelectionRange(range, false);
  }
  
  else {
    get_file(dp, range);
  }
}

function show_line_debug_results (uid) {
  var div = document.getElementById('debug_line_results_' + uid);
  if (div.style.display == 'none') {
    div.style.display = 'block';
  }
  
  else {
    div.style.display = 'none';
  }
}

function error_replace_next () {
  if (current_range) {
    var sess = editor_global.getSession();
    var input = sess.getTextRange(current_range);
    var replacement = current_debug.replace(input, current_replace);
    if (replacement !== null) {
      current_range.end = sess.replace(current_range, replacement);
    }
  }
  
  debug_next('forward');
}

function error_replace_all (sess) {
  if (!sess) {
    sess = editor_global.getSession();
  }
  
  if (current_range) {
    var y = current_range.end.row + 1;
    var x = current_range.start.column;
    editor_global.gotoLine(y, x);
  }
  
  var ranges = current_debug.findAll(sess);
  
  if (!ranges.length)
    return;
    
  var selection = editor_global.getSelectionRange();
  editor_global.clearSelection();
  editor_global.selection.moveCursorTo(0, 0);

  editor_global.$blockScrolling += 1;
  for (var i = ranges.length - 1; i >= 0; --i) {
    var input = sess.getTextRange(ranges[i]);
    var replacement = current_debug.replace(input, current_replace);
    if (replacement !== null) {
      sess.replace(ranges[i], replacement);
    }
  }
    
  //editor_global.selection.setSelectionRange(selection);
  editor_global.$blockScrolling -= 1;
}

function error_replace_all_tab () {
  for (dp in tab_paths) {
    error_replace_all(tab_paths[dp].session);
  }
}

function debug_next (way) {
  var back = false;
  
  if (current_range) {
    var y = current_range.end.row + 1;
    var x = current_range.end.column;
    
    if ((current_backwards && way == 'forward') || (!current_backwards && way == 'back')) {
      x = current_range.end.column - 1;
    }
    
    editor_global.gotoLine(y, x);
  }
  
  if ((current_backwards && way == 'forward') || (!current_backwards && way == 'back')) {
    back = true;
  }
  
  var opts = {
    needle: "",
    backwards: back,
    wrap: debug_options['wrap'],
    caseSensitive: debug_options['sensitive'],
    wholeWord: debug_options['whole'],
    scope: Debug.ALL,
    regExp: debug_options['regex']
  }
  
  if (current_debug) {
    current_debug.set(opts);
  }
  
  else {
    current_debug = new Debug();
  }
  
  // current_range = current_debug.find(editor_global.getSession());
  current_range = current_debug.parse(editor_global.getSession());
  if (current_range) {
    editor_global.getSession().getSelection().setSelectionRange(current_range, false);
  }
  
  else {
    // alert("The debug of a thousand miles has completed.");
  }
}

function choose_debug_dir () {
  dir_win.center();
  dir_win.open();
  document.getElementById("dir_chooser_dialog").value = '';
  
  return false;
}

function choose_me (d) {
  d = unescape(d);
  
  var v = document.getElementById("dir_chooser_dialog").value;
  if (v == d) {
    document.getElementById("picked_dir").value = d;
    dir_win.close();
  }
  
  else {
    document.getElementById("dir_chooser_dialog").value = d;
  }
}

function choose_dir_ok () {
  var v = document.getElementById("dir_chooser_dialog").value;
  document.getElementById("picked_dir").value = v;
  dir_win.close();
}

function quick_debuger (e) {
  var n = $('#quick_debug').val();
  if (n) {
    var opts = {
      needle: n,
      backwards: false,
      wrap: true,
      caseSensitive: false,
      wholeWord: false,
      scope: Debug.ALL,
      regExp: false
    }
    
    var qdebug = new Debug();
    
    var qrange = qdebug.find(editor_global.getSession());
    if (qrange) {
      editor_global.getSession().getSelection().setSelectionRange(qrange, false);
    }
  }
}

var dir_win;
$(document).ready(function () {
  dir_win = $("#dir_chooser").kendoWindow({title: 'Choose A Directory', modal: true, width: "400px", height: '370px'}).data("kendoWindow");
  $('#dir_chooser > div.browser').fileTree({ root: '', script: '/dirchooser/', expandSpeed: 200, collapseSpeed: 200 }, get_file);
  
  $("#quick_debug").keyup(quick_debuger);
});

