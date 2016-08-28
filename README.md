# OpticsSandbox
A simulation of light paths through optical elements for educational purposes.

## Usage For Deployment
Add an opticsSandbox div to an html document. This is used as an anchor to build the rest of the html elements from within javascript.

``` html
<div class="opticsSandbox"></div>
```

## Running Locally
1. Clone the repository
2. Open a terminal and navigate to the cloned directory.
3. Run the command below to launch a local HTTP server. If you simply try to open OpticsSandbox.html, you'll get Same Origin Policy warnings for trying to load files from your local system.
```
python -m SimpleHTTPServer
```
4. Open a browser and go to
```
localhost:8000/OpticsSandbox.html
```
