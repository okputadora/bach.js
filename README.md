## Steps

1. - [x] get definitive list of pieces from allMusic
1. - [x] scrape musicXML files from musescore (lets start with all JS BACH)
1. - [x] Save scores to fs
1. - [x] convert to xml to json
1. - [x] parse meaningful information???

- Need to grab the time signature - [ ]
- Grab octave from each note - [ ]
- Grab accidental - [ ]
- Apply accidental based on key sig.
- Apply accidental if the prev note was accidental and current note is not natural (Thats how they write sheet music, yeah?)

1. - [x] generate statistics (e.g. give key of A and note D of duration 1/4 the next most likely note is E for duration 1/8 or whatever)
1. - [x] build new songs
1. - [x] output/play new songs

## Project Structure

1. scrapeCompNames.js
1. scrapeSheetMusic.js
1. downLoadSheetMusic.js
1. unzip.js
1. parse.js
1. createMusic.js
