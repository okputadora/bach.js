## Steps 

1. - [ ] scrape musicXML files from musescore (lets start with all 
JS BACH)
  * For the scrape it seems like all we need to do is figure out the score id of all Bach compositions and then 
  ```
  var el = document.querySelector(href="/score/2184946/download/mxl");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", el.href, false);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.send();
    return xhr.responseText;
}, function cb(data){
    var fs = require("fs");
    fs.writeFileSync(`${scoreName}.zip}`, data, "binary");
})

  ```
1. - [ ] convert to xml to json
1. - [ ] parse meaningful information???
1. - [ ] generate statistics (e.g. give key of A and note D of duration 1/4 the next most likely note is E for duration 1/8 or whatever)
1. - [ ] build new songs 
1. - [ ] output/play new songs