# NetJSON Demo

[![Travis (.org) branch](https://img.shields.io/travis/kutugu/netjsondemo/master.svg)](https://travis-ci.org/KuTuGu/NetJSONDemo)
[![Coverage Status](https://coveralls.io/repos/github/KuTuGu/NetJSONDemo/badge.svg?branch=master)](https://coveralls.io/github/KuTuGu/NetJSONDemo?branch=master)
![Download](https://img.shields.io/npm/dt/npm-test-publish-netjsondemo.svg)
![NPM](https://img.shields.io/npm/v/npm-test-publish-netjsondemo.svg)
![Language](https://img.shields.io/badge/language-javascript-orange.svg)
       
[![NPM](https://nodei.co/npm/npm-test-publish-netjsondemo.png)](https://nodei.co/npm/npm-test-publish-netjsondemo/)
         
![img](/examples/data/netjsongraph.png)
![img](/examples/data/netjsonmap.png)
![img](/examples/data/netjsonindoormap.png)
Demo roughly reproduces the basic functions of the code base -- [netjsongraph.js](https://github.com/netjson/netjsongraph.js) using [EchartsJS](https://github.com/apache/incubator-echarts) and [LeafletJS](https://github.com/Leaflet/Leaflet). In addition, with the built-in features of the Echarts library, some small features have been added.

### Install

```
npm install
npm run start

npm run build
```

### Arguments

netjsongraph.js accepts two arguments.

- url (required, string): URL to fetch the JSON data from. 
               
	JSON format used internally based on [networkgraph](http://netjson.org/rfc.html#rfc.section.4), but a little different: more occupied names as follows：
```JS
{
    nodes: [{
        properties ? : {
            // Define node category
            category ? : String,
            
            /* 
                Define the geographic coordinates of the node.
                Required when rendering a map.
            */
            location ? : {
                lng: Float,
                lat: Float,
            },

            // Define node updated time
            time ? : String
        }
    }],
    links: [{
        properties ? : {
            // Define link updated time
            time ? : String
        }
    }]
    flatNodes ? : {
        <node id>: node Object
    }  
}
```

- options (optional, object): custom options described below
    - el: Container element. "body" defaultly.
    - metadata: Whether to show NetJSON NetworkGraph metadata or not, defaults to true
    - svgRender: Use SVG render?

    - echartsOption: A global configuration of Echarts.

    - graphConfig: Configuration of graph series(graphRender).

    - mapCenter: Map init center.
    - mapZoom: Map init zoom.
    - mapRoam: Is Map can zoom or move?
    - mapTileConfig: Map tiles config array, whose format is [url, option].
    - mapLineConfig: Support multiple lines superimposed style.
    - mapNodeConfig: Map node style.      
    
    - nodeSize: The size of nodes in pixel.
    - nodeStyleProperty: Used to custom node style.
    - linkStyleProperty: Used to custom link style.

    - onInit: Callback function executed on initialization.
    - onLoad: Callback function executed when rendered.
    - prepareData: Callback function executed after data has been loaded. Used to convert data to NetJSON Data normally.
    - onClickElement: Called when a node or link is clicked.

### New features added

#### Realtime Update

If you want to update the data in real time, you have to realize realtime updated algorithm because of its customizable.
Then you only need call `JSONDataUpdate` to update the view.

For show, I write a demo [here](https://kutugu.github.io/NetJSONDemo/examples/netjson-updateData.html).
I use [socket.io](https://socket.io/) to monitor data changes, which supports WebSocket or polling. 
And I build a simple local server using the express framework and nodeJS. Before testing, you need to open it. 

The code to build a local server can be found [here](https://github.com/KuTuGu/NetJSONDemo/tree/master/examples/data/netjsonnode/).

Execute in this directory:

```
npm install

node index.js
```

Then open the demo page, you will find that the nodes and links in the view change after 5 seconds.

This is just a demo, you can also customize other events to trigger data changes.

#### Search elements

If you want to add search elements function, you just need to pass the url as param to `searchElements`, which will return a function `searchFunc`.
Then you just need to obtain the value input, and pass it to the `searchFunc`.
`searchFunc` is similar to JSONDataUpdate, you can also set `appendData` and `isRaw` params according to different conditions.

The view will change if the value is valid, and you can also click the back button of browser to go back.

#### DateParse

The `dateParse` function is built in `utils` to parse a date string to the browser's current time zone based on the incoming matching rules.
For convenience, The exec result must be a array -- [date, year, month, day, hour, minute, second, millisecond?]

### Example Usage

```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>netjsongraph.js: basic example</title>
    <meta charset="utf-8">
    <!-- theme can be easily customized via css -->
    <link href="../src/css/netjsongraph-theme.css" rel="stylesheet">
    <link href="../src/css/netjsongraph.css" rel="stylesheet">
</head>
<body>
    <script type="text/javascript" src="../dist/netjsongraph.min.js"></script>
    <script type="text/javascript">
        const graph = new NetJSONGraph("../src/data/netjson-multipleInterfaces.json", {
            render: graphRender,
        });
        graph.render();
    </script>
</body>
</html>
```

### Different Demos

[NetJSON graph base Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsongraph.html)

[NetJSON graph elements legend Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsongraph-elementsLegend.html)
     
[NetJSON map base Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsonmap.html)
         
[NetJSON bigData Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-bigData.html)
         
[NetJSON multiple interfaces Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-multipleInterfaces.html)       

[NetJSON dataParse Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-dateParse.html)

[NetJSON updateData realtime Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-updateData.html)

[NetJSON switch render mode Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-switchRenderMode.html)

[NetJSON switch graph mode Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-switchGraphMode.html)

[NetJSON search elements Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-searchElements.html)

[NetJSON map animation lines Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsonmap-animation.html)

[NetJSON indoormap Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsonmap-indoormap.html)

[NetJSON map plugins Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsonmap-plugins.html)


