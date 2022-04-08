(function () {
    /**
     * vanilla JS implementation of jQuery.extend()
     */
    echarts._extend = function(defaults, options) {
        var extended = {},
            prop;
        for(prop in defaults) {
            if(Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for(prop in options) {
            if(Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    /**
     *
     * @param  {number}      number     
     * @param  {number}      digit      min digit
     * @param  {string}      filler          
     */
    echarts._numberMinDigit = function(number, digit = 2, filler = "0") {
        return (Array(digit).join(filler) + number).slice(-digit);
    }
    
    /**
     * netjsongraph.js main function
     *
     * @constructor
     * @param  {string|object}      JSONParam       The NetJSON file or url
     * @param  {object}             opts            The object with parameters to override {@link d3.netJsonGraph.opts}
     */
    echarts.netGraphChart = function(JSONParam, opts) {
        /**
         * Default options
         *
         * @param  {string}            el                  body        The container element                                  el: "body" [description]
         * @param  {bool}              metadata            true        Display NetJSON metadata at startup?
         * @param  {bool}              defaultStyle        true        Does node use default css style? If not, you can income the style with JSON. 
         * @param  {bool}              svgRender           false       Switch to Svg mode render?
         * @param  {string}            listenUpdateUrl     ""          listen the url to update JSONData.
         * @param  {object(RegExp)}    dateRegular         /(?:)/      Analyze date format.The exec result must be [date, year, month, day, hour, minute, second, millisecond?]
         * @param  {float}             gravity             0.1         The gravitational strength to the specified numerical value. @see {@link https://github.com/mbostock/d3/wiki/Force-Layout#gravity}
         * @param  {int|array}         edgeLength          [20, 60]    The distance between the two nodes on the side, this distance will also be affected by repulsion. @see {@link https://echarts.apache.org/option.html#series-graph.force.edgeLength}
         * @param  {int|array}         repulsion           200         The repulsion factor between nodes. @see {@link https://echarts.apache.org/option.html#series-graph.force.repulsion}
         * @param  {int}               circleRadius        8           The radius of circles (nodes) in pixel
         * @param  {int}               labelDx             0           node labels offsetX(distance on x axis) in graph. @see {@link https://echarts.apache.org/option.html#series-graph.label.offset}
         * @param  {int}               labelDy             -10         node labels offsetY(distance on y axis) in graph.
         * @param  {object}            nodeStyleProperty   {}          Used to custom node style. @see {@link https://echarts.apache.org/option.html#series-graph.data.itemStyle}
         * @param  {object}            linkStyleProperty   {}          Used to custom link style. @see {@link https://echarts.apache.org/option.html#series-graph.links.lineStyle}
         * @param  {function}          onInit                          Callback function executed on initialization
         * @param  {function}          onLoad                          Callback function executed after data has been loaded
         * @param  {function}          prepareData                     Used to convert NetJSON NetworkGraph to the javascript data
         * @param  {function}          onClickNode                     Called when a node is clicked
         * @param  {function}          onClickLink                     Called when a link is clicked
         */
        opts = echarts._extend({
            metadata: true,
            defaultStyle: true,
            // animationAtStart: true,
            mapModeRender: false, 
            svgRender: false,
            scaleExtent: [0.25, 18],
            // charge: -130,
            // linkDistance: 50,
            // linkStrength: 0.2,
            // friction: 0.9,  // d3 default
            // chargeDistance: Infinity,  // d3 default
            // theta: 0.8,  // d3 default
            gravity: 0.1,
            edgeLength: [20, 60],
            repulsion: 120,
            circleRadius: 5,
            labelDx: 0,
            labelDy: -10,
            nodeStyleProperty: {},
            linkStyleProperty: {},
            /**
             * @function
             * @name onInit
             *
             * Callback function executed on initialization
             * @param  {string|object}  JSONParam     The netJson remote url or object
             * @param  {object}         opts          The object of passed arguments
             * @return {function}
             */
            onInit: function(JSONParam, opts) {},
            /**
             * @function
             * @name onLoad
             *
             * Callback function executed after data has been loaded
             * @param  {string|object}  JSONParam     The netJson remote url or object
             * @param  {object}         opts          The object of passed arguments
             * @return {function}
             */
            onLoad: function(JSONParam, opts) {},
            /**
             * @function
             * @name prepareData
             *
             * Convert NetJSON NetworkGraph to the data structure consumed by d3
             *
             * @param JSONData  {object}
             */
            prepareData: function(JSONData) {},
            /**
             * @function
             * @name onClickNode
             *
             * Called when a node is clicked
             */
            onClickNode: function(node) {
                if(!nodeLinkOverlay){
                    nodeLinkOverlay = document.createElement("div");
                    nodeLinkOverlay.setAttribute("class", "njg-overlay");
                    netGraphContainer.appendChild(nodeLinkOverlay);
                }
                nodeLinkOverlay.style.display = "block";
                nodeLinkOverlay.innerHTML = `
                    <div class="njg-inner">
                        ${nodeInfo(node)}
                    </div>
                `;
                const closeA = document.createElement("a");
                closeA.setAttribute("class", "njg-close");
                closeA.onclick = () => {
                    nodeLinkOverlay.style.display = "none";
                }
                nodeLinkOverlay.appendChild(closeA); 
            },
            /**
             * @function
             * @name onClickLink
             *
             * Called when a node is clicked
             */
            onClickLink: function(link) {
                if(!nodeLinkOverlay){
                    nodeLinkOverlay = document.createElement("div");
                    nodeLinkOverlay.setAttribute("class", "njg-overlay");
                    netGraphContainer.appendChild(nodeLinkOverlay);
                }
                nodeLinkOverlay.style.display = "block";
                nodeLinkOverlay.innerHTML = `
                    <div class="njg-inner">
                        ${linkInfo(link)}
                    </div>
                `;
                const closeA = document.createElement("a");
                closeA.setAttribute("class", "njg-close");
                closeA.onclick = () => {
                    nodeLinkOverlay.style.display = "none";
                }
                nodeLinkOverlay.appendChild(closeA);
            }
        }, opts);

        // Init Callback
        opts.onInit(JSONParam, opts);

        const netGraphContainer = document.getElementById(opts.el) || document.getElementsByTagName("body")[0];  
        // JSONCacheStack store option configuration, nodeLinkOverlay store informationCard DOM.     
        let JSONCacheStack = null, nodeLinkOverlay;

        // Loading();

        JSONParamParse(JSONParam).then(JSONData => {
            // JSON Load Callback
            opts.onLoad(JSONParam, opts);

            opts.prepareData(JSONData);

            if(opts.metadata){
                NetJSONMetadata(JSONData);
            }

            if(JSONData.date){
                const dateNode = document.createElement("span"),
                      dateResult = dateParse(JSONData.date, opts.dateRegular);
                dateNode.setAttribute("title", dateResult);
                dateNode.setAttribute("class", "njg-date");
                dateNode.innerHTML = "Incoming Time: " + dateResult;
                netGraphContainer.appendChild(dateNode);
            }

            // dealDataByWorker(JSONData);
            addViewEye();
            switchRenderMode();
            JSONCacheStack = JSONData;
            NetJSONRender();

            if(opts.listenUpdateUrl){
                const socket = io(opts.listenUpdateUrl);
                socket.on('connect', function () {
                    console.log('client connect')
                });
                socket.on('disconnect', function(){
                    console.log('client disconnected.')
                });
                socket.on('netjsonChange', data => {
                    if(data.date !== JSONCacheStack.date){
                        document.getElementsByClassName("njg-date")[0].innerHTML = "Incoming Time: " + dateParse(data.date, opts.dateRegular);
                    }
                    dealDataByWorker(data)}
                );
            }
            
            function dealDataByWorker(JSONData){
                let worker = new Worker("../src/js/netjsonWorker.js");
                
                worker.postMessage(JSONData);    
                
                worker.addEventListener('error', e => {
                    console.error("Error in element rendering!");
                });
                worker.addEventListener('message', e => {
                    JSONCacheStack = e.data;
    
                    if(opts.metadata){
                        document.getElementById("metadataNodesLength").innerHTML = JSONCacheStack.nodes.length;
                        document.getElementById("metadataLinksLength").innerHTML = JSONCacheStack.links.length;
                    }
    
                    // unLoading();
                    
                    NetJSONRender();
                });
            }
        })

        /**
         * @function
         * @name JSONParamParse
         *
         * Perform different operations to call NetJSONDataParse function according to different Param types.
         * @param  {object|string}  JSONParam   Url or JSONData
         * 
         * @return {object}    A promise object of JSONData
         */

        function JSONParamParse(JSONParam){
            if(typeof JSONParam === "string"){
                return fetch(JSONParam, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                })
                .then(response => {
                    if(response.status === 200){
                        return response.json()
                    }
                })
                .catch(msg => {
                    console.error(msg);
                })
            }
            else{
                return new Promise(JSONParam);
            }
        }

        /**
         * @function
         * @name NetJSONDataParse
         *
         * Callback function executed when fetched data. Parse JSON data and construct the option.
         * @param  {object}  JSONData     NetJSONData
         * 
         * @return {object}  option -- render dependent configuration
         */

        function NetJSONDataParse(JSONData){
            return {
                title: {
                    text: "NetGraph Demo",
                    link: "",
                    textStyle: {
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: 30
                    },
                    left: "center",
                    top: "5%"
                },
                aria: {
                    show: true,
                    description: "This is a force-oriented graph chart that depicts the relationship between ip nodes."
                },
                toolbox:{
                    show:true,
                    feature:{
                        // dataView:{
                        //     show:true
                        // },
                        restore:{
                            show:true
                        },
                        saveAsImage:{
                            show:true
                        },
                    }
                },
                tooltip: {
                    confine: true,
                    formatter: (params, ticket, callback) => params.dataType === "edge" ? linkInfo(params.data) : nodeInfo(params.data)
                },
                legend: {
                    data: JSONData.categories
                },
                series:[{
                    type: "graph",
                    name: "NetGraph Demo",
                    layout: "force",
                    cursor:"pointer",           
                    label:{     
                        show: true,   
                        color: "#000000",
                        offset: [opts.labelDx, opts.labelDy],
                    },
                    force: {
                        initLayout: "circular",
                        repulsion: opts.repulsion,
                        gravity: opts.gravity,
                        edgeLength: opts.edgeLength,
                    },
                    symbolSize: opts.circleRadius,
                    roam: true,
                    draggable: true,
                    focusNodeAdjacency: true,
                    data: JSONData.nodes,
                    links: JSONData.links,
                    categories: JSONData.categories.map(category => ({name: category})),
                }]
            };
        }

        /**
         * @function
         * @name NetJSONRender
         *
         * Perform different renderings according to different types.
         */

        function NetJSONRender(){
            let graphChartContainer = document.getElementById("graphChartContainer");
            if(graphChartContainer){
                netGraphContainer.removeChild(graphChartContainer);
            }
            graphChartContainer = document.createElement("div");
            graphChartContainer.setAttribute("id", "graphChartContainer");
            netGraphContainer.appendChild(graphChartContainer);
            
            if(!opts.mapModeRender){
                // const graphChart = echarts.init(graphChartContainer, null, {renderer: opts.svgRender ? "svg" : "canvas"});
                // graphRenderResult(graphChart, JSONCacheStack);
                let dragListener, atlasObj, nodes;

                s = new sigma({
                  graph: {
                      nodes: JSONCacheStack.nodes.map((a,i)=>({
                          id: 'n' + i,
                          label: 'Node ' + i,
                          x: Math.random(),
                          y: Math.random(),
                          size: Math.random(),
                      })),
                      edges: JSONCacheStack.links.map((a,i)=>({
                          id: 'e' + i,
                          source: 'n' + (Math.random() * JSONCacheStack.nodes.length | 0),
                          target: 'n' + (Math.random() * JSONCacheStack.nodes.length | 0),
                          size: 1,
                      })),
                  },
                  settings: {
                    defaultEdgeHoverColor: "#000",
                    // edgeHoverColor: "default",
                    defaultNodeColor: '#666',
                    defaultEdgeColor: '#ccc',
                    edgeColor: "default",
                    // hideEdgesOnMove: true,
                    enableEdgeHovering: true,
                    autoRescale: ['nodePosition', 'nodeSize']
                    // skipErrors: true
                  },
                  renderers: [
                    {
                      container: graphChartContainer,
                      type: 'canvas' // sigma.renderers.canvas works as well
                    }
                  ]
                });
                
                atlasObj = s.startForceAtlas2({ 
                    linLogMode: true,
                    outboundAttractionDistribution: false,
                    adjustSizes: false,
                    edgeWeightInfluence: 0,
                    scalingRatio: 1,
                    strongGravityMode: false,
                    gravity: 1,
                    barnesHutOptimize: true,
                    barnesHutTheta: 0.5,
                    slowDown: 1,
                    startingIterations: 1,
                    iterationsPerRender: 1,
                    autoStop: true,
                    // avgDistanceThreshold: 100,
                    barnesHutOptimize: true, //should we use the algorithm's Barnes-Hut to improve repulsion's scalability (O(n²) to O(nlog(n)))? This is useful for large graph but harmful to small ones.
                    worker: false,
                    background: true,
                });
    
                // let dragListener, atlasObj, nodes;
                // s.addCamera('cam');
                // s.addRenderer({
                //     container: graphChartContainer,
                //     type: 'webgl',
                //     camera: 'cam'
                // });
        
                window.onblur = function () {
                  s.stopForceAtlas2();
                };
                window.onfocus = function () {
                  s.startForceAtlas2();
                };
        
                dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
                dragListener.bind('drag', function (event) {
                    s.stopForceAtlas2(); 
                });
                dragListener.bind('drop', function (event) {
                    nodes = s.supervisor.graph.nodes();
                    for (let j = 0, i = 0, l = s.supervisor.nodesByteArray.length; i < l; i += s.supervisor.ppn) {
                        if (nodes[j] === event.data.node) {
                            s.supervisor.nodesByteArray[i] = event.data.node.x;
                            s.supervisor.nodesByteArray[i + 1] = event.data.node.y;
                        }
                        j++;
                    }
                    s.startForceAtlas2();
                });

                s.bind("clickNode", function(node){
                  console.log(node)
                  opts.onClickNode(node);
                })
                s.bind("clickEdge", function(link){
                  console.log(link);
                  opts.onClickLink(link);
                })
            }
            else{
                if(!opts.netjsonmap){
                    opts.netjsonmap = L.map(graphChartContainer, {renderer: opts.svgRender ? L.svg() : L.canvas()}).setView([42.168, 260.536], 8);
                }
                else{
                    opts.netjsonmap = L.map(graphChartContainer, {renderer: opts.svgRender ? L.svg() : L.canvas()}).setView(opts.netjsonmap.getCenter(), opts.netjsonmap.getZoom());
                }
                L.easyPrint({
                    title: 'Awesome print button',
                    position: 'bottomleft',
                    exportOnly: true,
                    sizeModes: ['Current', 'A4Portrait', 'A4Landscape']
                }).addTo(opts.netjsonmap);

                let editableLayers = new L.FeatureGroup(),
                    MyCustomMarker = L.Icon.extend({
                        options: {
                            shadowUrl: null,
                            iconAnchor: new L.Point(12, 12),
                            iconUrl: '../lib/images/marker-icon.png'
                        }
                    }),
                    options = {
                        position: 'topleft',
                        draw: {
                            polyline: {
                                shapeOptions: {
                                    color: '#f357a1',
                                    weight: 3
                                }
                            },
                            polygon: {
                                allowIntersection: false, // Restricts shapes to simple polygons
                                drawError: {
                                    color: '#e1e100', // Color the shape will turn when intersects
                                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                                },
                                shapeOptions: {
                                    color: '#bada55'
                                }
                            },
                            circle: true, // Turns off this drawing tool
                            rectangle: {
                                shapeOptions: {
                                    clickable: false
                                }
                            },
                            marker: {
                                icon: new MyCustomMarker()
                            }
                        },
                        edit: {
                            featureGroup: editableLayers, //REQUIRED!!
                            remove: true
                        }
                    };
                opts.netjsonmap.addLayer(editableLayers);
                opts.netjsonmap.addControl(new L.Control.Draw(options));
                opts.netjsonmap.on(L.Draw.Event.CREATED, function (e) {
                    var type = e.layerType,
                        layer = e.layer;
                
                    if (type === 'marker') {
                        layer.bindPopup('A popup!');
                    }
                
                    editableLayers.addLayer(layer);
                });

                if(!opts.viewIndoormap){
                    opts.leafLeyLayers = [];
                    opts.leafLeyLayers.push(L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: opts.scaleExtent[1],
                        id: 'mapbox.streets',
                        accessToken: 'pk.eyJ1Ijoia3V0dWd1IiwiYSI6ImNqdHpnb2hqMjM0OG40OHBjbmN3azV1b2UifQ.PBk9TefuYkZlK8SweLAebA'
                    }).addTo(opts.netjsonmap));
                    mapRenderResult(opts.netjsonmap, JSONCacheStack);
                }
                viewInputImage(opts.netjsonmap);
            }
        }

        /**
         * @function
         * @name graphRenderResult
         *
         * Render the final result based on options.
         * @param  {object}  chart         Echarts
         * @param  {object}  JSONData      Render dependent configuration
         */
        function graphRenderResult(chart, JSONData){
            JSONData.links.map(function(link){
                link.lineStyle = link.lineStyle || opts.linkStyleProperty;
            });
            JSONData.nodes.map(function(node){
                node.itemStyle = node.nodeStyle || opts.nodeStyleProperty;
                node.name = node.name || node.id;
                node.value = node.value || node.name;
                if(node.category){
                    node.category = String(node.category);
                }
                if(!JSONData.categories){
                    JSONData.categories = [];
                }
                if(JSONData.categories.indexOf(node.category) === -1){
                    JSONData.categories.push(node.category)
                }
            });
            chart.setOption(NetJSONDataParse(JSONData));
            chart.on("mouseup", function(params){
                if (params.componentType === "series" && params.seriesType === "graph") {
                    if (params.dataType === "edge") {
                        opts.onClickLink(params.data); 
                    }
                    else {
                        opts.onClickNode(params.data); 
                    }
                }
            }, {passive: true});
            window.onresize = () => {
                chart.resize();
            }
        }

        /**
         * @function
         * @name mapRenderResult
         *
         * Render the final result based on options.
         * @param  {object}  map            Echarts
         * @param  {object}  JSONData       Render dependent configuration
         */
        function mapRenderResult(map, JSONData){
            const nodeElements = [], linkElements = [], drawElements = [];
            let {flatNodes: nodes, links} = JSONData;

            for(let node_id in nodes){
                if(nodes[node_id].location){
                    let {location, ...res} = nodes[node_id];
                    nodeElements.push(L.circleMarker([location.lng, location.lat], Object.assign(nodes[[node_id]].nodeStyle || opts.nodeStyleProperty, {params: JSON.parse(JSON.stringify(res))})).bindTooltip(nodeInfo(res)));
                }
            }
            for(let link of links){
                if(nodes[link.source] && nodes[link.target]){
                    linkElements.push(L.polyline([
                        [nodes[link.source].location.lng, nodes[link.source].location.lat],
                        [nodes[link.target].location.lng, nodes[link.target].location.lat],
                    ], Object.assign(link.lineStyle || opts.linkStyleProperty, {params: JSON.parse(JSON.stringify(link))})).bindTooltip(linkInfo(link)));
                }
            }
            drawElements.push(L.featureGroup(nodeElements).on('click', function(e) { map.setView([e.latlng.lat, e.latlng.lng], map.getMaxZoom());opts.onClickNode(e.layer.options.params);}));
            drawElements.push(L.featureGroup(linkElements).on('click', function(e) { map.setView([e.latlng.lat, e.latlng.lng]);opts.onClickLink(e.layer.options.params);}));
            L.featureGroup(drawElements).addTo(map);
        }

        /**
         * @function
         * @name NetJSONMetadata
         *
         * Display metadata of NetJSON.
         * @param  {object}  metadata     
         */

        function NetJSONMetadata(metadata){
            const attrs = ["protocol",
                "version",
                "revision",
                "metric",
                "router_id",
                "topology_id"];
            let html = "";
            
            if(metadata.label) {
                html += "<h3>" + metadata.label + "</h3>";
            }
            for(var i in attrs) {
                var attr = attrs[i];
                if(metadata[attr]) {
                    html += "<p><b>" + attr + "</b>: <span>" + metadata[attr] + "</span></p>";
                }
            }
            html += "<p><b>nodes</b>: <span id='metadataNodesLength'>" + metadata.nodes.length + "</span></p>";
            html += "<p><b>links</b>: <span id='metadataLinksLength'>" + metadata.links.length + "</span></p>";

            const metadataDiv = document.createElement("div"),
                innerDiv = document.createElement("div"),
                closeA = document.createElement("a");
            metadataDiv.setAttribute("class", "njg-metadata");
            metadataDiv.setAttribute("style", "display: block");
            innerDiv.setAttribute("class","njg-inner" );
            closeA.setAttribute("class", "njg-close");

            closeA.onclick = () => {
                metadataDiv.classList.add("njg-hidden");
            }
            innerDiv.innerHTML = html;
            metadataDiv.appendChild(innerDiv);
            metadataDiv.appendChild(closeA);
            
            netGraphContainer.appendChild(metadataDiv);
        } 

        /**
         * @function
         * @name switchRenderMode
         *
         * Switch rendering mode -- Canvas or Svg, re-render JSONData.
         */

        function switchRenderMode(){
            const switchWrapper = document.createElement("div"),
                checkInput = document.createElement("input"),
                checkLabel = document.createElement("label"),
                canvasMode = document.createElement("b"),
                svgMode = document.createElement("b");
                
            switchWrapper.setAttribute("class", "switch-wrap");
            checkInput.setAttribute("id", "switch");
            checkInput.setAttribute("type", "checkbox");
            checkLabel.setAttribute("for", "switch");
            canvasMode.innerHTML = "Canvas";
            svgMode.innerHTML = "Svg";
            checkInput.onchange = e => {
                opts.svgRender = e.target.checked;    
                NetJSONRender();
            }
            if(opts.svgRender){
                checkInput.checked = true;
            }
            switchWrapper.appendChild(canvasMode);
            switchWrapper.appendChild(checkInput);
            switchWrapper.appendChild(checkLabel);
            switchWrapper.appendChild(svgMode);
            netGraphContainer.appendChild(switchWrapper);
        }

        /**
         * @function
         * @name addViewEye
         *
         * Add viewEye icon to change graph or map mode.
         */

        function addViewEye(){
            let selectIconDiv = document.createElement("div"),
                iconEye = document.createElement("span");
            iconEye.setAttribute("class", "iconfont icon-eye");
            selectIconDiv.setAttribute("class", "njg-selectIcon");
            selectIconDiv.appendChild(iconEye);
            netGraphContainer.appendChild(selectIconDiv);
            
            iconEye.onclick = () => {
                opts.mapModeRender = !opts.mapModeRender;
                opts.viewIndoormap = false;
                NetJSONRender();
            }
        }

        /**
         * @function
         * @name viewInputImage
         *
         * Add viewEye icon to change graph or map mode.
         * 
         * @param {object}   netjsonmap
         */

        function viewInputImage(netjsonmap){
            let imgInput = document.getElementById("njg-indoorImgInput");
            if(opts.viewIndoormap){
                presentIndoormap(imgInput.files[0]);
            }
            else if(!imgInput){
                imgInput = document.createElement("input");
                imgInput.setAttribute("type", "file");
                imgInput.setAttribute("accept", "image/*");
                imgInput.setAttribute("id", "njg-indoorImgInput");
                netGraphContainer.appendChild(imgInput);
            }
            imgInput.onchange = e => {
                presentIndoormap(e.target.files[0]);
            }

            function presentIndoormap(img){
                let readImg = new FileReader(),
                    tempImage = new Image();
                readImg.readAsDataURL(img);
                readImg.onload = e => {
                    tempImage.src = e.target.result;
                    tempImage.onload = () => {
                        let southWest, northEast, bounds;
                        if(tempImage.width / tempImage.height > window.innerWidth / window.innerHeight){
                            southWest = netjsonmap.layerPointToLatLng(L.point(0, window.innerHeight - (window.innerHeight - window.innerWidth * tempImage.height / tempImage.width) / 2 + 60)),
                            northEast = netjsonmap.layerPointToLatLng(L.point(window.innerWidth, (window.innerHeight - window.innerWidth * tempImage.height / tempImage.width) / 2 + 60));
                            bounds = new L.LatLngBounds(southWest, northEast);
                        }
                        else{
                            southWest = netjsonmap.layerPointToLatLng(L.point((window.innerWidth - window.innerHeight * tempImage.width / tempImage.height) / 2, window.innerHeight + 60)),
                            northEast = netjsonmap.layerPointToLatLng(L.point(window.innerWidth - (window.innerWidth - window.innerHeight * tempImage.width / tempImage.height) / 2, 60));
                            bounds = new L.LatLngBounds(southWest, northEast);
                        }
                        for(let layer of opts.leafLeyLayers){
                            netjsonmap.removeLayer(layer);
                        }
                        opts.leafLeyLayers.push(L.imageOverlay(tempImage.src, bounds).addTo(netjsonmap));
                        opts.viewIndoormap = true;

                        // netjsonmap.on('click', e=>{
                        //     console.log(e)
                        // })
                    }
                }
            }
        }

        /**
         * @function
         * @name dateParse
         *
         * Parse the time in the browser's current time zone based on the incoming matching rules.
         * @param  {string}          dateString 
         * @param  {object(RegExp)}  parseRegular
         * 
         * @return {string}    Date string 
         */

        function dateParse(dateString, parseRegular = /^([1-9]\d{3})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?Z$/){
            const dateParseArr = parseRegular.exec(dateString);
            if(!dateParseArr || dateParseArr.length < 7){
                console.error("Date doesn't meet the specifications.");
                return "";
            }
            const hourDiffer = new Date().getTimezoneOffset() / 60,
                  dateNumerFields = ["dateYear", "dateMonth", "dateDay", "dateHour"],
                  dateNumberObject = {},
                  leapYear = (dateParseArr[1] % 4 === 0 && dateParseArr[1] % 100 !== 0) || dateParseArr[1] % 400 === 0,
                  limitBoundaries = new Map([
                    ["dateMonth", 12],
                    ["dateDay", [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]],
                    ["dateHour", 24],
                  ]);

            for(let i = dateNumerFields.length;i > 0;i--){
                dateNumberObject[dateNumerFields[i - 1]] = parseInt(dateParseArr[i], 10);
            }

            let carry = -hourDiffer;
            for(let i = dateNumerFields.length;i > 0;i--){
                if(dateNumerFields[i - 1] === "dateYear"){
                    dateNumberObject[dateNumerFields[i - 1]] += carry;
                    break;
                }
                else if(dateNumerFields[i - 1] === "dateDay"){
                    limitBoundary = limitBoundaries.get("dateDay")[dateNumberObject["dateMonth"] - 1];
                }
                else{
                    limitBoundary = limitBoundaries.get(dateNumerFields[i - 1]);
                }

                let calculateResult = dateNumberObject[dateNumerFields[i - 1]] + carry;

                if(dateNumerFields[i - 1] === "dateHour"){
                    carry = calculateResult < 0 ? -1 : (calculateResult >= limitBoundary ? 1 : 0);
                }
                else{
                    carry = calculateResult <= 0 ? -1 : (calculateResult > limitBoundary ? 1 : 0);
                }

                if(carry === 1){
                    calculateResult -= limitBoundary;
                }
                else if(carry < 0){
                    if(dateNumerFields[i - 1] === "dateDay"){
                        limitBoundary = limitBoundaries.get("dateDay")[(dateNumberObject[dateNumerFields[i - 1]] + 10) % 11];
                    }
                    calculateResult += limitBoundary;
                }

                dateNumberObject[dateNumerFields[i - 1]] = calculateResult;
            }

            return dateNumberObject["dateYear"] + "." + echarts._numberMinDigit(dateNumberObject["dateMonth"]) + "." + echarts._numberMinDigit(dateNumberObject["dateDay"]) + " " + echarts._numberMinDigit(dateNumberObject["dateHour"]) + ":" + echarts._numberMinDigit(dateParseArr[5]) + ":"+ echarts._numberMinDigit(dateParseArr[6]) + "." + (dateParseArr[7] ? echarts._numberMinDigit(dateParseArr[7], 3) : "");
        }

        /**
         * @function
         * @name nodeInfo
         *
         * Parse the infomation of incoming node data.
         * @param  {object}    node 
         * 
         * @return {string}    html string 
         */

        function nodeInfo(node){
            let html = `<p><b>id</b>: ${node.id}</p>`;
            if(node.label) { html += "<p><b>label</b>: " + node.label + "</p>"; }
            if(node.properties) {
                for(let key in node.properties) {
                    if(!node.properties.hasOwnProperty(key)) { continue; }
                    html += "<p><b>"+key.replace(/_/g, " ")+"</b>: " + node.properties[key] + "</p>";
                }
            }
            if(node.linkCount) { html += "<p><b>links</b>: " + node.linkCount + "</p>";}
            if(node.local_addresses) {
                html += "<p><b>local addresses</b>:<br>" + node.local_addresses.join('<br>') + "</p>";
            }

            return html;
        }

        /**
         * @function
         * @name linkInfo
         *
         * Parse the infomation of incoming link data.
         * @param  {object}    link
         * 
         * @return {string}    html string 
         */

        function linkInfo(link){
            let html = `
                <p><b>source</b>: ${link.source}</p>
                <p><b>target</b>: ${link.target}</p>
                <p><b>cost</b>: ${link.cost}</p>
            `;
            if(link.properties) {
                for(var key in link.properties) {
                    if(!link.properties.hasOwnProperty(key)) { continue; }
                    html += "<p><b>"+ key.replace(/_/g, " ") +"</b>: " + link.properties[key] + "</p>";
                }
            }

            return html;
        }
    }
})()